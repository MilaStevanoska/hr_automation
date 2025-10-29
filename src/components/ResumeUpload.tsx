import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- FIX ---
// 1. Import the PDF.js library
import * as pdfjs from 'pdfjs-dist';
// 2. Import the worker file directly from the package
// The "?url" part is a vite-specific command that gets the file's path.
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// 3. Set the worker path to our local file instead of the CDN
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
// --- END FIX ---


interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  candidateId?: string;
}

export function ResumeUpload({ onUploadComplete }: { onUploadComplete?: (candidateId: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle', message: '' });
  const { user } = useAuth();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error("Could not read file");
          }

          const pdf = await pdfjs.getDocument(arrayBuffer).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
          }
          
          resolve(fullText);

        } catch (error: any) {
          console.error("Error parsing PDF:", error);
          reject(new Error(`Failed to parse PDF: ${error.message}`));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const processResume = async (file: File) => {
    try {
      setUploadStatus({ status: 'uploading', message: 'Uploading resume...' });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `resumes/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: resumeRecord, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          processing_status: 'processing',
          uploaded_by: user?.id
        })
        .select()
        .single();

      if (resumeError) {
        throw resumeError;
      }

      setUploadStatus({ status: 'processing', message: 'Extracting text from PDF...' });

      const rawText = await extractTextFromPDF(file);

      await supabase
        .from('resumes')
        .update({ raw_text: rawText })
        .eq('id', resumeRecord.id);

      setUploadStatus({ status: 'processing', message: 'Parsing resume data...' });

      const { data, error: functionError } = await supabase.functions.invoke('process-resume', {
        body: {
          resumeId: resumeRecord.id,
          rawText: rawText
        }
      });

      if (functionError) {
        throw functionError;
      }

      setUploadStatus({
        status: 'success',
        message: 'Resume processed successfully!',
        candidateId: data.candidate.id
      });

      if (onUploadComplete && data.candidate.id) {
        onUploadComplete(data.candidate.id);
      }

      setTimeout(() => {
        setUploadStatus({ status: 'idle', message: '' });
      }, 3000);

    } catch (error: any) {
      console.error('Error processing resume:', error);
      setUploadStatus({
        status: 'error',
        message: error.message || 'Failed to process resume'
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      processResume(file);
    } else {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      processResume(file);
    } else {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a PDF file'
      });
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        } ${uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="resume-upload"
          disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
        />

        <label
          htmlFor="resume-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          {uploadStatus.status === 'idle' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Resume
              </h3>
              <p className="text-slate-600 text-center mb-4">
                Drag and drop a PDF file here, or click to browse
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span>PDF files only</span>
              </div>
            </>
          )}

          {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {uploadStatus.message}
              </h3>
              <p className="text-slate-600 text-center">
                This may take a few moments...
              </p>
            </>
          )}

          {uploadStatus.status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {uploadStatus.message}
              </h3>
              <p className="text-slate-600 text-center">
                Candidate profile has been created
              </p>
            </>
          )}

          {uploadStatus.status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Upload Failed
              </h3>
              <p className="text-red-600 text-center">
                {uploadStatus.message}
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
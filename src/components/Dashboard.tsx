import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ResumeUpload } from './ResumeUpload';
import { CandidateList } from './CandidateList';
import { CandidateProfile } from './CandidateProfile';
import { LogOut, Upload, Users, Briefcase } from 'lucide-react'; // Changed Users icon for header

export function Dashboard() {
  const { signOut, user } = useAuth();
  const [activeView, setActiveView] = useState<'upload' | 'list'>('upload');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // --- Handlers remain the same ---
  const handleUploadComplete = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleBackToList = () => {
    setSelectedCandidateId(null);
    setActiveView('list'); // Default back to list view
  };
  // --- End Handlers ---

  return (
    // Slightly lighter background
    <div className="min-h-screen bg-gray-50"> 
      {/* Header with subtle gradient and improved spacing */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" /> 
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">HR Platform</h1> 
                <p className="text-xs text-gray-500">Resume Parser</p>
              </div>
            </div>

            {/* User Info & Sign Out */}
            <div className="flex items-center gap-4">
              <div className="text-right"> 
                <p className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">{user?.email}</p> 
                <p className="text-xs text-gray-500">Recruiter</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition border border-gray-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!selectedCandidateId ? (
          // View for Upload/List Tabs
          <>
            {/* Welcome Card */}
            <div className="mb-8 md:mb-10">
              {/* Added subtle gradient background, more padding */}
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 md:p-8"> 
                <div className="mb-6"> 
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                    Candidate Dashboard
                  </h2>
                  <p className="text-gray-600">
                    Upload resumes or view existing candidate profiles.
                  </p>
                </div>

                {/* Tab Buttons - Improved styling */}
                <div className="flex gap-2 border-b border-gray-200 pb-4 mb-6"> 
                  <button
                    onClick={() => setActiveView('upload')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                      activeView === 'upload'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Resume
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                      activeView === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    View Candidates
                  </button>
                </div>

                {/* Content based on active tab */}
                <div>
                  {activeView === 'upload' && (
                    <ResumeUpload onUploadComplete={handleUploadComplete} />
                  )}
                   {activeView === 'list' && (
                    <CandidateList onSelectCandidate={handleSelectCandidate} />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // View for Single Candidate Profile
          <CandidateProfile
            candidateId={selectedCandidateId}
            onBack={handleBackToList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5"> 
          <p className="text-center text-xs text-gray-500"> 
            Automated Resume Processing System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
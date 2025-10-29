# HR/Recruitment Platform - Setup Instructions

This is an automated resume processing platform that extracts candidate information from PDF resumes and populates candidate profiles automatically.

## Features

- Automatic PDF resume parsing
- Extract candidate contact information (name, email, phone, LinkedIn)
- Parse work experience, education, and skills
- Calculate total years of experience
- Beautiful, modern UI with candidate profiles
- Secure authentication with Supabase
- Row Level Security (RLS) for data protection

## Setup Instructions

### 1. Database Setup

The database schema needs to be created in your Supabase project. Follow these steps:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/gvxpdavgcpeztzjvcypu
2. Navigate to the SQL Editor: https://supabase.com/dashboard/project/gvxpdavgcpeztzjvcypu/sql/new
3. Copy the entire contents of `database-schema.sql` file from this project
4. Paste it into the SQL Editor and click "Run"

This will create:
- `candidates` table - stores candidate profile information
- `resumes` table - stores uploaded resume files and processing status
- `candidate_skills` table - stores extracted skills
- `work_experience` table - stores work history
- `education` table - stores educational background
- All necessary Row Level Security (RLS) policies
- Indexes for optimal query performance

### 2. Storage Bucket Setup

Create a storage bucket for resume files:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `resumes`
3. Set it as a private bucket
4. Add RLS policies:
   - Allow authenticated users to upload: `bucket_id = 'resumes' AND auth.uid() = owner`
   - Allow authenticated users to read: `bucket_id = 'resumes'`

### 3. Edge Function Setup (Optional)

The resume processing edge function is located in `supabase/functions/process-resume/`.

To deploy it manually:
1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Run: `supabase functions deploy process-resume`

Note: The app includes a client-side parser as a fallback, so the edge function is optional but recommended for better performance.

### 4. Authentication Setup

Email/password authentication is enabled by default in Supabase. No additional configuration needed.

If you want to disable email confirmation (for development):
1. Go to Authentication > Settings in your Supabase dashboard
2. Disable "Enable email confirmations"

## How It Works

1. **Upload Resume**: HR users upload candidate resumes in PDF format
2. **Text Extraction**: The system extracts text from the PDF
3. **Intelligent Parsing**: AI-powered parsing extracts:
   - Personal information (name, email, phone, LinkedIn)
   - Professional summary
   - Skills (categorized by type)
   - Work experience (company, title, dates, responsibilities)
   - Education (institution, degree, field of study, dates)
   - Total years of experience (calculated automatically)
4. **Profile Creation**: A complete candidate profile is created automatically
5. **View & Manage**: HR teams can view all candidates and their detailed profiles

## Usage

1. Sign up or sign in to the platform
2. Click "Upload Resume" tab
3. Drag and drop a PDF resume or click to browse
4. Wait for processing (usually 5-10 seconds)
5. View the automatically created candidate profile
6. Switch to "View Candidates" tab to see all candidates
7. Click any candidate to view their full profile

## Security

- All data is protected with Row Level Security (RLS)
- Users can only access candidates they created
- Authentication is required for all operations
- No data is exposed to unauthorized users

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

## Notes

- The system currently uses a sample resume parser for demonstration
- For production use, integrate a proper PDF parsing library or OCR service
- The edge function can be enhanced with ML models for better accuracy
- Consider adding resume deduplication to prevent duplicate candidates

/*
  # HR/Recruitment Platform Schema

  ## Overview
  This migration creates the core database structure for an HR/Recruitment platform
  with automated resume parsing capabilities.

  ## Instructions
  Run this SQL in your Supabase SQL Editor:
  https://supabase.com/dashboard/project/gvxpdavgcpeztzjvcypu/sql/new

  ## New Tables

  ### 1. candidates - Stores candidate profile information
  ### 2. resumes - Stores uploaded resume files and processing status
  ### 3. candidate_skills - Stores extracted skills
  ### 4. work_experience - Stores work history
  ### 5. education - Stores educational background
*/

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  phone text DEFAULT '',
  location text DEFAULT '',
  linkedin_url text DEFAULT '',
  summary text DEFAULT '',
  total_experience_years numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer DEFAULT 0,
  processing_status text DEFAULT 'pending',
  raw_text text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Create candidate_skills table
CREATE TABLE IF NOT EXISTS candidate_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_category text DEFAULT 'technical',
  proficiency_level text DEFAULT 'intermediate',
  created_at timestamptz DEFAULT now()
);

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  job_title text NOT NULL,
  location text DEFAULT '',
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  degree text DEFAULT '',
  field_of_study text DEFAULT '',
  start_date date,
  end_date date,
  grade text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(processing_status);
CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_experience_candidate_id ON work_experience(candidate_id);
CREATE INDEX IF NOT EXISTS idx_education_candidate_id ON education(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON candidates(created_by);

-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Authenticated users can view all candidates"
  ON candidates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert candidates"
  ON candidates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own candidates"
  ON candidates FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own candidates"
  ON candidates FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Resumes policies
CREATE POLICY "Authenticated users can view all resumes"
  ON resumes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert resumes"
  ON resumes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their uploaded resumes"
  ON resumes FOR UPDATE TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their uploaded resumes"
  ON resumes FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

-- Skills policies
CREATE POLICY "Authenticated users can view all skills"
  ON candidate_skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert skills for their candidates"
  ON candidate_skills FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_skills.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update skills for their candidates"
  ON candidate_skills FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_skills.candidate_id
      AND candidates.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_skills.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete skills for their candidates"
  ON candidate_skills FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = candidate_skills.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

-- Work experience policies
CREATE POLICY "Authenticated users can view all work experience"
  ON work_experience FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert work experience for their candidates"
  ON work_experience FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = work_experience.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update work experience for their candidates"
  ON work_experience FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = work_experience.candidate_id
      AND candidates.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = work_experience.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete work experience for their candidates"
  ON work_experience FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = work_experience.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

-- Education policies
CREATE POLICY "Authenticated users can view all education records"
  ON education FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert education for their candidates"
  ON education FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = education.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update education for their candidates"
  ON education FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = education.candidate_id
      AND candidates.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = education.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete education for their candidates"
  ON education FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates
      WHERE candidates.id = education.candidate_id
      AND candidates.created_by = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

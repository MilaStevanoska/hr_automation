import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string;
          email: string | null;
          first_name: string;
          last_name: string;
          phone: string;
          location: string;
          linkedin_url: string;
          summary: string;
          total_experience_years: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          phone?: string;
          location?: string;
          linkedin_url?: string;
          summary?: string;
          total_experience_years?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          phone?: string;
          location?: string;
          linkedin_url?: string;
          summary?: string;
          total_experience_years?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      resumes: {
        Row: {
          id: string;
          candidate_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          processing_status: string;
          raw_text: string;
          uploaded_at: string;
          processed_at: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          id?: string;
          candidate_id?: string | null;
          file_name: string;
          file_path: string;
          file_size?: number;
          processing_status?: string;
          raw_text?: string;
          uploaded_at?: string;
          processed_at?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          id?: string;
          candidate_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          processing_status?: string;
          raw_text?: string;
          uploaded_at?: string;
          processed_at?: string | null;
          uploaded_by?: string | null;
        };
      };
      candidate_skills: {
        Row: {
          id: string;
          candidate_id: string | null;
          skill_name: string;
          skill_category: string;
          proficiency_level: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id?: string | null;
          skill_name: string;
          skill_category?: string;
          proficiency_level?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string | null;
          skill_name?: string;
          skill_category?: string;
          proficiency_level?: string;
          created_at?: string;
        };
      };
      work_experience: {
        Row: {
          id: string;
          candidate_id: string | null;
          company_name: string;
          job_title: string;
          location: string;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id?: string | null;
          company_name: string;
          job_title: string;
          location?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string | null;
          company_name?: string;
          job_title?: string;
          location?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          description?: string;
          created_at?: string;
        };
      };
      education: {
        Row: {
          id: string;
          candidate_id: string | null;
          institution_name: string;
          degree: string;
          field_of_study: string;
          start_date: string | null;
          end_date: string | null;
          grade: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id?: string | null;
          institution_name: string;
          degree?: string;
          field_of_study?: string;
          start_date?: string | null;
          end_date?: string | null;
          grade?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string | null;
          institution_name?: string;
          degree?: string;
          field_of_study?: string;
          start_date?: string | null;
          end_date?: string | null;
          grade?: string;
          created_at?: string;
        };
      };
    };
  };
};

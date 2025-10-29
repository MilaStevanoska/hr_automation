import { useEffect, useState } from 'react';
import { supabase, Database } from '../lib/supabase';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Building2,
  User
} from 'lucide-react';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type Skill = Database['public']['Tables']['candidate_skills']['Row'];
type Experience = Database['public']['Tables']['work_experience']['Row'];
type Education = Database['public']['Tables']['education']['Row'];

interface CandidateProfileProps {
  candidateId: string;
  onBack: () => void;
}

export function CandidateProfile({ candidateId, onBack }: CandidateProfileProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidateData();
  }, [candidateId]);

  const loadCandidateData = async () => {
    try {
      const [candidateRes, skillsRes, experienceRes, educationRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', candidateId).single(),
        supabase.from('candidate_skills').select('*').eq('candidate_id', candidateId),
        supabase.from('work_experience').select('*').eq('candidate_id', candidateId).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('candidate_id', candidateId).order('start_date', { ascending: false })
      ]);

      if (candidateRes.data) setCandidate(candidateRes.data);
      if (skillsRes.data) setSkills(skillsRes.data);
      if (experienceRes.data) setExperience(experienceRes.data);
      if (educationRes.data) setEducation(educationRes.data);
    } catch (error) {
      console.error('Error loading candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return <div className="text-center py-12 text-slate-600">Candidate not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to candidates</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {candidate.first_name} {candidate.last_name}
              </h1>
              {candidate.summary && (
                <p className="text-blue-100 text-lg max-w-2xl">{candidate.summary}</p>
              )}
            </div>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {candidate.first_name[0]}{candidate.last_name[0]}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 bg-slate-50">
          {candidate.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Email</div>
                <div className="text-slate-900">{candidate.email}</div>
              </div>
            </div>
          )}

          {candidate.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Phone</div>
                <div className="text-slate-900">{candidate.phone}</div>
              </div>
            </div>
          )}

          {candidate.location && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Location</div>
                <div className="text-slate-900">{candidate.location}</div>
              </div>
            </div>
          )}

          {candidate.linkedin_url && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">LinkedIn</div>
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}

          {candidate.total_experience_years > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Experience</div>
                <div className="text-slate-900">{candidate.total_experience_years} years</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
              >
                {skill.skill_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Work Experience</h2>
          </div>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-slate-200 pl-6 pb-6 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{exp.job_title}</h3>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{exp.company_name}</span>
                    </div>
                  </div>
                  {exp.is_current && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  {exp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      {' - '}
                      {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {exp.description && (
                  <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Education</h2>
          </div>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-slate-200 pl-6 pb-6 last:pb-0">
                <h3 className="text-xl font-semibold text-slate-900">{edu.institution_name}</h3>
                <div className="flex items-center gap-2 text-slate-700 mt-1">
                  {edu.degree && <span className="font-medium">{edu.degree}</span>}
                  {edu.field_of_study && (
                    <>
                      {edu.degree && <span className="text-slate-400">•</span>}
                      <span>{edu.field_of_study}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {edu.start_date ? new Date(edu.start_date).getFullYear() : 'N/A'}
                      {' - '}
                      {edu.end_date ? new Date(edu.end_date).getFullYear() : 'N/A'}
                    </span>
                  </div>
                  {edu.grade && (
                    <div>
                      <span className="font-medium">GPA: {edu.grade}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

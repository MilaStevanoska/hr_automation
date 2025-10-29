import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { OpenAI } from "npm:openai";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};


interface ResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  summary: string;
  totalExperienceYears: number;
  skills: Array<{
    skillName: string;
    skillCategory: string;
    proficiencyLevel: string;
  }>;
  workExperience: Array<{
    companyName: string;
    jobTitle: string;
    location: string;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    description: string;
  }>;
  education: Array<{
    institutionName: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string | null;
    endDate: string | null;
    grade: string;
  }>;
}


async function parseResume(text: string): Promise<ResumeData> {
  
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY1')!,
  });

  // prompt
  const systemPrompt = `You are an expert HR recruitment assistant. Your job is to extract key information from a resume's raw text and return it *only* in the following JSON format.
Do not include any text other than the JSON object.
The JSON format must match this TypeScript interface:
interface ResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  summary: string;
  totalExperienceYears: number;
  skills: Array<{
    skillName: string;
    skillCategory: string; // "technical" or "soft"
    proficiencyLevel: string; // "beginner", "intermediate", "expert"
  }>;
  workExperience: Array<{
    companyName: string;
    jobTitle: string;
    location: string;
    startDate: string | null; // "YYYY-MM"
    endDate: string | null; // "YYYY-MM"
    isCurrent: boolean;
    description: string;
  }>;
  education: Array<{
    institutionName: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string | null; // "YYYY"
    endDate: string | null; // "YYYY"
    grade: string;
  }>;
}
`;


  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the resume text:\n\n${text}` }
      ],
    });

    const jsonResponse = response.choices[0].message.content;
    const parsedData: ResumeData = JSON.parse(jsonResponse);
    
    const defaults = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        linkedinUrl: "",
        summary: "",
        totalExperienceYears: 0,
        skills: [],
        workExperience: [],
        education: []
    };

    return { ...defaults, ...parsedData };

  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to parse resume with AI.");
  }
}



Deno.serve(async (req: Request) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { resumeId, rawText } = await req.json();

    if (!resumeId || !rawText) {
      return new Response(
        JSON.stringify({ error: 'Missing resumeId or rawText' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resumeData = await parseResume(rawText);

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({
        email: resumeData.email,
        first_name: resumeData.firstName,
        last_name: resumeData.lastName,
        phone: resumeData.phone,
        location: resumeData.location,
        linkedin_url: resumeData.linkedinUrl,
        summary: resumeData.summary,
        total_experience_years: resumeData.totalExperienceYears,
        created_by: user.id
      })
      .select()
      .single();

    if (candidateError) {
      throw candidateError;
    }

    await supabase
      .from('resumes')
      .update({
        candidate_id: candidate.id,
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', resumeId);

    if (resumeData.skills.length > 0) {
      const skillsToInsert = resumeData.skills.map(skill => ({
        candidate_id: candidate.id,
        skill_name: skill.skillName,
        skill_category: skill.skillCategory,
        proficiency_level: skill.proficiencyLevel
      }));
      await supabase.from('candidate_skills').insert(skillsToInsert);
    }

    if (resumeData.workExperience.length > 0) {
      const experienceToInsert = resumeData.workExperience.map(exp => ({
        candidate_id: candidate.id,
        company_name: exp.companyName,
        job_title: exp.jobTitle,
        location: exp.location,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.isCurrent,
        description: exp.description
      }));
      await supabase.from('work_experience').insert(experienceToInsert);
    }

    if (resumeData.education.length > 0) {
      const educationToInsert = resumeData.education.map(edu => ({
        candidate_id: candidate.id,
        institution_name: edu.institutionName,
        degree: edu.degree,
        field_of_study: edu.fieldOfStudy,
        start_date: edu.startDate,
        end_date: edu.endDate,
        grade: edu.grade
      }));
      await supabase.from('education').insert(educationToInsert);
    }

    return new Response(
      JSON.stringify({
        success: true,
        candidate: candidate,
        resumeData: resumeData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing resume:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
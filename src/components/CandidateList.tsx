import { useEffect, useState } from 'react';
import { supabase, Database } from '../lib/supabase';
import { Users, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Trash2, Loader2 } from 'lucide-react';

type Candidate = Database['public']['Tables']['candidates']['Row'];

export function CandidateList({ onSelectCandidate }: { onSelectCandidate: (candidateId: string) => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this candidate? This cannot be undone.')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('candidates')
          .delete()
          .eq('id', candidateId);
        if (error) throw error;
        await loadCandidates();
        alert('Candidate deleted successfully.');
      } catch (error: any) {
        console.error('Error deleting candidate:', error);
        alert(`Failed to delete candidate: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleEdit = (candidateId: string, event: React.MouseEvent) => {
     event.stopPropagation();
     alert(`Edit functionality for candidate ${candidateId} needs to be implemented.`);
     // Example: onSelectCandidate(candidateId);
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (candidates.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No candidates yet</h3>
        <p className="text-slate-600">Upload a resume to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Candidates</h2>
      {loading && candidates.length > 0 && (
           <div className="flex items-center justify-center py-4">
             <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
             <span className="ml-2 text-slate-600">Refreshing...</span>
           </div>
      )}
      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onSelectCandidate(candidate.id)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 cursor-pointer relative group"
          >
            {/* Main Flex container */}
            <div className="flex items-start justify-between">

              {/* Text Details Block - Reduced right padding */}
              <div className="flex-1 pr-16"> {/* Reduced padding to pr-16 */}
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {candidate.first_name} {candidate.last_name}
                </h3>

                {/* Delete Button*/}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              
                   <button
                      onClick={(e) => handleDelete(candidate.id, e)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete Candidate"
                    >
                       <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {candidate.email && ( <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4" /><span className="text-sm">{candidate.email}</span></div> )}
                  {candidate.phone && ( <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4" /><span className="text-sm">{candidate.phone}</span></div> )}
                  {candidate.location && ( <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4" /><span className="text-sm">{candidate.location}</span></div> )}
                </div>

                {/* Experience & Date */}
                <div className="flex items-center gap-4">
                  {candidate.total_experience_years != null && candidate.total_experience_years > 0 && ( <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full"><Briefcase className="w-4 h-4" /><span>{candidate.total_experience_years} years exp.</span></div> )}
                  <div className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="w-4 h-4" /><span>Added {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'N/A'}</span></div>
                </div>
              </div>
            </div> 
          </div>
        ))}
      </div>
    </div>
  );
}

import { supabase } from './client';

// Helper for fetching open calls with filters
export const getOpenCalls = async (status: string = 'all', sort: string = 'deadline') => {
  let query = supabase
    .from('open_calls')
    .select('*');
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  // Apply sorting
  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true });
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'popularity') {
    query = query.order('popularity', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching open calls:', error);
    return [];
  }
  
  return data;
};

// Get user's open call submissions
export const getUserSubmissions = async (userId: string) => {
  const { data, error } = await supabase
    .from('open_call_submissions')
    .select(`
      *,
      open_calls (*)
    `)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  return data;
};

// Submit application to open call
export const submitOpenCallApplication = async (openCallId: string, userId: string, formData: any) => {
  const { error } = await supabase
    .from('open_call_submissions')
    .insert([{ 
      open_call_id: openCallId,
      user_id: userId,
      status: 'submitted',
      submission_data: formData
    }]);
    
  if (error) {
    console.error('Error submitting application:', error);
    return false;
  }
  
  return true;
};

// Get all submissions for admin dashboard
export const getAllSubmissions = async () => {
  const { data, error } = await supabase
    .from('open_call_submissions')
    .select('*, open_calls(title)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  // Fetch user emails
  const enrichedSubmissions = await Promise.all(data.map(async (submission) => {
    const { data: userData } = await supabase.auth.admin.getUserById(submission.user_id);
    
    return {
      ...submission,
      user_email: userData?.user?.email || 'Unknown',
      open_call_title: submission.open_calls?.title || 'Unknown'
    };
  }));
  
  return enrichedSubmissions;
};

// Update submission status for admin
export const updateSubmissionStatus = async (submissionId: string, status: string, feedback: string | null = null) => {
  const { error } = await supabase
    .from('open_call_submissions')
    .update({ 
      status, 
      feedback,
      updated_at: new Date().toISOString() 
    })
    .eq('id', submissionId);
    
  if (error) {
    console.error('Error updating submission status:', error);
    return false;
  }
  
  return true;
};

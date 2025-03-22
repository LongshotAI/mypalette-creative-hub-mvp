
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

/**
 * Get open calls with filters
 */
export async function getOpenCalls(status: string = 'all'): Promise<ApiResponse<any[]>> {
  try {
    let query = supabase
      .from('open_calls')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch open calls');
    return createErrorResponse(
      'Failed to fetch open calls', 
      error
    );
  }
}

/**
 * Get user's open call submissions
 */
export async function getUserSubmissions(userId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('open_call_submissions')
      .select(`
        *,
        open_calls (*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch submissions');
    return createErrorResponse(
      'Failed to fetch submissions', 
      error
    );
  }
}

/**
 * Submit application to open call
 */
export async function submitOpenCallApplication(
  openCallId: string, 
  userId: string, 
  formData: any,
  status: 'draft' | 'submitted' = 'submitted'
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('open_call_submissions')
      .insert([{ 
        open_call_id: openCallId,
        user_id: userId,
        status: status,
        submission_data: formData
      }]);
      
    if (error) throw error;
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to submit application');
    return createErrorResponse(
      'Failed to submit application', 
      error
    );
  }
}

/**
 * Update existing submission
 */
export async function updateSubmission(
  submissionId: string,
  updates: {
    status?: string;
    submission_data?: any;
    feedback?: string;
  }
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('open_call_submissions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);
      
    if (error) throw error;
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to update submission');
    return createErrorResponse(
      'Failed to update submission', 
      error
    );
  }
}

/**
 * Get all submissions for an open call (admin function)
 */
export async function getOpenCallSubmissions(openCallId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('open_call_submissions')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          email,
          avatar_url
        )
      `)
      .eq('open_call_id', openCallId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch submissions');
    return createErrorResponse(
      'Failed to fetch submissions', 
      error
    );
  }
}

/**
 * Get a single submission by ID
 */
export async function getSubmission(submissionId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('open_call_submissions')
      .select(`
        *,
        profiles:user_id (*),
        open_calls (*)
      `)
      .eq('id', submissionId)
      .single();
      
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to fetch submission');
    return createErrorResponse(
      'Failed to fetch submission', 
      error
    );
  }
}

/**
 * Upload file for open call submission
 */
export async function uploadSubmissionFile(
  file: File, 
  userId: string,
  openCallId: string
): Promise<ApiResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${openCallId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('submissions')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);
    
    return createSuccessResponse(publicUrl);
  } catch (error) {
    handleApiError(error, 'Failed to upload file');
    return createErrorResponse(
      'Failed to upload file', 
      error
    );
  }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('open_call_submissions')
      .delete()
      .eq('id', submissionId);
      
    if (error) throw error;
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to delete submission');
    return createErrorResponse(
      'Failed to delete submission', 
      error
    );
  }
}


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
  formData: any
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('open_call_submissions')
      .insert([{ 
        open_call_id: openCallId,
        user_id: userId,
        status: 'submitted',
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

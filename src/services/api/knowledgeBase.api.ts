
import { supabase } from '@/lib/supabase';
import { createSuccessResponse, createErrorResponse, ApiResponse } from './base.api';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

/**
 * Adds a new knowledge item to the knowledge base
 */
export const addKnowledgeItem = async (
  title: string,
  content: string,
  userId: string
): Promise<ApiResponse<KnowledgeItem>> => {
  try {
    if (!title || !content) {
      return createErrorResponse('Title and content are required');
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([
        { title, content, user_id: userId }
      ])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Error adding knowledge item:', error);
    return createErrorResponse('Failed to add knowledge item', error);
  }
};

/**
 * Gets all knowledge items for a specific user
 */
export const getUserKnowledgeItems = async (userId: string): Promise<ApiResponse<KnowledgeItem[]>> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data || []);
  } catch (error) {
    console.error('Error getting knowledge items:', error);
    return createErrorResponse('Failed to get knowledge items', error);
  }
};

/**
 * Deletes a knowledge item
 */
export const deleteKnowledgeItem = async (itemId: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return createSuccessResponse(null);
  } catch (error) {
    console.error('Error deleting knowledge item:', error);
    return createErrorResponse('Failed to delete knowledge item', error);
  }
};

/**
 * Updates a knowledge item
 */
export const updateKnowledgeItem = async (
  itemId: string,
  updates: Partial<Pick<KnowledgeItem, 'title' | 'content'>>
): Promise<ApiResponse<KnowledgeItem>> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', itemId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Error updating knowledge item:', error);
    return createErrorResponse('Failed to update knowledge item', error);
  }
};

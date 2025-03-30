
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  addMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetChat: () => void;
}

interface UseChatOptions {
  useKnowledgeBase?: boolean;
  customSystemPrompt?: string;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default system prompt
  const defaultSystemPrompt = `
    You are a helpful assistant for MyPalette, a creative hub platform.
    You help users with questions about using the platform, creating portfolios,
    submitting to open calls, and other art-related queries.
    Always be friendly, helpful, and concise in your responses.
    If you don't know the answer to something, say so honestly.
  `;
  
  const systemPrompt = options.customSystemPrompt || defaultSystemPrompt;

  const addMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    
    // Update messages with user input
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare messages in the format Anthropic expects
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the new user message
      chatHistory.push({ role: 'user', content });
      
      console.log('Calling Anthropic edge function with:', {
        messageCount: chatHistory.length,
        usingKnowledgeBase: options.useKnowledgeBase
      });
      
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          messages: chatHistory,
          systemPrompt,
          useKnowledgeBase: options.useKnowledgeBase || false,
        },
      });
      
      if (error) throw new Error(error.message);
      
      if (data?.content) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content[0].text
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data?.error) {
        throw new Error(data.error.message || 'Invalid response from Anthropic API');
      } else {
        throw new Error('Invalid response from Anthropic API');
      }
    } catch (err: any) {
      console.error('Error in chat:', err);
      const errorMessage = err.message || 'Failed to get a response. Please try again.';
      setError(errorMessage);
      
      if (errorMessage.includes('credit balance is too low')) {
        toast.error('AI assistant is currently unavailable due to API credit limitations.');
      } else {
        toast.error('Failed to get a response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, options.useKnowledgeBase, systemPrompt]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    addMessage,
    isLoading,
    error,
    resetChat,
  };
}

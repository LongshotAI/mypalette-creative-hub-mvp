
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
      // Prepare messages in the format expected
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the new user message
      chatHistory.push({ role: 'user', content });
      
      // First try ElevenLabs chat function
      let response;
      try {
        console.log('Calling ElevenLabs edge function with:', {
          messageCount: chatHistory.length,
          usingKnowledgeBase: options.useKnowledgeBase
        });
        
        response = await supabase.functions.invoke('eleven-labs-chat', {
          body: {
            messages: chatHistory,
            systemPrompt,
            useKnowledgeBase: options.useKnowledgeBase || false,
          },
        });
      } catch (elevenlabsError) {
        console.error('Error with ElevenLabs chat:', elevenlabsError);
        // If ElevenLabs fails, try Anthropic as fallback
        response = await supabase.functions.invoke('anthropic-chat', {
          body: {
            messages: chatHistory,
            systemPrompt,
            useKnowledgeBase: options.useKnowledgeBase || false,
          },
        });
      }
      
      if (response.error) throw new Error(response.error.message);
      
      // Handle response from either service
      if (response.data?.content) {
        // ElevenLabs format
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.data?.content?.[0]?.text) {
        // Anthropic format
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.content[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.data?.error) {
        throw new Error(response.data.error.message || 'Invalid response from AI service');
      } else {
        // Fallback response if no valid response from either service
        const fallbackMessage: ChatMessage = {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try asking me something else or try again later."
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (err: any) {
      console.error('Error in chat:', err);
      const errorMessage = err.message || 'Failed to get a response. Please try again.';
      setError(errorMessage);
      
      // Add a friendly error message to the chat instead of just showing an error notification
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble generating a response right now. Our team is working on it. In the meantime, feel free to browse the education resources or explore portfolios on MyPalette."
      };
      setMessages(prev => [...prev, errorChatMessage]);
      
      if (errorMessage.includes('credit balance is too low')) {
        // Show toast but don't block the UI
        toast.error('AI assistant is currently experiencing connection issues. We\'re working on it!');
      } else {
        toast.error('Having trouble connecting to the AI. Please try again later.');
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

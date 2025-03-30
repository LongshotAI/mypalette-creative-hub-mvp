
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, useKnowledgeBase = false } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl || '', supabaseKey || '');
    
    // Default system prompt if not provided
    let finalSystemPrompt = systemPrompt || "You are a helpful assistant for MyPalette, a creative hub platform.";
    
    // If knowledge base integration is requested, fetch relevant entries
    if (useKnowledgeBase) {
      // Get the latest user message
      const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      if (userMessage) {
        try {
          // Fetch knowledge base entries that might be relevant
          const { data: knowledgeItems, error } = await supabase
            .from('knowledge_base')
            .select('title, content')
            .limit(15); // Increased limit to accommodate more knowledge entries
            
          if (!error && knowledgeItems && knowledgeItems.length > 0) {
            // Append knowledge base content to system prompt
            const knowledgeText = knowledgeItems.map(item => 
              `Title: ${item.title}\nContent: ${item.content}`
            ).join('\n\n');
            
            finalSystemPrompt += "\n\nHere is some information from our knowledge base that might help you answer the user's question:\n" + knowledgeText;
            
            console.log('Knowledge base entries found: ' + knowledgeItems.length);
          } else {
            console.log('No knowledge base entries found or error occurred:', error);
          }
        } catch (e) {
          console.error('Error fetching knowledge base:', e);
        }
      }
    }

    try {
      // Check if API key is available
      if (!elevenLabsApiKey) {
        throw new Error('ElevenLabs API key is not configured');
      }

      // Prepare the messages for ElevenLabs
      const userMessage = messages[messages.length - 1].content;
      
      // Format conversation history - this is important for ElevenLabs to understand the context
      const conversationHistory = messages.length > 1 
        ? messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n') 
        : '';

      // Call ElevenLabs chat API
      const response = await fetch('https://api.elevenlabs.io/v1/chat', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'eleven_turbo_v2',
          system_prompt: finalSystemPrompt,
          history: conversationHistory,
          input: userMessage,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error from ElevenLabs API:', errorData);
        
        // Special handling for API limit errors
        if (errorData.includes('rate limit') || errorData.includes('quota exceeded')) {
          return new Response(JSON.stringify({ 
            error: {
              message: 'The AI assistant is currently unavailable due to API limitations. Please contact support to resolve this issue.'
            },
            errorType: 'api_limit'
          }), {
            status: 429, // Too Many Requests
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('ElevenLabs response received:', JSON.stringify(data).slice(0, 200) + '...');

      return new Response(JSON.stringify({ content: data.output.text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calling ElevenLabs API:', error);
      throw new Error(`Failed to call ElevenLabs API: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in eleven-labs-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

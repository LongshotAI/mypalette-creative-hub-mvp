
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
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
      if (!anthropicApiKey) {
        throw new Error('Anthropic API key is not configured');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages,
          system: finalSystemPrompt,
        }),
      });

      const data = await response.json();
      
      // Check if there's an error in the response
      if (data.type === 'error') {
        console.error('Error from Anthropic API:', data.error);
        
        // Special handling for credit balance errors
        if (data.error?.message?.includes('credit balance is too low')) {
          return new Response(JSON.stringify({ 
            error: {
              message: 'The AI assistant is currently unavailable due to API credit limitations. Please contact support to resolve this issue.'
            },
            errorType: 'credit_limit'
          }), {
            status: 402, // Payment Required
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ error: data.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Anthropic response received:', JSON.stringify(data).slice(0, 200) + '...');

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw new Error(`Failed to call Anthropic API: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in anthropic-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
            .limit(5);
            
          if (!error && knowledgeItems && knowledgeItems.length > 0) {
            // Append knowledge base content to system prompt
            const knowledgeText = knowledgeItems.map(item => 
              `Title: ${item.title}\nContent: ${item.content}`
            ).join('\n\n');
            
            finalSystemPrompt += "\n\nHere is some information from our knowledge base that might help you answer the user's question:\n" + knowledgeText;
          }
        } catch (e) {
          console.error('Error fetching knowledge base:', e);
        }
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey || '',
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
    
    console.log('Anthropic response received:', JSON.stringify(data).slice(0, 200) + '...');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in anthropic-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

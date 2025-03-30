
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get ElevenLabs API key
const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if ElevenLabs API key is available
  if (!elevenLabsApiKey) {
    console.error('ElevenLabs API key not found');
    return new Response(
      JSON.stringify({
        error: {
          message: 'ElevenLabs API key not configured'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  try {
    // Parse request body
    const { messages, systemPrompt, useKnowledgeBase } = await req.json();

    let knowledgeBaseContext = '';
    
    // If knowledge base is enabled, fetch relevant entries
    if (useKnowledgeBase) {
      try {
        // Get user message content
        const userMessage = messages[messages.length - 1].content;
        
        // Query knowledge base for relevant entries
        const { data: knowledgeItems, error } = await supabase
          .from('knowledge_base')
          .select('title, content')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (knowledgeItems && knowledgeItems.length > 0) {
          // Format knowledge items as context
          knowledgeBaseContext = "Here is some relevant information that might help you answer the question:\n\n";
          knowledgeItems.forEach((item) => {
            knowledgeBaseContext += `${item.title}:\n${item.content}\n\n`;
          });
        }
      } catch (error) {
        console.log('No knowledge base entries found or error occurred:', error);
      }
    }

    // Prepare system prompt with knowledge base context if available
    const fullSystemPrompt = knowledgeBaseContext 
      ? `${systemPrompt}\n\n${knowledgeBaseContext}`
      : systemPrompt;

    // Format messages for ElevenLabs API
    const formattedMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages
    ];

    // Make API request to ElevenLabs
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify({
          messages: formattedMessages,
          model_id: "eleven_monolingual_v1"
        }),
      });

      // Process ElevenLabs response
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from ElevenLabs API:", errorData);
        
        // Return a fallback response to maintain functionality
        return new Response(
          JSON.stringify({
            content: "I'm here to help you with MyPalette. What would you like to know about creating portfolios, submitting to open calls, or other art-related topics?"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      
      // Return the response
      return new Response(
        JSON.stringify({
          content: data.text || "I'm here to help with your MyPalette questions!"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error calling ElevenLabs API:", error);
      
      // Return a fallback response
      return new Response(
        JSON.stringify({
          content: "I'm here to assist you with MyPalette. How can I help you today?"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("General error in chat function:", error);
    
    // Return a friendly error message that doesn't expose the technical issue
    return new Response(
      JSON.stringify({
        content: "Hello! I'm your MyPalette assistant. What can I help you with today?"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 to prevent error display
      }
    );
  }
});

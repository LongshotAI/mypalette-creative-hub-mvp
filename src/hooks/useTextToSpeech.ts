
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element if it doesn't exist
  const getAudioElement = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add event listeners
      audioRef.current.addEventListener('ended', () => {
        setIsSpeaking(false);
      });
      
      audioRef.current.addEventListener('error', () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
      });
    }
    
    return audioRef.current;
  };
  
  // Speak function
  const speak = async (text: string, voiceId?: string) => {
    try {
      setError(null);
      
      // Don't start a new speech if already speaking
      if (isSpeaking) {
        stopSpeaking();
      }
      
      setIsSpeaking(true);
      
      // Call the edge function to get the audio
      const { data, error: functionError } = await supabase.functions.invoke('eleven-labs-tts', {
        body: { text, voiceId },
      });
      
      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate speech');
      }
      
      if (!data) {
        throw new Error('No audio data received');
      }
      
      // Convert the ArrayBuffer to a Blob
      const audioData = new Uint8Array(data);
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      // Play the audio
      const audio = getAudioElement();
      audio.src = url;
      await audio.play();
      
      // Clean up the blob URL when done
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsSpeaking(false);
      };
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(err.message || 'Failed to generate speech');
      setIsSpeaking(false);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };
  
  return {
    speak,
    stopSpeaking,
    isSpeaking,
    error,
  };
}

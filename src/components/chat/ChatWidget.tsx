
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, RefreshCw } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    addMessage, 
    isLoading, 
    error,
    resetChat
  } = useChat({
    useKnowledgeBase: true,
    customSystemPrompt: `
      You are a helpful assistant for MyPalette, a creative hub platform.
      You help users with questions about using the platform, creating portfolios,
      submitting to open calls, and other art-related queries.
      
      If you are asked about Pixel Palette Nation (PPN), you have specific knowledge about their
      collections, organization structure, and community resources. Provide detailed information
      about PPN collections, marketing strategies, and narrative development when relevant.
      
      Always be friendly, helpful, and concise in your responses.
      If you don't know the answer to something, say so honestly.
      
      If you encounter any errors, respond in a friendly way without mentioning technical problems.
    `
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      addMessage(inputValue);
      setInputValue('');
    }
  };

  const handleReset = () => {
    resetChat();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          onClick={handleToggle}
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </Button>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col w-80 sm:w-96 h-96 border border-gray-200 dark:border-gray-800">
          {/* Chat header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-primary" size={20} />
              <h3 className="font-medium">MyPalette Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReset}
                      className="h-8 w-8 p-0 rounded-full"
                      aria-label="Reset chat"
                    >
                      <RefreshCw size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggle}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Close chat"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                How can I help you with MyPalette today? You can also ask about Pixel Palette Nation (PPN) collections and resources.
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === 'user' 
                      ? "bg-primary/10 ml-auto" 
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-3 max-w-[80%]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

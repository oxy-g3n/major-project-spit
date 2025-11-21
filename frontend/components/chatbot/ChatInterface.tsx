'use client';

import { useState, useRef, useEffect } from 'react';
import { ProcessedSensorData, ChatMessage } from '@/types/sensor';
import MessageBubble from './MessageBubble';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  sensorData: ProcessedSensorData[];
}

export default function ChatInterface({ sensorData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your IoT sensor data analyst. Ask me anything about the temperature, humidity, pressure readings, or environmental conditions from your sensor network.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sensorData
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      let errorContent = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}.`;
      
      // Check if it's an API key issue
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('Invalid API Key'))) {
        errorContent = `⚠️ API Key Error: Your Groq API key appears to be invalid or missing.\n\n` +
          `Current key in .env.local starts with "xai-" which is an XAI key, not Groq.\n\n` +
          `To fix:\n` +
          `1. Get a Groq API key from https://console.groq.com (starts with "gsk_")\n` +
          `2. Update GROQ_API_KEY in .env.local\n` +
          `3. Restart the dev server\n\n` +
          `The chatbot needs a Groq API key, not XAI.`;
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-semibold text-gray-900">AI Sensor Analyst</h1>
        <p className="text-sm text-gray-600">Ask questions about your sensor data</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="bg-gray-200 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600">Analyzing data...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about sensor data..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

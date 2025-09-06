import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hi! I\'m here to help you understand your route optimization results. Feel free to ask me about efficiency, alternative routes, or any other questions!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const predefinedResponses = {
    'efficiency': 'Your route efficiency of 87% means we\'ve optimized your path to save time and distance. This considers traffic patterns, road conditions, and stop sequencing.',
    'alternative': 'I can suggest alternative routes! Would you like to see options that prioritize: 1) Fastest time, 2) Shortest distance, or 3) Scenic routes?',
    'traffic': 'Current traffic conditions are factored into your route. We use real-time data to avoid congested areas and suggest optimal departure times.',
    'fuel': 'Your optimized route can save approximately 12% in fuel costs compared to standard routing by reducing unnecessary distance and idling time.',
    'time': 'The estimated time includes buffer for traffic, stops, and typical driving conditions. Actual time may vary based on real-time conditions.',
    'default': 'I\'m here to help with route optimization questions! You can ask me about efficiency, alternative routes, traffic conditions, fuel savings, or timing estimates.'
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simple keyword-based response
    setTimeout(() => {
      const lowercaseInput = inputValue.toLowerCase();
      let response = predefinedResponses.default;

      if (lowercaseInput.includes('efficiency') || lowercaseInput.includes('optimize')) {
        response = predefinedResponses.efficiency;
      } else if (lowercaseInput.includes('alternative') || lowercaseInput.includes('other')) {
        response = predefinedResponses.alternative;
      } else if (lowercaseInput.includes('traffic')) {
        response = predefinedResponses.traffic;
      } else if (lowercaseInput.includes('fuel') || lowercaseInput.includes('gas')) {
        response = predefinedResponses.fuel;
      } else if (lowercaseInput.includes('time') || lowercaseInput.includes('duration')) {
        response = predefinedResponses.time;
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-80 h-96 shadow-2xl border-0 bg-white/95 backdrop-blur-sm flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>Route Assistant</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-0.5 text-white" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your route..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={sendMessage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
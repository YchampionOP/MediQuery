import {
    Bot,
    Copy,
    FileText,
    Heart,
    Mic,
    MicOff,
    Pill,
    Save,
    Send,
    Stethoscope,
    Trash2,
    TrendingUp,
    User,
    Volume2,
    VolumeX
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './ChatInterface.css';

// Define types directly in the component since we can't import from @types
type UserRole = 'clinician' | 'patient';

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  source: string;
  type: string;
  highlights: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  searchResults?: SearchResult[];
  suggestions?: string[];
  toolCalls?: ToolCall[];
  metadata?: Record<string, any>;
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface ChatInterfaceProps {
  userRole: UserRole;
  patientId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userRole, patientId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate connection to backend
    const connectToBackend = async () => {
      try {
        // In a real app, this would connect to Socket.IO or WebSocket
        setIsConnected(true);
        
        // Join session
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userRole,
            patientId
          }),
        });
        
        if (response.ok) {
          console.log('Connected to chat session');
        }
      } catch (error) {
        console.error('Failed to connect to chat:', error);
      }
    };

    connectToBackend();

    // Add welcome message based on user role
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      content: userRole === 'clinician' 
        ? 'Hello! I\'m your AI clinical assistant. I can help you search patient records, analyze medical data, find research evidence, and support clinical decision-making. What would you like to explore today?'
        : 'Hi there! I\'m here to help you understand your health information in simple terms. You can ask me about your test results, medications, or any health questions you might have. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      suggestions: userRole === 'clinician' 
        ? [
            'Show me patients with diabetes and recent chest pain',
            'Find research on ACE inhibitors for elderly patients',
            'Check drug interactions for metformin',
            'Analyze trends in recent lab results'
          ]
        : [
            'Explain my recent blood test results',
            'What should I know about my medications?',
            'Help me understand my diagnosis',
            'Show me my health trends over time'
          ]
    };

    setMessages([welcomeMessage]);

    return () => {
      // Cleanup
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [userRole, patientId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Real-time streaming response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          sessionId,
          userRole,
          patientId,
          tool: activeTool
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                assistantMessage = {
                  ...assistantMessage,
                  content: assistantMessage.content + data.content
                };
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = assistantMessage;
                  return newMessages;
                });
              } else if (data.type === 'search_results') {
                assistantMessage = {
                  ...assistantMessage,
                  searchResults: data.results
                };
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = assistantMessage;
                  return newMessages;
                });
              } else if (data.type === 'suggestions') {
                assistantMessage = {
                  ...assistantMessage,
                  suggestions: data.suggestions
                };
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = assistantMessage;
                  return newMessages;
                });
              } else if (data.type === 'tool_call') {
                const newToolCall: ToolCall = {
                  id: data.tool_call.id,
                  name: data.tool_call.name,
                  arguments: data.tool_call.arguments,
                  result: data.tool_call.result
                };
                
                assistantMessage = {
                  ...assistantMessage,
                  toolCalls: [...(assistantMessage.toolCalls || []), newToolCall]
                };
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = assistantMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const toggleTextToSpeech = (message: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
      setIsSpeaking(true);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
      setSessionId(`session-${Date.now()}`);
    }
  };

  const saveChat = async () => {
    try {
      const response = await fetch('/api/chat/sessions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messages,
          userRole,
          patientId
        }),
      });

      if (response.ok) {
        alert('Chat saved successfully!');
      } else {
        throw new Error('Failed to save chat');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Failed to save chat. Please try again.');
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-content">
          <div className="header-info">
            <h2>
              {userRole === 'clinician' ? (
                <><Stethoscope size={20} /> Clinical AI Assistant</>
              ) : (
                <><Heart size={20} /> Health AI Assistant</>
              )}
            </h2>
            <p>
              {userRole === 'clinician' 
                ? 'Ask questions about patients, research, or clinical protocols'
                : 'Get easy-to-understand explanations of your health information'
              }
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="header-action-button"
              onClick={saveChat}
              title="Save conversation"
            >
              <Save size={18} />
            </button>
            <button 
              className="header-action-button"
              onClick={clearChat}
              title="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
            <button 
              className={`header-action-button ${isConnected ? 'connected' : 'disconnected'}`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            >
              <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
            </button>
          </div>
        </div>
        
        {userRole === 'clinician' && (
          <div className="tool-selector">
            <button 
              className={activeTool === 'search' ? 'active' : ''}
              onClick={() => setActiveTool(activeTool === 'search' ? null : 'search')}
              title="Search medical records"
            >
              <FileText size={16} />
            </button>
            <button 
              className={activeTool === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTool(activeTool === 'analytics' ? null : 'analytics')}
              title="Analyze patient data"
            >
              <TrendingUp size={16} />
            </button>
            <button 
              className={activeTool === 'medications' ? 'active' : ''}
              onClick={() => setActiveTool(activeTool === 'medications' ? null : 'medications')}
              title="Check medications"
            >
              <Pill size={16} />
            </button>
            <button 
              className={activeTool === 'research' ? 'active' : ''}
              onClick={() => setActiveTool(activeTool === 'research' ? null : 'research')}
              title="Find research"
            >
              <FileText size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className="message-content">
              <div className="message-text">
                <p>{message.content}</p>
              </div>
              
              {message.searchResults && message.searchResults.length > 0 && (
                <div className="search-results">
                  <h4>Related Information:</h4>
                  <div className="results-grid">
                    {message.searchResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="result-card">
                        <h5>{result.title}</h5>
                        <p>{result.summary}</p>
                        <div className="result-meta">
                          <span className="result-type">{result.type}</span>
                          <span className="result-source">{result.source}</span>
                          <span className="relevance-score">
                            {Math.round(result.relevanceScore * 100)}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="tool-calls">
                  <h4>Tools Used:</h4>
                  {message.toolCalls.map((toolCall, index) => (
                    <div key={index} className="tool-call">
                      <span className="tool-name">{toolCall.name}</span>
                      <span className="tool-args">{JSON.stringify(toolCall.arguments)}</span>
                    </div>
                  ))}
                </div>
              )}

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="suggestions">
                  <h4>You might also ask:</h4>
                  <div className="suggestion-buttons">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-button"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="message-actions">
                <button 
                  className="action-button"
                  onClick={() => copyMessage(message.content)}
                  title="Copy message"
                >
                  <Copy size={14} />
                </button>
                <button 
                  className="action-button"
                  onClick={() => toggleTextToSpeech(message.content)}
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
            
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              userRole === 'clinician'
                ? 'Ask about patients, medications, research, or clinical guidelines...'
                : 'Ask about your health, test results, or medications...'
            }
            rows={1}
            disabled={isLoading}
          />
          
          <div className="input-actions">
            <button
              className="voice-button"
              onClick={startVoiceRecognition}
              disabled={isLoading || isListening}
              title="Voice input"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        
        <div className="input-hints">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
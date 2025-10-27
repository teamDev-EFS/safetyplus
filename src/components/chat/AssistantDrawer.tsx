import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: Array<{
    type: 'openProduct' | 'search' | 'openOrder' | 'openUrl';
    payload: any;
  }>;
}

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantDrawer({ isOpen, onClose }: AssistantDrawerProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Anaya, your SafetyPlus assistant. I can help you find products, track orders, or schedule a meeting. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const savedSpeak = localStorage.getItem('assistant-speak-enabled');
    if (savedSpeak) {
      setSpeakEnabled(JSON.parse(savedSpeak));
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!speakEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeak = () => {
    const newValue = !speakEnabled;
    setSpeakEnabled(newValue);
    localStorage.setItem('assistant-speak-enabled', JSON.stringify(newValue));
    if (!newValue) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    window.speechSynthesis.cancel();

    try {
      const response = await getAssistantResponse([...messages, userMessage]);
      setMessages((prev) => [...prev, response]);

      if (speakEnabled && response.content) {
        speak(response.content);
      }
    } catch (error) {
      console.error('Assistant error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAssistantResponse = async (conversationMessages: Message[]): Promise<Message> => {
    const lastMessage = conversationMessages[conversationMessages.length - 1].content.toLowerCase();

    if (lastMessage.includes('meeting') || lastMessage.includes('demo') || lastMessage.includes('schedule')) {
      return {
        role: 'assistant',
        content: "I'd be happy to help you schedule a meeting! Click the button below to book a time that works for you.",
        actions: [
          {
            type: 'openUrl',
            payload: {
              url: import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com',
              label: 'Schedule on Calendly',
            },
          },
        ],
      };
    }

    if (lastMessage.includes('track') && lastMessage.includes('order')) {
      return {
        role: 'assistant',
        content: 'To track your order, please provide your order number and email address, or visit the Track Order page.',
        actions: [
          {
            type: 'openUrl',
            payload: {
              url: '/track-order',
              label: 'Track Order',
            },
          },
        ],
      };
    }

    if (lastMessage.includes('cabinet') || lastMessage.includes('ppe') || lastMessage.includes('safety') || lastMessage.includes('fire')) {
      return {
        role: 'assistant',
        content: "I can help you find safety equipment! Let me show you our product catalog where you can browse by category.",
        actions: [
          {
            type: 'openUrl',
            payload: {
              url: '/shop',
              label: 'Browse Products',
            },
          },
        ],
      };
    }

    if (lastMessage.includes('contact') || lastMessage.includes('call') || lastMessage.includes('email')) {
      return {
        role: 'assistant',
        content: 'You can reach us at 0422 4982221 or email support@safetyplus.com. Visit our contact page for more information.',
        actions: [
          {
            type: 'openUrl',
            payload: {
              url: '/contact',
              label: 'Contact Us',
            },
          },
        ],
      };
    }

    if (lastMessage.includes('help') || lastMessage.includes('hi') || lastMessage.includes('hello')) {
      return {
        role: 'assistant',
        content: "Hello! I can help you with:\n• Finding safety products\n• Tracking your orders\n• Scheduling a meeting\n• Answering questions about our company\n\nWhat would you like to know?",
      };
    }

    return {
      role: 'assistant',
      content: "I can help you find safety equipment, track orders, or schedule a meeting. Could you please provide more details about what you're looking for?",
    };
  };

  const quickActions = [
    { label: 'Find safety cabinets', query: 'Show me safety cabinets' },
    { label: 'Track my order', query: 'Track my order' },
    { label: 'Schedule a meeting', query: 'Schedule a demo meeting' },
    { label: 'Contact support', query: 'How can I contact you?' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Anaya</h2>
            <p className="text-sm opacity-90">SafetyPlus AI Assistant</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {messages.length === 1 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              🔒 Your conversations are private and secure. We use your data only to assist you.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, actionIndex) => (
                      <a
                        key={actionIndex}
                        href={action.payload.url}
                        target={action.payload.url.startsWith('http') ? '_blank' : undefined}
                        rel={action.payload.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block w-full px-4 py-2 bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-center font-medium text-sm"
                      >
                        {action.payload.label || 'Open Link'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(action.query);
                  }}
                  className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleRecording}
              disabled={loading}
              className={`p-3 rounded-xl transition ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={toggleSpeak}
              className={`p-3 rounded-xl transition ${
                speakEnabled
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={speakEnabled ? 'Disable voice output' : 'Enable voice output'}
            >
              {speakEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading || isRecording}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            AI Assistant • Powered by SafetyPlus
          </p>
        </div>
      </div>
    </>
  );
}

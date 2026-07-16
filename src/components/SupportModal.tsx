import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Mail, MessageSquare } from 'lucide-react';
import { 
  AdminSettings, 
  SupportMessage, 
  getAdminSettings, 
  getStudentMessages, 
  sendSupportMessage,
  markMessagesAsRead
} from '../lib/support';

interface SupportModalProps {
  userId: string;
  onClose: () => void;
}

export default function SupportModal({ userId, onClose }: SupportModalProps) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    const [fetchedSettings, fetchedMessages] = await Promise.all([
      getAdminSettings(),
      getStudentMessages(userId)
    ]);
    
    if (fetchedSettings) setSettings(fetchedSettings);
    setMessages(fetchedMessages);
    setIsLoading(false);

    // Mark admin messages as read
    const hasUnreadAdmin = fetchedMessages.some(m => m.sender_type === 'admin' && !m.is_read);
    if (hasUnreadAdmin) {
      await markMessagesAsRead(userId, 'student');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg: SupportMessage = {
      id: Math.random().toString(),
      user_id: userId,
      sender_type: 'student',
      content: newMessage,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    const sent = await sendSupportMessage(userId, tempMsg.content, 'student');
    if (sent) {
      // Refresh to get actual DB ID and timestamp
      const updatedMessages = await getStudentMessages(userId);
      setMessages(updatedMessages);
    } else {
      // handle error, remove temp msg if desired
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Central de Suporte</h2>
              <p className="text-xs text-slate-400">Tire suas dúvidas direto com a coordenação</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Info (Settings) */}
        {settings && (
          <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex gap-4">
            {settings.support_phone && (
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-1 justify-center">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{settings.support_phone}</span>
              </div>
            )}
            {settings.support_email && (
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-1 justify-center">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">{settings.support_email}</span>
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-400 text-sm">
              Carregando mensagens...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <p className="text-slate-600 font-medium text-sm">Nenhuma mensagem ainda</p>
                <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                  Envie uma mensagem abaixo para iniciar o atendimento.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isStudent = msg.sender_type === 'student';
              return (
                <div key={msg.id || i} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isStudent 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className={`text-[9px] mt-1 text-right ${isStudent ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

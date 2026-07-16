import React, { useState, useEffect } from 'react';
import { Mail, Phone, Save, MessageSquare, User } from 'lucide-react';
import { 
  AdminSettings, 
  SupportMessage, 
  getAdminSettings, 
  updateAdminSettings,
  getAllMessagesGroupedByUser,
  sendSupportMessage,
  markMessagesAsRead
} from '../lib/support';

export default function SuporteManager() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [groupedMessages, setGroupedMessages] = useState<Record<string, SupportMessage[]>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // refresh 10s
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    const data = await getAdminSettings();
    if (data) {
      setSettings(data);
      setEmail(data.support_email);
      setPhone(data.support_phone);
    }
  };

  const fetchMessages = async () => {
    const data = await getAllMessagesGroupedByUser();
    setGroupedMessages(data);
    setIsLoadingMessages(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const success = await updateAdminSettings(email, phone);
    if (success) {
      alert("Configurações de suporte atualizadas!");
      fetchSettings();
    } else {
      alert("Erro ao salvar configurações.");
    }
    setIsSavingSettings(false);
  };

  const handleSelectUser = async (userId: string) => {
    setSelectedUser(userId);
    // Mark as read
    const messages = groupedMessages[userId];
    if (messages?.some(m => m.sender_type === 'student' && !m.is_read)) {
      await markMessagesAsRead(userId, 'admin');
      fetchMessages(); // refresh state
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const tempMsg: SupportMessage = {
      id: Math.random().toString(),
      user_id: selectedUser,
      sender_type: 'admin',
      content: newMessage,
      is_read: true,
      created_at: new Date().toISOString()
    };

    setGroupedMessages(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), tempMsg]
    }));
    setNewMessage('');

    const sent = await sendSupportMessage(selectedUser, tempMsg.content, 'admin');
    if (sent) {
      fetchMessages();
    }
  };

  const userIds = Object.keys(groupedMessages).sort((a, b) => {
    // Sort by latest message
    const msgA = groupedMessages[a];
    const msgB = groupedMessages[b];
    const lastA = msgA[msgA.length - 1]?.created_at || '';
    const lastB = msgB[msgB.length - 1]?.created_at || '';
    return new Date(lastB).getTime() - new Date(lastA).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Contatos Oficiais</h2>
            <p className="text-xs text-slate-500">Telefone e email exibidos para os alunos na aba Suporte.</p>
          </div>
        </div>
        <div className="p-5 flex items-end gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">E-mail de Suporte</label>
            <input 
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="ex: suporte@caboveio.com.br"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Telefone/WhatsApp</label>
            <input 
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="ex: (31) 99999-9999"
            />
          </div>
          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center space-x-2 h-[38px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingSettings ? 'Salvando...' : 'Salvar Contatos'}</span>
          </button>
        </div>
      </div>

      {/* Chat Inbox */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex h-[600px]">
        {/* User List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Caixa de Entrada
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingMessages ? (
              <div className="text-center text-sm text-slate-500 mt-10">Carregando...</div>
            ) : userIds.length === 0 ? (
              <div className="text-center text-sm text-slate-500 mt-10">Nenhuma mensagem.</div>
            ) : (
              userIds.map(uid => {
                const msgs = groupedMessages[uid];
                const lastMsg = msgs[msgs.length - 1];
                const unreadCount = msgs.filter(m => m.sender_type === 'student' && !m.is_read).length;
                const isSelected = selectedUser === uid;

                return (
                  <button
                    key={uid}
                    onClick={() => handleSelectUser(uid)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-white border border-transparent'
                    }`}
                  >
                    <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-semibold text-sm text-slate-800 truncate" title={uid}>{uid}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(lastMsg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {lastMsg.sender_type === 'admin' ? 'Você: ' : ''}{lastMsg.content}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
                <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedUser}</h3>
                  <p className="text-xs text-slate-500">Atendimento via Chat</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedMessages[selectedUser]?.map(msg => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm text-sm ${
                        isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-200" />
              <p>Selecione um aluno para ver as mensagens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// LOKASI FILE: app/student/dashboard/components/GroupChat.tsx
'use client';

import React, { useState } from 'react';

// Definisikan tipe untuk setiap pesan
interface Message {
  id: number;
  user: string;
  avatarInitial: string;
  avatarColor: string;
  text: string;
  time: string;
  isSender: boolean;
}

// Data awal (dummy data)
const initialMessages: Message[] = [
  { id: 1, user: 'Pak Budi', avatarInitial: 'PB', avatarColor: 'bg-purple-200 text-purple-800', text: 'Jangan lupa ujian matematika besok ya!', time: '10:30', isSender: false },
  { id: 2, user: 'Sari', avatarInitial: 'S', avatarColor: 'bg-blue-200 text-blue-800', text: 'Ada yang mau belajar bareng?', time: '10:45', isSender: false },
];

export default function GroupChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const newMsg: Message = {
      id: messages.length + 1,
      user: 'Ahmad Syahrul',
      avatarInitial: 'AS',
      avatarColor: 'bg-gray-200 text-gray-800',
      text: newMessage,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isSender: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Group Chat Kelas</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">23 online</span>
        </div>
      </div>
      <div className="h-64 overflow-y-auto space-y-4 mb-4 p-3 bg-gray-50 rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start space-x-2 ${msg.isSender ? 'justify-end' : ''}`}>
            {!msg.isSender && (
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.avatarColor}`}>
                <span className="font-bold text-xs">{msg.avatarInitial}</span>
              </div>
            )}
            <div className={`p-3 rounded-lg max-w-xs ${msg.isSender ? 'bg-purple-600 text-white' : 'bg-white shadow-sm'}`}>
              {!msg.isSender && <p className="text-xs font-bold text-purple-600 mb-1">{msg.user}</p>}
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.isSender ? 'text-purple-200 text-right' : 'text-gray-500'}`}>{msg.time}</p>
            </div>
             {msg.isSender && (
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.avatarColor}`}>
                <span className="font-bold text-xs">{msg.avatarInitial}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ketik pesan..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
        <button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}

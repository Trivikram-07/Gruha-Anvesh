import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Loader2, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ Works in both dev and production
const socket = io('/', {
  auth: {
    token: localStorage.getItem('token') || '',
  },
  withCredentials: true,
});


interface ChatSummary {
  userId: string;
  username: string;
  lastMessage: string;
  lastTimestamp: Date;
  propertyId: string;
  propertyName: string;
  imageUrl: string;
  propertyType?: string;
  unreadCount: number;
}

interface Message {
  _id?: string;
  sender: { _id: string; username: string };
  recipient: { _id: string; username: string };
  propertyId: string;
  content: string;
  timestamp: Date;
  property?: { propertyName: string; images: string[] };
  isRead: boolean;
}

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching chats with Token:', token);
      try {
        const response = await fetch('/api/properties/messages/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch chats: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched chats:', data);
        setChats(data.map((chat: ChatSummary) => ({ ...chat, unreadCount: chat.unreadCount || 0 })));
      } catch (err) {
        console.error('Fetch chats error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();

    socket.on('receiveMessage', (message: Message) => {
      console.log('Received message:', message);
      if (message.recipient._id === userId && !message.isRead) {
        updateChatList(message, true);
      }

      if (
        selectedChat &&
        message.propertyId === selectedChat.propertyId &&
        ((message.sender._id === userId && message.recipient._id === selectedChat.userId) ||
         (message.sender._id === selectedChat.userId && message.recipient._id === userId))
      ) {
        const messageId = message._id || `${new Date(message.timestamp).getTime()}-${message.content}`;
        setMessages((prev) => {
          const exists = prev.some(m =>
            (m._id && m._id === message._id) ||
            `${new Date(m.timestamp).getTime()}-${m.content}` === messageId
          );
          if (!exists) {
            const newMessages = [...prev, { ...message, isRead: true }];
            return newMessages.sort((a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          }
          return prev;
        });

        if (selectedChat) {
          markMessageAsRead(message);
        }
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedChat, userId]);

  const markMessageAsRead = async (message: Message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/properties/messages/${message.propertyId}/messages/mark-read`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ otherUserId: message.sender._id }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to mark message as read: ${errorData.message || response.statusText}`);
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.propertyId === message.propertyId && chat.userId === message.sender._id
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
      socket.emit('chatRead', { propertyId: message.propertyId, otherUserId: message.sender._id });
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching messages for chat:', selectedChat.propertyId, 'with Token:', token);
      try {
        const response = await fetch(
          `/api/properties/messages/${selectedChat.propertyId}/messages`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch messages: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched messages:', data);
        const sortedMessages = [...data].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedMessages);

        const markReadResponse = await fetch(
          `/api/properties/messages/${selectedChat.propertyId}/messages/mark-read`,
          {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ otherUserId: selectedChat.userId }),
          }
        );
        if (!markReadResponse.ok) throw new Error('Failed to mark messages as read');
        setChats((prev) =>
          prev.map((chat) =>
            chat.propertyId === selectedChat.propertyId && chat.userId === selectedChat.userId
              ? { ...chat, unreadCount: 0 }
              : chat
          )
        );
        socket.emit('chatRead', { propertyId: selectedChat.propertyId, otherUserId: selectedChat.userId });
      } catch (err) {
        console.error('Fetch messages error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };
    fetchMessages();
    socket.emit('joinChat', { userId, otherUserId: selectedChat.userId, propertyId: selectedChat.propertyId });

    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 0;
    }
  }, [selectedChat, userId]);

  const updateChatList = (message: Message, isNew: boolean) => {
    const otherUserId = message.sender._id === userId ? message.recipient._id : message.sender._id;
    const otherUsername = message.sender._id === userId ? message.recipient.username : message.sender.username;
    const key = `${message.propertyId}-${[userId, otherUserId].sort().join('-')}`;

    setChats((prev) => {
      const existingChatIndex = prev.findIndex((chat) => `${chat.propertyId}-${[userId, chat.userId].sort().join('-')}` === key);
      const updatedChat = {
        userId: otherUserId,
        username: otherUsername,
        lastMessage: message.content,
        lastTimestamp: message.timestamp,
        propertyId: message.propertyId,
        propertyName: message.property?.propertyName || (existingChatIndex !== -1 ? prev[existingChatIndex].propertyName : selectedChat?.propertyName) || 'Unknown Property',
        imageUrl: message.property?.images?.[0] || (existingChatIndex !== -1 ? prev[existingChatIndex].imageUrl : selectedChat?.imageUrl) || 'https://placehold.co/50',
        propertyType: existingChatIndex !== -1 ? prev[existingChatIndex].propertyType : selectedChat?.propertyType,
        unreadCount: existingChatIndex !== -1 && isNew && message.recipient._id === userId && !selectedChat
          ? prev[existingChatIndex].unreadCount + 1
          : existingChatIndex !== -1
          ? prev[existingChatIndex].unreadCount
          : isNew && message.recipient._id === userId && !selectedChat
          ? 1
          : 0,
      };
      if (existingChatIndex !== -1) {
        const updatedChats = [...prev];
        updatedChats[existingChatIndex] = updatedChat;
        return updatedChats.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
      }
      return [updatedChat, ...prev].sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !userId) return;

    const messageData = {
      sender: userId,
      recipient: selectedChat.userId,
      propertyId: selectedChat.propertyId,
      propertyType: selectedChat.propertyType || 'PGProperty',
      content: newMessage,
    };
    console.log('Sending message:', messageData);

    const tempMessage = {
      sender: { _id: userId, username: 'You' },
      recipient: { _id: selectedChat.userId, username: selectedChat.username },
      propertyId: selectedChat.propertyId,
      content: newMessage,
      timestamp: new Date(),
      property: { propertyName: selectedChat.propertyName, images: [selectedChat.imageUrl] },
      isRead: false,
      _id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setMessages(prev => {
      const newMessages = [...prev, tempMessage];
      return newMessages.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    socket.emit('sendMessage', messageData);
    setNewMessage('');

    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 0;
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <MessageSquare className="h-8 w-8 mr-2 text-blue-600" /> Your Chats
          </h1>
          {!selectedChat ? (
            <div>
              {chats.length === 0 ? (
                <p className="text-gray-500 text-center">No chats yet. Start a conversation!</p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <motion.div
                      key={`${chat.propertyId}-${[userId, chat.userId].sort().join('-')}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer rounded-lg relative"
                      onClick={() => setSelectedChat(chat)}
                    >
                      <img
                        src={chat.imageUrl}
                        alt={chat.propertyName}
                        className="h-12 w-12 object-cover rounded-md mr-4"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/50')}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{chat.username}</p>
                        <p className="text-sm text-gray-600">{chat.propertyName}</p>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(chat.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full"></span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <button onClick={() => setSelectedChat(null)} className="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">{selectedChat.username} - {selectedChat.propertyName}</h2>
              </div>
              <div className="h-96 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg flex flex-col" ref={messageContainerRef}>
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center mt-auto">No messages yet</p>
                ) : (
                  <div className="flex flex-col">
                    {messages.map((msg) => (
                      <div
                        key={msg._id || `${new Date(msg.timestamp).getTime()}-${msg.content}`}
                        className={`flex mb-3 ${msg.sender._id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                            msg.sender._id === userId
                              ? 'bg-blue-500 text-white ml-auto rounded-bl-lg'
                              : 'bg-gray-200 text-gray-800 mr-auto rounded-br-lg'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className={`text-xs ${msg.sender._id === userId ? 'text-blue-100' : 'text-gray-500'} block mt-1 text-right`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChatList;
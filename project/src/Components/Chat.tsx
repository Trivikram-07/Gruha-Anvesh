import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

interface Message {
  _id?: string;
  sender: { _id: string; username: string };
  recipient: { _id: string; username: string };
  propertyId: string;
  propertyType: string;
  content: string;
  timestamp: Date;
  property?: { propertyName: string; images: string[] };
}


const Chat: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [propertyOwnerId, setPropertyOwnerId] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId') || '';
  const username = localStorage.getItem('username') || 'You';

  useEffect(() => {
    if (!socket) {
      socket = io({
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket'], // 👈 important to avoid 400 polling error
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true, // optional, based on backend CORS
      });
  
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
      });
  
      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        setError(`Connection error: ${err.message}`);
      });
  
      socket.on('disconnect', (reason) => {
        console.log('⚠️ Socket disconnected:', reason);
      });
    }
  
    return () => {
      socket?.off('connect');
      socket?.off('connect_error');
      socket?.off('disconnect');
      socket?.disconnect(); // Clean disconnect
      socket = null;
    };
  }, []);
  
  

  useEffect(() => {
    if (!propertyId) {
      setError('No property ID provided');
      setLoading(false);
      return;
    }

    const fetchPropertyDetailsAndMessages = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching property for:', propertyId);
        const types = ['pg', 'bhk', 'vacation'];
        let foundProperty = null;
        for (const type of types) {
          const response = await fetch(`/api/properties/${type}/${propertyId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            foundProperty = await response.json();
            setPropertyData(foundProperty);
            setPropertyOwnerId(foundProperty.user);
            setPropertyType(type === 'pg' ? 'PGProperty' : type === 'bhk' ? 'BHKHouse' : 'VacationSpot');
            console.log(`Found property: ${foundProperty.propertyName}, Owner: ${foundProperty.user}`);
            break;
          }
        }

        if (!foundProperty) throw new Error('Property not found');

        console.log('Fetching messages for:', propertyId);
        const messagesResponse = await fetch(
          `/api/properties/${propertyId}/messages`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!messagesResponse.ok) throw new Error(`Failed to fetch messages: ${await messagesResponse.text()}`);
        const messagesData = await messagesResponse.json();
        console.log('Fetched messages:', messagesData);
        setMessages(messagesData);

        if (socket) {
          socket.emit('joinChat', { userId, propertyId });
          console.log(`Joined chat as ${userId} for ${propertyId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetailsAndMessages();
  }, [propertyId]);

  useEffect(() => {
    if (!socket || !propertyId || !propertyOwnerId || !userId) return;

    const handleReceiveMessage = (message: Message) => {
      console.log('Received message:', message);
      if (
        message.propertyId === propertyId &&
        (message.sender._id === userId || message.recipient._id === userId)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          console.log('Adding message:', message, 'Exists?', exists);
          return exists ? prev : [...prev, message];
        });
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      setError(err.message);
    });

    return () => {
      socket?.off('receiveMessage', handleReceiveMessage);
      socket?.off('error');
    };
  }, [propertyId, propertyOwnerId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !propertyOwnerId || !propertyType || !propertyId || !socket) {
      console.log('Cannot send - missing:', {
        message: newMessage,
        propertyOwnerId,
        propertyType,
        propertyId,
        socket: socket ? 'connected' : 'disconnected',
      });
      return;
    }

    const messageData = {
      sender: { _id: userId, username },
      recipient: { _id: propertyOwnerId, username: propertyData?.ownerName || 'Owner' },
      propertyId,
      propertyType,
      content: newMessage,
    };

    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);

    const clientMessage: Message = {
      ...messageData,
      timestamp: new Date(),
      property: messages.length > 0 && messages[0].property
        ? messages[0].property
        : { propertyName: propertyData?.propertyName || 'Unknown Property', images: propertyData?.images || [] },
    };

    setMessages((prev) => [...prev, clientMessage]);
    setNewMessage('');
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading chat...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">{propertyData?.propertyName || 'Property Chat'}</h2>
          <p className="text-sm opacity-80">Chatting with {propertyData?.ownerName || 'Property Owner'}</p>
        </div>
        <div className="h-96 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet—start the convo!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id || `${msg.timestamp}-${msg.content}`}
                className={`mb-3 max-w-[75%] ${
                  msg.sender._id === userId ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'
                } p-3 rounded-lg shadow-sm`}
              >
                <p className="text-sm font-medium">{msg.sender._id === userId ? 'You' : msg.sender.username}</p>
                <p>{msg.content}</p>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-3">
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className={`px-4 py-2 rounded-r ${newMessage.trim() ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from 'socket.io-client';
import { CheckCircle, AlertCircle } from 'lucide-react';

const socket: Socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') },
});

interface Notification {
  _id: string;
  message: string;
  type: 'success' | 'info';
  timestamp: Date;
  isRead: boolean;
  propertyId?: string;
  propertyType?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    console.log('Fetching notifications with Token:', token);
    try {
      const response = await fetch('http://localhost:3000/api/properties/notifications/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch notifications: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      console.log('Fetched notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.on('bookingSuccess', ({ propertyId, propertyName }) => {
      const notification: Notification = {
        _id: `${propertyId}-${Date.now()}`,
        message: `Booking for ${propertyName} successful!`,
        type: 'success',
        timestamp: new Date(),
        isRead: false,
        propertyId,
        propertyType: 'VacationSpot',
      };
      setNotifications((prev) => [notification, ...prev]);
      fetchNotifications();
    });

    socket.on('reviewPrompt', ({ propertyId, propertyName }) => {
      const notification: Notification = {
        _id: `${propertyId}-${Date.now()}`,
        message: `Time to review ${propertyName}! Rate and share your experience.`,
        type: 'info',
        timestamp: new Date(),
        isRead: false,
        propertyId,
        propertyType: 'VacationSpot',
      };
      setNotifications((prev) => [notification, ...prev]);
      fetchNotifications();
    });

    return () => {
      socket.off('bookingSuccess');
      socket.off('reviewPrompt');
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('token');
    console.log('Marking notification as read:', notificationId, 'with Token:', token);
    try {
      const response = await fetch(`http://localhost:3000/api/properties/notifications/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to mark as read: ${errorData.message || response.statusText}`);
      }
      const updatedNotification = await response.json();
      console.log('Updated notification:', updatedNotification);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? updatedNotification : notif))
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) await markAsRead(notif._id);
    if (notif.type === 'success' && notif.propertyId) {
      navigate(`/vacation/${notif.propertyId}`, { state: { fromNotification: true } });
    } else if (notif.type === 'info' && notif.propertyId) {
      navigate(`/review/vacation/${notif.propertyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications yet</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className={`p-4 mb-4 bg-gray-800 rounded-lg flex items-start ${
              notif.isRead ? 'text-gray-400' : 'text-white'
            } hover:bg-gray-700 cursor-pointer`}
            onClick={() => handleNotificationClick(notif)}
          >
            {notif.type === 'success' ? (
              <CheckCircle className="h-6 w-6 mr-3 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 mr-3 text-blue-500" />
            )}
            <div>
              <p>{notif.message}</p>
              <span className="text-sm">{new Date(notif.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
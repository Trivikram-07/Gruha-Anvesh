import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bell, CheckCircle, AlertCircle, Menu, X } from 'lucide-react';
import logo from '/image1.png';

const socket = io('/', {
  auth: {
    token: localStorage.getItem('token'),
  },
  transports: ['websocket'],
  withCredentials: true,
});

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info';
  timestamp: Date;
  isRead: boolean;
  propertyId?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setUsername('');
      setNotifications([]);
      setUnreadMessages(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/properties/messages/chats/unread', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch unread count: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        setUnreadMessages(data.totalUnread || 0);
      } catch (err) {
        console.error('Fetch unread count error:', err);
      }
    };

    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch user details: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        setUsername(data.username || 'User');
      } catch (err) {
        console.error('Fetch user details error:', err);
      }
    };

    fetchUnreadCount();
    fetchUserDetails();

    socket.on('receiveMessage', (message) => {
      if (message.recipient._id === localStorage.getItem('userId') && !message.isRead) {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    socket.on('bookingSuccess', ({ propertyId, propertyName }) => {
      const notification: Notification = {
        id: `${propertyId}-${Date.now()}`,
        message: `Booking for ${propertyName} successful!`,
        type: 'success',
        timestamp: new Date(),
        isRead: false,
        propertyId,
      };
      setNotifications((prev) => [...prev, notification]);
    });

    socket.on('reviewPrompt', ({ propertyId, propertyName }) => {
      const notification: Notification = {
        id: `${propertyId}-${Date.now()}`,
        message: `Time to review ${propertyName}! Rate and share your experience.`,
        type: 'info',
        timestamp: new Date(),
        isRead: false,
        propertyId,
      };
      setNotifications((prev) => [...prev, notification]);
    });

    socket.on('chatRead', () => {
      fetchUnreadCount();
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('bookingSuccess');
      socket.off('reviewPrompt');
      socket.off('chatRead');
    };
  }, [isLoggedIn]);

  // Handle clicks outside dropdowns and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileDropdown((prev) => !prev);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfileDropdown(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu((prev) => !prev);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const latestNotification = notifications.length > 0 ? notifications[notifications.length - 1] : null;

  return (
    <nav className="sticky top-0 z-[1000] bg-gray-800 px-4 py-3 sm:px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Link to={isLoggedIn ? '/home' : '/'} className="flex items-center">
          <img src={logo} alt="Gruha Anvesh Logo" className="h-11 w-auto mr-2" />
        </Link>
      </div>

      {/* Hamburger Button for Mobile */}
      <button
        className="md:hidden text-white focus:outline-none"
        onClick={toggleMobileMenu}
        aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
      >
        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-6">
        {isLoggedIn ? (
          <>
            <Link to="/home" className="text-white hover:text-blue-200 font-medium">
              Home
            </Link>
            <Link to="/subscriptions" className="text-white hover:text-blue-200 font-medium">
              Subscriptions
            </Link>
            <Link to="/ContactUs" className="text-white hover:text-blue-200 font-medium">
              Contact Us
            </Link>
            <Link to="/upload" className="text-white hover:text-blue-200 font-medium">
              Upload
            </Link>
            <div className="relative" ref={profileRef}>
              <span
                className="flex items-center text-white hover:text-blue-200 cursor-pointer font-medium"
                onClick={toggleProfileDropdown}
              >
                Profile
                {unreadMessages > 0 && (
                  <span className="ml-2 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </span>
              <div
                className={`absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-[1000] overflow-hidden transition-all duration-300 ease-in-out transform ${
                  showProfileDropdown
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="text-white font-semibold text-lg px-4 py-2 border-b border-gray-700">
                  {username}
                </div>
                <Link
                  to="/profile/history"
                  className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                  onClick={() => {
                    console.log('History clicked');
                    setShowProfileDropdown(false);
                  }}
                >
                  History
                </Link>
                <Link
                  to="/profile/bookings"
                  className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                  onClick={() => {
                    console.log('Previous Bookings clicked');
                    setShowProfileDropdown(false);
                  }}
                >
                  Previous Bookings
                </Link>
                <Link
                  to="/chats"
                  className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                  onClick={() => {
                    console.log('Chat clicked');
                    setShowProfileDropdown(false);
                  }}
                >
                  Chat
                </Link>
                <Link
                  to="/profile/edit"
                  className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                  onClick={() => {
                    console.log('Edit Profile clicked');
                    setShowProfileDropdown(false);
                  }}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    console.log('Logout button clicked');
                    handleLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="relative" ref={notificationsRef}>
              <Bell
                className="h-6 w-6 text-white cursor-pointer hover:text-blue-200"
                onClick={toggleNotifications}
              />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
              <div
                className={`absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-[1000] overflow-hidden transition-all duration-300 ease-in-out transform ${
                  showNotifications
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                {latestNotification ? (
                  <div>
                    <div
                      className={`px-4 py-2 flex items-start ${
                        latestNotification.isRead ? 'text-gray-400' : 'text-white'
                      } hover:bg-gray-700 cursor-pointer`}
                      onClick={() => {
                        navigate(
                          latestNotification.type === 'success'
                            ? `/vacation/${latestNotification.propertyId}`
                            : `/review/vacation/${latestNotification.propertyId}`,
                          { state: { fromNotification: latestNotification.type === 'success' } }
                        );
                        setShowNotifications(false);
                      }}
                    >
                      {latestNotification.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                      )}
                      <div>
                        <p>{latestNotification.message}</p>
                        <span className="text-xs">
                          {new Date(latestNotification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-b-lg"
                    >
                      All Notifications
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 px-4 py-2">No notifications yet</p>
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-b-lg"
                    >
                      All Notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/home" className="text-white hover:text-blue-200 font-medium">
              Home
            </Link>
            <Link to="/signup" className="text-white hover:text-blue-200 font-medium">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 bg-gray-900 z-[1100] transform transition-transform duration-300 ease-in-out md:hidden ${
          showMobileMenu ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {isLoggedIn ? (
            <>
              <Link
                to="/home"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Home clicked (mobile)');
                  setShowMobileMenu(false);
                }}
              >
                Home
              </Link>
              <Link
                to="/subscriptions"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Subscriptions clicked (mobile)');
                  setShowMobileMenu(false);
                }}
              >
                Subscriptions
              </Link>
              <Link
                to="/ContactUs"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Contact Us clicked (mobile)');
                  setShowMobileMenu(false);
                }}
              >
                Contact Us
              </Link>
              <Link
                to="/upload"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Upload clicked (mobile)');
                  setShowMobileMenu(false);
                }}
              >
                Upload
              </Link>
              <div className="relative" ref={profileRef}>
                <span
                  className="flex items-center text-white text-xl hover:text-blue-200 cursor-pointer"
                  onClick={toggleProfileDropdown}
                >
                  Profile
                  {unreadMessages > 0 && (
                    <span className="ml-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </span>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-[1200] overflow-hidden transition-all duration-300 ease-in-out ${
                    showProfileDropdown
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-2 pointer-events-auto'
                  }`}
                >
                  <div className="text-white font-semibold text-lg px-4 py-2 border-b border-gray-700">
                    {username}
                  </div>
                  <Link
                    to="/profile/history"
                    className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                    onClick={(e) => {
                      console.log('History clicked (mobile)');
                      setShowProfileDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    History
                  </Link>
                  <Link
                    to="/profile/bookings"
                    className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                    onClick={(e) => {
                      console.log('Previous Bookings clicked (mobile)');
                      setShowProfileDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    Previous Bookings
                  </Link>
                  <Link
                    to="/chats"
                    className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                    onClick={(e) => {
                      console.log('Chat clicked (mobile)');
                      setShowProfileDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    Chat
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="block text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                    onClick={(e) => {
                      console.log('Edit Profile clicked (mobile)');
                      setShowProfileDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      console.log('Logout clicked (mobile)');
                      handleLogout();
                      setShowProfileDropdown(false);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left text-white hover:text-blue-200 px-4 py-2 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="relative" ref={notificationsRef}>
                <div className="flex items-center" onClick={toggleNotifications}>
                  <Bell className="h-6 w-6 text-white cursor-pointer hover:text-blue-200" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-[1200] overflow-hidden transition-all duration-300 ease-in-out ${
                    showNotifications
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-2 pointer-events-auto'
                  }`}
                >
                  {latestNotification ? (
                    <div>
                      <div
                        className={`px-4 py-2 flex items-start ${
                          latestNotification.isRead ? 'text-gray-400' : 'text-white'
                        } hover:bg-gray-700 cursor-pointer`}
                        onClick={() => {
                          console.log('Notification clicked (mobile)');
                          navigate(
                            latestNotification.type === 'success'
                              ? `/vacation/${latestNotification.propertyId}`
                              : `/review/vacation/${latestNotification.propertyId}`,
                            { state: { fromNotification: latestNotification.type === 'success' } }
                          );
                          setShowNotifications(false);
                          setShowMobileMenu(false);
                        }}
                      >
                        {latestNotification.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                        )}
                        <div>
                          <p>{latestNotification.message}</p>
                          <span className="text-xs">
                            {new Date(latestNotification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log('All Notifications clicked (mobile)');
                          navigate('/notifications');
                          setShowNotifications(false);
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-center text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-b-lg"
                      >
                        All Notifications
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 px-4 py-2">No notifications yet</p>
                      <button
                        onClick={() => {
                          console.log('All Notifications clicked (mobile)');
                          navigate('/notifications');
                          setShowNotifications(false);
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-center text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-b-lg"
                      >
                        All Notifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/home"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Home clicked (mobile, logged out)');
                  setShowMobileMenu(false);
                }}
              >
                Home
              </Link>
              <Link
                to="/signup"
                className="text-white text-xl hover:text-blue-200"
                onClick={() => {
                  console.log('Sign Up clicked (mobile, logged out)');
                  setShowMobileMenu(false);
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
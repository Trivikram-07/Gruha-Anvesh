const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { Server } = require('socket.io');
const VacationSpot = require('./Models/VacationSpot');
const Notification = require('./Models/Notification');
const Message = require('./Models/Message');
const PGProperty = require('./Models/PGProperty');
const BHKHouse = require('./Models/BHKHouse');
const path = require('path');

dotenv.config({ path: './Config/.env' }); // Load .env from Config folder

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://mini-homepage.onrender.com']
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: No token provided'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.handshake.auth.userId = decoded.id;
    socket.join(decoded.id);
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Handle Socket.IO Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.handshake.auth.userId);

  socket.on('joinChat', ({ userId, otherUserId, propertyId }) => {
    const chatRoom = `${propertyId}-${[userId, otherUserId].sort().join('-')}`;
    socket.join(chatRoom);
    console.log(`User ${userId} joined room ${chatRoom}`);
  });

  socket.on('sendMessage', async (messageData) => {
    const { sender, recipient, propertyId, propertyType, content } = messageData;
    const senderId = sender._id || sender;
    const recipientId = recipient._id || recipient;
    const chatRoom = `${propertyId}-${[senderId, recipientId].sort().join('-')}`;

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      propertyId,
      propertyType,
      content,
      timestamp: new Date(),
      isRead: false,
    });

    try {
      await message.save();
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username')
        .populate('recipient', 'username')
        .lean();
      socket.to(chatRoom).emit('receiveMessage', populatedMessage);
      io.to(recipientId).emit('newMessageNotification', populatedMessage);
      console.log(`Message sent to ${chatRoom}:`, populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error.message);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  socket.on('chatRead', async ({ propertyId, otherUserId }) => {
    const chatRoom = `${propertyId}-${[socket.handshake.auth.userId, otherUserId].sort().join('-')}`;
    socket.to(chatRoom).emit('chatRead', { propertyId, userId: socket.handshake.auth.userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Deployment: Serve static files and SPA fallback
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'project/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'project/dist', 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Frontend could not be loaded.');
      }
    });
  });
} else {
  app.get('/*', (req, res) => {
    res.send('API is running fine');
  });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://mini-homepage.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/properties/actions', require('./Routes/propertyActionsRoutes'));
app.use('/api/properties/favorites', require('./Routes/propertyFavoritesRoutes'));
app.use('/api/properties/bookings', require('./Routes/propertyBookingsRoutes'));
app.use('/api/properties/notifications', require('./Routes/propertyNotificationsRoutes'));
app.use('/api/properties/recommendations', require('./Routes/propertyRecommendationsRoutes'));
app.use('/api/properties/messages', require('./Routes/propertyMessagesRoutes'));
app.use('/api/properties/management', require('./Routes/propertyManagementRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));

// Cron Job for Review Prompts
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const vacationSpots = await VacationSpot.find({
      'bookings.endDate': { $lte: now },
      'bookings.reviewPrompted': false,
    });

    for (const spot of vacationSpots) {
      let updated = false;
      for (const booking of spot.bookings) {
        if (new Date(booking.endDate) <= now && !booking.reviewPrompted) {
          const notification = new Notification({
            user: booking.user,
            message: `Time to review ${spot.propertyName}! Rate and share your experience.`,
            type: 'info',
            propertyId: spot._id,
            propertyType: 'VacationSpot',
          });
          await notification.save();
          io.to(booking.user.toString()).emit('reviewPrompt', {
            propertyId: spot._id,
            propertyName: spot.propertyName,
          });
          booking.reviewPrompted = true;
          updated = true;
        }
      }
      if (updated) await spot.save();
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

// Startup Review Check
(async () => {
  try {
    const now = new Date();
    const vacationSpots = await VacationSpot.find({
      'bookings.endDate': { $lte: now },
      'bookings.reviewPrompted': false,
    });

    for (const spot of vacationSpots) {
      let updated = false;
      for (const booking of spot.bookings) {
        if (new Date(booking.endDate) <= now && !booking.reviewPrompted) {
          const notification = new Notification({
            user: booking.user,
            message: `Time to review ${spot.propertyName}! Rate and share your experience.`,
            type: 'info',
            propertyId: spot._id,
            propertyType: 'VacationSpot',
          });
          await notification.save();
          io.to(booking.user.toString()).emit('reviewPrompt', {
            propertyId: spot._id,
            propertyName: spot.propertyName,
          });
          booking.reviewPrompted = true;
          updated = true;
        }
      }
      if (updated) await spot.save();
    }
  } catch (err) {
    console.error('Startup review check error:', err);
  }
})();

// Error Handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
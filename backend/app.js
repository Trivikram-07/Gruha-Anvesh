const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { Server } = require('socket.io');
const VacationSpot = require('./models/VacationSpot');
const Notification = require('./models/Notification');
const Message = require('./models/Message');
const PGProperty = require('./models/PGProperty');
const BHKHouse = require('./models/BHKHouse');
const path = require('path');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
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
    socket.join(decoded.id); // Join user's room
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

      // Use socket.to() instead of io.to() to avoid sending the message back to the sender
      socket.to(chatRoom).emit('receiveMessage', populatedMessage);
      
      // Send notification only to the recipient
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

//-----------------------deployment

const __dirname1 = path.resolve(); // This gives the root of your backend directory



if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist folder (ensure this path is correct)
  app.use(express.static(path.join(__dirname1, '../project/dist')));

  // Handle any route with index.html (for SPA)
  app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname1, 'dist', 'index.html'), (err) => {
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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

mongoose.connect(process.env.MONGO_URI, {
 
  serverSelectionTimeoutMS: 5000, // Reduce timeout to fail fast
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


  app.use('/api/auth', require('./routes/authRoutes'));
  
  app.use('/api/properties/actions', require('./routes/propertyActionsRoutes'));
  app.use('/api/properties/favorites', require('./routes/propertyFavoritesRoutes'));
  app.use('/api/properties/bookings', require('./routes/propertyBookingsRoutes'));
  app.use('/api/properties/notifications', require('./routes/propertyNotificationsRoutes'));
  app.use('/api/properties/recommendations', require('./routes/propertyRecommendationsRoutes'));
  app.use('/api/properties/messages', require('./routes/propertyMessagesRoutes'));
  app.use('/api/properties/management', require('./routes/propertyManagementRoutes'));

  app.use('/api/users', require('./routes/userRoutes'));

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

// Run once on startup
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

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
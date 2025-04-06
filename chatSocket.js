// chatSocket.js
const { Server } = require('socket.io');
const Message = require('./models/Message');

const initializeChatSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinChat', ({ userId, otherUserId, propertyId }) => {
      const chatRoom = `${propertyId}-${[userId, otherUserId].sort().join('-')}`;
      socket.join(chatRoom);
      socket.join(userId); // Join user-specific room for notifications
      console.log(`User ${userId} joined room ${chatRoom}`);
    });

    socket.on('sendMessage', async (messageData) => {
      console.log('Message received (raw):', JSON.stringify(messageData, null, 2));
      const { sender, recipient, propertyId, propertyType, content } = messageData;

      const senderId = sender._id || sender;
      const recipientId = recipient._id || recipient;
      const chatRoom = `${propertyId}-${[senderId, recipientId].sort().join('-')}`;

      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        propertyId,
        propertyType: propertyType || undefined,
        content,
        timestamp: new Date(),
        isRead: false,
      });

      try {
        console.log('Saving message:', message);
        await message.save();
        console.log('Message saved:', message);

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username')
          .populate('recipient', 'username')
          .lean();

        const enrichedMessage = {
          ...populatedMessage,
          property: { propertyName: 'Unknown Property', images: ['https://placehold.co/50'] },
        };

        const { PGProperty, BHKHouse, VacationSpot } = require('./models');
        let property;
        switch (propertyType) {
          case 'PGProperty':
            property = await PGProperty.findById(propertyId);
            break;
          case 'BHKHouse':
            property = await BHKHouse.findById(propertyId);
            break;
          case 'VacationSpot':
            property = await VacationSpot.findById(propertyId);
            break;
          default:
            property = null;
        }
        if (property) {
          enrichedMessage.property = {
            propertyName: property.propertyName,
            images: property.images || ['https://placehold.co/50'],
          };
        }

        io.to(chatRoom).emit('receiveMessage', enrichedMessage);
        console.log(`Message sent to ${chatRoom}:`, enrichedMessage);
      } catch (error) {
        console.error('Error saving message:', error.message);
        socket.emit('error', { message: 'Failed to save message' });
      }
    });

    socket.on('chatRead', ({ propertyId, otherUserId }) => {
      const userId = socket.handshake.auth.userId;
      const chatRoom = `${propertyId}-${[userId, otherUserId].sort().join('-')}`;
      io.to(chatRoom).emit('chatRead', { propertyId, otherUserId });
      console.log(`Chat read event emitted to ${chatRoom} for user ${userId}`);
    });

    socket.on('bookingSuccess', ({ propertyId, propertyName, userId }) => {
      io.to(userId).emit('bookingSuccess', { propertyId, propertyName });
      console.log(`Booking success for ${propertyName} sent to ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeChatSocket;
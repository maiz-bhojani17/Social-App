export const initSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Register active user
    socket.on('registerUser', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(userId); // Join personal room for private notifications
        io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
        console.log(`User registered: ${userId} on socket ${socket.id}`);
      }
    });

    // Join custom room (e.g. conversationId or postId)
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    // Real-time Chat message dispatch
    socket.on('sendMessage', (data) => {
      // data: { receiverId, sender, message, createdAt, ... }
      if (data.receiverId) {
        // Send to receiver's private room
        io.to(data.receiverId).emit('receiveMessage', data);
      }
      if (data.room) {
        // Or if in a specific room
        io.to(data.room).emit('receiveMessage', data);
      }
    });

    // Typing indicators
    socket.on('typing', ({ receiverId, username }) => {
      if (receiverId) {
        io.to(receiverId).emit('userTyping', { senderId: socket.userId, username });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit('userStoppedTyping', { senderId: socket.userId });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
        console.log(`User ${socket.userId} disconnected`);
      } else {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });
};

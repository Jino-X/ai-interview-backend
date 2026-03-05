const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  const rooms = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId).add({ id: socket.id, user: socket.user });
      socket.to(roomId).emit('user-joined', { user: socket.user, socketId: socket.id });
      const participants = Array.from(rooms.get(roomId)).map((p) => ({ ...p, user: p.user }));
      io.to(roomId).emit('room-participants', participants);
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.forEach((p) => { if (p.id === socket.id) room.delete(p); });
        if (room.size === 0) rooms.delete(roomId);
      }
      socket.to(roomId).emit('user-left', { socketId: socket.id, user: socket.user });
    });

    socket.on('code-change', ({ roomId, code, language, questionId }) => {
      socket.to(roomId).emit('code-update', { code, language, questionId, from: socket.user._id });
    });

    socket.on('cursor-position', ({ roomId, position, questionId }) => {
      socket.to(roomId).emit('cursor-update', { position, questionId, from: socket.user._id });
    });

    socket.on('chat-message', ({ roomId, message }) => {
      const data = {
        id: Date.now(),
        message,
        sender: { _id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
        timestamp: new Date().toISOString(),
      };
      io.to(roomId).emit('new-message', data);
    });

    socket.on('webrtc-offer', ({ roomId, offer, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-offer', { offer, from: socket.id });
    });

    socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-answer', { answer, from: socket.id });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-ice-candidate', { candidate, from: socket.id });
    });

    socket.on('interview-action', ({ roomId, action, data }) => {
      socket.to(roomId).emit('interview-action', { action, data, from: socket.user._id });
    });

    socket.on('drawing-update', ({ roomId, drawingData }) => {
      socket.to(roomId).emit('drawing-update', { drawingData, from: socket.user._id });
    });

    socket.on('disconnect', () => {
      rooms.forEach((participants, roomId) => {
        participants.forEach((p) => {
          if (p.id === socket.id) {
            participants.delete(p);
            socket.to(roomId).emit('user-left', { socketId: socket.id, user: socket.user });
          }
        });
        if (participants.size === 0) rooms.delete(roomId);
      });
      console.log(`Socket disconnected: ${socket.user?.name}`);
    });
  });
};

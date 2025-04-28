import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-tour', (tourId) => {
      console.log(`Client ${socket.id} joined tour room: ${tourId}`);
      socket.join(`tour:${tourId}`);
    });

    socket.on('leave-tour', (tourId) => {
      console.log(`Client ${socket.id} left tour room: ${tourId}`);
      socket.leave(`tour:${tourId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Function to emit tour availability updates
export const emitTourAvailabilityUpdate = (tourId, startDateData) => {
  if (!io) return;
  
  console.log(`Emitting availability update for tour ${tourId}`);
  io.to(`tour:${tourId}`).emit('tour-availability-update', {
    tourId,
    startDateData
  });
};

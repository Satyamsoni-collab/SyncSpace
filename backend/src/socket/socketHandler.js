import { joinRoom, leaveRoom, getUsersInRoom } from '../rooms/roomManager.js';

/**
 * Handles all Socket.io events and connections.
 * @param {import('socket.io').Server} io - The Socket.io server instance.
 */
export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle a user joining a room
    socket.on('join-room', (userParams) => {
      // Expecting userParams to contain at least roomId
      const roomId = userParams.roomId;
      
      // Add user to the in-memory room manager
      const user = { socketId: socket.id, ...userParams };
      joinRoom(roomId, user);
      
      // Join the actual socket.io room
      socket.join(roomId);
      
      console.log(`User (${socket.id}) joined room: ${roomId}`);

      // Emit an event to others in the room that a new user joined
      socket.to(roomId).emit('user-joined', {
        message: `A new user has joined the room.`,
        user
      });
      
      // Send the updated list of users to everyone in the room
      io.to(roomId).emit('room-users', getUsersInRoom(roomId));
    });

    // Handle a user disconnecting
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      const result = leaveRoom(socket.id);
      if (result) {
        const { roomId, user } = result;
        
        // Emit an event to the room that the user left
        socket.to(roomId).emit('user-disconnected', {
          message: `A user has left the room.`,
          user
        });
        
        // Update the room with the new user list
        io.to(roomId).emit('room-users', getUsersInRoom(roomId));
      }
    });
  });
};

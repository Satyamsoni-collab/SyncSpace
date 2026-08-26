import { joinRoom, leaveRoom, getUsersInRoom } from '../rooms/roomManager.js';

/**
 * Handles all Socket.io events and connections.
 * @param {import('socket.io').Server} io - The Socket.io server instance.
 */
export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    /* ==============================
       JOIN ROOM
       ============================== */
    socket.on('join-room', (userParams = {}) => {
      try {
        const { roomId, userName } = userParams;

        // Validation: Prevent crashes from empty payloads
        if (!roomId || typeof roomId !== 'string') {
          return socket.emit('error', { message: 'Invalid or missing roomId' });
        }

        // Setup socket data for persistent reference
        socket.data.roomId = roomId;
        socket.data.userName = userName || `User-${socket.id.substring(0, 5)}`;

        // Construct standardized user object 
        // (Keeping both id/name and socketId/username to satisfy both frontend and roomManager)
        const user = { 
          socketId: socket.id, 
          id: socket.id,       
          name: socket.data.userName,
          username: socket.data.userName,
          x: null, 
          y: null 
        };

        // Add to in-memory room manager
        joinRoom(roomId, user);
        
        socket.join(roomId);
        console.log(`${socket.data.userName} (${socket.id}) joined room: ${roomId}`);

        // Notify other users
        socket.to(roomId).emit('user-joined', user);
        
        // Send complete user list to everyone in room
        io.to(roomId).emit('room-users', getUsersInRoom(roomId));

      } catch (error) {
        console.error(`[Error] join-room for ${socket.id}:`, error.message);
      }
    });

    /* ==============================
       WHITEBOARD DRAWING
       ============================== */
    socket.on('whiteboard-draw', (data = {}) => {
      try {
        const { roomId, shape } = data;
        
        if (!roomId || !shape) return; // Prevent crashes

        socket.to(roomId).emit('whiteboard-draw', { shape });
      } catch (error) {
        console.error('[Error] whiteboard-draw:', error.message);
      }
    });

    /* ==============================
       CLEAR WHITEBOARD
       ============================== */
    socket.on('whiteboard-clear', (data = {}) => {
      try {
        const { roomId } = data;
        if (!roomId) return;

        socket.to(roomId).emit('whiteboard-clear');
      } catch (error) {
        console.error('[Error] whiteboard-clear:', error.message);
      }
    });

    /* ==============================
       CURSOR MOVEMENT
       ============================== */
    socket.on('cursor-move', (data = {}) => {
      try {
        const { roomId, x, y } = data;
        
        // Prevent broadcasting garbage coordinates
        if (!roomId || x === undefined || y === undefined) return;

        socket.to(roomId).emit('cursor-move', {
          id: socket.id,
          name: socket.data.userName,
          x,
          y
        });
      } catch (error) {
        console.error('[Error] cursor-move:', error.message);
      }
    });

    /* ==============================
       REAL-TIME CODE EDITOR
       ============================== */
    socket.on('code-change', (data = {}) => {
      try {
        const { roomId, code, language } = data;
        
        if (!roomId || code === undefined) return;

        socket.to(roomId).emit('code-change', { code, language });
      } catch (error) {
        console.error('[Error] code-change:', error.message);
      }
    });

    /* ==============================
       USER DISCONNECT
       ============================== */
    socket.on('disconnect', () => {
      try {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove from roomManager (This also automatically deletes empty rooms)
        const result = leaveRoom(socket.id);
        
        if (result) {
          const { roomId, user } = result;
          
          // Emit user-left payload required by your frontend
          socket.to(roomId).emit('user-left', { id: socket.id });

          // Fallback legacy event
          socket.to(roomId).emit('user-disconnected', { 
            message: `${user?.name || 'A user'} has left the room.`, 
            user 
          });
          
          // Emit updated room-users list to everyone remaining
          const remainingUsers = getUsersInRoom(roomId);
          if (remainingUsers.length > 0) {
            io.to(roomId).emit('room-users', remainingUsers);
          }
        }
      } catch (error) {
        console.error(`[Error] disconnect for ${socket.id}:`, error.message);
      }
    });
  });
};
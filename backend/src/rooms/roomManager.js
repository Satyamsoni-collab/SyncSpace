/**
 * In-memory store to track active rooms and users inside them.
 * Structure: Map<roomId, Map<socketId, userObject>>
 */
const rooms = new Map();

/**
 * Adds a user to a specific room.
 * @param {string} roomId - The ID of the room to join.
 * @param {Object} user - The user object (must include socketId).
 */
export const joinRoom = (roomId, user) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  
  const room = rooms.get(roomId);
  room.set(user.socketId, user);
};

/**
 * Removes a user from their room based on their socketId.
 * @param {string} socketId - The socket ID of the user to remove.
 * @returns {Object|null} - An object containing the removed user and the roomId, or null if not found.
 */
export const leaveRoom = (socketId) => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.has(socketId)) {
      const user = room.get(socketId);
      room.delete(socketId);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
      }
      
      return { roomId, user };
    }
  }
  return null;
};

/**
 * Retrieves all users in a specific room.
 * @param {string} roomId - The ID of the room.
 * @returns {Array<Object>} - An array of user objects in the room.
 */
export const getUsersInRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    return [];
  }
  return Array.from(rooms.get(roomId).values());
};

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database setup
const { sequelize, testConnection } = require('./database');
const User = require('./models/User');

// Routes
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.0.122:3000"], // Allow local and network access
    methods: ["GET", "POST", "PUT", "PATCH"]
  }
});

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/users', userRoutes);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Queues for matching
const coalitionQueue = [];
const oppositionQueue = [];

// Function to match users
function matchUsers() {
  console.log('Trying to match, coalitionQueue length:', coalitionQueue.length, 'oppositionQueue length:', oppositionQueue.length);
  while (coalitionQueue.length > 0 && oppositionQueue.length > 0) {
    const coalitionUser = coalitionQueue.shift();
    const oppositionUser = oppositionQueue.shift();

    // Create a room for the match
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Notify both users with opponent's data
    coalitionUser.socket.emit('matched', { 
      roomId, 
      opponentStance: 'OPPOSITION',
      opponent: oppositionUser.user
    });
    oppositionUser.socket.emit('matched', { 
      roomId, 
      opponentStance: 'COALITION',
      opponent: coalitionUser.user
    });

    console.log(`Matched users: ${coalitionUser.user.fullName} and ${oppositionUser.user.fullName} in room ${roomId}`);
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinMatching', (data) => {
    const { stance, user } = data;
    console.log(`User ${socket.id} joining matching with stance: ${stance}, name: ${user.fullName}`);

    const userData = { id: socket.id, socket, user };

    if (stance === 'COALITION') {
      coalitionQueue.push(userData);
    } else if (stance === 'OPPOSITION') {
      oppositionQueue.push(userData);
    }

    // Try to match immediately
    matchUsers();
  });

  socket.on('leaveMatching', () => {
    console.log(`User ${socket.id} leaving matching`);

    // Remove from queues
    coalitionQueue.splice(coalitionQueue.findIndex(u => u.id === socket.id), 1);
    oppositionQueue.splice(oppositionQueue.findIndex(u => u.id === socket.id), 1);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from queues
    coalitionQueue.splice(coalitionQueue.findIndex(u => u.id === socket.id), 1);
    oppositionQueue.splice(oppositionQueue.findIndex(u => u.id === socket.id), 1);
  });
});

const PORT = process.env.PORT || 3002;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await sequelize.sync({ alter: true }); // Use alter: true for development, force: true to drop and recreate
    console.log('Database synchronized successfully.');

    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: ${sequelize.getDatabaseName()}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
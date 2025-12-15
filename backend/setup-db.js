require('dotenv').config();
const { sequelize } = require('./database');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Create database if it doesn't exist (Note: This requires superuser privileges)
    // For production, create the database manually or use a migration tool

    // Sync all models
    await sequelize.sync({ force: true }); // Use force: true to drop and recreate tables (WARNING: This will delete all data)
    console.log('Database tables created successfully.');

    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
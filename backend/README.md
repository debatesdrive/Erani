# Erani Backend

Node.js backend for the Erani debate matching app with SQLite database (development) / PostgreSQL (production).

## Setup

1. Install dependencies:
```bash
npm install
```

2. For development (SQLite - no additional setup required):
   - The app uses SQLite by default, so no database installation is needed
   - Database file will be created automatically at `./database.sqlite`

3. For production (PostgreSQL):
   - Install PostgreSQL
   - Create a database named `erani_db`
   - Update the `.env` file with your PostgreSQL credentials:
   ```
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=erani_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

4. Start the development server:
```bash
npm run dev
```

The server will run on port 3002 and listen on all network interfaces (0.0.0.0) for cross-device testing.

## API Endpoints

### User Management
- `POST /api/users/login` - Login or create user by phone number
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (bio, topics, name)
- `POST /api/users/:id/upload-picture` - Upload profile picture
- `PATCH /api/users/:id/stats` - Update user stats after debates

### Real-time Features
- WebSocket connection for matching users with opposite stances
- Automatic pairing when users from both COALITION and OPPOSITION queues are available

## Database Schema

### Users Table
- `id` (Primary Key, Auto Increment)
- `fullName` (String, required)
- `phoneNumber` (String, unique, required)
- `bio` (Text, optional, max 500 chars)
- `topics` (JSON Array, optional, max 10 topics)
- `profilePicture` (String, optional - URL/path)
- `debatesCount` (Integer, default 0)
- `rating` (Decimal, default 5.0)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## File Uploads

Profile pictures are stored in the `uploads/` directory and served statically at `/uploads/` endpoint.

## Development Notes

- The server uses Sequelize ORM for database operations
- CORS is configured to allow connections from localhost and network IPs
- File uploads are limited to 5MB and image files only
- Database sync uses `alter: true` in production to preserve data
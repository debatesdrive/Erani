# Copilot Instructions for Erani Debate App

## Architecture Overview
This is a full-stack debate matching app with a React frontend and Node.js backend using Socket.io for real-time communication. The app matches users with opposite political stances (COALITION vs OPPOSITION) for video calls.

- **Frontend**: React 19 with TypeScript, Vite build tool, React Router for navigation, Tailwind CSS for styling (currently via CDN).
- **Backend**: Node.js with Express and Socket.io, maintains separate queues for COALITION and OPPOSITION stances, matches users immediately when both queues have entries.
- **Real-time Communication**: WebSocket connections handle joining queues, matching notifications, and disconnections.

## Key Components
- `App.tsx`: Main app component with routing and context provider.
- `pages/`: Route components (Lobby, StanceSelection, Matching, Call, etc.).
- `components/`: Reusable UI components (Button, Input, Layout).
- `backend/server.js`: Socket.io server managing user queues and matching logic.
- `types.ts`: TypeScript interfaces (User, Stance).

## Data Flow
1. User enters profile data in Lobby → stored in React Context.
2. User selects stance in StanceSelection → navigates to Matching.
3. Matching page connects to Socket.io, emits 'joinMatching' with user data.
4. Backend adds to appropriate queue, attempts matching.
5. On match, backend emits 'matched' with roomId and opponent data.
6. Frontend navigates to Call page with opponent info via React Router state.

## Development Workflow
- **Frontend**: `npm run dev` starts Vite dev server on port 3000/3001.
- **Backend**: `cd backend && npm run dev` starts nodemon on port 3002, listening on 0.0.0.0 for network access.
- **Build**: `npm run build` creates production bundle.
- **Debugging**: Check browser console for Socket.io errors; backend logs queue states and matches.

## Conventions and Patterns
- **State Management**: Use `useAppContext` hook for global user/stance data.
- **Navigation**: Pass data between pages via `navigate('/route', { state: data })`.
- **Socket Connection**: Always connect to `http://${window.location.hostname}:3002` for dynamic host support.
- **User Data**: Include `fullName`, `phone`, `rating` in User type; handle missing fields gracefully.
- **Matching Logic**: Queues are arrays of {id, socket, user}; remove disconnected users immediately.
- **Styling**: Use Tailwind classes; icons from Lucide React.

## Examples
- **Joining Matching**: `socket.emit('joinMatching', { stance: selectedStance, user })`
- **Handling Match**: `socket.on('matched', (data) => navigate('/call', { state: data }))`
- **Queue Management**: Filter queues on disconnect: `queue.filter(u => u.id !== socket.id)`

## Integration Points
- **CORS**: Backend allows multiple origins for local/network development.
- **Dependencies**: socket.io-client for frontend, express/socket.io for backend.
- **Cross-Component**: Context for user data, Router state for opponent info.
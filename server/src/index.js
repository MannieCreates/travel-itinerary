import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Using port 5000 for backend
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for invoice PDFs, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// API Routes
app.use('/api', routes);

// Basic route
app.get('/', (req, res) => {
  res.send('Travel Itinerary API is running');
});

// In production, serve the React build
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tourRoutes from './routes/tours.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://root:root@cluster0.bgizyas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Travel Itinerary API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
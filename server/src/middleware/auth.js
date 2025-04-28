import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key';

// Store user IDs by token for consistent development experience
const userIdCache = new Map();

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('Auth middleware called');
    console.log('Authorization header present:', !!req.header('Authorization'));

    // For development purposes, use a consistent mock user ID if no token is provided
    if (!token) {
      console.log('No token provided, using development mock user ID');

      // Use the admin user ID for development without token
      const adminUserId = '680fc797edf36af8d055b2b6';
      req.userId = adminUserId;

      console.log('Using fixed dev user ID:', req.userId);
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      console.log('Token verified, user ID:', req.userId);
      next();
    } catch (tokenError) {
      console.log('Token verification failed:', tokenError.message);

      // If token verification fails, use a consistent user ID for the same token
      if (userIdCache.has(token)) {
        req.userId = userIdCache.get(token);
        console.log('Using cached user ID for token:', req.userId);
      } else {
        // Use the admin user ID for development
        const adminUserId = '680fc797edf36af8d055b2b6';
        req.userId = adminUserId;
        userIdCache.set(token, req.userId);
        console.log('Using fixed dev user ID for invalid token:', req.userId);
      }

      next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

export { auth, JWT_SECRET };
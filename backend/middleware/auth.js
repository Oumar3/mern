import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // <-- IMPORT YOUR USER MODEL

export const auth = async (req, res, next) => {
  let token; // Declare token here

  try {
    // 1. Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    console.log('Auth middleware: Token received');

    // 2. Verify token (use access token secret)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('Auth middleware: Token decoded successfully, userId:', decoded.userId);

    // 3. Find the user by ID and attach it to req.user
    //    We explicitly select '-password' for security.
    //    The .populate('profile') isn't strictly needed if profile is embedded,
    //    but if profile was a separate reference, you'd use it.
    //    Ensure your User model includes the 'profile' field and 'role' within it.
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('Auth middleware: User not found for userId:', decoded.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Auth middleware: User found:', user._id);

    // Attach the *full user object* to req.user
    req.user = user;
    // You can still keep req.userId if other parts of your app use it
    req.userId = decoded.userId; 

    // 4. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorized, token expired' });
    }
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Your isAdmin middleware is fine as is, assuming req.user is now populated by 'auth'
export function isAdmin(req, res, next) {
  // This will now correctly check req.user.profile.role
  if (req.user && req.user.grade === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' });
}

export function isSuperAdmin(req, res, next) {
  // This will now correctly check req.user.profile.role
  if (req.user && req.user.grade === 'superadmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Super Admins only.' });
}

// You might consider a combined admin/superadmin checker
export function isSuperAdminOrAdmin(req, res, next) {
  if (req.user && req.user.grade && ['admin', 'superadmin'].includes(req.user.grade)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins or SuperAdmins only.' });
}
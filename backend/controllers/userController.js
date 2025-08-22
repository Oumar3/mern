import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { hashPassword, comparePassword, validatePassword, validateEmail } from '../helpers/authHelper.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Convert undefined/null email to empty string and validate if non-empty
    const processedEmail = email || '';
    if (processedEmail && !validateEmail(processedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain...'
      });
    }

    // Check for existing user (ignore empty emails in lookup)
    const existingUserQuery = processedEmail 
      ? { $or: [{ email: processedEmail }, { username }] }
      : { username };
    
    const existingUser = await User.findOne(existingUserQuery);
    if (existingUser) {
      return res.status(400).json({ 
        error: processedEmail 
          ? 'Email or username already registered' 
          : 'Username already registered' 
      });
    }

    // Create user with processed email (empty string if not provided)
    const hashedPassword = await hashPassword(password);
    const user = new User({ 
      username, 
      email: processedEmail, // Will be empty string if not provided
      password: hashedPassword 
    });
    
    await user.save();
    
    // Create access and refresh tokens like in login
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    
    res.status(201).json({
      user: { 
        id: user._id, 
        email: user.email || undefined, // Don't include empty emails in response
        username: user.username 
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ error: 'Email or username is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const findConditions = [];
    if (email) findConditions.push({ email });
    if (username) findConditions.push({ username });

    const user = await User.findOne({ $or: findConditions });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // --- START: NEW TOKEN GENERATION ---

    // 1. Create the short-lived access token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // 2. Create the long-lived refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    
    // --- END: NEW TOKEN GENERATION ---
    
    const responseUser = {
      // Your existing user object structure...
      _id: user._id,
      id: user._id,
      ...(user.email && { email: user.email }), // Only include email if it exists
      username: user.username,
      isAdmin: user.isAdmin,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        contact: user.profile?.contact,
        address: user.profile?.address,
        profilePicture: user.profile?.profilePicture,
        role: user.profile?.role,
        organisation: user.profile?.organisation
      }
      
    };

    // 3. Send both tokens to the client
    res.json({
      user: responseUser,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Add this new function to authController.js

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  try {
    // 1. Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Check if the user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // 3. Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // 4. Send the new access token and user data back
    // (The frontend needs user data to repopulate the auth state)
    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        // ... include other necessary user fields
      }
    });

  } catch (error) {
    // This will catch expired tokens or invalid signatures
    console.error('Refresh token error:', error);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const getMe = async (req, res) => {
  try {
    // The userId is added to req by your auth middleware
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { profile } = req.body;

    // Get current user data
    const currentUser = await User.findById(userId);
    
    // Delete old profile picture if it exists and is being changed
    if (currentUser.profile?.profilePicture && 
        profile.profilePicture !== currentUser.profile.profilePicture) {
      const oldFilename = currentUser.profile.profilePicture.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads', oldFilename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profile } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Admin-only: Create user
export const adminCreateUser = async (req, res) => {
  try {
    // Only allow admins
    if (!req.user || req.user.profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { username, email, password, profile } = req.body;

    // Validate input (email is now optional)
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Process email (convert undefined/null to empty string)
    const processedEmail = email || '';

    // Only validate email if provided (non-empty)
    if (processedEmail && !validateEmail(processedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if username exists, or email exists if provided (non-empty)
    const existingUserQuery = processedEmail 
      ? { $or: [{ email: processedEmail }, { username }] } 
      : { username };
    
    const existingUser = await User.findOne(existingUserQuery);
    if (existingUser) {
      return res.status(400).json({ 
        error: processedEmail 
          ? 'Email or username already registered' 
          : 'Username already registered' 
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      username,
      email: processedEmail, // Will be empty string if not provided
      password: hashedPassword,
      profile: {
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        contact: profile?.contact,
        address: profile?.address,
        organisation: profile?.organisation,
        role: profile?.role || 'user'
      }
    });
    await user.save();

    // Prepare response - don't include empty email
    const responseUser = {
      id: user._id,
      username: user.username,
      ...(user.email && user.email.trim() && { email: user.email }),
      profile: user.profile
    };

    res.status(201).json({
      message: 'User created successfully',
      user: responseUser
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Create user with profile (open to all)
export const createUserWithProfile = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Validate input (email is now optional)
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Process email (convert undefined/null to empty string)
    const processedEmail = email || '';

    // Only validate email if provided (non-empty)
    if (processedEmail && !validateEmail(processedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if username exists, or email exists if provided (non-empty)
    const existingUserQuery = processedEmail 
      ? { $or: [{ email: processedEmail }, { username }] } 
      : { username };
    
    const existingUser = await User.findOne(existingUserQuery);
    if (existingUser) {
      return res.status(400).json({ 
        error: processedEmail 
          ? 'Email or username already registered' 
          : 'Username already registered' 
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      username,
      email: processedEmail, // Will be empty string if not provided
      password: hashedPassword,
      profile: {
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        contact: profile?.contact,
        address: profile?.address,
        organisation: profile?.organisation,
        role: profile?.role || 'user'
      }
    });
    await user.save();

    // Prepare response - don't include empty email
    const responseUser = {
      id: user._id,
      username: user.username,
      ...(user.email && user.email.trim() && { email: user.email }),
      profile: user.profile
    };

    res.status(201).json({
      message: 'User created successfully',
      user: responseUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Remove (delete) user by ID (admin only)
export const removeUser = async (req, res) => {
  try {
    // Only allow admins
    /* if (!req.user || req.user.profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    } */

    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


// Update user by ID (admin or self-update)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, profile, grade, isActive } = req.body;
    const requestingUser = req.user; // Assumes auth middleware sets req.user

    // Find the user to be updated
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Authorization: Allow self-update or admin/superadmin update
    if (
      requestingUser.id !== userId &&
      !['superadmin'].includes(requestingUser.grade)
    ) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    // Handle username and email uniqueness
    if (username && username !== userToUpdate.username) {
      const existingUserWithUsername = await User.findOne({ 
        username, 
        _id: { $ne: userId } // Exclude current user from search
      });
      if (existingUserWithUsername) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
      }
      userToUpdate.username = username;
    }

    if (email && email !== userToUpdate.email) {
      const existingUserWithEmail = await User.findOne({ 
        email, 
        _id: { $ne: userId } // Exclude current user from search
      });
      if (existingUserWithEmail) {
        return res.status(400).json({ error: 'Cet email existe déjà' });
      }
      userToUpdate.email = email;
    }

    // Handle password update
    if (password) {
      userToUpdate.password = await hashPassword(password);
    }

    // Update profile fields
    if (profile) {
      Object.assign(userToUpdate.profile, profile);
    }

    // Admin-only fields: only admins/superadmins can change grade or isActive status
    if (['admin', 'superadmin'].includes(requestingUser.grade)) {
      if (grade) {
        userToUpdate.grade = grade;
      }
      if (typeof isActive === 'boolean') {
        userToUpdate.isActive = isActive;
      }
    }

    const updatedUser = await userToUpdate.save();

    // Don't send password back
    const responseUser = updatedUser.toObject();
    delete responseUser.password;

    res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user: responseUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Échec de la mise à jour de l\'utilisateur' });
  }
};

import express from 'express';
import { register, login, getMe, changePassword, updateProfile, getAllUsers, getUserById, adminCreateUser, createUserWithProfile, refreshToken, updateUser, removeUser } from '../controllers/userController.js';
import { auth, isAdmin, isSuperAdmin, isSuperAdminOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe); // Add this route
router.post('/change-password', auth, changePassword);
router.put('/:userId/profile', auth, updateProfile);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/admin/create-user', auth, isSuperAdminOrAdmin, adminCreateUser);
router.post('/create-user-with-profile', auth, createUserWithProfile);
router.put('/:userId', auth, isSuperAdmin, updateUser);
//router.put('/update-user/:id', auth, isSuperAdminOrAdmin, updateUser);
router.delete('/:id', auth, isSuperAdminOrAdmin, removeUser); // Add this route for deleting a user
router.post('/refresh-token', refreshToken);


export default router;
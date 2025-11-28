import express from 'express';
import { LoginRateLimiter } from '../middleware/rateLimiter.js';
import authController from '../controllers/authController.js';
// import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

router.route('/login')
    .post(LoginRateLimiter,authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/register')
    .post(authController.register)

router.route('/logout')
    .get(authController.logout)

export default router
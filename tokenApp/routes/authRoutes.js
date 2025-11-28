import express from 'express'
import {LoginRateLimiter} from '../middleware/rateLimiter.js'

const authController = require('../controllers/authController')
const router = express.Router()

router.route('/')
    .post(LoginRateLimiter,authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/register')
    .post(authController.register)

router.route('/logout')
    .get(authController.logout)

export default router
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../controllers/tokenController.js';
import { createRefreshToken, revokeRefreshToken, getRefreshToken } from '../services/refreshTokenService.js';
const authController = {};

/**
 * REGISTER
 */
authController.register = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Please provide username and password' });

    const existingUser = await User.findOne({ username });
    if (existingUser)
        return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: 'User created successfully' });
});


/**
 * LOGIN
 */
authController.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Please provide username and password' });

    const user = await User.findOne({ username });
    if (!user || !user.active)
        return res.status(401).json({ message: 'User unauthorized' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: 'Invalid username or password' });

    /** Generate Access Token (short life) */
    const accessToken = generateAccessToken({
        username: user.username,
        roles: user.roles
    });

    /** Generate Refresh Token (long life) */
    const refreshToken = generateRefreshToken();

    /** Send refresh token in httpOnly cookie */
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,         // Important in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });

    return res.status(200).json({ accessToken });
});


/**
 * REFRESH TOKEN
 */
authController.refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.refreshToken)
        return res.status(401).json({ message: 'Refresh token required' });

    const refreshToken = cookies.refreshToken;
    try {
        const user = await verifyRefreshToken(refreshToken);
        /** New access token */
        const newAccessToken = generateAccessToken({
            username: user.username,
            roles: user.roles
        });
        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }


});


/**
 * LOGOUT
 */
authController.logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.refreshToken)
        return res.status(401).json({ message: 'Refresh token required' });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    return res.status(200).json({ message: 'Logged out successfully' });
});


export default authController;
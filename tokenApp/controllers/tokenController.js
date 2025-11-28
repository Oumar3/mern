import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return refreshToken;
};

export const verifyAccessToken = (token) => jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return reject({ status: 403, message: "Invalid refresh token" });

        const user = await User.findOne({ username: decoded.username });
        if (!user)
          return reject({ status: 401, message: "User not found" });

        resolve(user);
      }
    );
  });
};
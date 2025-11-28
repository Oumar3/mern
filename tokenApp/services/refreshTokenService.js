// services/refreshTokenService.js
import RefreshToken from "../models/RefreshToken.js";
import { generateRefreshToken } from "../controllers/tokenController.js";

export const createRefreshToken = async (userId, userAgent) => {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 7*24*60*60*1000); // 7 jours

  const refreshToken = await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    userAgent
  });

  return refreshToken;
};

export const getRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token }).populate("user");
  if (!refreshToken || !refreshToken.isActive) {
    throw { status: 403, message: "Invalid or expired refresh token" };
  }
  return refreshToken;
};

export const revokeRefreshToken = async (tokenDoc, replacedByToken = null) => {
  tokenDoc.revoked = true;
  tokenDoc.replacedByToken = replacedByToken;
  await tokenDoc.save();
};

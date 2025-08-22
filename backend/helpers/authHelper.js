import bcryptjs from 'bcryptjs';

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcryptjs.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

export const validatePassword = (password) => {
  // Password must be at least 8 characters long and contain at least:
  // - One uppercase letter
  // - One lowercase letter
  // - One number
  // - One special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateEmail = (email) => {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
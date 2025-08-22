import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const MONGO_URI = process.env.MONGODB_URI;

async function createSuperAdmin() {
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ 'profile.role': 'superadmin' });
  if (existing) {
    console.log('Superadmin already exists.');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash('XY781227@kyle', 10);

  const superAdmin = new User({
    username: 'iBoy',
    email: 'moukhtar.benali@gmail.com',
    password: hashedPassword,
    grade: 'superadmin',
    isActive: true,
    isAdmin: true,
    profile: {
      firstName: 'Moukhtar',
      lastName: 'Ben Ali',
      role: 'IT',
    },
  });

  await superAdmin.save();
  console.log('Superadmin user created!');
  process.exit();
}

createSuperAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
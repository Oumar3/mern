import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: false,
    index: true,
    unique: false,
    sparse: true,
    trim: true,
    lowercase: true,
    default: undefined // ✅ instead of null
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  grade: {
    type: String,
    enum: ['superadmin', 'admin', 'no-grade',],
    default: 'no-grade'
  },
  profile: {
    firstName: String,
    lastName: String,
    contact: String,
    address: String,
    profilePicture: String,
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation', // Reference to Organisation model
    },
    role: {
      type: String,
      enum: ['supervisor', 'IT', 'executive', 'agent', 'user', 'Chef Logistique', 'Chef d\'Organisation'],
      default: 'user',
    },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
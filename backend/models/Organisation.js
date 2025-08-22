import mongoose from 'mongoose';

const organisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 150,
    trim: true
  },
  shortName: {
    type: String,
    unique: true,
    sparse: true,
    maxlength: 150,
    trim: true
  },
  description: {
    type: String,
    maxlength: 50000
  },
  slug: {
    type: String,
    unique: true,
    maxlength: 150
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
organisationSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Instance method to return string representation
organisationSchema.methods.toString = function() {
  return this.name;
};

const Organisation = mongoose.model('Organisation', organisationSchema);

export default Organisation;

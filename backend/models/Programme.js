import mongoose from "mongoose";

const programmeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  objectif: {
    type: String,
    required: true,
  },
  domaine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domaine',
    required: true,
  },
  cost: {
    type: Number,
    required: false,
  },
  currency: {
    type: String,
    required: false,
    enum: ['USD', 'EUR', 'XAF', 'XOF'], // Add more currencies as needed
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  
  slug: {
    type: String,
    unique: true,
    maxlength: 150,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate slug
programmeSchema.pre('save', function(next) {
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
programmeSchema.methods.toString = function() {
  return this.name;
};

const Programme = mongoose.model('Programme', programmeSchema);

export default Programme;


import mongoose from 'mongoose';

const promiseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'XAF', 'XOF'],
    default: 'XAF'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  promiseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'partial', 'cancelled'],
    default: 'pending'
  }
}, { _id: true });

const institutionSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['financial_backer', 'technical', 'implementation', 'governmental', 'ngo', 'private_sector', 'academic', 'international'],
    default: 'implementation'
  },
  interventionAreas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme'
  }],
  promises: [promiseSchema],
  slug: {
    type: String,
    unique: true,
    maxlength: 150
  },
  contact: {
    email: String,
    phone: String,
    address: String,
    website: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
institutionSchema.pre('save', function(next) {
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

// Virtual to check if institution is a financial backer
institutionSchema.virtual('isFinancialBacker').get(function() {
  return this.category === 'financial_backer';
});

// Virtual to calculate total promised amount
institutionSchema.virtual('totalPromisedAmount').get(function() {
  if (!this.isFinancialBacker || !this.promises.length) return 0;
  return this.promises.reduce((total, promise) => total + promise.amount, 0);
});

// Instance method to return string representation
institutionSchema.methods.toString = function() {
  return this.name;
};

// Ensure virtual fields are serialized
institutionSchema.set('toJSON', { virtuals: true });
institutionSchema.set('toObject', { virtuals: true });

const Institution = mongoose.model('Institution', institutionSchema);

export default Institution;

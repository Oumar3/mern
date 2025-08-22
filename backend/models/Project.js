import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    maxlength: 150,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    enum: ['Projet', 'Reforme'],
    default: 'Projet',
  },
  typology: {
    type: String,
    required: true,
    enum: ['Gouvernance', 'Structurant'],
  },
  zone: {
    type: String,
    required: false,
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'XAF', 'XOF'], // Add more currencies as needed
  },
  status: {
    type: String,
    required: true,
    enum: ['En cours', 'Terminé', 'Annulé', 'En attente', 'Suspendus'], // Define project statuses
  },
}, {
  timestamps: true,
}); 

// Pre-save middleware to generate slug
projectSchema.pre('save', function(next) {
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

projectSchema.methods.toString = function() {       
  return this.name;
};  

const Project = mongoose.model('Project', projectSchema);

export default Project;
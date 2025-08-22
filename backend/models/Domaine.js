import mongoose from "mongoose";

const domaineSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    nature: {
        type: String,
        enum: ['Specifique', 'Transversale'],
        default: 'Specifique',
        required: true,
    },
    strategy: {
        type: String,
        required: true,
    },
    slug : {
        type: String,
        unique: true,
        maxlength: 150,
    },
}, {
    timestamps: true,
});

// Pre-save middleware to generate slug
domaineSchema.pre('save', function(next) {
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
domaineSchema.methods.toString = function() {
    return this.name;
};

const Domaine = mongoose.model('Domaine', domaineSchema);

export default Domaine;

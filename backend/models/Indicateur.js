import mongoose from "mongoose";

const indicateurSchema = new mongoose.Schema({
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
    anne_deReference: {
        type: Number,
        required: true,
    },
    valeur_deReference: {
        type: Number,
        required: true,
    },
    anne_cible: {
        type: Number,
        required: true,
    },
    valeur_cible: {
        type: Number,
        required: true,
    },
    impact: {
        type: String,
        required: true,
    },
    uniteDeMesure: {
        type: String,
        required: false,
    },
    programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true,
    },
    source: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
        required: true
    }],
    sourceDescription: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});
// Pre-save middleware to generate slug
indicateurSchema.pre('save', function(next) {
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

const Indicateur = mongoose.model('Indicateur', indicateurSchema);

export default Indicateur;
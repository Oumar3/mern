import mongoose from "mongoose";

const suiviIndicateurSchema = new mongoose.Schema({
    // Define your schema fields here
    code: {
        type: String,
        required: true,
        unique: true,
    },
    anne: {
        type: Number,
        required: true,
    },
    valeur: {
        type: Number,
        required: true,
    },
    indicateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Indicateur',
        required: true,
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
        required: true,
    },
    sourceDetail: {
        type: String,
        default: '',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const SuiviIndicateur = mongoose.model("SuiviIndicateur", suiviIndicateurSchema);

export default SuiviIndicateur;

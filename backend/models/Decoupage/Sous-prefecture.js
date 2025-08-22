import mongoose from "mongoose";

const sousPrefectureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    departement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departement',
        required: true
    },
}, {
    timestamps: true
});

const SousPrefecture = mongoose.model("SousPrefecture", sousPrefectureSchema);

export default SousPrefecture;
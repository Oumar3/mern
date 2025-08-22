import mongoose from "mongoose";

const cantonSchema = new mongoose.Schema({
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
    sousPrefecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SousPrefecture',
        required: true
    },
}, {
    timestamps: true
});

const Canton = mongoose.model("Canton", cantonSchema);

export default Canton;
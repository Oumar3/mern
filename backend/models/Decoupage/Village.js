import mongoose from "mongoose";

const villageSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    canton: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Canton',
        required: true
    },
    geolocation: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    }
}, {
    timestamps: true
});

const Village = mongoose.model("Village", villageSchema);

export default Village;

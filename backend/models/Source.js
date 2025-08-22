import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    producer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DataProducer',
        required: true,
    }],
    url: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const Source = mongoose.model('Source', sourceSchema);

export default Source;

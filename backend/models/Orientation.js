import mongoose from 'mongoose';

const orientationSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true
    },
});

const Orientation = mongoose.model('Orientation', orientationSchema);

export default Orientation;

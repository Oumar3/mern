import mongoose from "mongoose";

const dataProducerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    contactInfo: {
        mail: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
    },
    url: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const DataProducer = mongoose.model('DataProducer', dataProducerSchema);

export default DataProducer;

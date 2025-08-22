import mongoose from "mongoose";

const communeSchema = new mongoose.Schema({
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
    departement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departement',
        required: true
    }
}, {
    timestamps: true
});

const Commune = mongoose.model("Commune", communeSchema);

export default Commune;

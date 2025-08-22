import mongoose from "mongoose";

const departementSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    province: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
        required: true
    },
    chefLieu: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});

const Departement = mongoose.model("Departement", departementSchema);

export default Departement;

import mongoose from "mongoose";

const uniteDeMesureSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    
}, {
    timestamps: true,
});


const UniteDeMesure = mongoose.model('UniteDeMesure', uniteDeMesureSchema);

export default UniteDeMesure;

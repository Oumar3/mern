import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema({
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
    chefLieu: {
        type: String,
        required: false
    },
}, {
    timestamps: true,
    
});

const Province = mongoose.model("Province", provinceSchema);

export default Province;
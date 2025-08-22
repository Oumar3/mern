import mongoose from "mongoose";

const indicatorFollowupSchema = new mongoose.Schema({
    indicator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Indicator",
        required: true,
    },
    dataIndex: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Create a compound index to ensure unique followups per indicator data entry per year
indicatorFollowupSchema.index({ indicator: 1, dataIndex: 1, year: 1 }, { unique: true });

const IndicatorFollowup = mongoose.model('IndicatorFollowup', indicatorFollowupSchema);
export default IndicatorFollowup;

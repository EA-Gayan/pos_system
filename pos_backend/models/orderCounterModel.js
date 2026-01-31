const mongoose = require("mongoose");

/**
 * OrderCounter Model
 * Stores daily order counters for efficient sequential order ID generation
 * Each document represents a unique date with its current counter value
 */
const orderCounterSchema = new mongoose.Schema({
    // Date string in format YYMMDD (e.g., "260131" for Jan 31, 2026)
    date: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    // Current counter value for this date
    count: {
        type: Number,
        required: true,
        default: 0,
    },
});

module.exports = mongoose.model("OrderCounter", orderCounterSchema);

const mongoose = require("mongoose");

const cleanupStatusSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  lastRunAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("CleanupStatus", cleanupStatusSchema);

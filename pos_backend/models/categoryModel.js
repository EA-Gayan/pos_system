const mongoose = require("mongoose");
const MealTypes = require("../enum/mealTypes");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mealType: {
      type: [Number],
      enum: Object.values(MealTypes),
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual field for related products
categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
});

categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Category", categorySchema);

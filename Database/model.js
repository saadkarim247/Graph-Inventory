const mongoose = require("mongoose");

const createModels = async () => {
  const PartSchema = await new mongoose.Schema({
    parents: [Object],
    children: [Object],
    availableStock: Number,
    partNumber: String,
  });

  const Part = await mongoose.model("Part", PartSchema);
  return Part;
};

module.exports = createModels;

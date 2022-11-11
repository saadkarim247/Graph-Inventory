const mongoose = require("mongoose");

const createModels = async () => {
  const createPartSchema = async () => {
    const PartSchema = await new mongoose.Schema({
      parents: [Object],
      children: [Object],
      availableStock: Number,
      partNumber: String,
    });

    const Part = await mongoose.model("Part", PartSchema);
    return Part;
  };

  const createForecastSchema = async () => {
    const ForecastShema = await new mongoose.Schema({
      quantity: Number,
      partNumber: String,
      workWeek: Number
    })

    const forecast = await mongoose.model("Forecast", ForecastShema);
    return forecast;
  }
  var models = [];
  models[0] = await createPartSchema();
  models[1] = await createForecastSchema();

  return models;
};

module.exports = createModels;

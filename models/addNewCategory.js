const mongoose = require("mongoose");
// creating a document sturcture
const addNewCategorySchema = new mongoose.Schema({
  objId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// creating a model OR collection
const AddNewCategory = new mongoose.model(
  "AddNewCategory",
  addNewCategorySchema
);

module.exports = AddNewCategory; //EXPORT ADD NEW CATEGORY MODULE

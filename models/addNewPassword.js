const mongoose = require("mongoose"); //IMPORT MONGOOSE
// creating a document sturcture
const addNewPasswordSchema = new mongoose.Schema({
  selectCategory: {
    type: String,
    required: true,
  },
  objId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegistedUser",
    required: true,
  },
  passwordDetails: {
    type: String,
    required: true,
  },
  projectname: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// creating a model OR collection
const addNewPassword = new mongoose.model(
  "AddNewPassword",
  addNewPasswordSchema
);

module.exports = addNewPassword; //EXPORT ADD NEW PASSWORD MODULE

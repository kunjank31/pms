const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// creating a document sturcture
const registerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  isVerified: { type: Boolean, default: false },
});

// password converted into hash using bcrypt
registerSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10); //hashing a password
    }
    next();
  } catch (error) {
    res.status(400).send(error);
  }
});

// creating a token using JWT(JsonWebToken) though methods
registerSchema.methods.generateToken = async function () {
  try {
    const tokenCreate = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: tokenCreate });
    await this.save();
    return tokenCreate;
  } catch (error) {
    res.status(400).send(error);
  }
};
// creating a model OR collection
const Register = new mongoose.model("RegistedUser", registerSchema);

module.exports = Register; //EXPORT USER REGISTRATION MODULE

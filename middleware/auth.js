/*------MIDDLEWARE------*/
const jwt = require("jsonwebtoken");
const registedUser = require("../models/register");
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; //get a cookies when user wants to access the page if user is geniune that is access the page OR not then login/register

    const verifyToken = await jwt.verify(token, process.env.SECRET_KEY); //verify a token user is authentic or not

    const user = await registedUser.findById({ _id: verifyToken._id });
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.redirect("/"); //if user trying to access that page which is authentic then it will redirect to login page
  }
};
module.exports = auth; //EXPORT AUTHENTICATION MODULE

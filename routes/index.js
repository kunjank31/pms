/*--------IMPORTING A MODULES---------*/
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth"); //AUTH MIDDLEWARE
const registedUser = require("../models/register"); //REGISTERATION MODEL
const addCategory = require("../models/addNewCategory"); //ADD CATEGORY MODEL
const addPasword = require("../models/addNewPassword"); //ADD PASSWORD MODEL
const nodemailer = require("nodemailer");
/*--------IMPORTING A MODULES END---------*/

/*------------------USER LOGIN-----------------*/
// this home page route
router.get("/", (req, res) => {
  res.render("index", { title: "Login", ShowMsg: "" });
});
// when user login
router.post("/", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await registedUser.findOne({ username }); //get login user details that user is authentication
    const check = await bcrypt.compare(password, user.password); //compare password when user login
    const token = await user.generateToken(); //user login generate token
    res.cookie("jwt", token, {
      httpOnly: true,
    }); //create a cookie  when login
    if (check) {
      // res.status(200).render("password_category", {
      //   title: "Login",
      //   loginUserId: user.username,
      // });
      res.redirect("/passwordCategory");
    } else {
      res
        .status(400)
        .render("index", { title: "Login", ShowMsg: "Invaild User" });
    }
  } catch {
    res.status(400).render("index", {
      title: "Login",
      ShowMsg: "Please Enter valid Details",
    });
  }
});
/*------------------USER LOGIN END-----------------*/

/*------------------USER REGISTRATION-----------------*/

// user Registration for first time using an app
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", ShowMsg: "" });
});
router.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const email = req.body.email;

    if (password === cpassword) {
      const newRegistedUser = new registedUser({
        username: req.body.username,
        email,
        password,
      });

      const token = await newRegistedUser.generateToken(); //generate token at the time of registration

      res.cookie("jwt", token, {
        httpOnly: true,
      }); //create a cookie

      const result = await newRegistedUser.save(); //user who have entered the details save to database

      res.status(200).redirect("/");
    } else {
      res.status(400).render("register", {
        title: "Register",
        ShowMsg: "Please Check Your Password",
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

/*------------------USER REGISTRATION END-----------------*/

/*---------PASSWORD CATEGORY MANAGEMENT-----------*/
// for password Category
router.get("/passwordCategory", auth, async (req, res) => {
  try {
    const user_name = req.user.username;
    const result = await addCategory.find();
    res.render("password_category", {
      title: "View All Category Lists",
      loginUserId: user_name,
      records: result,
    });
  } catch (error) {
    res.send("not found");
  }
});
// Password Category delete function
router.get("/passwordCategory/delete/:id", auth, async (req, res) => {
  try {
    const user_name = req.user.username;
    const result = await addCategory.findByIdAndDelete(req.params.id);
    res.redirect("/passwordCategory");
  } catch (error) {
    res.send("not found");
  }
});
// password Category Edit functionality
router.get("/passwordCategory/edit/:id", auth, async (req, res) => {
  try {
    const user_name = req.user.username;
    const result = await addCategory.findById(req.params.id);
    res.render("editCategory", {
      title: "View All Category Lists",
      loginUserId: user_name,
      records: result,
      ShowMsg: "",
    });
  } catch (error) {
    res.send("not found");
  }
});
router.post("/passwordCategory/edit/:id", auth, async (req, res) => {
  try {
    const user_name = req.user.username;
    const result = await addCategory.findByIdAndUpdate(req.params.id, {
      categoryName: req.body.categoryName,
    });
    res.redirect("/passwordCategory");
  } catch (error) {
    res.send("not found");
  }
});
/*---------PASSWORD CATEGORY MANAGEMENT END-----------*/

/*---------ADD CATEGORY-----------*/
// for AddNewCategory
router.get("/addNewCategory", auth, (req, res) => {
  const user_name = req.user.username;
  res.render("addNewCategory", {
    title: "Add New Category",
    loginUserId: user_name,
    ShowMsg: "",
  });
});

// creating a categories
router.post("/addNewCategory", auth, async (req, res) => {
  const user_name = await req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
  try {
    if (req.body.categoryName.length > 2) {
      const add = new addCategory({
        categoryName: req.body.categoryName,
        objId: req.user.id
      });
      const result = add.save();
      res.render("addNewCategory", {
        title: "Add New Category",
        loginUserId: user_name,
        records: result,
        ShowMsg: "Successfully Category added",
      });
    } else {
      res.render("addNewCategory", {
        title: "Add New Category",
        ShowMsg: "Successfully Category added",
        loginUserId: user_name,
      });
    }
  } catch (error) {
    res.send(error);
  }
});
/*---------ADD CATEGORY END-----------*/

/*---------ADD NEW PASSWORD -----------*/
// for add new password
router.get("/addNewPassword", auth, async (req, res) => {
  try {
    const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
    const result = await addCategory.find();
    res.render("addNewPassword", {
      title: "Add New Password",
      loginUserId: user_name,
      records: result,
      ShowMsg: "",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// creating a new password
router.post("/addNewPassword", auth, async (req, res) => {
  const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
  try {
    const category = await addCategory.find()
    const addPass = new addPasword({
      selectCategory: req.body.selectCategory,
      objId : req.user.id,
      projectname: req.body.projectname,
      passwordDetails: req.body.passwordDetails,
    });
    const result = await addPass.save();
    // res.render("addNewPassword", {
    //   title: "Add New Password",
    //   loginUserId: user_name,
    //   records: category,
    //   ShowMsg: "Successfully Password submited",
    // });
    res.redirect("/addNewPassword");
  } catch {
    res.render("addNewPassword", {
      title: "Add New Password",
      loginUserId: user_name,
      ShowMsg: "Password Not submited",
    });
  }
});
/*---------ADD NEW PASSWORD END-----------*/

/*---------VIEW ALL PASSWORD-----------*/
// for view all password with pagination
router.get("/viewAllPassword", auth, async (req, res) => {
  try {
    const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
    const perPage = 3; //creating a variable to how many password show in one page
    const page = req.params.page || 1; //how many shall pages create
    await addPasword
      .find({})
      .skip(perPage * page - perPage) //skip pages which already show
      .limit(perPage) //show items in single page as you want
      .exec((err, data) => {
        if (err) throw err;
        addPasword.countDocuments({}).exec((err, count) => {
          res.render("viewAllPassword", {
            title: "Add New Password",
            loginUserId: user_name,
            records: data,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
// pagination : when user click no.2 page will
router.get("/viewAllPassword/:page", auth, async (req, res) => {
  try {
    const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
    const perPage = 3; //creating a variable to how many password show in one page
    const page = req.params.page || 1; //how many shall pages create
    await addPasword
      .find({})
      .skip(perPage * page - perPage) //skip pages which already show
      .limit(perPage) //show items in single page as you want
      .exec((err, data) => {
        if (err) throw err;
        addPasword.countDocuments({}).exec((err, count) => {
          res.render("viewAllPassword", {
            title: "Add New Password",
            loginUserId: user_name,
            records: data,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
// user edit the password
router.get("/viewAllPassword/edit/:id", auth, async (req, res) => {
  const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
  const result = await addPasword.findById(req.params.id);
  res.render("editPassword", {
    title: "Edit Posts",
    records: result,
    loginUserId: user_name,
    ShowMsg: "",
  });
});
// user edit the password
router.post("/viewAllPassword/edit/:id", auth, async (req, res) => {
  const user_name = req.user.username; //WHEN USER LOGIN SHOW WHOSE USER LOGED IN
  const updateData = await addPasword.findByIdAndUpdate(req.params.id, {
    selectCategory: req.body.selectCategory,
    projectname: req.body.projectname,
    passwordDetails: req.body.passwordDetails,
  });
  const result = await updateData.save();
  res.redirect("/viewAllPassword");
});
router.get("/viewAllPassword/delete/:id", async (req, res) => {
  const result = await addPasword.findByIdAndDelete(req.params.id);
  res.redirect("/viewAllPassword");
});

/*---------VIEW ALL PASSWORD END-----------*/

/*---------LOGOUT-----------*/
// for logout user
router.get("/logout", auth, async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((elem) => {
    //   return elem.token !== req.token;
    // }); //when user login multiple devices but wants to logout only one device to use this function
    req.user.tokens = []; //logout from all devices by using JWT
    res.clearCookie("jwt"); //clearCookie when user logout
    await req.user.save();
    res.status(200).redirect("/");
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("*", (req, res) => {
  res.redirect("/");
});
/*--------LOGOUT END-----------*/
module.exports = router;

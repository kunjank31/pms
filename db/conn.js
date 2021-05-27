const mongoose = require("mongoose");
// DATABASE CONNECTION
mongoose.connect("mongodb://localhost:27017/pms", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
}).then(()=>console.log("DB Connected..")).catch(e=>console.log(e));

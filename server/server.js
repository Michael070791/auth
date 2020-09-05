const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

mongoose.Promise = global.Promise;
const app = express();
//connection to database
mongoose.connect("mongodb://localhost:27017/auth");
//import user model
//Midlewares
const { User } = require("./models/user");
const { auth } = require("./middleware/auth");
//using body parser globaly on all routes
app.use(bodyParser.json());
app.use(cookieParser());

//posting request to route /api/user
//create user
app.post("/api/user", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });
  user.save((err, doc) => {
    if (err) res.status(400).send(err);
    res.status(200).send(doc);
  });
});
// user login
app.post("/user/login", function (req, res) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      res.json({ message: "Auth failed, user not found" });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) return res.status(400).json({ message: "Wrong password" });
      user.generateToken((err, user) => {
        if (err) {
          return res.status(400).send(err);
        }
        res.cookie("auth", user.token).send("ok");
      });
      //   res.status(200).send(user);
    });
  });
});
//user profile
app.get("/user/profile", auth, (req, res) => {
  res.status(200).send({ message: `access granted with token: ${req.token} ` });
});

//port config
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

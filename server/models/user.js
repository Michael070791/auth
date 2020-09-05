const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_I = 10;

const userSchema = mongoose.Schema({
  email: {
    type: String,
    requrired: true,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  token: {
    type: String,
  },
});
//pasword hashin and saving  logic
userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified) {
    bcrypt.genSalt(SALT_I, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
//validating passwords for user login
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      throw cb(err);
    }
    cb(null, isMatch);
  });
};
// TOKEN Generation
userSchema.methods.generateToken = function (cb) {
  let user = this;
  var token = jwt.sign(user._id.toHexString(), "supersecret");
  user.token = token;

  user.save((err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  const user = this;

  jwt.verify(token, "supersecret", function (err, decode) {
    user.findOne({ "_id": decode, "token": token }, function (err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

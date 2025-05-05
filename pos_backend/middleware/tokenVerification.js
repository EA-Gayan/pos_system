const config = require("../config/config");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");

const isVerifiedUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      const error = createHttpError(401, "Please provide token!");
      return next(error);
    }

    const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

    const user = await User.findById(decodeToken.id);
    if (!user) {
      const error = createHttpError(401, "User not found!");
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error during token verification:", error.message);
    const err = createHttpError(401, "Invalid access token!");
    return next(err);
  }
};

module.exports = { isVerifiedUser };

const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const connectDB = require("../config/database");

const register = async (req, res, next) => {
  try {
    await connectDB();
    const { name, email, phone, password, role } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !role) {
      const error = createHttpError(400, "All fields are required!");
      return next(error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = createHttpError(400, "User already exists!");
      return next(error);
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      const error = createHttpError(400, "Email and password are required!");
      return next(error);
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      const error = createHttpError(401, "Invalid Credentials!");
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = createHttpError(401, "Invalid password!");
      return next(error);
    }

    // Cleanup is now handled by cron job (see /api/cron/cleanup)

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.accessTokenSecret,
      { expiresIn: "1d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "User Login successful!",
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res, next) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "User Logout successful!",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { register, login, getUserData, logout };

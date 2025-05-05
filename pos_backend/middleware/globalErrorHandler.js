const config = require("../config/config");

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    status: statusCode,
    message: err.message || "Internal Server Error",
    errorStack: config.nodeEnv === "development" ? err.stack : "",
  });
};

module.exports = globalErrorHandler;
// This code defines a global error handler middleware function for an Express.js application. The function takes four parameters: err (the error object), req (the request object), res (the response object), and next (the next middleware function). The function is currently empty, meaning it does not handle errors yet. It is intended to be used in the Express app to catch and handle errors that occur during request processing.

require("dotenv").config();

const config = Object.freeze({
  port: process.env.PORT || 3000,
  databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017",
  nodeEnv: process.env.NODE_ENV || "development",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

module.exports = config;
// This code is a configuration module for a Node.js application. It uses the dotenv package to load environment variables from a .env file. The config object contains three properties: port, databaseURI, and nodeEnv, which are set to default values if the corresponding environment variables are not defined. Finally, the config object is exported for use in other parts of the application.

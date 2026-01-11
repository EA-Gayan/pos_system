const express = require("express");
const router = express.Router();
const cronController = require("../controllers/cronController");

router.get("/cleanup", cronController.cleanup);

module.exports = router;

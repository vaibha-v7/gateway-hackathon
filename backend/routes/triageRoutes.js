const express = require("express");

const triageController = require("../controllers/triageController");

const router = express.Router();

router.post("/", triageController.triageSingle);
router.post("/batch", triageController.triageBatch);

module.exports = router;
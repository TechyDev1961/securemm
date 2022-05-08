const router = require('express').Router();
const auth = require('./auth');
const mm = require("./mm")
const transcript = require("./transcript")
router.use("/auth", auth)
router.use("/mm", mm)
router.use("/ticket", transcript)
module.exports = router
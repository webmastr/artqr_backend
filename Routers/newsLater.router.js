const express = require("express");
const router = express.Router();
const {
  subscribeToNewsletter,
  getAllSubscribers,
  submitUserInfo,
  getAllUserInfo,
} = require("../Controller/newsLater.controller");

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Newsletter Routes
router.post("/create-newsletter", subscribeToNewsletter);
router.get("/get-newsletter", getAllSubscribers);

// Tell Us About You Routes
router.post("/submit-user-info", submitUserInfo);
router.get("/get-user-info", getAllUserInfo);

module.exports = router;

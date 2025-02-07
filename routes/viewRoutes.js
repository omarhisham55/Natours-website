const express = require("express");
const controller = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const router = express.Router();

router.get("/account", authController.protect, controller.getAccount);
router.get("/my-tours", authController.protect, controller.getMyTours);
//*
// router.post(
//   "/submit-user-data",
//   authController.protect,
//   controller.updateUserData
// );

router.use(authController.isLoggedIn);

router.get(
  "/",
  bookingController.createBookingCheckout,
  controller.getOverview
);
router.get("/tour/:slug", controller.getTour);
router.get("/login", controller.getLoginForm);
router.get("/signup", controller.getSignupForm);

module.exports = router;

const express = require("express");
const {
  getUsersStats,
  getAllUsers,
  getMe,
  updateMe,
  uploadUserPhoto,
  resizeUserPhoto,
  deleteMe,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

//* ////////////////Authentication////////////////////////////
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

//* ////////////////User Control////////////////////////////
router.use(authController.protect);

router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.get("/me", getMe, getUserById);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

//* ////////////////Admin Control////////////////////////////
router.use(authController.restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/getUsersStats").get(getUsersStats);
router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;

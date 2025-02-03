const express = require("express");
const controller = require("./../controllers/viewsController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.use(authController.isLoggedIn);

router.get("/", controller.getOverview);
router.get("/tour/:slug", controller.getTour);
router.get("/login", controller.getLoginForm);

router.all("*", (req, res, next) => {
    
});
module.exports = router;

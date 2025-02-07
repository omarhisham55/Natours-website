const express = require("express");
const controller = require("../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewsRouter = require("./../routes/reviewsRoutes");
const router = express.Router();

//? router.param("id", controller.checkID);

router.use("/:id/reviews", reviewsRouter);

//? router.use(authController.protect);

router
  .route("/")
  .get(controller.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controller.createTour
  );

router.route("/tour-stats").get(controller.getTourStats);

router
  .route("/monthly-stats/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controller.getMonthlyStats
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(controller.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(controller.getDistances);

router
  .route("/top-5-cheap")
  .get(controller.aliasTopTours, controller.getAllTours);

router
  .route("/:id")
  .get(controller.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controller.uploadTourImages,
    controller.resizeTourImages,
    controller.patchTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    controller.deleteTour
  );

module.exports = router;

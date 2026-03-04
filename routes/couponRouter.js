const router = require("express").Router();
const couponCtrl = require("../controllers/couponCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

// Admin routes
router.post("/", auth, authAdmin, couponCtrl.createCoupon);
router.get("/", couponCtrl.getCoupons);
router.get("/:id", couponCtrl.getCoupon);
router.patch("/:id", auth, authAdmin, couponCtrl.updateCoupon);
router.delete("/:id", auth, authAdmin, couponCtrl.deleteCoupon);

// User routes
router.post("/validate", couponCtrl.validateCoupon);
router.post("/apply", auth, couponCtrl.applyCoupon);

module.exports = router;

const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const auth = require("../middleware/auth");

router.post("/register", userCtrl.register);

router.post("/login", userCtrl.login);

router.get("/logout", userCtrl.logout);

router.get("/refresh_token", userCtrl.refreshToken);

router.get("/infor", auth, userCtrl.getUser);

router.patch("/addcart", auth, userCtrl.addCart);

router.get("/history", auth, userCtrl.history);

router.post("/like", auth, userCtrl.likeProduct);

router.post("/unlike", auth, userCtrl.unlikeProduct);

router.get("/likes", auth, userCtrl.getUserLikes);

router.get("/check-like/:productId", auth, userCtrl.checkProductLike);

router.get("/all-users", userCtrl.getAllAdmins);

router.get("/admin-main", userCtrl.getMainAdmin);

module.exports = router;

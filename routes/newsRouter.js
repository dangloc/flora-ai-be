const router = require("express").Router();
const newsCtrl = require("../controllers/newsCtrl");
const newsCategoryCtrl = require("../controllers/newsCategoryCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

// News Category Routes
// Public routes
router.get("/categories", newsCategoryCtrl.getCategories);
router.get("/categories/:slug", newsCategoryCtrl.getCategoryBySlug);
router.get("/category/:id", newsCategoryCtrl.getCategory);

// Admin routes
router.post("/categories", auth, authAdmin, newsCategoryCtrl.createCategory);
router.patch("/categories/:id", auth, authAdmin, newsCategoryCtrl.updateCategory);
router.delete("/categories/:id", auth, authAdmin, newsCategoryCtrl.deleteCategory);

// News Routes
// Public routes - ROUTES CỤ THỂ PHẢI TRƯỚC
router.get("/featured", newsCtrl.getFeaturedNews);
router.get("/trending", newsCtrl.getTrendingNews);
router.get("/category/:slug", newsCtrl.getNewsByCategory);
// ROUTES CHUNG CHUNG ỞCuối
router.get("/", newsCtrl.getNews);
router.get("/:slug", newsCtrl.getNewsDetail);
router.post("/:id/like", newsCtrl.likeNews);

// Admin routes
router.post("/", auth, authAdmin, newsCtrl.createNews);
router.patch("/:id", auth, authAdmin, newsCtrl.updateNews);
router.delete("/:id", auth, authAdmin, newsCtrl.deleteNews);

module.exports = router;

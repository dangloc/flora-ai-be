const router = require('express').Router()
const bannerCtrl = require('../controllers/bannerCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

// Public routes - không cần auth
router.route('/banners')
    .get(bannerCtrl.getBanners)
    .post(auth, authAdmin, bannerCtrl.createBanner)

router.route('/banners/:id')
    .get(bannerCtrl.getBanner)
    .put(auth, authAdmin, bannerCtrl.updateBanner)
    .delete(auth, authAdmin, bannerCtrl.deleteBanner)

router.route('/banners/:id/image')
    .put(auth, authAdmin, bannerCtrl.updateBannerImage)

module.exports = router


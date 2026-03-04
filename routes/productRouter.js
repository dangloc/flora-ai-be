const router = require('express').Router()
const productCtrl = require('../controllers/productCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')


router.route('/products')
    .get(productCtrl.getProducts)
    .post(productCtrl.createProduct)

router.route('/products/best-selling')
    .get(productCtrl.getBestSellingProducts)


router.route('/products/:id')
    .delete(productCtrl.deleteProduct)
    .put(productCtrl.updateProduct)

// Routes cho variants
router.route('/products/:id/variants')
    .get(productCtrl.getProductVariants)
    .post(productCtrl.addVariant)

router.route('/products/:id/variants/:variantId')
    .put(productCtrl.updateVariant)
    .delete(productCtrl.deleteVariant)

router.route('/products/:id/variants/:variantId/inventory')
    .put(productCtrl.updateVariantInventory)


module.exports = router
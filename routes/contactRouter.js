const router = require('express').Router();
const contactCtrl = require('../controllers/contactCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

// Send contact email (public)
router.post('/send-mail', contactCtrl.sendMail);

// Get all contacts (admin only)
router.get('/all', auth, authAdmin, contactCtrl.getContacts);

// Mark as read (admin only)
router.patch('/:id/read', auth, authAdmin, contactCtrl.markAsRead);

// Delete contact (admin only)
router.delete('/:id', auth, authAdmin, contactCtrl.deleteContact);

module.exports = router;

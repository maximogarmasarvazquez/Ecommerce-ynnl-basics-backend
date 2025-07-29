const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

router.post('/', shippingController.createShipping);
router.get('/', shippingController.getAllShippings);
router.get('/:id', shippingController.getShippingById);
router.put('/:id', shippingController.updateShipping);
router.delete('/:id', shippingController.deleteShipping);

module.exports = router;

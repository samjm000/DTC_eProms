const express = require('express');
const sideEffectController = require('../controllers/sideEffectController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/ctcae-events', authenticate, sideEffectController.getCTCAEEvents);

router.get('/ctcae-events/:id', authenticate, sideEffectController.getCTCAEEventById);

router.post('/report', authenticate, authorize('patient'), sideEffectController.reportSideEffect);

router.get('/', authenticate, sideEffectController.getSideEffects);

router.get('/urgent', authenticate, authorize('clinician', 'admin'), sideEffectController.getUrgentSideEffects);

router.put('/:id', authenticate, sideEffectController.updateSideEffect);

module.exports = router;

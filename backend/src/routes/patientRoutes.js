const express = require('express');
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',
  authenticate,
  authorize('clinician', 'admin'),
  patientController.getAllPatients
);

router.get('/dashboard',
  authenticate,
  authorize('patient'),
  patientController.getPatientDashboard
);

router.get('/:id',
  authenticate,
  patientController.getPatientById
);

router.post('/',
  authenticate,
  authorize('clinician', 'admin'),
  patientController.createPatient
);

router.put('/:id',
  authenticate,
  authorize('clinician', 'admin'),
  patientController.updatePatient
);

module.exports = router;

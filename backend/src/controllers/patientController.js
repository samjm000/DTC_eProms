const { Patient, User, TreatmentPlan, PatientSideEffect, CTCAEAdverseEvent } = require('../models');
const { Op } = require('sequelize');

exports.getAllPatients = async (req, res) => {
  try {
    const { search, cancerType, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    const userWhereClause = {};

    if (search) {
      userWhereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (cancerType) {
      whereClause.cancerType = { [Op.iLike]: `%${cancerType}%` };
    }

    const patients = await Patient.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
        },
        {
          model: User,
          as: 'primaryClinician',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: TreatmentPlan,
          as: 'treatmentPlans',
          required: false,
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.json({
      patients: patients.rows,
      pagination: {
        total: patients.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(patients.count / limit)
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'lastLogin']
        },
        {
          model: User,
          as: 'primaryClinician',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: TreatmentPlan,
          as: 'treatmentPlans',
          order: [['startDate', 'DESC']]
        },
        {
          model: PatientSideEffect,
          as: 'sideEffects',
          include: [
            {
              model: CTCAEAdverseEvent,
              as: 'adverseEvent',
              attributes: ['id', 'eventName', 'patientFriendlyName']
            },
            {
              model: User,
              as: 'reviewer',
              attributes: ['id', 'firstName', 'lastName']
            }
          ],
          order: [['onsetDate', 'DESC']],
          limit: 50
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (req.user.role === 'patient' && patient.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const {
      userId,
      nhsNumber,
      dateOfBirth,
      gender,
      cancerType,
      cancerStage,
      diagnosisDate,
      hospitalNumber,
      emergencyContactName,
      emergencyContactPhone,
      contactPreference
    } = req.body;

    const existingPatient = await Patient.findOne({ where: { nhsNumber } });
    if (existingPatient) {
      return res.status(400).json({ error: 'NHS number already exists' });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'patient') {
      return res.status(400).json({ error: 'Invalid user or user is not a patient' });
    }

    const patient = await Patient.create({
      userId,
      nhsNumber,
      dateOfBirth,
      gender,
      cancerType,
      cancerStage,
      diagnosisDate,
      primaryClinicianId: req.user.id,
      hospitalNumber,
      emergencyContactName,
      emergencyContactPhone,
      contactPreference: contactPreference || 'email'
    });

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    delete updates.id;
    delete updates.userId;
    delete updates.nhsNumber;

    await patient.update(updates);

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

exports.getPatientDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'primaryClinician',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: TreatmentPlan,
          as: 'treatmentPlans',
          where: { status: { [Op.in]: ['active', 'planned'] } },
          required: false
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const recentSideEffects = await PatientSideEffect.findAll({
      where: { patientId: patient.id },
      include: [
        {
          model: CTCAEAdverseEvent,
          as: 'adverseEvent',
          attributes: ['eventName', 'patientFriendlyName']
        }
      ],
      order: [['onsetDate', 'DESC']],
      limit: 10
    });

    const urgentSideEffects = await PatientSideEffect.count({
      where: {
        patientId: patient.id,
        requiresUrgentAttention: true,
        clinicianReviewStatus: 'pending'
      }
    });

    res.json({
      patient,
      recentSideEffects,
      stats: {
        urgentSideEffects,
        activeTreatments: patient.treatmentPlans?.length || 0
      }
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

const { PatientSideEffect, CTCAEAdverseEvent, Patient, User } = require('../models');
const { Op } = require('sequelize');

exports.getCTCAEEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { eventName: { [Op.iLike]: `%${search}%` } },
        { patientFriendlyName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.categoryId = category;
    }

    const events = await CTCAEAdverseEvent.findAll({
      where: whereClause,
      order: [['display_order', 'ASC'], ['patient_friendly_name', 'ASC']]
    });

    res.json({ events });
  } catch (error) {
    console.error('Get CTCAE events error:', error);
    res.status(500).json({ error: 'Failed to fetch CTCAE events' });
  }
};

exports.getCTCAEEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CTCAEAdverseEvent.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'CTCAE event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get CTCAE event error:', error);
    res.status(500).json({ error: 'Failed to fetch CTCAE event' });
  }
};

exports.reportSideEffect = async (req, res) => {
  try {
    const {
      ctcaeEventId,
      grade,
      onsetDate,
      severityScore,
      impactOnDailyLife,
      patientNotes,
      treatmentCycleId
    } = req.body;

    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const ctcaeEvent = await CTCAEAdverseEvent.findByPk(ctcaeEventId);
    if (!ctcaeEvent) {
      return res.status(404).json({ error: 'CTCAE event not found' });
    }

    const requiresUrgentAttention = grade >= 3;

    const sideEffect = await PatientSideEffect.create({
      patientId: patient.id,
      ctcaeEventId,
      grade,
      onsetDate,
      severityScore,
      impactOnDailyLife,
      patientNotes,
      treatmentCycleId,
      isOngoing: true,
      clinicianReviewStatus: requiresUrgentAttention ? 'action_required' : 'pending',
      requiresUrgentAttention
    });

    if (requiresUrgentAttention) {
    }

    const sideEffectWithDetails = await PatientSideEffect.findByPk(sideEffect.id, {
      include: [
        {
          model: CTCAEAdverseEvent,
          as: 'adverseEvent'
        }
      ]
    });

    res.status(201).json({
      message: 'Side effect reported successfully',
      sideEffect: sideEffectWithDetails
    });
  } catch (error) {
    console.error('Report side effect error:', error);
    res.status(500).json({ error: 'Failed to report side effect' });
  }
};

exports.getSideEffects = async (req, res) => {
  try {
    const { patientId, status, urgent, startDate, endDate } = req.query;

    let targetPatientId = patientId;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      targetPatientId = patient.id;
    }

    if (!targetPatientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const whereClause = { patientId: targetPatientId };

    if (status) {
      whereClause.clinicianReviewStatus = status;
    }

    if (urgent === 'true') {
      whereClause.requiresUrgentAttention = true;
    }

    if (startDate || endDate) {
      whereClause.onsetDate = {};
      if (startDate) whereClause.onsetDate[Op.gte] = startDate;
      if (endDate) whereClause.onsetDate[Op.lte] = endDate;
    }

    const sideEffects = await PatientSideEffect.findAll({
      where: whereClause,
      include: [
        {
          model: CTCAEAdverseEvent,
          as: 'adverseEvent'
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['onsetDate', 'DESC']]
    });

    res.json({ sideEffects });
  } catch (error) {
    console.error('Get side effects error:', error);
    res.status(500).json({ error: 'Failed to fetch side effects' });
  }
};

exports.updateSideEffect = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const sideEffect = await PatientSideEffect.findByPk(id, {
      include: [{ model: Patient, as: 'patient' }]
    });

    if (!sideEffect) {
      return res.status(404).json({ error: 'Side effect not found' });
    }

    if (req.user.role === 'patient' && sideEffect.patient.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'patient') {
      const allowedUpdates = ['resolutionDate', 'isOngoing', 'severityScore', 'impactOnDailyLife', 'patientNotes'];
      Object.keys(updates).forEach(key => {
        if (!allowedUpdates.includes(key)) delete updates[key];
      });
    }

    if (req.user.role === 'clinician') {
      if (updates.clinicianReviewStatus) {
        updates.reviewedBy = req.user.id;
        updates.reviewedAt = new Date();
      }
    }

    await sideEffect.update(updates);

    const updatedSideEffect = await PatientSideEffect.findByPk(id, {
      include: [
        { model: CTCAEAdverseEvent, as: 'adverseEvent' },
        { model: User, as: 'reviewer', attributes: ['firstName', 'lastName'] }
      ]
    });

    res.json({
      message: 'Side effect updated successfully',
      sideEffect: updatedSideEffect
    });
  } catch (error) {
    console.error('Update side effect error:', error);
    res.status(500).json({ error: 'Failed to update side effect' });
  }
};

exports.getUrgentSideEffects = async (req, res) => {
  try {
    const whereClause = {
      requiresUrgentAttention: true,
      clinicianReviewStatus: { [Op.in]: ['pending', 'action_required'] }
    };

    if (req.user.role === 'clinician') {
      const patients = await Patient.findAll({
        where: { primaryClinicianId: req.user.id },
        attributes: ['id']
      });
      const patientIds = patients.map(p => p.id);
      whereClause.patientId = { [Op.in]: patientIds };
    }

    const sideEffects = await PatientSideEffect.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: CTCAEAdverseEvent,
          as: 'adverseEvent'
        }
      ],
      order: [['onsetDate', 'DESC']]
    });

    res.json({ sideEffects });
  } catch (error) {
    console.error('Get urgent side effects error:', error);
    res.status(500).json({ error: 'Failed to fetch urgent side effects' });
  }
};

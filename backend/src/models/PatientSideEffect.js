const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PatientSideEffect = sequelize.define('PatientSideEffect', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    field: 'patient_id'
  },
  treatmentCycleId: {
    type: DataTypes.UUID,
    references: {
      model: 'treatment_cycles',
      key: 'id'
    },
    field: 'treatment_cycle_id'
  },
  ctcaeEventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ctcae_adverse_events',
      key: 'id'
    },
    field: 'ctcae_event_id'
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  onsetDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'onset_date'
  },
  resolutionDate: {
    type: DataTypes.DATEONLY,
    field: 'resolution_date'
  },
  isOngoing: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_ongoing'
  },
  severityScore: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    },
    field: 'severity_score'
  },
  impactOnDailyLife: {
    type: DataTypes.ENUM('none', 'mild', 'moderate', 'severe'),
    field: 'impact_on_daily_life'
  },
  patientNotes: {
    type: DataTypes.TEXT,
    field: 'patient_notes'
  },
  clinicianReviewStatus: {
    type: DataTypes.ENUM('pending', 'reviewed', 'action_required', 'resolved'),
    defaultValue: 'pending',
    field: 'clinician_review_status'
  },
  clinicianNotes: {
    type: DataTypes.TEXT,
    field: 'clinician_notes'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'reviewed_by'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at'
  },
  requiresUrgentAttention: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'requires_urgent_attention'
  }
}, {
  tableName: 'patient_side_effects',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PatientSideEffect;

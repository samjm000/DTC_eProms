const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TreatmentPlan = sequelize.define('TreatmentPlan', {
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
  treatmentName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'treatment_name'
  },
  treatmentType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'treatment_type'
  },
  protocolName: {
    type: DataTypes.STRING(255),
    field: 'protocol_name'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    field: 'end_date'
  },
  plannedCycles: {
    type: DataTypes.INTEGER,
    field: 'planned_cycles'
  },
  status: {
    type: DataTypes.ENUM('planned', 'active', 'completed', 'discontinued'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'created_by'
  }
}, {
  tableName: 'treatment_plans',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TreatmentPlan;

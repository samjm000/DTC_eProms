const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CTCAEAdverseEvent = sequelize.define('CTCAEAdverseEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.UUID,
    references: {
      model: 'ctcae_categories',
      key: 'id'
    },
    field: 'category_id'
  },
  eventName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'event_name'
  },
  meddraCode: {
    type: DataTypes.STRING(50),
    field: 'meddra_code'
  },
  grade1Description: {
    type: DataTypes.TEXT,
    field: 'grade_1_description'
  },
  grade2Description: {
    type: DataTypes.TEXT,
    field: 'grade_2_description'
  },
  grade3Description: {
    type: DataTypes.TEXT,
    field: 'grade_3_description'
  },
  grade4Description: {
    type: DataTypes.TEXT,
    field: 'grade_4_description'
  },
  grade5Description: {
    type: DataTypes.TEXT,
    field: 'grade_5_description'
  },
  patientFriendlyName: {
    type: DataTypes.STRING(255),
    field: 'patient_friendly_name'
  },
  patientFriendlyDescription: {
    type: DataTypes.TEXT,
    field: 'patient_friendly_description'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 999,
    field: 'display_order'
  }
}, {
  tableName: 'ctcae_adverse_events',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CTCAEAdverseEvent;

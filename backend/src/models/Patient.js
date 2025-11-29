const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  nhsNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'nhs_number'
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_of_birth'
  },
  gender: {
    type: DataTypes.STRING(20)
  },
  cancerType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'cancer_type'
  },
  cancerStage: {
    type: DataTypes.STRING(50),
    field: 'cancer_stage'
  },
  diagnosisDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'diagnosis_date'
  },
  primaryClinicianId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'primary_clinician_id'
  },
  hospitalNumber: {
    type: DataTypes.STRING(50),
    field: 'hospital_number'
  },
  contactPreference: {
    type: DataTypes.ENUM('email', 'sms', 'both', 'none'),
    defaultValue: 'email',
    field: 'contact_preference'
  },
  emergencyContactName: {
    type: DataTypes.STRING(200),
    field: 'emergency_contact_name'
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(20),
    field: 'emergency_contact_phone'
  }
}, {
  tableName: 'patients',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Patient;

const User = require('./User');
const Patient = require('./Patient');
const TreatmentPlan = require('./TreatmentPlan');
const CTCAEAdverseEvent = require('./CTCAEAdverseEvent');
const PatientSideEffect = require('./PatientSideEffect');

User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Patient.belongsTo(User, { foreignKey: 'primaryClinicianId', as: 'primaryClinician' });
User.hasMany(Patient, { foreignKey: 'primaryClinicianId', as: 'patients' });

Patient.hasMany(TreatmentPlan, { foreignKey: 'patientId', as: 'treatmentPlans' });
TreatmentPlan.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(PatientSideEffect, { foreignKey: 'patientId', as: 'sideEffects' });
PatientSideEffect.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

CTCAEAdverseEvent.hasMany(PatientSideEffect, { foreignKey: 'ctcaeEventId', as: 'patientReports' });
PatientSideEffect.belongsTo(CTCAEAdverseEvent, { foreignKey: 'ctcaeEventId', as: 'adverseEvent' });

PatientSideEffect.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = {
  User,
  Patient,
  TreatmentPlan,
  CTCAEAdverseEvent,
  PatientSideEffect
};

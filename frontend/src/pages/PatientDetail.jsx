import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/api';
import { User, Calendar, AlertCircle, Activity, Phone, Mail, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getById(id)
  });

  const patient = data?.data?.patient;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading patient details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading patient</h3>
        <p className="text-gray-600">{error.response?.data?.error || 'Failed to load patient details'}</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="mb-6 flex items-center text-nhs-blue hover:text-nhs-dark-blue transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Patient List
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {patient.user.firstName} {patient.user.lastName}
        </h1>
        <p className="text-gray-600 mt-2">NHS Number: {patient.nhsNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Patient Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="text-sm text-gray-900">{format(new Date(patient.dateOfBirth), 'PPP')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="text-sm text-gray-900">{patient.gender || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {patient.user.email}
              </dd>
            </div>
            {patient.user.phoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {patient.user.phoneNumber}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Hospital Number</dt>
              <dd className="text-sm text-gray-900">{patient.hospitalNumber || 'Not recorded'}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Cancer Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Cancer Type</dt>
              <dd className="text-sm text-gray-900">{patient.cancerType}</dd>
            </div>
            {patient.cancerStage && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Stage</dt>
                <dd className="text-sm text-gray-900">{patient.cancerStage}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Diagnosis Date</dt>
              <dd className="text-sm text-gray-900">{format(new Date(patient.diagnosisDate), 'PPP')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary Clinician</dt>
              <dd className="text-sm text-gray-900">
                {patient.primaryClinician
                  ? `Dr. ${patient.primaryClinician.firstName} ${patient.primaryClinician.lastName}`
                  : 'Not assigned'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Emergency Contact
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{patient.emergencyContactName || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{patient.emergencyContactPhone || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact Preference</dt>
              <dd className="text-sm text-gray-900 capitalize">{patient.contactPreference}</dd>
            </div>
          </dl>
        </div>
      </div>

      {patient.treatmentPlans && patient.treatmentPlans.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Treatment Plans</h2>
          <div className="space-y-4">
            {patient.treatmentPlans.map((plan) => (
              <div key={plan.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{plan.treatmentName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.treatmentType}</p>
                    {plan.protocolName && (
                      <p className="text-xs text-gray-500 mt-1">Protocol: {plan.protocolName}</p>
                    )}
                  </div>
                  <span className={`badge ${
                    plan.status === 'active' ? 'badge-success' :
                    plan.status === 'completed' ? 'badge-info' :
                    plan.status === 'discontinued' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{format(new Date(plan.startDate), 'PP')}</p>
                  </div>
                  {plan.endDate && (
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">{format(new Date(plan.endDate), 'PP')}</p>
                    </div>
                  )}
                  {plan.plannedCycles && (
                    <div>
                      <p className="text-gray-500">Planned Cycles</p>
                      <p className="font-medium">{plan.plannedCycles}</p>
                    </div>
                  )}
                </div>
                {plan.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{plan.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reported Side Effects</h2>

        {!patient.sideEffects || patient.sideEffects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No side effects reported yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Side Effect
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Onset Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.sideEffects.map((effect) => (
                  <tr key={effect.id} className={effect.requiresUrgentAttention ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {effect.adverseEvent.patientFriendlyName || effect.adverseEvent.eventName}
                      </div>
                      {effect.patientNotes && (
                        <div className="text-xs text-gray-500 mt-1 italic">"{effect.patientNotes}"</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        effect.grade >= 3 ? 'badge-danger' :
                        effect.grade === 2 ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        Grade {effect.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(effect.onsetDate), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {effect.isOngoing ? (
                        <span className="badge badge-warning">Ongoing</span>
                      ) : (
                        <span className="badge badge-success">Resolved</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        effect.clinicianReviewStatus === 'pending' ? 'badge-warning' :
                        effect.clinicianReviewStatus === 'reviewed' ? 'badge-success' :
                        effect.clinicianReviewStatus === 'action_required' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {effect.clinicianReviewStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;

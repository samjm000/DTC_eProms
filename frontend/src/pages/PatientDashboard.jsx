import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientService, sideEffectService } from '../services/api';
import { Activity, AlertCircle, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const PatientDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: () => patientService.getDashboard()
  });

  const patient = dashboardData?.data?.patient;
  const recentSideEffects = dashboardData?.data?.recentSideEffects || [];
  const stats = dashboardData?.data?.stats;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Health Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your treatment and report side effects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-nhs-blue to-nhs-dark-blue text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Treatments</p>
              <p className="text-3xl font-bold mt-2">{stats?.activeTreatments || 0}</p>
            </div>
            <Activity className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-nhs-green to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Side Effects Reported</p>
              <p className="text-3xl font-bold mt-2">{recentSideEffects.length}</p>
            </div>
            <AlertCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-nhs-red to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Needs Attention</p>
              <p className="text-3xl font-bold mt-2">{stats?.urgentSideEffects || 0}</p>
            </div>
            <AlertCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Care Team</h2>

          {patient?.primaryClinician && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="bg-nhs-blue rounded-full p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Primary Clinician</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Dr. {patient.primaryClinician.firstName} {patient.primaryClinician.lastName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{patient.primaryClinician.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
            <p className="text-sm text-gray-700">{patient?.cancerType}</p>
            {patient?.cancerStage && (
              <p className="text-sm text-gray-600 mt-1">Stage: {patient.cancerStage}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Diagnosed: {patient?.diagnosisDate && format(new Date(patient.diagnosisDate), 'PPP')}
            </p>
          </div>

          <div className="mt-6">
            <Link
              to="/report-side-effect"
              className="w-full btn-primary text-center block"
            >
              Report Side Effect
            </Link>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Side Effects</h2>

          {recentSideEffects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No side effects reported yet</p>
              <p className="text-sm mt-2">
                If you experience any side effects, please report them using the button above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSideEffects.map((effect) => (
                <div
                  key={effect.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {effect.adverseEvent.patientFriendlyName || effect.adverseEvent.eventName}
                      </p>
                      <div className="flex items-center mt-2 space-x-3">
                        <span className={`badge ${
                          effect.grade >= 3 ? 'badge-danger' :
                          effect.grade === 2 ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          Grade {effect.grade}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(effect.onsetDate), 'PPP')}
                        </span>
                        {effect.isOngoing && (
                          <span className="badge badge-warning">Ongoing</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs font-medium ${
                          effect.clinicianReviewStatus === 'pending' ? 'text-yellow-600' :
                          effect.clinicianReviewStatus === 'reviewed' ? 'text-green-600' :
                          effect.clinicianReviewStatus === 'action_required' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          Status: {effect.clinicianReviewStatus.replace('_', ' ')}
                        </span>
                      </div>
                      {effect.patientNotes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{effect.patientNotes}"</p>
                      )}
                    </div>
                    {effect.requiresUrgentAttention && (
                      <AlertCircle className="h-5 w-5 text-nhs-red flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {patient?.treatmentPlans && patient.treatmentPlans.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Treatment Plan</h2>
          <div className="space-y-4">
            {patient.treatmentPlans.map((plan) => (
              <div key={plan.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{plan.treatmentName}</p>
                    <p className="text-sm text-gray-600 mt-1">{plan.treatmentType}</p>
                    {plan.protocolName && (
                      <p className="text-xs text-gray-500 mt-1">Protocol: {plan.protocolName}</p>
                    )}
                  </div>
                  <span className={`badge ${
                    plan.status === 'active' ? 'badge-success' :
                    plan.status === 'completed' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-xs text-gray-600 space-x-4">
                  <span>Start: {format(new Date(plan.startDate), 'PP')}</span>
                  {plan.endDate && <span>End: {format(new Date(plan.endDate), 'PP')}</span>}
                  {plan.plannedCycles && <span>Cycles: {plan.plannedCycles}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

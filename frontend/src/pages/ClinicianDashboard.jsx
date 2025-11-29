import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientService, sideEffectService } from '../services/api';
import { Users, AlertCircle, Activity, TrendingUp } from 'lucide-react';

const ClinicianDashboard = () => {
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.getAll({ limit: 5 })
  });

  const { data: urgentData, isLoading: urgentLoading } = useQuery({
    queryKey: ['urgent-side-effects'],
    queryFn: () => sideEffectService.getUrgent()
  });

  const patients = patientsData?.data?.patients || [];
  const urgentSideEffects = urgentData?.data?.sideEffects || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clinician Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of patient outcomes and side effects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-nhs-blue to-nhs-dark-blue text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold mt-2">
                {patientsLoading ? '...' : patientsData?.data?.pagination?.total || 0}
              </p>
            </div>
            <Users className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-nhs-red to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Urgent Side Effects</p>
              <p className="text-3xl font-bold mt-2">
                {urgentLoading ? '...' : urgentSideEffects.length}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-nhs-green to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Treatments</p>
              <p className="text-3xl font-bold mt-2">-</p>
            </div>
            <Activity className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Urgent Side Effects</h2>
            <AlertCircle className="h-6 w-6 text-nhs-red" />
          </div>

          {urgentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue mx-auto"></div>
            </div>
          ) : urgentSideEffects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No urgent side effects requiring attention</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentSideEffects.map((effect) => (
                <Link
                  key={effect.id}
                  to={`/patients/${effect.patient.id}`}
                  className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {effect.patient.user.firstName} {effect.patient.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {effect.adverseEvent.patientFriendlyName || effect.adverseEvent.eventName}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="badge badge-danger">Grade {effect.grade}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(effect.onsetDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <AlertCircle className="h-5 w-5 text-nhs-red flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
            <Link to="/patients" className="text-nhs-blue hover:underline text-sm font-medium">
              View all
            </Link>
          </div>

          {patientsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue mx-auto"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No patients yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  to={`/patients/${patient.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.user.firstName} {patient.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">NHS: {patient.nhsNumber}</p>
                      <p className="text-sm text-gray-600">{patient.cancerType}</p>
                    </div>
                    <div className="text-right">
                      {patient.treatmentPlans?.[0] && (
                        <span className="badge badge-info">{patient.treatmentPlans[0].status}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicianDashboard;

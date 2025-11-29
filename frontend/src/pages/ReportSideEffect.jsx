import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sideEffectService } from '../services/api';
import { AlertCircle, Search, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportSideEffect = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    grade: 1,
    onsetDate: new Date().toISOString().split('T')[0],
    severityScore: 5,
    impactOnDailyLife: 'mild',
    patientNotes: ''
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['ctcae-events', searchTerm],
    queryFn: () => sideEffectService.getCTCAEEvents({ search: searchTerm }),
    enabled: true
  });

  const reportMutation = useMutation({
    mutationFn: (data) => sideEffectService.report(data),
    onSuccess: () => {
      toast.success('Side effect reported successfully');
      queryClient.invalidateQueries(['patient-dashboard']);
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to report side effect');
    }
  });

  const events = eventsData?.data?.events || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error('Please select a side effect');
      return;
    }

    reportMutation.mutate({
      ctcaeEventId: selectedEvent.id,
      ...formData,
      grade: parseInt(formData.grade),
      severityScore: parseInt(formData.severityScore)
    });
  };

  const getGradeDescription = (grade) => {
    if (!selectedEvent) return '';
    const gradeKey = `grade${grade}Description`;
    return selectedEvent[gradeKey] || '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report Side Effect</h1>
        <p className="text-gray-600 mt-2">
          Report any side effects you're experiencing from your treatment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Side Effect</h2>

          <div className="mb-4">
            <label className="label">Search for a side effect</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., nausea, fatigue, pain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue mx-auto"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No side effects found. Try a different search term.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'bg-nhs-blue text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className={`font-medium ${
                        selectedEvent?.id === event.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {event.patientFriendlyName || event.eventName}
                      </p>
                      {event.patientFriendlyDescription && (
                        <p className={`text-sm mt-1 ${
                          selectedEvent?.id === event.id ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {event.patientFriendlyDescription}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedEvent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-nhs-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Selected:</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedEvent.patientFriendlyName || selectedEvent.eventName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedEvent && (
          <>
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Grade Severity</h2>

              <div className="mb-4">
                <label className="label">
                  How severe is this side effect? (Grade 1-5)
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="input-field"
                  required
                >
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              {getGradeDescription(formData.grade) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Grade {formData.grade} Definition:
                  </p>
                  <p className="text-sm text-gray-700">{getGradeDescription(formData.grade)}</p>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="label">When did this start?</label>
                  <input
                    type="date"
                    value={formData.onsetDate}
                    onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    How severe does it feel to you? (1 = minimal, 10 = worst possible)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severityScore}
                    onChange={(e) => setFormData({ ...formData, severityScore: e.target.value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Minimal (1)</span>
                    <span className="font-medium text-lg">{formData.severityScore}</span>
                    <span>Worst (10)</span>
                  </div>
                </div>

                <div>
                  <label className="label">Impact on daily activities</label>
                  <select
                    value={formData.impactOnDailyLife}
                    onChange={(e) => setFormData({ ...formData, impactOnDailyLife: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="none">No impact</option>
                    <option value="mild">Mild impact</option>
                    <option value="moderate">Moderate impact</option>
                    <option value="severe">Severe impact</option>
                  </select>
                </div>

                <div>
                  <label className="label">Additional notes (optional)</label>
                  <textarea
                    value={formData.patientNotes}
                    onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Describe how this side effect is affecting you, any patterns you've noticed, or other relevant information..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportMutation.isLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

            {parseInt(formData.grade) >= 3 && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-nhs-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Important Notice</p>
                    <p className="text-sm text-red-800 mt-1">
                      This is a high-grade side effect. Please call your cancer treatment helpline for advice.
                      If you feel this is an emergency, please contact your hospital or call 999.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default ReportSideEffect;

import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [paidBills, setPaidBills] = useState(new Set());
  
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [testReports, setTestReports] = useState([]);
  const [bills, setBills] = useState([]);
  
  // Appointment booking state
  const [showBookModal, setShowBookModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, []);

  /**
   * Helper: safely extract array from a DRF response that may be
   * paginated ({ count, next, previous, results: [] }) or a flat array.
   */
  const extractArray = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.results)) return responseData.results;
    return [];
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError('');

      // ── 1. Fetch patient by email ──
      let patients = [];
      try {
        const email = user?.email;
        if (!email) throw new Error("No authenticated email found");
        
        const patientsRes = await api.get(`/patients/?email=${encodeURIComponent(email)}`);
        console.log('[PatientDashboard] /patients/ raw response:', patientsRes.data);
        patients = extractArray(patientsRes.data);
      } catch (err) {
        console.error('[PatientDashboard] /patients/ FAILED:', err.response?.status, err.response?.data);
        setError(`Failed to load patient profile: ${err.response?.data?.detail || err.message}`);
        setLoading(false);
        return; // Can't continue without patient data
      }

      if (!patients || patients.length === 0) {
        setError("No patient profile found for your account. Please contact administration.");
        setLoading(false);
        return;
      }
      
      const currentPatient = patients[0];
      setPatient(currentPatient);
      console.log('[PatientDashboard] Mapped to patient:', currentPatient.name, '(p_id:', currentPatient.p_id, ')');

      // ── 2. Fetch doctors (AllowAny) ──
      try {
        const doctorsRes = await api.get('/doctors/');
        console.log('[PatientDashboard] /doctors/ raw response:', doctorsRes.data);
        const doctorsList = extractArray(doctorsRes.data);
        setDoctors(doctorsList);
      } catch (err) {
        console.error('[PatientDashboard] /doctors/ FAILED:', err.response?.status, err.response?.data);
        // Non-fatal: doctors dropdown will be empty but dashboard still loads
      }

      // ── 3. Fetch consults (appointments) ──
      try {
        const consultsRes = await api.get('/consults/');
        const consults = extractArray(consultsRes.data);
        const patientConsults = consults.filter(c => c.patient === currentPatient.p_id);
        setAppointments(patientConsults);
        if (patientConsults.length > 0) {
          setNextAppointment(patientConsults[0]);
        }
      } catch (err) {
        console.error('[PatientDashboard] /consults/ FAILED:', err.response?.status, err.response?.data);
      }

      // ── 4. Fetch test reports ──
      try {
        const reportsRes = await api.get(`/patient/${currentPatient.p_id}/reports/`);
        const reports = extractArray(reportsRes.data);
        setTestReports(reports);
      } catch (err) {
        console.error('[PatientDashboard] /patient/reports/ FAILED:', err.response?.status, err.response?.data);
      }

      // ── 5. Fetch bills ──
      try {
        const billsRes = await api.get('/bills/');
        const allBills = extractArray(billsRes.data);
        const patientBills = allBills.filter(b => b.patient === currentPatient.p_id);
        setBills(patientBills);
      } catch (err) {
        console.error('[PatientDashboard] /bills/ FAILED:', err.response?.status, err.response?.data);
      }

    } catch (err) {
      console.error("[PatientDashboard] Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !patient) return;
    
    setBookingLoading(true);
    try {
      await api.post('/consults/create/', {
        patient_id: patient.p_id,
        doctor_id: parseInt(selectedDoctor),
      });
      setShowBookModal(false);
      setSelectedDoctor('');
      fetchPatientData();
    } catch (err) {
      console.error("Failed to book appointment", err.response?.data || err.message);
      setError(`Failed to book appointment: ${err.response?.data?.error || err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePayBill = (billId) => {
    // Simulate payment logic
    setPaidBills(prev => new Set([...prev, billId]));
    showToast("Payment successful! Bill marked as Paid.");
  };

  if (loading) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-md text-label-md">Loading Patient Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col md:flex-row relative">
      
      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container p-xl rounded-xl border border-outline-variant w-full max-w-md shadow-2xl">
            <h3 className="font-headline-md text-headline-md mb-md text-on-surface">Book Appointment</h3>
            <form onSubmit={handleBookAppointment} className="flex flex-col gap-md">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Select Doctor</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.employee_details ? `Dr. ${doc.employee_details.name}` : `Dr. ID: ${doc.doctor_id}`} ({doc.dept})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-sm mt-sm">
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  className="px-md py-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-highest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="px-md py-sm bg-primary text-on-primary rounded-lg hover:opacity-90"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-low dark:bg-surface-container-low border-r border-outline-variant py-lg gap-md shrink-0 fixed left-0 top-0">
        <div className="px-lg pb-md mb-md border-b border-outline-variant flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-3xl" >health_and_safety</span>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Vitalis HMS</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Patient Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-md flex flex-col gap-xs">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all cursor-pointer ${activeTab === 'appointments' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">event_available</span>
            <span className="font-label-md text-label-md">Appointments</span>
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all cursor-pointer ${activeTab === 'billing' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="font-label-md text-label-md">Billing</span>
          </button>
        </nav>

        <div className="px-md mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md">
          <button onClick={logout} className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-all cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>

          <div className="mt-md px-md py-sm flex items-center gap-md bg-surface-container rounded-lg border border-outline-variant">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {patient?.name?.charAt(0) || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="font-label-md text-label-md text-on-surface truncate">{patient?.name || 'Patient'}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">ID: P-{patient?.p_id || '—'}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden flex justify-between items-center w-full px-lg py-md bg-surface-container border-b border-outline-variant sticky top-0 z-50">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" >health_and_safety</span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Vitalis HMS</h1>
          </div>
        </header>

        <div className="p-lg md:p-margin-desktop max-w-max-width mx-auto w-full flex flex-col gap-xl">
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl font-body-md flex items-start gap-sm">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <div>
                <p>{error}</p>
                <button 
                  onClick={() => { setError(''); fetchPatientData(); }}
                  className="mt-2 text-sm underline hover:opacity-80"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
                <div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface">Welcome back, {patient?.name?.split(' ')[0] || 'Patient'}.</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Here is your health overview for today.</p>
                </div>
                <button 
                  onClick={() => setShowBookModal(true)}
                  className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-full flex items-center gap-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined" >add_circle</span>
                  Book Appointment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
                {/* Next Appointment Card */}
                <div className="md:col-span-8 bg-surface-container rounded-xl border border-outline-variant p-lg relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-lg">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-sm rounded-lg" >calendar_month</span>
                      <span className="font-label-md text-label-md text-primary">Next Appointment</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-lg items-start md:items-center">
                    {nextAppointment ? (
                      <>
                        <div className="flex-1">
                          <h3 className="font-headline-lg text-headline-lg text-on-surface">
                            {nextAppointment.doctor_name || `Doctor ID: ${nextAppointment.doctor}`}
                          </h3>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            Upcoming Consultation
                          </p>
                        </div>
                        <div className="bg-surface-container-highest border border-outline-variant rounded-lg p-md min-w-[200px]">
                          <div className="flex items-center gap-md mb-sm">
                            <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                            <span className="font-body-md text-body-md text-on-surface">{nextAppointment.consult_date}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="font-body-md text-on-surface-variant">No upcoming appointments.</p>
                    )}
                  </div>
                </div>

                {/* Active Medications (Static) */}
                <div className="md:col-span-4 bg-surface-container rounded-xl border border-outline-variant p-lg flex flex-col">
                  <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
                    <span className="material-symbols-outlined text-tertiary" >medication</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Medications</h3>
                  </div>
                  <ul className="flex flex-col gap-sm flex-1">
                    <li className="flex items-center justify-between p-sm hover:bg-surface-container-highest rounded-lg transition-colors border-l-2 border-primary">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">Lisinopril</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">10mg • Daily</p>
                      </div>
                    </li>
                  </ul>
                  <button className="mt-md w-full py-sm border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-highest transition-colors">Request Refill</button>
                </div>

                {/* Vitals and Labs */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <div className="bg-surface-container rounded-xl border border-outline-variant p-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-md">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-error" >favorite</span>
                        <h4 className="font-label-md text-label-md text-on-surface-variant">Heart Rate</h4>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                    </div>
                    <div className="flex items-end gap-sm mb-md">
                      <span className="font-headline-xl text-headline-xl text-on-surface">72</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">bpm</span>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl border border-outline-variant p-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-md">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-inverse-primary" >water_drop</span>
                        <h4 className="font-label-md text-label-md text-on-surface-variant">Blood Pressure</h4>
                      </div>
                    </div>
                    <div className="flex items-end gap-sm mb-md">
                      <span className="font-headline-xl text-headline-xl text-on-surface">118/76</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">mmHg</span>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl border border-outline-variant p-lg flex flex-col">
                    <div className="flex justify-between items-center mb-md">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-secondary" >science</span>
                        <h4 className="font-label-md text-label-md text-on-surface-variant">Recent Labs</h4>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-sm">
                      {testReports.length > 0 ? (
                        testReports.slice(0, 3).map((report, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="font-body-md text-body-md text-on-surface">{report.test_type}</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant truncate ml-2 max-w-[100px]" title={report.result}>{report.result}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-on-surface-variant text-sm text-center">No recent lab reports.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="flex flex-col gap-lg">
              <div className="flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-on-surface">My Appointments</h2>
                <button 
                  onClick={() => setShowBookModal(true)}
                  className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-full flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                  Book New
                </button>
              </div>
              <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Doctor</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Date</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {appointments.length > 0 ? (
                      appointments.map((app, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-highest transition-colors">
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">
                            {app.doctor_name || `Dr. ID: ${app.doctor}`}
                          </td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">{app.consult_date}</td>
                          <td className="px-lg py-md">
                            <span className="px-sm py-xs bg-success-container text-on-success-container rounded-full font-label-sm text-label-sm">Confirmed</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-lg py-xl text-center text-on-surface-variant font-body-md">No appointments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface">Billing History</h2>
              <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Bill ID</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Amount</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Date</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {bills.length > 0 ? (
                      bills.map((bill, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-highest transition-colors">
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">B-{bill.b_id}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">₹{bill.amount}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">{bill.generated_at ? new Date(bill.generated_at).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-lg py-md">
                            {paidBills.has(bill.b_id) ? (
                              <span className="px-sm py-xs bg-success-container text-on-success-container rounded-full font-label-sm text-label-sm">Paid</span>
                            ) : (
                              <div className="flex items-center gap-sm">
                                <span className="px-sm py-xs bg-error-container text-on-error-container rounded-full font-label-sm text-label-sm">Unpaid</span>
                                <button 
                                  onClick={() => handlePayBill(bill.b_id)}
                                  className="text-primary hover:underline font-label-sm text-label-sm"
                                >
                                  Pay Now
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-lg py-xl text-center text-on-surface-variant font-body-md">No billing history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-lg right-lg z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`flex items-center gap-md px-lg py-md rounded-xl shadow-2xl border ${
              toast.type === 'success' ? 'bg-success-container text-on-success-container border-success/20' : 'bg-error-container text-on-error-container border-error/20'
            }`}>
              <span className="material-symbols-outlined">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="font-label-md text-label-md">{toast.message}</p>
            </div>
          </div>
        )}
      </main>
    </div>

  );
};

export default PatientDashboard;

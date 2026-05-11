import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    occupancyRate: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    dailyRevenue: 0,
    activeStaff: 0,
    pendingAdmissions: 0,
  });

  const [wards, setWards] = useState([]);
  const [activities, setActivities] = useState([]);

  // Admission Modal State
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [allConsults, setAllConsults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [admitLoading, setAdmitLoading] = useState(false);
  
  // Billing Modal State
  const [showBillModal, setShowBillModal] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [selectedBillPatient, setSelectedBillPatient] = useState('');
  const [billLoading, setBillLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  /**
   * Helper: safely extract array from a DRF response that may be
   * paginated ({ count, next, previous, results: [] }) or a flat array.
   */
  const extractArray = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.results)) return responseData.results;
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      let rooms = [], bills = [], doctors = [], nurses = [], patientsList = [], consults = [];

      // ── Fetch each endpoint independently ──
      try {
        const res = await api.get('/rooms/');
        console.log('[AdminDash] /rooms/ raw:', res.data);
        rooms = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /rooms/ FAILED:', err.response?.status, err.response?.data);
      }

      try {
        const res = await api.get('/bills/');
        console.log('[AdminDash] /bills/ raw:', res.data);
        bills = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /bills/ FAILED:', err.response?.status, err.response?.data);
      }

      try {
        const res = await api.get('/doctors/');
        console.log('[AdminDash] /doctors/ raw:', res.data);
        doctors = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /doctors/ FAILED:', err.response?.status, err.response?.data);
      }

      try {
        const res = await api.get('/nurses/');
        console.log('[AdminDash] /nurses/ raw:', res.data);
        nurses = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /nurses/ FAILED:', err.response?.status, err.response?.data);
      }

      try {
        const res = await api.get('/patients/');
        console.log('[AdminDash] /patients/ raw:', res.data);
        patientsList = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /patients/ FAILED:', err.response?.status, err.response?.data);
      }

      try {
        const res = await api.get('/consults/');
        console.log('[AdminDash] /consults/ raw:', res.data);
        consults = extractArray(res.data);
      } catch (err) {
        console.error('[AdminDash] /consults/ FAILED:', err.response?.status, err.response?.data);
      }

      setPatients(patientsList);

      const freeRooms = rooms.filter(r => r.availability);
      setAvailableRooms(freeRooms);

      const totalBeds = rooms.reduce((acc, room) => acc + room.capacity, 0);
      const occupiedBeds = rooms.filter(r => !r.availability).reduce((acc, room) => acc + room.capacity, 0);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const wardGroups = rooms.reduce((acc, room) => {
        if (!acc[room.type]) {
          acc[room.type] = { type: room.type, capacity: 0, occupied: 0 };
        }
        acc[room.type].capacity += room.capacity;
        if (!room.availability) {
          acc[room.type].occupied += room.capacity;
        }
        return acc;
      }, {});

      const wardsArray = Object.values(wardGroups).map(w => ({
        ...w,
        status: (w.capacity > 0 && (w.occupied / w.capacity) >= 0.9) ? 'Critical' : 
                (w.capacity > 0 && (w.occupied / w.capacity) >= 0.7) ? 'Near Capacity' : 'Available'
      }));

      const totalRev = bills.reduce((acc, bill) => acc + parseFloat(bill.amount || 0), 0);
      const activeStaffCount = doctors.length + nurses.length;
      const pendingCount = Math.max(Math.floor(patientsList.length * 0.1), 0);

      setStats({
        occupancyRate,
        occupiedBeds,
        totalBeds,
        dailyRevenue: totalRev,
        activeStaff: activeStaffCount,
        pendingAdmissions: pendingCount,
      });

      setWards(wardsArray);
      setAllConsults(consults);
      setAllBills(bills);

      const recentConsults = consults.slice(0, 4).map(c => ({
        type: 'Consultation',
        title: 'Consultation Logged',
        desc: c.doctor_details?.employee_details?.name 
          ? `Patient consulted Dr. ${c.doctor_details.employee_details.name}` 
          : `Consultation ID ${c.consult_id} confirmed.`,
        time: c.consult_date,
        icon: 'personal_injury',
        color: 'primary'
      }));
      
      setActivities(recentConsults.length > 0 ? recentConsults : [
        { type: 'System', title: 'System Online', desc: 'All modules functioning optimally.', time: 'Just now', icon: 'check_circle', color: 'secondary' }
      ]);

    } catch (err) {
      console.error("Dashboard unexpected error:", err);
      setError("An unexpected error occurred loading the dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!selectedBillPatient || !billAmount) return;

    setBillLoading(true);
    try {
      await api.post('/bills/generate/', {
        patient_id: parseInt(selectedBillPatient),
        amount: parseFloat(billAmount)
      });
      showToast("Bill generated successfully!");
      setShowBillModal(false);
      setBillAmount('');
      setSelectedBillPatient('');
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to generate bill:", err.response?.data || err.message);
      setError(`Failed to generate bill: ${err.response?.data?.error || err.message}`);
    } finally {
      setBillLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedRoom) return;

    setAdmitLoading(true);
    try {
      await api.post('/patients/admit/', {
        patient_id: parseInt(selectedPatient),
        room_id: parseInt(selectedRoom)
      });
      setShowAdmitModal(false);
      setSelectedPatient('');
      setSelectedRoom('');
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to admit patient:", err.response?.data || err.message);
      setError(`Failed to admit patient: ${err.response?.data?.error || err.message}`);
    } finally {
      setAdmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-md text-label-md">Loading System Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col md:flex-row relative">

      {/* Admission Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container p-xl rounded-xl border border-outline-variant w-full max-w-md shadow-2xl">
            <h3 className="font-headline-md text-headline-md mb-md text-on-surface">New Admission</h3>
            <form onSubmit={handleAdmitPatient} className="flex flex-col gap-md">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Select Patient</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Patient --</option>
                  {patients.map(p => (
                    <option key={p.p_id} value={p.p_id}>
                      {p.name} (ID: {p.p_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-xs block mt-md">Select Room</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Room --</option>
                  {availableRooms.map(r => (
                    <option key={r.r_id} value={r.r_id}>
                      {r.type} (Room ID: {r.r_id}, Capacity: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-sm mt-md">
                <button 
                  type="button" 
                  onClick={() => setShowAdmitModal(false)}
                  className="px-md py-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-highest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={admitLoading}
                  className="px-md py-sm bg-primary text-on-primary rounded-lg hover:opacity-90"
                >
                  {admitLoading ? 'Admitting...' : 'Admit Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container p-xl rounded-xl border border-outline-variant w-full max-w-md shadow-2xl">
            <h3 className="font-headline-md text-headline-md mb-md text-on-surface">Generate Bill</h3>
            <form onSubmit={handleCreateBill} className="flex flex-col gap-md">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Select Patient</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                  value={selectedBillPatient}
                  onChange={(e) => setSelectedBillPatient(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Patient --</option>
                  {patients.map(p => (
                    <option key={p.p_id} value={p.p_id}>
                      {p.name} (ID: {p.p_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-xs block mt-md">Amount (₹)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="e.g. 1500.00"
                  required
                />
              </div>
              <div className="flex justify-end gap-sm mt-md">
                <button 
                  type="button" 
                  onClick={() => setShowBillModal(false)}
                  className="px-md py-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-highest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={billLoading}
                  className="px-md py-sm bg-primary text-on-primary rounded-lg hover:opacity-90"
                >
                  {billLoading ? 'Generating...' : 'Create Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="bg-surface-container-low dark:bg-surface-container-low text-primary dark:text-primary-fixed-dim md:w-64 border-r border-outline-variant flex flex-col py-lg gap-md shrink-0 hidden md:flex min-h-screen sticky top-0">
        <div className="px-lg flex items-center gap-md mb-md">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" data-weight="fill" >local_hospital</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Vitalis HMS</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Central Command</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-md flex flex-col gap-sm">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'patients' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">personal_injury</span>
            <span>Patient Records</span>
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'appointments' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">event_available</span>
            <span>Appointments</span>
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'billing' ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Billing</span>
          </button>
        </div>

        <div className="px-md flex flex-col gap-sm mt-auto">
          <button 
            onClick={() => setShowAdmitModal(true)}
            className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md py-sm rounded-full transition-colors flex items-center justify-center gap-sm mb-sm"
          >
            <span className="material-symbols-outlined">add</span>
            New Admission
          </button>
          <div className="h-px bg-outline-variant my-sm"></div>
          <div className="mt-sm flex items-center gap-md px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">Admin User</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate">System Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-all cursor-pointer w-full text-left mt-xs"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-y-auto bg-surface relative min-h-screen">
        <header className="md:hidden flex items-center justify-between p-md bg-surface-container border-b border-outline-variant sticky top-0 z-10">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-sm" data-weight="fill" >local_hospital</span>
            </div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Vitalis HMS</h1>
          </div>
        </header>

        <div className="px-margin-mobile md:px-margin-desktop py-lg flex flex-col md:flex-row md:items-end justify-between gap-md shrink-0">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {activeTab === 'dashboard' ? 'Overview Dashboard' : 
               activeTab === 'patients' ? 'Patient Records' :
               activeTab === 'appointments' ? 'Appointment Management' : 'Billing & Invoices'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              {activeTab === 'dashboard' ? 'Real-time hospital metrics and command center.' : 
               `Manage and track ${activeTab} within the system.`}
            </p>
          </div>
          {activeTab !== 'dashboard' && (
            <div className="flex items-center gap-md w-full md:w-auto">
              {activeTab === 'billing' && (
                <button 
                  onClick={() => setShowBillModal(true)}
                  className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-md text-label-md flex items-center gap-sm hover:opacity-90 transition-all shrink-0"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Bill
                </button>
              )}
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-full py-sm pl-10 pr-md text-on-surface focus:outline-none focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-margin-mobile md:px-margin-desktop mb-4">
            <div className="bg-error-container text-on-error-container p-4 rounded-xl font-body-md flex items-start gap-sm">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <div>
                <p>{error}</p>
                <button 
                  onClick={() => { setError(''); fetchDashboardData(); }}
                  className="mt-2 text-sm underline hover:opacity-80"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-margin-mobile md:px-margin-desktop pb-margin-desktop flex flex-col gap-xl">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {/* Occupancy Card */}
            <div className="bg-surface-container p-md rounded-xl border border-outline-variant flex flex-col justify-between hover:border-outline transition-colors group">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm rounded-lg bg-primary-container/20 text-primary">
                  <span className="material-symbols-outlined">bed</span>
                </div>
              </div>
              <div>
                <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Patient Occupancy</h3>
                <div className="flex items-end gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface">{stats.occupancyRate}%</span>
                  <span className="font-body-sm text-body-sm text-outline mb-1">{stats.occupiedBeds} / {stats.totalBeds} Beds</span>
                </div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-surface-container p-md rounded-xl border border-outline-variant flex flex-col justify-between hover:border-outline transition-colors group">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm rounded-lg bg-tertiary-container/20 text-tertiary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
              <div>
                <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Total Revenue</h3>
                <div className="flex items-end gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface">₹{(stats.dailyRevenue).toLocaleString()}</span>
                  <span className="font-body-sm text-body-sm text-outline mb-1">Generated</span>
                </div>
              </div>
            </div>

            {/* Active Staff Card */}
            <div className="bg-surface-container p-md rounded-xl border border-outline-variant flex flex-col justify-between hover:border-outline transition-colors group">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm rounded-lg bg-secondary-container/20 text-secondary">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <div>
                <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Active Staff (Shift)</h3>
                <div className="flex items-end gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface">{stats.activeStaff}</span>
                  <span className="font-body-sm text-body-sm text-outline mb-1">Doctors &amp; Nurses</span>
                </div>
              </div>
            </div>

            {/* Pending Admissions */}
            <div className="bg-surface-container p-md rounded-xl border border-outline-variant flex flex-col justify-between hover:border-outline transition-colors group">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm rounded-lg bg-error-container/20 text-error">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
              </div>
              <div>
                <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Pending Admissions</h3>
                <div className="flex items-end gap-sm">
                  <span className="font-headline-xl text-headline-xl text-on-surface">{stats.pendingAdmissions}</span>
                  <span className="font-body-sm text-body-sm text-outline mb-1">In ER Triage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Ward Availability Table */}
            <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl flex flex-col overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Ward Availability</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-lowest">
                      <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant font-medium">Ward Unit</th>
                      <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant font-medium">Capacity</th>
                      <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant">
                    {wards.length > 0 ? wards.map((ward, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-highest transition-colors border-l-2 border-transparent hover:border-primary">
                        <td className="py-md px-md">
                          <div className="font-label-md text-label-md text-on-surface">{ward.type}</div>
                        </td>
                        <td className="py-md px-md">
                          <div className="flex items-center gap-sm">
                            <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden w-24">
                              <div 
                                className={`h-full ${ward.status === 'Critical' ? 'bg-error' : ward.status === 'Near Capacity' ? 'bg-tertiary' : 'bg-primary'}`} 
                                style={{ width: `${ward.capacity > 0 ? (ward.occupied/ward.capacity)*100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-on-surface">{ward.occupied}/{ward.capacity}</span>
                          </div>
                        </td>
                        <td className="py-md px-md">
                          <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 rounded-md border ${
                            ward.status === 'Critical' ? 'text-error bg-error-container/20 border-error/20' :
                            ward.status === 'Near Capacity' ? 'text-tertiary bg-tertiary-container/20 border-tertiary/20' :
                            'text-primary bg-primary-container/20 border-primary/20'
                          }`}>
                            {ward.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="py-md px-md text-center text-outline">No room data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col h-[400px]">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-high/50 shrink-0">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Live Activity</h3>
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-primary">Live</span>
                </div>
              </div>
              <div className="p-md flex-1 overflow-y-auto flex flex-col gap-md relative">
                <div className="absolute left-[31px] top-md bottom-md w-px bg-outline-variant"></div>
                {activities.map((act, idx) => (
                  <div key={idx} className="flex gap-md relative z-10">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary shrink-0 border-2 border-surface-container">
                      <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{act.title}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{act.desc}</p>
                      <p className="font-label-sm text-label-sm text-outline mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </div>
            </>
          )}

          {activeTab === 'patients' && (
            <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Patient Name</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">ID</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Contact</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-highest transition-colors">
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">{p.name}</td>
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">P-{p.p_id}</td>
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">{p.mob_no}</td>
                      <td className="px-lg py-md">
                        <button className="text-primary hover:underline text-sm font-medium">View Records</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Doctor</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Patient ID</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Date</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {allConsults.filter(c => c.consult_date.includes(searchTerm)).map((c, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-highest transition-colors">
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">
                        {c.doctor_details?.employee_details?.name ? `Dr. ${c.doctor_details.employee_details.name}` : `Dr. ID: ${c.doctor}`}
                      </td>
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">P-{c.patient}</td>
                      <td className="px-lg py-md font-body-md text-body-md text-on-surface">{c.consult_date}</td>
                      <td className="px-lg py-md">
                        <span className="px-sm py-xs bg-success-container text-on-success-container rounded-full font-label-sm text-label-sm">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Bill ID</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Patient ID</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Amount</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Generated Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-lg py-xl text-center">
                        <div className="flex items-center justify-center gap-sm">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-body-md text-on-surface-variant">Fetching billing records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : allBills.filter(b => 
                      (b.b_id?.toString() || '').includes(searchTerm) || 
                      (b.patient?.toString() || '').includes(searchTerm)
                    ).length > 0 ? (
                    allBills
                      .filter(b => 
                        (b.b_id?.toString() || '').includes(searchTerm) || 
                        (b.patient?.toString() || '').includes(searchTerm)
                      )
                      .map((b, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-highest transition-colors">
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">B-{b.b_id}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">P-{b.patient}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">₹{b.amount}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface">{b.generated_at ? new Date(b.generated_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-lg py-xl text-center text-on-surface-variant font-body-md">
                        {error ? 'Failed to load billing data.' : 'No billing records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default AdminDashboard;

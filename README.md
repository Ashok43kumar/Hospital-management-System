# Vitalis - Hospital Management System

A robust, full-stack Hospital Management System (HMS) designed for efficient patient care, appointment management, and streamlined hospital operations. Built with a modern tech stack focusing on security, scalability, and high performance.

## 🚀 Features

- **Secure Authentication**: Integrated with Supabase Auth (JWT) for secure user login and role-based access.
- **Dynamic Patient Portal**: Dashboard for patients to view medical records, lab reports, and billing history.
- **Appointment Management**: Real-time booking system for consultations with doctor availability tracking.
- **Admin Command Center**: Live hospital metrics including bed occupancy, daily revenue, and active staff monitoring.
- **Relational Database Management**: Structured MySQL schema handling patients, doctors, employees, rooms, and billing.
- **Billing System**: Automated invoice generation and tracking for patient services.
- **Responsive UI**: Modern, glassmorphic design built with React and Tailwind CSS.

## 🛠 Tech Stack

### Frontend
- **React**: Component-based UI development.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Utility-first CSS framework for modern styling.
- **Axios**: Promise-based HTTP client for API communication.

### Backend
- **Django**: High-level Python web framework.
- **Django REST Framework (DRF)**: Toolkit for building powerful Web APIs.

### Database
- **MySQL**: Relational database for structured data management.

### Authentication
- **Supabase Auth**: JWT-based authentication and secure user management.

## 📁 Project Structure

```text
hospital-management-system/
├── frontend/             # React (Vite) application
├── hospital/             # Django application (core logic)
├── hospital_management/  # Django project configuration
├── authentication/       # Auth utilities and Supabase integration
├── venv/                 # Python virtual environment
└── manage.py            # Django management script
```

## 🔌 API Endpoints (DRF)

The system exposes a comprehensive REST API:

- `GET /api/patients/` - List/Search patients.
- `GET /api/doctors/` - List available doctors and departments.
- `POST /api/consults/create/` - Book a new consultation.
- `GET /api/bills/` - View billing and payment records.
- `GET /api/rooms/` - Monitor room and bed availability.

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.x
- Node.js & npm
- MySQL Server

### 1. Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure MySQL database in your settings or `.env` file.
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (`.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
DB_NAME=hospital_db
DB_USER=root
DB_PASSWORD=your_password
```

## 🖥️ Usage
- **Backend**: Runs on [http://localhost:8000](http://localhost:8000)
- **Frontend**: Runs on [http://localhost:5173](http://localhost:5173)

## 🗄️ Database Schema
The project uses a normalized relational schema in MySQL to ensure data integrity:
- **Patients**: Personal info and medical history.
- **Doctors/Employees**: Staffing and department data.
- **Rooms/Wards**: Infrastructure and bed management.
- **Consults/Bills**: Transactional records for care and payments.
- **Lab Reports**: Detailed diagnostic data.

## 📸 Screenshots
*(Add your project screenshots here to showcase the UI)*

## 🔮 Future Improvements
- **Advanced Analytics**: Interactive charts for hospital administrative trends.
- **Automated Notifications**: Email/SMS reminders for appointments.
- **Advanced Lab Integration**: Direct upload and parsing of diagnostic PDF reports.
- **Mobile Application**: Native mobile experience for patients.

---
Developed for DBMS Project Submission.

# AI Development Prompts

### Backend Generation Prompt
```text
Generate a scalable Django REST Framework backend for a Hospital Management System. 
Requirements:
- Database: MySQL with a relational schema.
- Models: Patient, Doctor, Employee (with role-based types), Room, Ward, Consultation (Appointments), Bill, and TestReport.
- Authentication: Integrate Supabase JWT authentication.
- API: Create standard REST ViewSets for all models with proper filtering capabilities.
```

### Frontend Integration & Improvement Prompt
```text
Enhance the existing React/Vite/Tailwind frontend for the Hospital Management System.
Tasks:
- Security: Implement a ProtectedRoute wrapper using AuthContext to secure dashboard access.
- Authentication: Refine the 'Logout' feature to clear Supabase sessions and redirect to login.
- Account Creation: Build a robust 'Create Account' flow that registers users with Supabase and creates a mapped patient record in MySQL via API.
- Dashboard expansion: Update the Patient Dashboard into a multi-tab interface (Overview, Appointments, Billing) and the Admin Dashboard into a sidebar-navigable system (Dashboard, Patients, Appointments, Billing).
- UX: Add loading states, success/error toast notifications, and search/filter functionality for tables.
```

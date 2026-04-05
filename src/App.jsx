import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DomainSelection from './pages/auth/DomainSelection';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfileSetup from './pages/auth/ProfileSetup';
import PortalLayout from './components/layout/PortalLayout';

import PatientDashboard from './pages/patient/Dashboard';
import PatientLiveConsultation from './pages/patient/LiveConsultation';
import PatientReportView from './pages/patient/ReportView';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorLiveConsultation from './pages/doctor/LiveConsultation';
import ReportReview from './pages/doctor/ReportReview';

import CustomerDashboard from './pages/customer/Dashboard';
import CustomerLiveSession from './pages/customer/LiveSession';

import ExecutiveDashboard from './pages/executive/Dashboard';
import ExecutiveLiveSession from './pages/executive/LiveSession';

import OutboundManager from './pages/outbound/Manager';

function AdminPlaceholder() {
  return <div className="p-8 text-center text-xl mt-12">Admin Portal (Coming Soon)</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DomainSelection />} />
        <Route path="/role/:domain" element={<RoleSelection />} />
        
        <Route path="/auth/:domain/:role/login" element={<Login />} />
        <Route path="/auth/:domain/:role/signup" element={<Register />} />
        <Route path="/setup/:domain/:role" element={<ProfileSetup />} />
        
        <Route path="/patient" element={<PortalLayout role="patient" />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="consultation/:id/live" element={<PatientLiveConsultation />} />
          <Route path="report/:id" element={<PatientReportView />} />
        </Route>

        <Route path="/doctor" element={<PortalLayout role="doctor" />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="consultation/:id/live" element={<DoctorLiveConsultation />} />
          <Route path="report/:id/review" element={<ReportReview />} />
          <Route path="outbound" element={<OutboundManager domain="medical" />} />
        </Route>
        
        <Route path="/admin" element={<PortalLayout role="admin" />}>
           <Route path="dashboard" element={<AdminPlaceholder />} />
        </Route>

        <Route path="/user" element={<PortalLayout role="user" />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="session/:id/live" element={<CustomerLiveSession />} />
        </Route>

        <Route path="/manager" element={<PortalLayout role="manager" />}>
          <Route path="dashboard" element={<ExecutiveDashboard />} />
          <Route path="session/:id/live" element={<ExecutiveLiveSession />} />
          <Route path="outbound" element={<OutboundManager domain="finance" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
export default App;
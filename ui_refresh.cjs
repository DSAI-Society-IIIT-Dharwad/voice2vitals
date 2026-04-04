const fs = require('fs');
const path = require('path');

const files = {
  // Enhanced CSS for Top-Tier UI
  'src/index.css': `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Premium Palette */
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --primary-light: #EEF2FF;
  --secondary: #10B981;
  --secondary-hover: #059669;
  --secondary-light: #D1FAE5;
  --danger: #EF4444;
  --danger-light: #FEE2E2;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  
  --background: #F9FAFB;
  --card-bg: #FFFFFF;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border: #E5E7EB;
  
  --sidebar-w: 280px;
  --topbar-h: 70px;

  /* Premium Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  --shadow-glow: 0 0 20px rgba(79, 70, 229, 0.15);
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background);
  color: var(--text-main);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--primary); text-decoration: none; font-weight: 500; transition: color 0.2s;}
a:hover { color: var(--primary-hover); }

button {
  font-family: inherit; cursor: pointer; border: none; background: none; transition: all 0.2s;
}

input, select, textarea {
  font-family: inherit; font-size: 0.95rem;
}

/* Base UI Styles */
.app-container { display: flex; height: 100vh; overflow: hidden; }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--background); }
.page-content { flex: 1; padding: 2.5rem; overflow-y: auto; }

/* Utilities */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; } .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
.w-full { width: 100%; } .h-full { height: 100%; }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; } .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; font-weight: 600;} .text-2xl { font-size: 1.75rem; font-weight: 700; tracking: -0.02em; }
.font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.text-muted { color: var(--text-muted); }
.text-primary { color: var(--primary); }

/* Components */
.card {
  background: var(--card-bg);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  transition: all 0.3s ease;
}
.card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }

/* Buttons */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}
.btn-outline {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-main);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-outline:hover { background: var(--background); border-color: var(--text-muted); }

/* Inputs */
.auth-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  outline: none;
  transition: all 0.2s;
  background: var(--background);
}
.auth-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: white;
}
.input-label { margin-bottom: 0.5rem; display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-main); text-align: left; }

/* Animations */
@keyframes fadeInSlide { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeInSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `,

  // Core App Router
  'src/App.jsx': `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
export default App;`,

  // Layout updates for name change
  'src/components/layout/PortalLayout.jsx': `import { Outlet, useNavigate, Link } from 'react-router-dom';
import { User, Home, Phone, FileText, Settings, LogOut, PhoneOutgoing } from 'lucide-react';
import './Layout.css';

export default function PortalLayout({ role }) {
  const navigate = useNavigate();
  
  const getNavItems = () => {
    switch(role) {
      case 'patient': return [{label: 'Dashboard', icon: Home, path: '/patient/dashboard'}, {label: 'My Reports', icon: FileText, path: '/patient/dashboard'}, {label: 'Profile', icon: User, path: '/patient/dashboard'}];
      case 'doctor': return [{label: 'Dashboard', icon: Home, path: '/doctor/dashboard'}, {label: 'Outbound Calls', icon: PhoneOutgoing, path: '/doctor/outbound'}, {label: 'Settings', icon: Settings, path: '/doctor/dashboard'}];
      case 'user': return [{label: 'Dashboard', icon: Home, path: '/user/dashboard'}];
      case 'manager': return [{label: 'Dashboard', icon: Home, path: '/manager/dashboard'}, {label: 'Outbound calls', icon: PhoneOutgoing, path: '/manager/outbound'}];
      case 'admin': return [{label: 'Dashboard', icon: Home, path: '/admin/dashboard'}];
      default: return [];
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo cursor-pointer" onClick={() => navigate('/')}>
             Voice2<span style={{color: 'var(--secondary)'}}>Vitals</span>
          </div>
          <span className="role-badge">{role}</span>
        </div>
        <nav className="sidebar-nav">
          {getNavItems().map((item, i) => {
            const Icon = item.icon;
            return (
              <Link to={item.path} key={i} className="nav-item">
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={() => navigate('/')}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="welcome-text">Welcome back</div>
          <div className="user-icon"><User size={20}/></div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}`,

  'src/components/layout/Layout.css': `.sidebar {
  width: var(--sidebar-w);
  background: var(--card-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--border);
}
.logo {
  font-weight: 800;
  font-size: 1.4rem;
  color: var(--text-main);
  letter-spacing: -0.02em;
}
.role-badge {
  font-size: 0.7rem;
  background: var(--primary-light);
  color: var(--primary);
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  text-transform: capitalize;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.sidebar-nav {
  padding: 1.5rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-item:hover, .nav-item.active {
  background: var(--background);
  color: var(--primary);
  text-decoration: none;
}
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
}
.logout-btn {
  width: 100%;
  color: var(--danger);
}
.logout-btn:hover {
  background: var(--danger-light);
  color: var(--danger);
}
.topbar {
  height: var(--topbar-h);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.welcome-text {
  font-weight: 500;
  color: var(--text-muted);
}
.user-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}`,

  // Auth Styles
  'src/pages/auth/Auth.css': `.auth-layout {
  min-height: 100vh;
  display: flex;
  background: #F9FAFB;
}
.auth-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.auth-right {
  flex: 1;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: white;
}
.auth-card {
  width: 100%;
  max-width: 440px;
  background: white;
  padding: 3rem;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}
.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-main);
  letter-spacing: -0.02em;
}
.auth-subtitle {
  color: var(--text-muted);
  margin-bottom: 2rem;
}
.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}
.selection-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}
.selection-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-2px);
}
.selection-btn .icon {
  color: var(--primary);
}
.selection-btn .title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-main);
}
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 1.5rem 0;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}
.divider:not(:empty)::before { margin-right: .5em; }
.divider:not(:empty)::after { margin-left: .5em; }`,

  // 1. Domain Selection -> Auth Flow
  'src/pages/auth/DomainSelection.jsx': `import { useNavigate } from 'react-router-dom';
import { Activity, Briefcase } from 'lucide-react';
import './Auth.css';

export default function DomainSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="text-center max-w-lg">
          <div className="logo mb-8" style={{fontSize: '2.5rem'}}>Voice2<span style={{color: 'var(--secondary)'}}>Vitals</span></div>
          <h1 className="text-2xl font-bold mb-4">Choose Your Domain</h1>
          <p className="text-muted">Select the industry to streamline your conversational intelligence.</p>
          
          <div className="selection-grid">
            <button className="selection-btn" onClick={() => navigate('/role/medical')}>
              <Activity size={36} className="icon"/>
              <span className="title">Medical</span>
            </button>
            <button className="selection-btn" onClick={() => navigate('/role/finance')}>
              <Briefcase size={36} className="icon"/>
              <span className="title">Finance</span>
            </button>
          </div>
        </div>
      </div>
      <div className="auth-right hidden md:flex">
         <h2 className="text-4xl font-bold mb-6 text-center leading-tight">Transform conversations <br/>into structured data.</h2>
         <p className="text-lg opacity-90 text-center max-w-md">Instantly transcribe, extract, and analyze voice interactions in real-time.</p>
      </div>
    </div>
  )
}`,

  // 2. Role Selection
  'src/pages/auth/RoleSelection.jsx': `import { useNavigate, useParams } from 'react-router-dom';
import { User, Activity, Shield, Briefcase, PhoneCall } from 'lucide-react';
import './Auth.css';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { domain } = useParams();
  
  const roles = domain === 'medical' 
    ? [
        { id: 'doctor', title: 'Doctor', icon: Activity },
        { id: 'patient', title: 'Patient', icon: User },
        { id: 'admin', title: 'Admin', icon: Shield }
      ]
    : [
        { id: 'manager', title: 'The Manager', icon: Briefcase },
        { id: 'user', title: 'The User', icon: User }
      ];

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="text-center max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4" style={{textTransform: 'capitalize'}}>{domain} Portal</h1>
          <p className="text-muted">Select your user persona to proceed.</p>
          
          <div className="selection-grid" style={{gridTemplateColumns: roles.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'}}>
            {roles.map(r => {
              const Icon = r.icon;
              return (
                <button key={r.id} className="selection-btn" onClick={() => navigate(\`/auth/\${domain}/\${r.id}/login\`)}>
                  <Icon size={32} className="icon" />
                  <span className="title">{r.title}</span>
                </button>
              )
            })}
          </div>
          <button className="mt-8 text-primary font-semibold" onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>
    </div>
  )
}`,

  // 3. Login Page
  'src/pages/auth/Login.jsx': `import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate(\`/\${role}/dashboard\`);
  };

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="auth-card">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back to the Voice2Vitals {domain} portal as {role}.</p>
          
          <form className="flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Enter your password" required />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">First time user? </span>
              <Link to={\`/auth/\${domain}/\${role}/signup\`} className="text-primary font-semibold">Sign up</Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2 text-lg">Sign In</button>
          </form>

          <div className="divider">other options</div>
          
          <button className="btn-outline w-full py-3 gap-3">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
             Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}`,

  // 4. Registration Page
  'src/pages/auth/Register.jsx': `import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate(\`/setup/\${domain}/\${role}\`);
  };

  return (
    <div className="auth-layout">
      <div className="auth-left animate-fade-in">
        <div className="auth-card">
          <h2 className="auth-title">First time signup.</h2>
          <p className="auth-subtitle">Create your {role} account.</p>
          
          <form className="flex-col gap-4" onSubmit={handleRegister}>
            <div>
              <label className="input-label">Email id</label>
              <input type="email" className="auth-input" placeholder="Enter your email" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="auth-input" placeholder="Create a strong password" required />
            </div>
            
            <div className="text-sm mt-2 mb-2">
              <span className="text-muted">Already user? </span>
              <Link to={\`/auth/\${domain}/\${role}/login\`} className="text-primary font-semibold">Sign in</Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2 text-lg">Continue</button>
          </form>

          <div className="divider">other options</div>
          
          <button className="btn-outline w-full py-3 gap-3">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
             Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}`,

  // 5. Setup Profile (Collect req info)
  'src/pages/auth/ProfileSetup.jsx': `import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function ProfileSetup() {
  const { domain, role } = useParams();
  const navigate = useNavigate();

  const titleText = domain === 'medical' ? \`Collect req info for \${role}\` : \`Collect basic info for \${role}\`;

  const handleComplete = (e) => {
    e.preventDefault();
    navigate(\`/\${role}/dashboard\`);
  };

  return (
    <div className="auth-layout flex-col items-center justify-center p-4">
      <div className="auth-card w-full max-w-lg mx-auto animate-fade-in">
        <h2 className="auth-title">{titleText}</h2>
        <p className="auth-subtitle mb-6">Let's finish setting up your account before reaching the dashboard.</p>
        
        <form className="flex-col gap-4" onSubmit={handleComplete}>
          <div>
             <label className="input-label">Full Name</label>
             <input type="text" className="auth-input" required />
          </div>
          <div>
             <label className="input-label">Phone Number</label>
             <input type="tel" className="auth-input" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">Go to Dashboard</button>
        </form>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(__dirname, file), content);
});

console.log('UI and App flow supercharged successfully.');

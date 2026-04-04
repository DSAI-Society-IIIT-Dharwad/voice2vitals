import { Outlet, useNavigate, Link } from 'react-router-dom';
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
}
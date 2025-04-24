import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout: React.FC = () => {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem('user_data');
    nav('/');
  };

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <button onClick={() => nav('/dashboard')} className="sidebar-button">
          📒 Journal
        </button>
        <button onClick={() => nav('/calendar')} className="sidebar-button">
          📅 Calendar
        </button>
        <button onClick={() => nav('/view-entries')} className="sidebar-button">
          🔍 View Entries
        </button>
        <button onClick={logout} className="sidebar-button logout-button">
          🔒 Logout
        </button>
      </aside>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

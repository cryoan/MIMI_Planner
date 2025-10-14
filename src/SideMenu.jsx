import React from 'react';
import './SideMenu.css';

const SideMenu = ({ isOpen, setIsOpen, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'agenda', label: 'Final Agenda', icon: '📅' },
    { id: 'settings', label: 'Schedule Settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="side-menu-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hamburger button when menu is closed */}
      {!isOpen && (
        <button
          className="hamburger-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {/* Side Menu */}
      <div className={`side-menu ${isOpen ? 'open' : 'closed'}`}>
        {/* Toggle Button (Close when open) */}
        {isOpen && (
          <button
            className="menu-toggle"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}

        {/* Menu Header */}
        {isOpen && (
          <div className="menu-header">
            <h2>MIMI Planning</h2>
          </div>
        )}

        {/* Menu Items */}
        <nav className="menu-items">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                // Close menu on mobile after selection
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              title={!isOpen ? item.label : ''}
            >
              <span className="menu-icon">{item.icon}</span>
              {isOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SideMenu;

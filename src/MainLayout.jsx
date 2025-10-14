import React, { useState } from 'react';
import SideMenu from './SideMenu';
import FinalAgenda from './FinalAgenda';
import DoctorSettings from './DoctorSettings';
import { rotation_cycles } from './customPlanningLogic.js';
import './MainLayout.css';

const MainLayout = ({ selectedRotationCycle, setSelectedRotationCycle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('agenda');

  return (
    <div className="main-layout">
      {/* Side Menu */}
      <SideMenu
        isOpen={menuOpen}
        setIsOpen={setMenuOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area */}
      <div className={`main-content ${menuOpen ? 'menu-open' : 'menu-closed'}`}>
        {activeSection === 'agenda' && (
          <FinalAgenda
            selectedRotationCycle={selectedRotationCycle}
            setSelectedRotationCycle={setSelectedRotationCycle}
          />
        )}

        {activeSection === 'settings' && (
          <DoctorSettings
            selectedRotationCycle={selectedRotationCycle}
            setSelectedRotationCycle={setSelectedRotationCycle}
          />
        )}
      </div>
    </div>
  );
};

export default MainLayout;

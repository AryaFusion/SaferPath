import React from 'react';
import { useSafety } from '../context/SafetyContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PlanPage from './PlanPage';
import RouteDetailPage from './RouteDetailPage';
import HelpNearbyPage from './HelpNearbyPage';
import ReportPage from './ReportPage';
import ActiveTripPage from './ActiveTripPage';
import ContactsPage from './ContactsPage';
import PrivacyPage from './PrivacyPage';
import SettingsPage from './SettingsPage';
import EmergencyPage from './EmergencyPage';

export const MainDashboard: React.FC = () => {
  const { currentPage } = useSafety();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16">
        {currentPage === 'plan' && <PlanPage />}
        {currentPage === 'route-detail' && <RouteDetailPage />}
        {currentPage === 'help' && <HelpNearbyPage />}
        {currentPage === 'report' && <ReportPage />}
        {currentPage === 'trip' && <ActiveTripPage />}
        {currentPage === 'contacts' && <ContactsPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'emergency' && <EmergencyPage />}
      </main>

      <Footer />
    </div>
  );
};

export default MainDashboard;

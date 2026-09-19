import React, { useState } from "react";
import { useSafety } from "../context/SafetyContext";
import Sidebar from "../components/common/Sidebar";
import AppHeader from "../components/common/AppHeader";
import MobileNav from "../components/common/MobileNav";
import EmergencySheet from "../components/common/EmergencySheet";

import RouteWorkspace from "../features/routes/RouteWorkspace";
import EvidenceTimeline from "../features/routes/EvidenceTimeline";
import HelpPointsView from "../features/help-points/HelpPointsView";
import ReportStepper from "../features/reports/ReportStepper";
import TripStatus from "../features/trips/TripStatus";
import ContactsView from "../features/auth/ContactsView";
import PrivacyCenter from "../features/privacy/PrivacyCenter";
import SettingsView from "../features/operations/SettingsView";
import EmergencyView from "../features/operations/EmergencyView";
import LandingView from "../features/landing/LandingView";
import WelcomeFlow from "../features/welcome/WelcomeFlow";

export const AppShell: React.FC = () => {
  const { tab, setTab } = useSafety();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#172033] flex font-sans selection:bg-[#2563EB] selection:text-white pb-16 md:pb-0">
      {/* Left Sidebar Navigation (Desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header for quick links */}
        <AppHeader onOpenEmergency={() => setEmergencyOpen(true)} />

        {/* Workspace Views */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-5 pb-16">
          {tab === "/landing" && <LandingView />}
          {tab === "/welcome" && <WelcomeFlow />}
          {(tab === "/route" || tab === "planner") && <RouteWorkspace />}
          {(tab === "/evidence" || tab === "route-evidence") && (
            <EvidenceTimeline />
          )}
          {(tab === "/help" || tab === "help-points") && <HelpPointsView />}
          {(tab === "/reports" || tab === "report-context") && (
            <ReportStepper />
          )}
          {(tab === "/trip" || tab === "active-trip") && (
            <TripStatus onOpenEmergency={() => setEmergencyOpen(true)} />
          )}
          {(tab === "/saved-places" || tab === "contacts") && <ContactsView />}
          {tab === "/privacy" && <PrivacyCenter />}
          {tab === "/settings" && <SettingsView />}
          {tab === "/emergency" && <EmergencyView />}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#DCE3EE] bg-white py-6 px-6 text-xs text-[#64748B]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <span className="font-bold text-[#172033] text-sm block">
                SaferPath
              </span>
              <span className="text-[11px] text-[#64748B]">
                A safer journey is a more open world.
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
              <button
                onClick={() => setTab("/privacy")}
                className="hover:text-[#2563EB] cursor-pointer transition-colors"
              >
                Privacy
              </button>
              <span>•</span>
              <button
                onClick={() => setTab("/saved-places")}
                className="hover:text-[#2563EB] cursor-pointer transition-colors"
              >
                Saved Places
              </button>
              <span>•</span>
              <button
                onClick={() => setTab("/help")}
                className="hover:text-[#2563EB] cursor-pointer transition-colors"
              >
                Help Nearby
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Emergency Action Sheet Modal */}
      <EmergencySheet
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />
    </div>
  );
};

export default AppShell;

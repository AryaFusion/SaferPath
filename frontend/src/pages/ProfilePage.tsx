import { useState } from "react";
import { usePreferences } from "../context/PreferencesContext";
import {
  User, Shield, Bell, Lock, Accessibility, LifeBuoy,
  LogOut, ChevronRight, X, Phone, Globe, Moon, Eye, Trash2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/app/AppNavbar";

// Reusable Section Item
function SettingItem({ icon: Icon, title, subtitle, onClick, value, danger }: any) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between py-3 transition-opacity hover:opacity-70 focus:outline-none"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${danger ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className={`text-[15px] font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>{title}</p>
          {subtitle && <p className="text-[13px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[13px] font-medium text-slate-500">{value}</span>}
        {!danger && <ChevronRight className="h-4 w-4 text-slate-300" />}
      </div>
    </button>
  );
}

// Reusable Toggle Item
function ToggleItem({ icon: Icon, title, subtitle, checked, onChange }: any) {
  return (
    <div className="flex w-full items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-[15px] font-medium text-slate-900">{title}</p>
          {subtitle && <p className="text-[13px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          checked ? "bg-emerald-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// Reusable Modal wrapper
function Modal({ isOpen, onClose, title, children }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-4 bottom-4 z-[90] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ProfilePage() {
  const { currentUser, updateUser, logout } = useAuth();
  const {
    preferences,
    updateNotifications,
    updatePrivacy,
    updateAccessibility,
    updateLanguage,
    updateTrustedContact,
    clearLocalData
  } = usePreferences();

  const navigate = useNavigate();

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Forms local state
  const [editProfileData, setEditProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    home: currentUser?.home || "",
    work: currentUser?.work || "",
    college: currentUser?.college || "",
  });
  const [trustedContactForm, setTrustedContactForm] = useState(preferences.trustedContact || { name: "", phone: "", relationship: "" });
  
  // Handlers
  const handleSaveProfile = () => {
    updateUser(editProfileData);
    setActiveModal(null);
  };

  const handleSaveContact = () => {
    updateTrustedContact(trustedContactForm);
    setActiveModal(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <AppNavbar />
      
      <main className="flex-1 pb-24 pt-16 md:pb-12 md:pt-20">
        <div className="mx-auto max-w-2xl px-4 py-6">
          
          <header className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account, preferences, privacy, and accessibility.</p>
          </header>

          {/* Profile Summary Card */}
          <div className="mb-8 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                {currentUser?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentUser?.name || "User"}</h2>
                <p className="text-sm text-slate-500">{currentUser?.email || "No email provided"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditProfileData({
                  name: currentUser?.name || "",
                  email: currentUser?.email || "",
                  phone: currentUser?.phone || "",
                  home: currentUser?.home || "",
                  work: currentUser?.work || "",
                  college: currentUser?.college || "",
                });
                setActiveModal("personal-details");
              }}
              className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Edit
            </button>
          </div>

          <div className="space-y-6">
            {/* ACCOUNT SETTINGS */}
            <section className="rounded-2xl bg-white px-5 py-2 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-1 mt-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Account Settings</h3>
              <div className="divide-y divide-slate-100">
                <SettingItem
                  icon={Lock}
                  title="Change Password"
                  onClick={() => setActiveModal("password")}
                />
                <SettingItem
                  icon={Bell}
                  title="Notifications"
                  value="Enabled"
                  onClick={() => setActiveModal("notifications")}
                />
                <SettingItem
                  icon={Globe}
                  title="Language"
                  value={preferences.language}
                  onClick={() => setActiveModal("language")}
                />
              </div>
            </section>

            {/* PRIVACY */}
            <section className="rounded-2xl bg-white px-5 py-2 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-1 mt-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Privacy</h3>
              <div className="divide-y divide-slate-100">
                <SettingItem
                  icon={Shield}
                  title="Privacy Controls"
                  subtitle="Manage location and sharing"
                  onClick={() => setActiveModal("privacy")}
                />
                <SettingItem
                  icon={Trash2}
                  title="Clear Local Data"
                  danger
                  onClick={() => setActiveModal("clear-data")}
                />
              </div>
            </section>

            {/* ACCESSIBILITY */}
            <section className="rounded-2xl bg-white px-5 py-2 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-1 mt-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Accessibility</h3>
              <div className="divide-y divide-slate-100">
                <SettingItem
                  icon={Accessibility}
                  title="Accessibility Options"
                  subtitle="Text size, motion, and contrast"
                  onClick={() => setActiveModal("accessibility")}
                />
              </div>
            </section>

            {/* SAFETY & SUPPORT */}
            <section className="rounded-2xl bg-white px-5 py-2 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-1 mt-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Safety & Support</h3>
              <div className="divide-y divide-slate-100">
                <SettingItem
                  icon={Phone}
                  title="Emergency Information"
                  onClick={() => setActiveModal("emergency")}
                />
                <SettingItem
                  icon={User}
                  title="Trusted Contacts"
                  subtitle={preferences.trustedContact ? preferences.trustedContact.name : "None configured"}
                  onClick={() => setActiveModal("trusted-contact")}
                />
                <SettingItem
                  icon={LifeBuoy}
                  title="Help & Support"
                  onClick={() => setActiveModal("help")}
                />
              </div>
            </section>

            {/* ABOUT & LOGOUT */}
            <section className="rounded-2xl bg-white px-5 py-2 shadow-sm ring-1 ring-slate-100">
              <div className="divide-y divide-slate-100">
                <SettingItem
                  icon={Info}
                  title="About SaferPath"
                  onClick={() => setActiveModal("about")}
                />
                <SettingItem
                  icon={LogOut}
                  title="Log Out"
                  danger
                  onClick={() => setActiveModal("logout")}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODALS */}
      
      {/* 1. Personal Details */}
      <Modal isOpen={activeModal === "personal-details"} onClose={() => setActiveModal(null)} title="Personal Details">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={editProfileData.name}
              onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={editProfileData.email}
              onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={editProfileData.phone}
              onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <hr className="my-2 border-slate-100" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personalize Your Experience</h4>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Home</label>
            <input
              type="text"
              value={editProfileData.home}
              onChange={(e) => setEditProfileData({...editProfileData, home: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Work</label>
            <input
              type="text"
              value={editProfileData.work}
              onChange={(e) => setEditProfileData({...editProfileData, work: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">College</label>
            <input
              type="text"
              value={editProfileData.college}
              onChange={(e) => setEditProfileData({...editProfileData, college: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Save Changes
          </button>
          <p className="text-center text-xs text-slate-400">Saved locally for this prototype.</p>
        </div>
      </Modal>

      {/* 2. Password */}
      <Modal isOpen={activeModal === "password"} onClose={() => setActiveModal(null)} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Update Password
          </button>
          <p className="text-center text-xs text-slate-400">Mock interaction. Password not actually changed.</p>
        </div>
      </Modal>

      {/* 3. Notifications */}
      <Modal isOpen={activeModal === "notifications"} onClose={() => setActiveModal(null)} title="Notifications">
        <div className="space-y-1 divide-y divide-slate-100">
          <ToggleItem
            icon={Map} title="Journey updates" subtitle="Status of your active trips"
            checked={preferences.notifications.journeyUpdates}
            onChange={(c: boolean) => updateNotifications({ journeyUpdates: c })}
          />
          <ToggleItem
            icon={Shield} title="Route deviation alerts" subtitle="When you stray from safe paths"
            checked={preferences.notifications.routeDeviations}
            onChange={(c: boolean) => updateNotifications({ routeDeviations: c })}
          />
          <ToggleItem
            icon={Bell} title="Check-in reminders" subtitle="Reminders to mark yourself safe"
            checked={preferences.notifications.checkInReminders}
            onChange={(c: boolean) => updateNotifications({ checkInReminders: c })}
          />
          <ToggleItem
            icon={Globe} title="SaferPath service updates" subtitle="Product news and features"
            checked={preferences.notifications.serviceUpdates}
            onChange={(c: boolean) => updateNotifications({ serviceUpdates: c })}
          />
        </div>
      </Modal>

      {/* 4. Language */}
      <Modal isOpen={activeModal === "language"} onClose={() => setActiveModal(null)} title="Language">
        <div className="space-y-2">
          {["English", "Hindi", "Marathi"].map(lang => (
            <label key={lang} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 hover:bg-emerald-50">
              <span className="font-medium text-slate-900">{lang}</span>
              <input
                type="radio"
                name="language"
                value={lang}
                checked={preferences.language === lang}
                onChange={(e) => {
                  updateLanguage(e.target.value);
                  setTimeout(() => setActiveModal(null), 300);
                }}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </Modal>

      {/* 5. Privacy */}
      <Modal isOpen={activeModal === "privacy"} onClose={() => setActiveModal(null)} title="Privacy Controls">
        <div className="space-y-1 divide-y divide-slate-100">
          <ToggleItem
            icon={Globe} title="Location Sharing" subtitle="Share location during app use"
            checked={preferences.privacy.locationSharing}
            onChange={(c: boolean) => updatePrivacy({ locationSharing: c })}
          />
          <ToggleItem
            icon={Map} title="Journey Sharing" subtitle="Allow trusted contacts to track you"
            checked={preferences.privacy.journeySharing}
            onChange={(c: boolean) => updatePrivacy({ journeySharing: c })}
          />
          
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium text-slate-900">Report Privacy</label>
            <select
              value={preferences.privacy.reportPrivacy}
              onChange={(e) => updatePrivacy({ reportPrivacy: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Public route context</option>
              <option>Private (Admin only)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* 6. Clear Data */}
      <Modal isOpen={activeModal === "clear-data"} onClose={() => setActiveModal(null)} title="Clear Data">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <h4 className="mb-2 font-bold text-slate-900">Clear all local prototype data?</h4>
          <p className="mb-6 text-sm text-slate-500">
            This will remove all saved preferences, profile edits, and mock state from this device.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearLocalData();
                setActiveModal(null);
              }}
              className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
            >
              Clear Data
            </button>
          </div>
        </div>
      </Modal>

      {/* 7. Accessibility */}
      <Modal isOpen={activeModal === "accessibility"} onClose={() => setActiveModal(null)} title="Accessibility">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Text Size</label>
            <select
              value={preferences.accessibility.textSize}
              onChange={(e) => updateAccessibility({ textSize: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Default</option>
              <option>Large</option>
              <option>Larger</option>
            </select>
          </div>
          
          <div className="divide-y divide-slate-100">
            <ToggleItem
              icon={Eye} title="Reduced Motion" subtitle="Minimize UI animations"
              checked={preferences.accessibility.reducedMotion}
              onChange={(c: boolean) => updateAccessibility({ reducedMotion: c })}
            />
            <ToggleItem
              icon={Moon} title="High Contrast" subtitle="Increase contrast for readability"
              checked={preferences.accessibility.highContrast}
              onChange={(c: boolean) => updateAccessibility({ highContrast: c })}
            />
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <span className="font-semibold">Screen Reader Support:</span> SaferPath uses semantic HTML and standard ARIA labels, making it natively compatible with iOS VoiceOver and Android TalkBack.
          </div>
        </div>
      </Modal>

      {/* 8. Emergency Info */}
      <Modal isOpen={activeModal === "emergency"} onClose={() => setActiveModal(null)} title="Emergency Information">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Phone className="h-8 w-8" />
          </div>
          <h4 className="mb-1 text-2xl font-bold text-slate-900">112</h4>
          <p className="mb-6 font-medium text-red-600">National Emergency Number</p>
          <p className="mb-6 text-sm text-slate-600">
            SaferPath is a routing and safety context tool. We do not dispatch emergency services. 
            If you are in immediate danger, please contact local emergency responders directly.
          </p>
          <a
            href="tel:112"
            className="block w-full rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700"
          >
            Call 112 Now
          </a>
        </div>
      </Modal>

      {/* 9. Trusted Contact */}
      <Modal isOpen={activeModal === "trusted-contact"} onClose={() => setActiveModal(null)} title="Trusted Contact">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Add a trusted contact to share your journey status with during an active trip.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={trustedContactForm.name}
              onChange={(e) => setTrustedContactForm({...trustedContactForm, name: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={trustedContactForm.phone}
              onChange={(e) => setTrustedContactForm({...trustedContactForm, phone: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Relationship</label>
            <select
              value={trustedContactForm.relationship}
              onChange={(e) => setTrustedContactForm({...trustedContactForm, relationship: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select...</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Partner">Partner</option>
              <option value="Colleague">Colleague</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                updateTrustedContact(null);
                setTrustedContactForm({ name: "", phone: "", relationship: "" });
                setActiveModal(null);
              }}
              className="flex-1 rounded-xl bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100"
            >
              Remove
            </button>
            <button
              onClick={handleSaveContact}
              className="flex-[2] rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
            >
              Save Contact
            </button>
          </div>
        </div>
      </Modal>

      {/* 10. Help */}
      <Modal isOpen={activeModal === "help"} onClose={() => setActiveModal(null)} title="Help & Support">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="font-bold text-slate-900">How do I plan a safe route?</h4>
            <p className="mt-1 text-sm text-slate-600">Go to the Home page, enter your destination, and select the safest option from the suggested routes.</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="font-bold text-slate-900">How does check-in work?</h4>
            <p className="mt-1 text-sm text-slate-600">During an active trip, you will receive periodic prompts to check in. If you fail to do so, your trusted contact may be notified.</p>
          </div>
          <button className="mt-2 w-full rounded-xl bg-emerald-50 py-3 font-semibold text-emerald-700 hover:bg-emerald-100">
            Contact Support (Prototype)
          </button>
        </div>
      </Modal>

      {/* 11. About */}
      <Modal isOpen={activeModal === "about"} onClose={() => setActiveModal(null)} title="About SaferPath">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">SaferPath</h3>
          <p className="text-sm font-medium text-emerald-600">Prototype · v0.1</p>
          <p className="mx-auto mt-4 max-w-sm text-sm text-slate-600">
            SaferPath is designed to provide safety-conscious routing and situational awareness for pedestrians and commuters.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm text-emerald-600">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </Modal>

      {/* 12. Log out */}
      <Modal isOpen={activeModal === "logout"} onClose={() => setActiveModal(null)} title="Log Out">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LogOut className="h-6 w-6" />
          </div>
          <h4 className="mb-2 font-bold text-slate-900">Are you sure you want to log out?</h4>
          <p className="mb-6 text-sm text-slate-500">
            You will need to sign in again to access your preferences and trips.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

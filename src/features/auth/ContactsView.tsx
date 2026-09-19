import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import Button from '../../components/common/Button';
import type { SavedPlace, SavedPlaceType, TrustedContact } from '../../lib/types';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Home,
  Briefcase,
  GraduationCap,
  Bookmark,
  UserCheck,
  UserPlus,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Navigation,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    savedPlaces,
    addSavedPlace,
    editSavedPlace,
    deleteSavedPlace,
    setOriginFromSavedPlace,
    setDestinationFromSavedPlace,
    contacts,
    addContact,
    editContact,
    removeContact,
    activeTrip,
  } = useSafety();

  // Modal / Form States for Saved Places
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  const [placeName, setPlaceName] = useState('');
  const [placeLabel, setPlaceLabel] = useState<SavedPlaceType>('Home');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeFormError, setPlaceFormError] = useState<string | null>(null);

  // Modal / Form States for Trusted Contacts
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Family');
  const [contactFormError, setContactFormError] = useState<string | null>(null);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // SAVED PLACES HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenAddPlace = () => {
    setPlaceName('');
    setPlaceLabel('Home');
    setPlaceAddress('');
    setPlaceFormError(null);
    setShowAddPlaceModal(true);
  };

  const handleOpenEditPlace = (place: SavedPlace) => {
    setEditingPlace(place);
    setPlaceName(place.name);
    setPlaceLabel(place.label);
    setPlaceAddress(place.address);
    setPlaceFormError(null);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaceFormError(null);

    const trimmedName = placeName.trim();
    const trimmedAddress = placeAddress.trim();

    if (!trimmedName || !trimmedAddress) {
      setPlaceFormError('Please fill in both place name and address.');
      return;
    }

    const isDuplicate = savedPlaces.some(
      (p) =>
        p.id !== editingPlace?.id &&
        p.name.toLowerCase() === trimmedName.toLowerCase() &&
        p.address.toLowerCase() === trimmedAddress.toLowerCase()
    );

    if (isDuplicate) {
      setPlaceFormError('A saved place with this name and address already exists.');
      return;
    }

    if (editingPlace) {
      editSavedPlace(editingPlace.id, {
        name: trimmedName,
        label: placeLabel,
        address: trimmedAddress,
      });
      triggerToast(`Saved place "${trimmedName}" updated.`);
      setEditingPlace(null);
    } else {
      addSavedPlace({
        name: trimmedName,
        label: placeLabel,
        address: trimmedAddress,
      });
      triggerToast(`Saved place "${trimmedName}" created.`);
      setShowAddPlaceModal(false);
    }

    setPlaceName('');
    setPlaceAddress('');
  };

  const handleConfirmDeletePlace = () => {
    if (!deletingPlaceId) return;
    const target = savedPlaces.find((p) => p.id === deletingPlaceId);
    deleteSavedPlace(deletingPlaceId);
    triggerToast(`Saved place "${target?.name || 'Place'}" deleted.`);
    setDeletingPlaceId(null);
  };

  // ---------------------------------------------------------------------------
  // TRUSTED CONTACTS HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenAddContact = () => {
    setContactName('');
    setContactPhone('');
    setContactRelationship('Family');
    setContactFormError(null);
    setShowAddContactModal(true);
  };

  const handleOpenEditContact = (c: TrustedContact) => {
    setEditingContact(c);
    setContactName(c.name);
    setContactPhone(c.phone);
    setContactRelationship(c.relationship);
    setContactFormError(null);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormError(null);

    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();

    if (!trimmedName || !trimmedPhone) {
      setContactFormError('Please enter both contact name and phone number.');
      return;
    }

    if (editingContact) {
      editContact(editingContact.id, {
        name: trimmedName,
        phone: trimmedPhone,
        relationship: contactRelationship,
      });
      triggerToast(`Contact "${trimmedName}" updated.`);
      setEditingContact(null);
    } else {
      addContact({
        name: trimmedName,
        phone: trimmedPhone,
        relationship: contactRelationship,
        sharesCheckIns: true,
        sharesETA: true,
      });
      triggerToast(`Contact "${trimmedName}" added.`);
      setShowAddContactModal(false);
    }

    setContactName('');
    setContactPhone('');
  };

  const handleConfirmDeleteContact = () => {
    if (!deletingContactId) return;
    const target = contacts.find((c) => c.id === deletingContactId);
    removeContact(deletingContactId);
    triggerToast(`Contact "${target?.name || 'Contact'}" removed.`);
    setDeletingContactId(null);
  };

  // Category Icon Resolver
  const getPlaceIcon = (label: SavedPlaceType) => {
    switch (label) {
      case 'Home':
        return <Home className="w-4 h-4 text-[#2563EB]" />;
      case 'Work':
        return <Briefcase className="w-4 h-4 text-[#2563EB]" />;
      case 'College':
        return <GraduationCap className="w-4 h-4 text-[#2563EB]" />;
      default:
        return <Bookmark className="w-4 h-4 text-[#2563EB]" />;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-1 pb-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold flex items-center justify-between animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1 pb-3 border-b border-[#DCE3EE]">
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Saved places & trusted contacts
        </h1>
        <p className="text-xs text-[#64748B]">
          Manage frequent origin/destination locations and trusted check-in contacts for active walks.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SAVED PLACES                                                   */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE3EE] pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#172033]">Saved places</h2>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-[#F5F7FB] text-[#64748B] border border-[#DCE3EE] rounded">
              {savedPlaces.length} saved
            </span>
          </div>

          <button
            onClick={handleOpenAddPlace}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add place</span>
          </button>
        </div>

        {/* Saved Places List */}
        {savedPlaces.length > 0 ? (
          <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
            {savedPlaces.map((sp) => (
              <div
                key={sp.id}
                className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#F5F7FB] transition-colors"
              >
                {/* Information Hierarchy */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] flex items-center justify-center shrink-0 mt-0.5">
                    {getPlaceIcon(sp.label)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {/* Primary Name */}
                      <span className="font-bold text-[#172033] text-sm">{sp.name}</span>
                      {/* Label Category Tag */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE]">
                        {sp.label}
                      </span>
                      {/* Subtle Demo Data Metadata */}
                      {sp.isDemo && (
                        <span className="text-[10px] text-[#64748B]">
                          • Sample data
                        </span>
                      )}
                    </div>
                    {/* Secondary Address */}
                    <span className="text-xs text-[#64748B] block">{sp.address}</span>
                  </div>
                </div>

                {/* Primary & Secondary Row Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                  {/* Primary Actions */}
                  <button
                    onClick={() => setOriginFromSavedPlace(sp)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#F5F7FB] text-[#172033] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE3EE] rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Use as origin</span>
                  </button>
                  <button
                    onClick={() => setDestinationFromSavedPlace(sp)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#F5F7FB] text-[#172033] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE3EE] rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Use as destination</span>
                  </button>
                  
                  {/* Secondary Icon Actions */}
                  <button
                    onClick={() => handleOpenEditPlace(sp)}
                    className="p-1.5 text-[#64748B] hover:text-[#172033] hover:bg-white border border-transparent hover:border-[#DCE3EE] rounded cursor-pointer transition-colors"
                    title={`Edit ${sp.name}`}
                    aria-label={`Edit ${sp.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPlaceId(sp.id)}
                    className="p-1.5 text-[#64748B] hover:text-[#C62828] hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded cursor-pointer transition-colors"
                    title={`Delete ${sp.name}`}
                    aria-label={`Delete ${sp.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#DCE3EE] rounded-md p-6 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-md bg-[#F5F7FB] text-[#2563EB] mx-auto flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-[#172033]">No saved places</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Save frequently used places to plan trips faster without re-typing addresses.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenAddPlace}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add a place</span>
            </Button>
          </div>
        )}
      </div>

      <hr className="border-[#DCE3EE]" />

      {/* ========================================================================= */}
      {/* SECTION 2: TRUSTED CONTACTS                                              */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE3EE] pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#172033]">Trusted contacts</h2>
            <span className="px-2 py-0.5 text-[11px] font-medium bg-[#F5F7FB] text-[#64748B] border border-[#DCE3EE] rounded">
              {contacts.length} contacts
            </span>
          </div>

          <button
            onClick={handleOpenAddContact}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add contact</span>
          </button>
        </div>

        {/* Demo Contact Notice */}
        <div className="p-3 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-xs text-[#64748B] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Preloaded contacts are sample fixture entries for demonstration. Real contacts added by you are saved locally in your browser.
          </p>
        </div>

        {/* Contacts List */}
        {contacts.length > 0 ? (
          <div className="bg-white border border-[#DCE3EE] rounded-md divide-y divide-[#DCE3EE]">
            {contacts.map((c) => {
              const isCurrentTripContact = activeTrip?.trustedContactId === c.id;
              const isDemo = c.isDemo || c.id.startsWith('c-');
              return (
                <div
                  key={c.id}
                  className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#F5F7FB] transition-colors"
                >
                  {/* Contact Hierarchy */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#F5F7FB] border border-[#DCE3EE] flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Primary Name */}
                        <span className="font-bold text-[#172033] text-sm">{c.name}</span>
                        {/* Secondary Relationship */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F7FB] text-[#172033] border border-[#DCE3EE]">
                          {c.relationship}
                        </span>
                        {/* Subtle Demo Data Metadata */}
                        {isDemo && (
                          <span className="text-[10px] text-[#64748B]">
                            • Sample data
                          </span>
                        )}
                        {isCurrentTripContact && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                            Active trip shared
                          </span>
                        )}
                      </div>
                      {/* Secondary Phone Number */}
                      <span className="text-xs font-mono text-[#64748B] block">{c.phone}</span>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEditContact(c)}
                      className="p-1.5 text-[#64748B] hover:text-[#172033] hover:bg-white border border-transparent hover:border-[#DCE3EE] rounded cursor-pointer transition-colors flex items-center gap-1 text-xs"
                      title={`Edit ${c.name}`}
                      aria-label={`Edit ${c.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingContactId(c.id)}
                      className="p-1.5 text-[#64748B] hover:text-[#C62828] hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded cursor-pointer transition-colors flex items-center gap-1 text-xs"
                      title={`Delete ${c.name}`}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#DCE3EE] rounded-md p-6 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-md bg-[#F5F7FB] text-[#2563EB] mx-auto flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-[#172033]">No trusted contacts</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Add trusted contacts to enable walk progress sharing and non-emergency check-in updates.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenAddContact}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add contact</span>
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT SAVED PLACE                                           */}
      {/* ========================================================================= */}
      {(showAddPlaceModal || editingPlace) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="place-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
                  Saved place configuration
                </span>
                <h3 id="place-modal-title" className="text-base font-bold text-[#172033]">
                  {editingPlace ? 'Edit saved place' : 'Add new saved place'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddPlaceModal(false);
                  setEditingPlace(null);
                }}
                className="p-1 text-[#64748B] hover:text-[#172033] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {placeFormError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
                <span>{placeFormError}</span>
              </div>
            )}

            <form onSubmit={handleSavePlace} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Place name *
                </label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Home, Office, Campus Gym"
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Place category / label *
                </label>
                <select
                  value={placeLabel}
                  onChange={(e) => setPlaceLabel(e.target.value as SavedPlaceType)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work / Office</option>
                  <option value="College">College / Campus</option>
                  <option value="Custom">Custom location</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Full address / landmark *
                </label>
                <input
                  type="text"
                  required
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  placeholder="e.g. Shivaji Park, Dadar West, Mumbai"
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCE3EE]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPlaceModal(false);
                    setEditingPlace(null);
                  }}
                  className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm">
                  {editingPlace ? 'Update place' : 'Save place'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE SAVED PLACE CONFIRMATION                                  */}
      {/* ========================================================================= */}
      {deletingPlaceId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-place-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 id="delete-place-title" className="text-base font-bold text-[#172033]">
                Delete this saved place?
              </h3>
              <p className="text-xs text-[#64748B]">
                This will remove the saved location from your shortcuts list.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DCE3EE]">
              <button
                onClick={() => setDeletingPlaceId(null)}
                className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePlace}
                className="px-4 py-2 bg-[#C62828] hover:bg-rose-800 text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT TRUSTED CONTACT                                       */}
      {/* ========================================================================= */}
      {(showAddContactModal || editingContact) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-[#DCE3EE] pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
                  Trusted contact configuration
                </span>
                <h3 id="contact-modal-title" className="text-base font-bold text-[#172033]">
                  {editingContact ? 'Edit trusted contact' : 'Add new trusted contact'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddContactModal(false);
                  setEditingContact(null);
                }}
                className="p-1 text-[#64748B] hover:text-[#172033] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactFormError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
                <span>{contactFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Contact name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Aarti Nandurkar"
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Phone number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98221 44556"
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#172033] block">
                  Relationship *
                </label>
                <select
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE3EE] rounded-md text-xs text-[#172033] focus-visible-ring"
                >
                  <option value="Family">Family member</option>
                  <option value="Friend">Friend / roommate</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Campus Police">Campus desk</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCE3EE]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContactModal(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm">
                  {editingContact ? 'Update contact' : 'Save contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE TRUSTED CONTACT CONFIRMATION                              */}
      {/* ========================================================================= */}
      {deletingContactId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-contact-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#DCE3EE] rounded-md shadow-lg p-5 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 id="delete-contact-title" className="text-base font-bold text-[#172033]">
                Delete this trusted contact?
              </h3>
              <p className="text-xs text-[#64748B]">
                This will revoke access for this contact from walk check-ins and emergency dialing sheets.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#DCE3EE]">
              <button
                onClick={() => setDeletingContactId(null)}
                className="px-4 py-2 bg-white border border-[#DCE3EE] hover:bg-[#F5F7FB] text-[#172033] font-semibold text-xs rounded-md cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteContact}
                className="px-4 py-2 bg-[#C62828] hover:bg-rose-800 text-white font-bold text-xs rounded-md cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsView;

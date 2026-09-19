import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import MapLibreRouteMap from '../../components/map/MapLibreRouteMap';
import WhyThisRouteDrawer from '../../components/common/WhyThisRouteDrawer';
import Button from '../../components/common/Button';
import type { RouteOption } from '../../lib/types';
import {
  ArrowLeftRight,
  Sun,
  Users,
  MapPin,
  Shield,
  Info,
  ChevronRight,
  Navigation,
} from 'lucide-react';

export const RouteWorkspace: React.FC = () => {
  const {
    originLocation,
    setOriginLocation,
    destinationLocation,
    setDestinationLocation,
    originCoords,
    destinationCoords,
    timeOfDay,
    setTimeOfDay,
    liveCurrentTime,
    selectedTimeDisplay,
    routes,
    normalizedRoutes,
    selectedRouteId,
    setSelectedRouteId,
    helpPoints,
    isFallbackRouting,
    routingStatusMessage,
    navigateToRouteDetail,
    startTrip,
  } = useSafety();

  const [drawerRoute] = useState<RouteOption | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);


  const handleSwap = () => {
    const tempLoc = originLocation;
    setOriginLocation(destinationLocation);
    setDestinationLocation(tempLoc);
  };

  const selectedRouteObj = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-1 sm:px-2">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#DCE3EE]">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Plan a route
          </h1>
          <p className="text-xs text-[#64748B] font-normal mt-0.5">
            Compare walking routes with contextual information about the journey.
          </p>
        </div>

        <button
          onClick={() => setShowHowItWorksModal(true)}
          className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>How evidence works</span>
        </button>
      </div>

      {/* Input Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left Input Panel: From ⇄ To (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#DCE3EE] rounded-md p-2 flex items-center gap-2">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            {/* From */}
            <div className="flex items-center gap-2 bg-[#F5F7FB] px-2.5 py-1.5 rounded border border-[#DCE3EE] text-xs font-medium text-[#172033]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0" />
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="Origin"
                className="w-full bg-transparent focus:outline-none text-[#172033] font-medium text-xs"
              />
            </div>

            {/* To */}
            <div className="flex items-center gap-2 bg-[#F5F7FB] px-2.5 py-1.5 rounded border border-[#DCE3EE] text-xs font-medium text-[#172033]">
              <span className="w-2 h-2 rounded-full bg-[#C62828] shrink-0" />
              <input
                type="text"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                placeholder="Destination"
                className="w-full bg-transparent focus:outline-none text-[#172033] font-medium text-xs"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap origin and destination"
            aria-label="Swap origin and destination"
            className="p-1.5 bg-white hover:bg-[#EFF6FF] border border-[#DCE3EE] hover:border-[#2563EB] rounded text-[#64748B] hover:text-[#2563EB] text-xs cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Travel Time Selector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DCE3EE] rounded-md p-2 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-xs font-medium text-[#64748B] shrink-0">Travel time:</span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setTimeOfDay('now')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-[#2563EB] text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer"
            >
              <span className="font-mono font-bold">NOW · {liveCurrentTime}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Spatial Hero Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 space-y-2">
          <MapLibreRouteMap
            routes={normalizedRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            origin={originCoords}
            destination={destinationCoords}
            originName={originLocation.split(',')[0]}
            destinationName={destinationLocation.split(',')[0]}
            helpPoints={helpPoints}
            isFallback={isFallbackRouting}
          />

          {routingStatusMessage && (
            <div className="px-3 py-1.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-[11px] text-[#64748B] flex items-center gap-1.5">
              <Info className="w-3 h-3 text-[#2563EB] shrink-0" />
              <span>{routingStatusMessage}</span>
            </div>
          )}
        </div>

        {/* Right: Route Options List */}
        <div className="lg:col-span-5 bg-white border border-[#DCE3EE] rounded-md p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
            <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono">
              Route options
            </h3>
            <span className="text-[11px] font-mono font-semibold text-[#2563EB]">
              {timeOfDay === 'now' ? `NOW · ${liveCurrentTime}` : selectedTimeDisplay}
            </span>
          </div>

          {/* Route Options List */}
          <div className="space-y-2">
            {routes.map((rt) => {
              const isSelected = rt.id === selectedRouteId;

              return (
                <div
                  key={rt.id}
                  onClick={() => setSelectedRouteId(rt.id)}
                  className={`p-3 rounded-md border transition-colors cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-white border-[#DCE3EE] hover:border-[#2563EB]/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">{rt.name}</h4>
                      <span className="text-[11px] text-[#64748B] block">{rt.via}</span>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="text-xs font-bold text-[#172033] block font-mono">
                          {rt.durationMinutes} min
                        </span>
                        <span className="text-[10px] text-[#64748B] block font-mono">
                          {rt.distanceKm} km
                        </span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#DCE3EE] bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Context Summary Line */}
                  <div className="text-[11px] text-[#64748B] pt-1.5 border-t border-[#DCE3EE]/80 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-[#2563EB]" />
                      <span>{rt.lightingEvidence.split('&')[0]}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#64748B]" />
                      <span>{rt.footfallEvidence.split('&')[0]}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0F766E]" />
                      <span>{rt.helpPointsCount} help points</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel Bottom Actions */}
          <div className="space-y-2 pt-2 border-t border-[#DCE3EE]">
            <Button
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-1.5 text-xs"
              onClick={() => {
                if (selectedRouteObj) {
                  navigateToRouteDetail(selectedRouteObj.id);
                }
              }}
            >
              <span>View route details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full flex items-center justify-center gap-1.5 text-xs"
              onClick={() => {
                if (selectedRouteObj) {
                  startTrip(selectedRouteObj.id);
                }
              }}
            >
              <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Start walk on {selectedRouteObj ? selectedRouteObj.name : 'selected route'}</span>
            </Button>
          </div>
        </div>
      </div>


      {/* How it Works Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#DCE3EE] rounded-md p-5 max-w-md w-full shadow-md space-y-3">
            <div className="flex justify-between items-center border-b border-[#DCE3EE] pb-2">
              <h3 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <span>How SaferPath works</span>
              </h3>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="p-1 text-[#64748B] hover:text-[#172033] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              SaferPath uses verified physical telemetry (streetlamps, store hours, transit desks) to display contextual evidence for routes at different times of day (6:00 PM, 9:00 PM, 11:30 PM). We state physical facts without giving subjective safety scores or safety guarantees.
            </p>
            <Button variant="primary" size="sm" className="w-full" onClick={() => setShowHowItWorksModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Why This Route Drawer */}
      <WhyThisRouteDrawer
        route={drawerRoute}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectRoute={(id) => {
          setSelectedRouteId(id);
          startTrip(id);
        }}
      />
    </div>
  );
};

export default RouteWorkspace;

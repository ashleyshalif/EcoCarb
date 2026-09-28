import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Layers, 
  IndianRupee, 
  Sliders, 
  Map, 
  Menu, 
  X, 
  Leaf, 
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSimulation } from './lib/useSimulation';
import { OverviewTab } from './components/OverviewTab';
import { LiveProcessTab } from './components/LiveProcessTab';
import { WasteCouplingTab } from './components/WasteCouplingTab';
import { EconomicsTab } from './components/EconomicsTab';
import { SimulatorTab } from './components/SimulatorTab';
import { ScalabilityTab } from './components/ScalabilityTab';
import { formatINR, formatNumber } from './lib/calc';
import { generateReportHtml } from './lib/generateReportHtml';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isPreparingReport, setIsPreparingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Shared simulation state across all tabs
  const simulation = useSimulation();
  const { defaultSkid } = simulation;

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Robust PDF / Print / HTML Report handler
  const handlePrintOrDownload = async () => {
    setIsPreparingReport(true);
    setReportError(null);

    try {
      const isIframe = window.self !== window.top;

      // In direct top-level browser window, try native print first
      if (!isIframe) {
        try {
          window.print();
          setIsPreparingReport(false);
          return;
        } catch (printErr) {
          console.warn('Direct window.print() failed, falling back to standalone report:', printErr);
        }
      }

      // Inside iframe or print failed: generate self-contained printable report Blob
      const reportHtml = generateReportHtml(defaultSkid);
      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      let opened = false;
      try {
        const printTab = window.open(blobUrl, '_blank');
        if (printTab && !printTab.closed) {
          opened = true;
        }
      } catch (openErr) {
        console.warn('window.open was blocked:', openErr);
      }

      // If popup was blocked or failed in sandbox iframe, download the standalone HTML report
      if (!opened) {
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `EcoCarb-Executive-Report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err: any) {
      console.error('Report preparation error:', err);
      setReportError('Could not open print window. Please allow popups or download.');
    } finally {
      setTimeout(() => {
        setIsPreparingReport(false);
      }, 1000);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-process', label: 'Live Process Monitor', icon: Activity, badge: simulation.disturbanceActive ? 'SURGE' : 'LIVE' },
    { id: 'waste-coupling', label: 'Waste Coupling', icon: Layers, badge: null },
    { id: 'economics', label: 'Economics (Zero-Cost Model)', icon: IndianRupee, badge: null },
    { id: 'simulator', label: 'Scenario Simulator', icon: Sliders, badge: 'KEY' },
    { id: 'scalability', label: 'Regional Scalability', icon: Map, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (Single-row, 3 zones) */}
      <header className="no-print h-16 border-b border-slate-800 bg-[#090e1c]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <button 
            type="button"
            className="flex items-center gap-2.5 cursor-pointer text-left bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl"
            onClick={() => handleSelectTab('overview')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                EcoCarb
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Carbon Mod
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-400" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isActive
                    ? 'text-white bg-slate-800 font-semibold shadow-sm'
                    : 'hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold whitespace-nowrap ${
                    item.badge === 'SURGE' 
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse' 
                      : item.badge === 'KEY'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Machine #01: {simulation.currentTemp}°C / {simulation.currentPH} pH</span>
          </div>

          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={handlePrintOrDownload}
              disabled={isPreparingReport}
              className={`px-3.5 py-2 rounded-xl text-slate-950 text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isPreparingReport 
                  ? 'bg-emerald-400/80 cursor-wait' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
              title="Print report or save as PDF"
            >
              {isPreparingReport ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing report...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download report (PDF)</span>
                </>
              )}
            </button>
            {reportError && (
              <span className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3" />
                {reportError}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="no-print lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* App Shell Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 lg:p-8 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="no-print hidden lg:flex flex-col w-64 shrink-0 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-1 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                      item.badge === 'SURGE' 
                        ? 'bg-amber-500/20 text-amber-300 animate-pulse' 
                        : item.badge === 'KEY'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Machine Quick Telemetry Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Capture Machine #01</span>
                <span className="text-[10px] text-slate-400">Standard 20ft Skid</span>
              </div>
              <span className="font-mono text-emerald-400 text-[10px] flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Smoke CO₂:</span>
                <span className="text-white whitespace-nowrap">{simulation.currentCO2}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tank Acidity (pH):</span>
                <span className={`whitespace-nowrap ${simulation.currentPH < 8.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {simulation.currentPH}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Heat Temp:</span>
                <span className="text-amber-300 whitespace-nowrap">{simulation.currentTemp}°C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Auto Fix:</span>
                <span className={`whitespace-nowrap ${simulation.dosingActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {simulation.dosingActive ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              NIT Raipur Watt's Next Ideathon · PS8
            </div>
          </div>
        </aside>

        {/* Primary Content Viewport */}
        <main className="flex-1 min-w-0">
          {/* Print-Only Cover Header (Visible only when generating PDF via window.print) */}
          <div className="hidden print:block mb-6 p-6 border-b border-slate-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-950">EcoCarb</h1>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  Turning Factory Smoke &amp; Steel Waste into Chalk Powder
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Team Carbon Mod · Zero-cost for factory · NIT Raipur Watt's Next Ideathon · PS8
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>CO₂ caught: {formatNumber(defaultSkid.daily_co2, 1)} t/day ({formatNumber(defaultSkid.annual_co2, 0)} t/yr)</div>
                <div>Chalk powder: {formatNumber(defaultSkid.daily_pcc, 1)} t/day ({formatNumber(defaultSkid.annual_pcc, 0)} t/yr)</div>
                <div>Steel waste used: {formatNumber(defaultSkid.daily_slag, 1)} t/day ({Math.round(defaultSkid.annual_slag).toLocaleString('en-IN')} t/yr)</div>
                <div>Money-back time: {defaultSkid.payback} yrs (range {defaultSkid.payback_range_3k_11k.min}–{defaultSkid.payback_range_3k_11k.max} yrs)</div>
                <div>Yearly profit: {formatINR(defaultSkid.annual_net_cash, true)}</div>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewTab simulation={simulation} onNavigateTab={handleSelectTab} />
          )}

          {activeTab === 'live-process' && (
            <LiveProcessTab simulation={simulation} />
          )}

          {activeTab === 'waste-coupling' && (
            <WasteCouplingTab simulation={simulation} />
          )}

          {activeTab === 'economics' && (
            <EconomicsTab />
          )}

          {activeTab === 'simulator' && (
            <SimulatorTab />
          )}

          {activeTab === 'scalability' && (
            <ScalabilityTab />
          )}

          {/* Requirement 5: Print/PDF report only glossary with 8 terms */}
          <div className="hidden print:block mt-8 pt-6 border-t-2 border-slate-300 font-sans">
            <h3 className="text-base font-bold text-slate-950 mb-3 uppercase tracking-wider">
              Words used here (Glossary)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-800">
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">1. Skid (Capture Machine):</span>
                <span>A compact, containerized industrial unit installed on site at the factory without long construction delays.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">2. PCC (Chalk powder):</span>
                <span>Precipitated Calcium Carbonate — fine white powder made by reacting captured CO₂ with calcium, used in cement and paint.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">3. Slag (Steel waste):</span>
                <span>Calcium-rich solid byproduct left over from steel manufacturing kilns, diverted from landfill dumps.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">4. CCaaS (Zero-cost model):</span>
                <span>Carbon Capture as a Service. We install, own, and maintain the capture equipment at zero capital expense to the factory.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">5. Money-back time (Payback):</span>
                <span>The time required for net earnings from powder sales and carbon credits to fully recover the initial machine cost.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">6. Capture rate:</span>
                <span>The percentage of carbon dioxide gas filtered and trapped from the chimney smoke by the absorber (target 85%).</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">7. pH (Tank acidity):</span>
                <span>A measurement of acidity or alkalinity in the reactor tank. Maintained between 8.5 and 9.5 for optimal chalk crystal formation.</span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">8. Carbon credit:</span>
                <span>A certified, tradable credit representing one metric ton of CO₂ permanently prevented from entering the atmosphere.</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mandatory Footer across all views */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-400 font-sans">
        <p className="max-w-4xl mx-auto leading-relaxed">
          Prototype - simulated data, illustrative assumptions | Team Carbon Mod | NIT Raipur Watt's Next Ideathon | PS8: Carbon Capture and Climate Mitigation
        </p>
      </footer>
    </div>
  );
}

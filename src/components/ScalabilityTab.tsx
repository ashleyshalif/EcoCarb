import React, { useState } from 'react';
import { 
  MapPin, 
  Container, 
  Factory, 
  Truck, 
  ArrowRight, 
  Building2, 
  Info,
  ChevronDown
} from 'lucide-react';
import { computeSkid, DEFAULT_SKID_PARAMS, formatINR, formatNumber } from '../lib/calc';

export const ScalabilityTab: React.FC = () => {
  // Slider for machine modules: 1 to 10
  const [skidModules, setSkidModules] = useState<number>(4);

  // Single source of truth baseline from computeSkid
  const defaultSkid = computeSkid(DEFAULT_SKID_PARAMS);

  // Multi-module aggregated metrics = N x computeSkid outputs
  const totalCO2AvoidedPerYear = defaultSkid.annual_co2 * skidModules;
  const totalPCCProducedPerYear = defaultSkid.annual_pcc * skidModules;
  const totalSlagDivertedPerYear = defaultSkid.annual_slag * skidModules;
  const totalAnnualRevenueINR = defaultSkid.annual_total_revenue * skidModules;

  // Selected hub for map inspection
  const [selectedHub, setSelectedHub] = useState<string>('urla');

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>Start with 1 machine, then add more like Lego blocks.</span>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Scaling Across the Industrial Corridor
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Add more machines as factory production grows without stopping operations
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-semibold flex items-center gap-2 whitespace-nowrap">
            <Container className="w-4 h-4" />
            <span>Modular Lego-style growth</span>
          </div>
        </div>
      </div>

      {/* 1-10 Machine Selector & Four Number Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e241c] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Fleet Size Multiplier
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Machines installed: <span className="font-mono text-emerald-400">{skidModules} {skidModules === 1 ? 'Machine' : 'Machines'}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 4, 6, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setSkidModules(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  skidModules === num
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={skidModules}
            onChange={(e) => setSkidModules(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-2.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>1 machine (pilot)</span>
            <span>5 machines (medium hub)</span>
            <span>10 machines (full cluster)</span>
          </div>
        </div>

        {/* Four Number Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-sm block">CO₂ removed per year</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 whitespace-nowrap">
              {formatNumber(totalCO2AvoidedPerYear, 0)} <span className="text-xs text-slate-400">tons</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">permanently trapped</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-sm block">Income per year</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 whitespace-nowrap">
              {formatINR(totalAnnualRevenueINR, true)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">from powder and credits</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-sm block">Powder supplied</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 whitespace-nowrap">
              {formatNumber(totalPCCProducedPerYear, 0)} <span className="text-xs text-slate-400">tons</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">to cement companies</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-sm block">Steel waste used</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1 whitespace-nowrap">
              {Math.round(totalSlagDivertedPerYear).toLocaleString('en-IN')} <span className="text-xs text-slate-400">tons</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">cleared from dumps</span>
          </div>
        </div>

        {/* Two Note Cards: One line each under 12 words */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-sm text-slate-200 flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Steel waste needed: about 69 tons a day per machine ({Math.round(defaultSkid.annual_slag).toLocaleString('en-IN')} t/year).</span>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-500/20 text-sm text-slate-200 flex items-center gap-2.5">
            <Info className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Cement and paint demand must be checked with real buyer quotes.</span>
          </div>
        </div>
      </div>

      {/* Schematic Map of the Corridor: Shorten each node to a name plus one line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                How materials move between cities
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Local corridor along National Highway 53
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Radius: about 30 km</span>
          </div>

          {/* Map canvas */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-xl p-6 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Background Highway Track */}
            <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-800/80 -translate-y-1/2 pointer-events-none rounded">
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-700 -translate-y-1/2" />
            </div>

            <div className="absolute top-1/2 left-8 -translate-y-6 text-xs font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
              Highway 53 (Durg — Bhilai — Raipur Corridor)
            </div>

            {/* Industrial Cluster Nodes: Each shortened to name + ONE line */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 my-auto">
              {/* Node 1: Bhilai Steel Hub */}
              <button 
                type="button"
                onClick={() => setSelectedHub('bhilai')}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  selectedHub === 'bhilai' 
                    ? 'bg-slate-900 border-amber-500 shadow-lg ring-1 ring-amber-500' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-bold text-white">Bhilai Steel Hub</span>
                  <Factory className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm text-amber-300 font-medium mt-1 leading-snug">
                  Provides tons of steel waste from local mills.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Durg-Bhilai</span>
                </div>
              </button>

              {/* Node 2: Urla & Siltara Factory Hub */}
              <button 
                type="button"
                onClick={() => setSelectedHub('urla')}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  selectedHub === 'urla' 
                    ? 'bg-slate-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wide whitespace-nowrap">
                  {skidModules}x Active
                </div>
                <div className="flex items-center justify-between text-sm mb-1 mt-1">
                  <span className="font-bold text-emerald-400">Urla &amp; Siltara Hub</span>
                  <Container className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-300 font-medium mt-1 leading-snug">
                  Where we install our capture machines.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Raipur North</span>
                </div>
              </button>

              {/* Node 3: Jamul & Mandhar Cement Hub */}
              <button 
                type="button"
                onClick={() => setSelectedHub('cement')}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  selectedHub === 'cement' 
                    ? 'bg-slate-900 border-cyan-500 shadow-lg ring-1 ring-cyan-500' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-bold text-white">Jamul &amp; Mandhar Hub</span>
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-sm text-cyan-300 font-medium mt-1 leading-snug">
                  Cement plants that buy all our chalk powder.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jamul-Mandhar</span>
                </div>
              </button>
            </div>

            {/* Synergistic Transport Vectors */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Steel waste hauled: about 30 km
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
                <ArrowRight className="w-3.5 h-3.5" />
                Catch smoke &amp; make chalk locally
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Chalk powder delivered &lt; 25 km
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Hub Detail & Technical Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Selected Location: {selectedHub.toUpperCase()}
            </h4>

            {selectedHub === 'bhilai' && (
              <div className="text-sm text-slate-300 space-y-1">
                <p>1. Local steel mills produce over 1 million tons of slag yearly.</p>
                <p>2. We take this waste off their hands to make powder.</p>
              </div>
            )}

            {selectedHub === 'urla' && (
              <div className="text-sm text-slate-300 space-y-1">
                <p>1. Over 120 re-rolling mills operating kilns 24 hours a day.</p>
                <p>2. We install machines in 7 days without stopping the kilns.</p>
              </div>
            )}

            {selectedHub === 'cement' && (
              <div className="text-sm text-slate-300 space-y-1">
                <p>1. Cement makers need calcium carbonate to strengthen cement.</p>
                <p>2. They buy our chalk powder under 5-year contracts.</p>
              </div>
            )}

            {/* Collapsed Technical Details */}
            <details className="group mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
              <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                <span className="flex items-center gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-open:rotate-180 transition-transform" />
                  Show technical details
                </span>
                <span className="text-slate-500 text-[11px]">Toggle</span>
              </summary>
              <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 font-mono text-slate-400 text-xs">
                <div>• Footprint: 20ft container (15 m²)</div>
                <div>• Slag trucking radius: about 30 km along NH-53</div>
                <div>• Availability factor: &gt;96% uptime</div>
              </div>
            </details>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Container className="w-4 h-4 text-emerald-400" />
              Easy to Scale Up
            </h4>
            <p className="text-sm text-slate-300 leading-snug">
              1. Add more machines like Lego blocks as factory smoke expands.
            </p>
            <p className="text-sm text-slate-300 leading-snug">
              2. Machines can be loaded onto trucks and moved if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

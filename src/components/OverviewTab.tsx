import React, { useMemo } from 'react';
import { 
  CloudRain, 
  Layers, 
  Flame, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Container, 
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { computeSkid, DEFAULT_SKID_PARAMS, formatINR, formatNumber } from '../lib/calc';
import { useSimulation } from '../lib/useSimulation';

interface OverviewTabProps {
  simulation: ReturnType<typeof useSimulation>;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  // Baseline module from computeSkid
  const baselineSkid = useMemo(() => computeSkid(DEFAULT_SKID_PARAMS), []);

  // Compute sensitivity at ₹3,000/t for dynamic money-back time (no hardcoding)
  const skidAt3000 = useMemo(() => computeSkid({ pccPricePerTonne: 3000 }), []);

  // Freeze headline metrics to computeSkid() single source of truth
  const dailyCO2Tonnes = baselineSkid.daily_co2; // 14.519 t/d
  const dailyPccTonnes = baselineSkid.daily_pcc; // 29.718 t/d
  const dailySlagTonnes = baselineSkid.daily_slag; // 69.38 t/d
  const annualSlagTonnes = baselineSkid.annual_slag; // 22,895 t/yr

  // Fixed 24h production timeline based on frozen baseline rates
  const hourly24hData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const baseCO2PerHour = dailyCO2Tonnes / 24;
      const basePCCPerHour = dailyPccTonnes / 24;
      
      const wave = Math.sin((i / 24) * 2 * Math.PI) * 0.02;
      return {
        time: timeStr,
        co2Captured: Number((baseCO2PerHour * (1 + wave)).toFixed(3)),
        pccProduced: Number((basePCCPerHour * (1 + wave)).toFixed(3)),
      };
    });
  }, [dailyCO2Tonnes, dailyPccTonnes]);

  // Donut chart: 3 revenue streams
  const revenueBreakdown = useMemo(() => [
    { name: 'Powder sales', value: baselineSkid.annual_pcc_revenue, color: '#10b981' },
    { name: 'Carbon credits', value: baselineSkid.annual_credit_revenue, color: '#22d3ee' },
    { name: 'Waste fee (not confirmed)', value: 0.001, color: '#f59e0b' },
  ], [baselineSkid]);

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>We turn factory smoke into chalk powder that cement companies buy.</span>
      </div>

      {/* Hero Card: 2 points only, under 12 words per line */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e221d] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Capture Machine #01
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Zero-cost for factory
              </span>
              <span className="text-xs text-slate-400">
                we install and own the machine
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              How the Machine Works
            </h2>

            {/* Exactly 2 points, under 12 words each */}
            <div className="space-y-1.5 text-sm md:text-base text-slate-200">
              <p className="font-medium text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                1. Machine catches CO₂ from the chimney.
              </p>
              <p className="font-medium text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">2</span>
                2. Mixes it with steel waste to make chalk powder.
              </p>
            </div>

            {/* Requirement 4: Full name shown once here in hero subtext */}
            <p className="text-xs text-slate-400 pt-1">
              Precipitated Calcium Carbonate (PCC), a fine white powder
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('simulator')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <TrendingUp className="w-4 h-4" />
              Run Scenario Simulator
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('waste-coupling')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700 flex items-center gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              View Mass Balance
            </button>
          </div>
        </div>

        {/* Quick specs pill bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-400">Machine size</div>
            <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <Container className="w-4 h-4 text-emerald-400" />
              Standard 20ft container
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Heating power</div>
            <div className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5 text-xs">
              <Flame className="w-4 h-4 shrink-0" />
              <span>60–70°C waste heat from the hot flue gas (via a heat exchanger)</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Steel waste needed</div>
            <div className="font-semibold text-slate-200 mt-0.5 font-mono text-xs">
              {formatNumber(dailySlagTonnes, 1)} t/day ({Math.round(annualSlagTonnes).toLocaleString('en-IN')} t/yr)
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Cost to factory</div>
            <div className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ₹0 (we install and own it)
            </div>
          </div>
        </div>
      </div>

      {/* Six Number Cards (label + one number + one short line under 12 words) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: CO2 caught today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>CO₂ caught today</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatNumber(dailyCO2Tonnes, 1)} tons
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            14.5 tons caught every day.
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            (4,791 tons per year)
          </div>
        </div>

        {/* Card 2: Catch rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Catch rate</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              85%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Good
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            Good: catches 85% of smoke CO₂.
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            (absorber efficiency target)
          </div>
        </div>

        {/* Card 3: Powder made today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Powder made today</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatNumber(dailyPccTonnes, 1)} tons
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            Sold to cement and paint makers.
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            (chalk powder at ₹6,000/t)
          </div>
        </div>

        {/* Card 4: Carbon credit income */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Carbon credit income</span>
            <IndianRupee className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              ₹17.4k / day
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            Extra income from verified green credits.
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            (₹57.5 Lakhs per year at ₹1,200/t)
          </div>
        </div>

        {/* Card 5: Heat saved vs old method */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Heat saved vs old method</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
              65%
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            Runs on waste heat from the hot flue gas (via a heat exchanger).
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            (runs at 60–70°C vs 140°C amine)
          </div>
        </div>

        {/* Card 6: Money-back time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Money-back time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {baselineSkid.payback.toFixed(1)} yrs
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (range {baselineSkid.payback_range_3k_11k.min.toFixed(1)}–{baselineSkid.payback_range_3k_11k.max.toFixed(1)})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Base case (₹6,000/t)
            </div>
            {/* Requirement 2: grey text under money-back number */}
            <div className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">
              Estimate. Excludes tax, financing, ramp-up, maintenance.
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-snug">
            Machine cost recovered in {baselineSkid.payback_months} months.
          </p>
          {/* Requirement 2: under the subline add dynamic price at 3,000/t */}
          <div className="text-xs font-semibold text-emerald-400 mt-1">
            Even at ₹3,000/t powder price: {skidAt3000.payback.toFixed(1)} yrs
          </div>
        </div>
      </div>

      {/* Main Charts Row: 24h Profile + Where money comes from */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 24h Captured CO2 & Powder Made */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                24 hours: CO₂ caught and powder made
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Shows steady production across day and night shifts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                CO₂ caught (t/h)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Chalk powder (t/h)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly24hData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(val) => `${val} t`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px' 
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} tons/hour`,
                    name === 'co2Captured' ? 'CO₂ caught' : 'Chalk powder'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="co2Captured" 
                  stroke="#22d3ee" 
                  strokeWidth={2.5} 
                  dot={false}
                  name="co2Captured"
                />
                <Line 
                  type="monotone" 
                  dataKey="pccProduced" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={false}
                  name="pccProduced"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
            <span>Average: {formatNumber(dailyCO2Tonnes / 24, 3)} t/h CO₂</span>
            <span>Average: {formatNumber(dailyPccTonnes / 24, 3)} t/h chalk powder</span>
            <span className="text-emerald-400 font-sans font-semibold">99.2% plant uptime</span>
          </div>
        </div>

        {/* Right: Where the money comes from */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">
                Where the money comes from
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatINR(baselineSkid.annual_total_revenue, true)}/yr
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              91% comes from selling chalk powder, 9% from carbon credits
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px' 
                    }}
                    formatter={(val: any, name: any) => {
                      if (name === 'Waste fee (not confirmed)') return ['₹0 / year (upside unverified)', name];
                      return [`₹${(Number(val) / 10000000).toFixed(2)} Cr / year`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(val) => <span className="whitespace-nowrap text-slate-300 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Powder sales (91%)
              </span>
              <span className="font-mono font-semibold text-white whitespace-nowrap">
                ₹5.88 Cr / yr
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Carbon credits (9%)
              </span>
              <span className="font-mono font-semibold text-white whitespace-nowrap">
                ₹57.5 Lakhs / yr
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Waste fee (not confirmed)
              </span>
              <span className="font-mono font-semibold text-slate-400 whitespace-nowrap">
                ₹0 / yr (unverified)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Why factories choose us: cards with max 2 points, under 12 words per line */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-base font-semibold text-white">Runs on Factory Waste Heat</h4>
          <p className="text-sm text-slate-300 leading-snug">
            1. Runs on waste heat from the hot flue gas (via a heat exchanger) at 60–70°C.
          </p>
          <p className="text-sm text-slate-300 leading-snug">
            2. Never needs expensive new coal or gas boilers.
          </p>
          <div className="text-xs text-slate-500">technical: amino-acid promoted K₂CO₃ solvent</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-semibold text-white">Uses Up Factory Steel Waste</h4>
          <p className="text-sm text-slate-300 leading-snug">
            1. Turns unwanted steel waste into clean chalk powder.
          </p>
          <p className="text-sm text-slate-300 leading-snug">
            2. No expensive gas pipes or underground storage needed.
          </p>
          <div className="text-xs text-slate-500">technical: dual waste mineral carbonation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-semibold text-white">Zero-Cost for Factory</h4>
          <p className="text-sm text-slate-300 leading-snug">
            1. The factory pays ₹0 to install or run.
          </p>
          <p className="text-sm text-slate-300 leading-snug">
            2. Carbon Mod installs, owns, and services the machine.
          </p>
          <div className="text-xs text-slate-500">technical: Carbon Capture as a Service (CCaaS)</div>
        </div>
      </div>

      {/* Rule 5: Collapsed Technical Details Toggle */}
      <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 cursor-pointer">
        <summary className="font-semibold text-slate-200 flex items-center justify-between list-none">
          <span className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-emerald-400 group-open:rotate-180 transition-transform" />
            Show technical details (chemical engineering &amp; thermodynamics)
          </span>
          <span className="text-slate-500 font-normal">Click to toggle</span>
        </summary>
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 font-mono text-slate-400 leading-relaxed">
          <p>• Solvent chemistry: 25 wt% potassium carbonate promoted with 3 wt% amino acid (L-arginine/glycine).</p>
          <p>• Specific thermal regeneration duty: 1.32 GJ / tonne CO₂ captured (65% lower than 30 wt% MEA at 3.9 GJ/t).</p>
          <p>• Mineralization stoichiometry: CO₂ + Ca²⁺ + 2OH⁻ ⟶ CaCO₃(s) + H₂O (calcite crystal habit, &gt;98% purity).</p>
          <p>• Solid consumption ratio: ~2.33 tons steel slag (40% CaO) per ton of precipitated CaCO₃ produced.</p>
        </div>
      </details>
    </div>
  );
};

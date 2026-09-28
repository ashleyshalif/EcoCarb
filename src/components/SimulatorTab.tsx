import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Coins, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { 
  SkidParams, 
  DEFAULT_SKID_PARAMS, 
  computeSkid, 
  formatINR, 
  formatNumber 
} from '../lib/calc';

export const SimulatorTab: React.FC = () => {
  const [params, setParams] = useState<SkidParams>(DEFAULT_SKID_PARAMS);

  // Live calculated outputs via single source of truth computeSkid
  const outputs = useMemo(() => computeSkid(params), [params]);

  const handleSliderChange = (field: keyof SkidParams, value: number) => {
    setParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetDefaults = () => {
    setParams(DEFAULT_SKID_PARAMS);
  };

  // Quick preset configurations
  const applyPreset = (presetName: string) => {
    if (presetName === 'foundry') {
      setParams({
        ...DEFAULT_SKID_PARAMS,
        flowRate: 1500,
        co2VolumePercent: 9.5,
        captureEfficiency: 82,
        slagCaoContent: 38,
      });
    } else if (presetName === 'rolling') {
      setParams({
        ...DEFAULT_SKID_PARAMS,
        flowRate: 3000,
        co2VolumePercent: 12.0,
        captureEfficiency: 85,
        slagCaoContent: 40,
      });
    } else if (presetName === 'rotary-kiln') {
      setParams({
        ...DEFAULT_SKID_PARAMS,
        flowRate: 6000,
        co2VolumePercent: 18.0,
        captureEfficiency: 88,
        slagCaoContent: 42,
      });
    }
  };

  // Sensitivity scenarios at chalk powder Rs 3,000 / 6,000 / 11,000 per ton
  const sensitivityCases = useMemo(() => {
    const prices = [3000, 6000, 11000];
    return prices.map((price) => {
      const res = computeSkid({ ...params, pccPricePerTonne: price });
      return {
        price,
        netCashLakhs: res.annual_net_cash / 100000,
        payback: res.payback,
        paybackMonths: res.payback_months,
      };
    });
  }, [params]);

  // Heat-table: rows = Machine Cost (Rs 1, 3, 5, 10 Cr), cols = Powder price (Rs 3,000 / 6,000 / 11,000)
  const heatTableData = useMemo(() => {
    const capexList = [1.0, 3.0, 5.0, 10.0];
    const pccList = [3000, 6000, 11000];
    return capexList.map((capexCr) => {
      const row = pccList.map((pccPrice) => {
        const res = computeSkid({
          ...params,
          skidCapexCr: capexCr,
          pccPricePerTonne: pccPrice,
        });
        return {
          pccPrice,
          payback: res.payback,
        };
      });
      return {
        capexCr,
        row,
      };
    });
  }, [params]);

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>Move the sliders to see how profit changes.</span>
      </div>

      {/* Header with Presets & Reset */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Test Different Factory Setups
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Choose a preset or move the sliders to see results in real time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline whitespace-nowrap">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('foundry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                params.flowRate === 1500
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Small Foundry
            </button>
            <button
              type="button"
              onClick={() => applyPreset('rolling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                params.flowRate === 3000
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Re-Rolling Mill
            </button>
            <button
              type="button"
              onClick={() => applyPreset('rotary-kiln')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                params.flowRate === 6000
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Rotary Kiln
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 ml-1 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-7 space-y-5">
          {/* Always Visible: The 5 that matter most */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">The 5 That Matter Most</h3>
                <p className="text-xs text-slate-400 mt-0.5">Primary commercial and production drivers</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                5 Primary Sliders
              </span>
            </div>

            {/* Slider 1: Powder price */}
            <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-200 font-semibold">Chalk powder price</label>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{params.pccPricePerTonne.toLocaleString('en-IN')}/t
                  {params.pccPricePerTonne === 6000 && <span className="text-xs text-slate-400 ml-1.5 font-normal">(Base case)</span>}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={14000}
                step={250}
                value={params.pccPricePerTonne}
                onChange={(e) => handleSliderChange('pccPricePerTonne', Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>₹2,000/t (Stress)</span>
                <span className="text-emerald-400">Base case: ₹6,000/t</span>
                <span>₹14,000/t (High grade)</span>
              </div>
            </div>

            {/* Slider 2: Machine cost */}
            <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-200 font-semibold">Machine cost</label>
                <span className="font-mono font-bold text-white">
                  ₹{params.skidCapexCr.toFixed(1)} Cr
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.25}
                value={params.skidCapexCr}
                onChange={(e) => handleSliderChange('skidCapexCr', Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>₹0.5 Cr</span>
                <span className="text-emerald-400">Default: ₹3.0 Cr</span>
                <span>₹8.0 Cr</span>
              </div>
            </div>

            {/* Slider 3: Running cost */}
            <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-200 font-semibold">Running cost per ton CO₂</label>
                <span className="font-mono font-bold text-slate-200">
                  ₹{params.opexPerTonneCO2.toLocaleString('en-IN')}/t CO₂
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={8000}
                step={250}
                value={params.opexPerTonneCO2}
                onChange={(e) => handleSliderChange('opexPerTonneCO2', Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>₹2,000/t</span>
                <span className="text-emerald-400">Default: ₹4,500/t</span>
                <span>₹8,000/t</span>
              </div>
            </div>

            {/* Slider 4: Smoke flow */}
            <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-200 font-semibold">Smoke flow from chimney</label>
                <span className="font-mono font-bold text-cyan-300">
                  {formatNumber(params.flowRate, 0)} Nm³/h
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={250}
                value={params.flowRate}
                onChange={(e) => handleSliderChange('flowRate', Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>500 Nm³/h</span>
                <span className="text-cyan-300">Default: 3,000 Nm³/h</span>
                <span>10,000 Nm³/h</span>
              </div>
            </div>

            {/* Slider 5: CO2 share in smoke (Consistent range 4.0% - 30.0%) */}
            <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-200 font-semibold">CO₂ share in smoke</label>
                <span className="font-mono font-bold text-cyan-300">
                  {params.co2VolumePercent.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={4.0}
                max={30.0}
                step={0.5}
                value={params.co2VolumePercent}
                onChange={(e) => handleSliderChange('co2VolumePercent', Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>4% Lean Boiler</span>
                <span className="text-cyan-300">12% Steel Mill</span>
                <span>30% Lime Kiln</span>
              </div>
            </div>

            {/* Notice under sliders */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Costs and prices are estimates. We will confirm them in a pilot.</span>
            </div>

            {/* Collapsed Advanced Settings */}
            <details className="group bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs cursor-pointer">
              <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <ChevronDown className="w-4 h-4 text-emerald-400 group-open:rotate-180 transition-transform" />
                  Advanced settings
                </span>
                <span className="text-slate-500 text-xs">Click to show 8 more sliders</span>
              </summary>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-4">
                {/* Advanced: Capture Efficiency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Capture efficiency:</span>
                    <span className="font-mono font-bold text-emerald-400">{params.captureEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={95}
                    step={1}
                    value={params.captureEfficiency}
                    onChange={(e) => handleSliderChange('captureEfficiency', Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Powder Conversion */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Chalk conversion rate:</span>
                    <span className="font-mono font-bold text-emerald-400">{params.carbonationConversion}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={98}
                    step={1}
                    value={params.carbonationConversion}
                    onChange={(e) => handleSliderChange('carbonationConversion', Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Slag CaO Content */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Steel waste calcium (CaO):</span>
                    <span className="font-mono font-bold text-amber-300">{params.slagCaoContent}%</span>
                  </div>
                  <input
                    type="range"
                    min={25}
                    max={55}
                    step={1}
                    value={params.slagCaoContent}
                    onChange={(e) => handleSliderChange('slagCaoContent', Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Calcium Leaching Efficiency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Calcium leaching efficiency:</span>
                    <span className="font-mono font-bold text-amber-300">{params.caLeachingEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={85}
                    step={1}
                    value={params.caLeachingEfficiency}
                    onChange={(e) => handleSliderChange('caLeachingEfficiency', Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Hours/day */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Operating hours per day:</span>
                    <span className="font-mono font-bold text-white">{params.operatingHoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={24}
                    step={1}
                    value={params.operatingHoursPerDay}
                    onChange={(e) => handleSliderChange('operatingHoursPerDay', Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Days/year */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Operating days per year:</span>
                    <span className="font-mono font-bold text-white">{params.operatingDaysPerYear} days</span>
                  </div>
                  <input
                    type="range"
                    min={250}
                    max={365}
                    step={5}
                    value={params.operatingDaysPerYear}
                    onChange={(e) => handleSliderChange('operatingDaysPerYear', Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Carbon Credit Price */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Carbon credit price:</span>
                    <span className="font-mono font-bold text-cyan-300">₹{params.carbonCreditPricePerTonne}/t</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={3000}
                    step={100}
                    value={params.carbonCreditPricePerTonne}
                    onChange={(e) => handleSliderChange('carbonCreditPricePerTonne', Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Advanced: Slag Tipping Fee */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Steel waste fee:</span>
                    <span className="font-mono font-bold text-amber-400">₹{params.slagTippingFeePerTonne}/t</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={50}
                    value={params.slagTippingFeePerTonne}
                    onChange={(e) => handleSliderChange('slagTippingFeePerTonne', Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: Result Card (Sticky at top) and sensitivity tables */}
        <div className="lg:col-span-5 space-y-5">
          {/* Requirement 6: Sticky Card at top containing the 4 result numbers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 lg:sticky lg:top-4 z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white">Financial Results</h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Live Outputs
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Number 1: Yearly income */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Yearly income</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatINR(outputs.annual_total_revenue, true)}
                </span>
              </div>

              {/* Number 2: Yearly running cost */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Yearly running cost</span>
                <span className="text-lg font-bold font-mono text-slate-300">
                  {formatINR(outputs.annual_opex, true)}
                </span>
              </div>

              {/* Number 3: Yearly profit */}
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Yearly profit</span>
                <span className="text-xl font-bold font-mono text-emerald-300">
                  {formatINR(outputs.annual_net_cash, true)}
                </span>
              </div>

              {/* Number 4: Money-back time */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Money-back time</span>
                  <span className="text-lg font-bold font-mono text-cyan-300">
                    {outputs.payback} years
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{params.pccPricePerTonne === 6000 ? 'Base case (₹6,000/t)' : `₹${params.pccPricePerTonne.toLocaleString('en-IN')}/t`}</span>
                  <span>range {outputs.payback_range_3k_11k.min}–{outputs.payback_range_3k_11k.max} yrs</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans pt-0.5">
                  Estimate. Excludes tax, financing, ramp-up, maintenance.
                </div>
              </div>
            </div>
          </div>

          {/* Affordable CapEx & Steel Waste Cards */}
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block font-medium">
                Most we could spend on the machine and still get money back in 3 years:
              </span>
              <div className="text-base font-bold font-mono text-emerald-400">
                {outputs.annual_net_cash > 0 ? formatINR(outputs.max_affordable_capex_3yr, true) : '₹0'}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">formula: 3 × yearly profit</span>
            </div>

            <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300">Steel waste needed per machine</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Needs ~2.3 tons of steel waste per ton of chalk powder.
                </div>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm whitespace-nowrap ml-2">
                {formatNumber(outputs.daily_slag, 1)} t/day ({Math.round(outputs.annual_slag).toLocaleString('en-IN')} t/yr)
              </span>
            </div>
          </div>

          {/* Price Table: If powder price changes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                If powder price changes
              </h4>
              <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Lowest powder price: {outputs.breakeven_pcc_label}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    {/* Requirement 4: Keep (PCC) in table headers */}
                    <th className="pb-2 font-sans">Chalk Powder Price (PCC)</th>
                    <th className="pb-2 text-right">Yearly Profit</th>
                    <th className="pb-2 text-right">Money-Back Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sensitivityCases.map((sc) => (
                    <tr key={sc.price} className="text-slate-300">
                      <td className="py-2.5 flex items-center gap-1.5 text-sm font-medium">
                        {sc.price === params.pccPricePerTonne && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        ₹{sc.price.toLocaleString('en-IN')}/t
                        {sc.price === 6000 && <span className="text-xs font-sans text-emerald-400 font-bold ml-1">(Base case)</span>}
                        {sc.price === 11000 && <span className="text-xs font-sans text-cyan-400 ml-1">(Optimistic)</span>}
                      </td>
                      <td className="py-2.5 text-right font-bold text-white text-sm">
                        ₹{sc.netCashLakhs.toFixed(1)} Lakhs
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400 text-sm">
                        {sc.payback > 50 ? '>10y' : `${sc.payback.toFixed(1)} yrs`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4x3 Grid: How fast do we get our money back? */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">How fast do we get our money back?</span>
                <span className="text-xs text-slate-400">years</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-2 text-left font-sans">Machine Cost</th>
                      <th className="pb-2">₹3k/t</th>
                      <th className="pb-2 font-bold text-emerald-400">₹6k/t (Base case)</th>
                      <th className="pb-2">₹11k/t</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {heatTableData.map((rowItem) => (
                      <tr key={rowItem.capexCr}>
                        <td className="py-2 text-left font-sans font-semibold text-slate-300">
                          ₹{rowItem.capexCr.toFixed(0)} Cr
                        </td>
                        {rowItem.row.map((cell) => {
                          const pb = cell.payback;
                          let colorCls = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                          if (pb < 3.0) {
                            colorCls = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
                          } else if (pb <= 6.0) {
                            colorCls = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold';
                          }
                          const displayVal = pb > 50 ? '>10y' : `${pb.toFixed(1)}y`;
                          return (
                            <td key={cell.pccPrice} className="py-1.5 px-1">
                              <span className={`inline-block w-full py-1 px-2 rounded text-xs ${colorCls}`}>
                                {displayVal}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> &lt;3 yrs (Fast)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> 3–6 yrs (Medium)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" /> &gt;6 yrs (Slow)
                </span>
              </div>
            </div>

            {/* Collapsed Technical Chemistry Toggle */}
            <details className="group mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
              <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                <span className="flex items-center gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-open:rotate-180 transition-transform" />
                  Show technical details (chemical equations &amp; formulas)
                </span>
                <span className="text-slate-500 text-[11px]">Toggle</span>
              </summary>
              <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 font-mono text-slate-400 text-xs">
                <div>• Flue gas density: 1.977 kg/Nm³ at STP</div>
                <div>• Molecular weight: CO₂ = 44.01 g/mol, CaCO₃ = 100.09 g/mol</div>
                <div>• Stoichiometric ratio: 2.274 tons CaCO₃ per ton CO₂ captured</div>
                <div>• Slag consumption: 2.333 tons slag per ton chalk powder</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

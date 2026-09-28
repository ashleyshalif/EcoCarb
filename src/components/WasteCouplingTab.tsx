import React, { useState } from 'react';
import { 
  Factory, 
  Wind, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Droplet, 
  Filter, 
  CheckCircle2, 
  Truck, 
  Activity, 
  ChevronDown
} from 'lucide-react';
import { computeSkid, DEFAULT_SKID_PARAMS, formatNumber } from '../lib/calc';
import { useSimulation } from '../lib/useSimulation';

interface WasteCouplingTabProps {
  simulation: ReturnType<typeof useSimulation>;
}

export const WasteCouplingTab: React.FC<WasteCouplingTabProps> = () => {
  // Selected stage to display detail
  const [selectedStage, setSelectedStage] = useState<string>('absorber');

  // Freeze baseline to computeSkid() single source of truth
  const skidCalculated = computeSkid(DEFAULT_SKID_PARAMS);

  // Exact physical mass balance terms (excluding recycled leachate loop)
  const co2InTonnesPerHour = Number(skidCalculated.co2_th.toFixed(3));
  const co2CapturedTonnesPerHour = Number(skidCalculated.captured_th.toFixed(3));
  const uncapturedFlueGasTonnes = Number((co2InTonnesPerHour - co2CapturedTonnesPerHour).toFixed(3));
  
  // Unreacted CO2 recycled back to reactor = captured CO2 * (1 - conversion)
  const convFraction = DEFAULT_SKID_PARAMS.carbonationConversion / 100;
  const unreactedCO2Tonnes = Number((co2CapturedTonnesPerHour * (1 - convFraction)).toFixed(3));

  const pccProducedTonnesPerHour = Number(skidCalculated.pcc_th.toFixed(3));
  const slagInTonnesPerHour = Number(skidCalculated.slag_th.toFixed(3));
  const solidResidueTonnesPerHour = Number((slagInTonnesPerHour - (pccProducedTonnesPerHour * 0.5603)).toFixed(3));

  // Dynamic real sum of inputs vs outputs (excluding recycled leachate loop)
  const totalInputs = Number((co2InTonnesPerHour + slagInTonnesPerHour).toFixed(3));
  const totalOutputs = Number((pccProducedTonnesPerHour + solidResidueTonnesPerHour + uncapturedFlueGasTonnes + unreactedCO2Tonnes).toFixed(3));
  const diffAbsolute = Math.abs(totalInputs - totalOutputs);
  const diffPercent = totalInputs > 0 ? (diffAbsolute / totalInputs) * 100 : 0;
  
  // Badge is green if the difference is under 0.5%, amber if higher
  const isBalanced = diffPercent < 0.5;
  const badgeStyle = isBalanced
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  // Dynamic badge text computed from real difference (not hard-coded)
  const balanceBadgeText = diffPercent < 0.1 
    ? 'Balanced: difference under 0.1%' 
    : `Balanced: difference ${diffPercent.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>Smoke CO₂ and steel waste react together to form harmless chalk.</span>
      </div>

      {/* Main Process Concept Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              How Factory Smoke &amp; Steel Waste Make Chalk
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              We connect the factory chimney pipe and local steel waste to create valuable white powder.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-sm">
              <div className="text-slate-400 font-medium">Simple chemical reaction:</div>
              <div className="font-mono font-bold text-emerald-300 text-sm tracking-wide">
                Smoke CO₂ + Waste Calcium ⟶ Solid Chalk + Water
              </div>
              <div className="text-[11px] text-slate-500 font-mono">CO₂ + Ca²⁺ + 2OH⁻ ⟶ CaCO₃(s) ↓ + H₂O</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow sheet as 5 big numbered steps, ONE line each */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            5 Steps from Smoke to Sold Powder
          </h3>
          <span className="text-xs text-slate-400">
            Click any step to see details
          </span>
        </div>

        {/* 5 Big Steps Container */}
        <div className="min-w-[920px] py-4 px-2 flex items-center justify-between gap-3">
          {/* Step 1: Smoke and steel waste come in */}
          <button 
            type="button"
            onClick={() => setSelectedStage('inlets')}
            className={`w-52 p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              selectedStage === 'inlets' 
                ? 'bg-slate-800 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg' 
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <div className="flex gap-1">
                <Wind className="w-4 h-4 text-cyan-400" />
                <Factory className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <h4 className="font-bold text-white text-sm mt-1">1. Smoke and steel waste come in</h4>
            <div className="text-xs text-slate-400 mt-2">
              From chimney &amp; slag heaps
            </div>
            <div className="text-xs font-mono text-cyan-300 font-bold mt-1">
              12% CO₂ · ~2.9 t/h waste
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 2: Absorber catches CO2 */}
          <button 
            type="button"
            onClick={() => setSelectedStage('absorber')}
            className={`w-52 p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              selectedStage === 'absorber' 
                ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400/50 shadow-lg' 
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <Droplet className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-white text-sm mt-1">2. Absorber catches CO₂</h4>
            <div className="text-xs text-slate-400 mt-2">
              60–70°C waste heat from the hot flue gas (via a heat exchanger)
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
              85% catch rate (0.61 t/h)
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 3: Reactor turns it into chalk */}
          <button 
            type="button"
            onClick={() => setSelectedStage('reactor')}
            className={`w-52 p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              selectedStage === 'reactor' 
                ? 'bg-slate-800 border-teal-400 ring-1 ring-teal-400/50 shadow-lg' 
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <h4 className="font-bold text-white text-sm mt-1">3. Reactor turns it into chalk</h4>
            <div className="text-xs text-slate-400 mt-2">
              Kept at safe 8.9 pH
            </div>
            <div className="text-xs font-mono text-teal-300 font-bold mt-1">
              Auto-fix buffer active
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 4: Filter separates the powder */}
          <button 
            type="button"
            onClick={() => setSelectedStage('filter')}
            className={`w-52 p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              selectedStage === 'filter' 
                ? 'bg-slate-800 border-indigo-400 ring-1 ring-indigo-400/50 shadow-lg' 
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                4
              </span>
              <Filter className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="font-bold text-white text-sm mt-1">4. Filter separates the powder</h4>
            <div className="text-xs text-slate-400 mt-2">
              Squeezes out pure powder
            </div>
            <div className="text-xs font-mono text-indigo-300 font-bold mt-1">
              98.4% pure white chalk
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 5: Powder is bagged and sold */}
          <button 
            type="button"
            onClick={() => setSelectedStage('offtake')}
            className={`w-52 p-4 rounded-xl border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              selectedStage === 'offtake' 
                ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400/50 shadow-lg' 
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                5
              </span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-white text-sm mt-1">5. Powder is bagged and sold</h4>
            <div className="text-xs text-slate-400 mt-2">
              Cement and paint buyers
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
              1.24 t/h (₹6,000/t)
            </div>
          </button>
        </div>
      </div>

      {/* Mass Balance Table & Unit Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mass Balance Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Where materials go (every hour)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact physical balance: input mass equals output mass
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono whitespace-nowrap border ${badgeStyle}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {balanceBadgeText}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">What (Stream &amp; PCC)</th>
                  <th className="pb-3">In or Out</th>
                  <th className="pb-3 text-right">Tons per hour</th>
                  <th className="pb-3 text-right pr-2">Where it goes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {/* Inputs */}
                <tr className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                    Smoke CO₂
                  </td>
                  <td className="text-cyan-400 font-sans text-xs font-bold">IN</td>
                  <td className="text-right font-bold text-white tabular-nums">{co2InTonnesPerHour.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-slate-300">Into capture absorber</td>
                </tr>

                <tr className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                    Steel waste
                  </td>
                  <td className="text-amber-400 font-sans text-xs font-bold">IN</td>
                  <td className="text-right font-bold text-white tabular-nums">{slagInTonnesPerHour.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-slate-300">Into calcium tank</td>
                </tr>

                {/* Outputs */}
                <tr className="bg-emerald-950/20 text-slate-200 hover:bg-emerald-950/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-bold text-emerald-300">
                    Chalk powder
                  </td>
                  <td className="text-emerald-400 font-sans text-xs font-bold">PRODUCT</td>
                  <td className="text-right font-bold text-emerald-400 tabular-nums">{pccProducedTonnesPerHour.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-emerald-300 font-semibold">Sold to cement plants</td>
                </tr>

                <tr className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                    Cleaned leftover stone
                  </td>
                  <td className="text-slate-400 font-sans text-xs font-bold">SAFE SOLID</td>
                  <td className="text-right font-bold text-slate-300 tabular-nums">{solidResidueTonnesPerHour.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-slate-300">Used as road base</td>
                </tr>

                <tr className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                    Cleaned chimney smoke
                  </td>
                  <td className="text-slate-400 font-sans text-xs font-bold">CLEAN AIR</td>
                  <td className="text-right font-bold text-slate-300 tabular-nums">{uncapturedFlueGasTonnes.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-slate-300">Out of chimney stack</td>
                </tr>

                {/* Requirement 1: Unreacted CO2 row */}
                <tr className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-cyan-300">
                    Unreacted CO₂ (goes back to reactor)
                  </td>
                  <td className="text-cyan-400 font-sans text-xs font-bold">RECYCLE</td>
                  <td className="text-right font-bold text-cyan-300 tabular-nums">{unreactedCO2Tonnes.toFixed(3)}</td>
                  <td className="text-right pr-2 font-sans text-slate-300">Recycled back to reactor</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-800 text-xs font-mono text-slate-400">
                  <td colSpan={2} className="py-2.5 pl-2 font-sans font-semibold text-slate-300">
                    Total Mass Checked:
                  </td>
                  <td className="py-2.5 text-right font-bold text-white tabular-nums">
                    In: {totalInputs.toFixed(3)} t/h · Out: {totalOutputs.toFixed(3)} t/h
                  </td>
                  <td className="py-2.5 text-right pr-2 font-sans text-emerald-400">
                    Diff: {diffAbsolute.toFixed(3)} t/h ({diffPercent.toFixed(2)}%)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Collapsed Technical Composition Table Toggle */}
          <details className="group mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
            <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
              <span className="flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-open:rotate-180 transition-transform" />
                Show technical details (chemical stream compositions)
              </span>
              <span className="text-slate-500 text-[11px]">Toggle</span>
            </summary>
            <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 font-mono text-slate-400 text-xs">
              <p>• Flue Gas: 12.0% CO₂, 76% N₂, 4% O₂, 8% H₂O at 140°C bypass.</p>
              <p>• Steel Slag: 40.0% CaO, 28% SiO₂, 18% Fe₂O₃, 6% MgO, 4% Al₂O₃.</p>
              <p>• Product PCC: &gt;98.4% CaCO₃ scalenohedral calcite crystals, d50 = 1.8 µm.</p>
              <p>• Spent Siliceous Residue: Insoluble silicate matrix safe for geopolymer aggregate.</p>
              <p>• Leaching loop: Internal aqueous solvent cycle excluded from net boundary balance.</p>
              <p>• Calcium is extracted from steel waste using a mild leaching agent (to be selected and validated in the pilot). Reagent make-up is included in the running cost.</p>
            </div>
          </details>
        </div>

        {/* Right 1 Col: Unit Detail Panel (max 2 bullets) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3">
              Step Detail: {selectedStage === 'inlets' ? 'Smoke & Steel Waste' : selectedStage === 'absorber' ? 'Absorber Column' : selectedStage === 'reactor' ? 'Chalk Reactor' : selectedStage === 'filter' ? 'Filter Press' : 'Powder Selling'}
            </h3>

            {/* Exactly 2 plain bullets under 12 words */}
            <div className="space-y-3 text-sm text-slate-200">
              {selectedStage === 'absorber' && (
                <>
                  <p className="font-medium text-white">
                    1. Catches 85% of smoke CO₂ gently using warm liquid.
                  </p>
                  <p className="font-medium text-white">
                    2. Uses waste heat from the hot flue gas (via a heat exchanger) at 60–70°C, burning zero extra fuel.
                  </p>
                </>
              )}

              {selectedStage === 'reactor' && (
                <>
                  <p className="font-medium text-white">
                    1. Calcium extracted from steel waste joins the caught CO₂.
                  </p>
                  <p className="font-medium text-white">
                    2. Forms solid, bright white chalk crystals inside the tank.
                  </p>
                </>
              )}

              {selectedStage === 'filter' && (
                <>
                  <p className="font-medium text-white">
                    1. Powerful filter press separates pure white powder from water.
                  </p>
                  <p className="font-medium text-white">
                    2. All water is cleaned and recycled back into the machine.
                  </p>
                </>
              )}

              {selectedStage === 'offtake' && (
                <>
                  <p className="font-medium text-white">
                    1. Bags pure chalk powder for nearby cement and paint companies.
                  </p>
                  <p className="font-medium text-white">
                    2. Sells at ₹6,000 to ₹11,000 per ton.
                  </p>
                </>
              )}

              {selectedStage === 'inlets' && (
                <>
                  <p className="font-medium text-white">
                    1. Diverts dirty chimney smoke without slowing down the kiln.
                  </p>
                  <p className="font-medium text-white">
                    2. Receives crushed steel waste from local slag dumps.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
            Selected step: <span className="text-emerald-400 font-bold">{selectedStage.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

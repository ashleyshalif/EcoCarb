import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Sliders, 
  Gauge, 
  Droplets, 
  Thermometer, 
  Wind, 
  TrendingDown, 
  ChevronDown,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { formatNumber } from '../lib/calc';
import { useSimulation } from '../lib/useSimulation';

interface LiveProcessTabProps {
  simulation: ReturnType<typeof useSimulation>;
}

export const LiveProcessTab: React.FC<LiveProcessTabProps> = ({ simulation }) => {
  const {
    currentCO2,
    currentPH,
    currentTemp,
    currentDiffPressure,
    dosingActive,
    dosingRate,
    predictedPHIn5Min,
    phTrendSlope,
    disturbanceActive,
    triggerDisturbance,
    resetTelemetry,
    recentReadings,
  } = simulation;

  // Plain status words with color: Good (green) / Watch (amber) / Alert (red)
  const isPhCritical = currentPH < 8.2 || currentPH > 9.8;
  const isPhWarning = currentPH < 8.5 || currentPH > 9.5;
  const phStatus = isPhCritical ? 'Alert' : isPhWarning ? 'Watch' : 'Good';
  const phColor = isPhCritical ? 'text-rose-400 bg-rose-500/20' : isPhWarning ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20';

  const co2Status = disturbanceActive ? 'Watch' : 'Good';
  const co2Color = disturbanceActive ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20';

  const tempStatus = currentTemp > 75 ? 'Watch' : 'Good';
  const tempColor = currentTemp > 75 ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20';

  const pressureStatus = currentDiffPressure > 17 ? 'Watch' : 'Good';
  const pressureColor = currentDiffPressure > 17 ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20';

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>Sensors watch the machine 24x7 and warn us before anything goes wrong.</span>
      </div>

      {/* Control bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  disturbanceActive ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  disturbanceActive ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </span>
              <span className="text-sm font-semibold text-white">
                Live Sensor Readings (checked every 2 seconds)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Machine #01 · Urla Industrial Estate, Raipur
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={triggerDisturbance}
              disabled={disturbanceActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                disturbanceActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Simulate Flue-Gas Disturbance</span>
            </button>
            <button
              type="button"
              onClick={resetTelemetry}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {disturbanceActive && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Test surge active:</strong> Chimney smoke spiked. Auto-fix system is adding buffer now.
              </span>
            </div>
            <span className="font-mono font-bold text-amber-200 ml-2 whitespace-nowrap">Auto-Fixing...</span>
          </div>
        )}
      </div>

      {/* 4 Primary Process Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: CO2 in smoke */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2 font-medium">
            <span>CO₂ in smoke</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between gap-2 my-2">
            <div>
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {formatNumber(currentCO2, 1)}%
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${co2Color}`}>
              {co2Status}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-snug">
            Normal level around 12% in chimney smoke.
          </p>
          <div className="text-xs text-slate-500 mt-2">
            technical: NDIR optical sensor (target 11.5–12.5%)
          </div>
        </div>

        {/* Gauge 2: Tank acidity (pH) */}
        <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-colors ${
          isPhCritical ? 'border-rose-500/80 shadow-lg shadow-rose-900/20' : isPhWarning ? 'border-amber-500/60' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2 font-medium">
            <span>Tank acidity (pH)</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between gap-2 my-2">
            <div>
              <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatNumber(currentPH, 2)}
              </span>
              <span className="text-xs text-slate-400 ml-1">pH</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${phColor}`}>
              {phStatus}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-snug">
            Good: pH must stay between 8.5 and 9.5.
          </p>
          <div className="text-xs text-slate-500 mt-2">
            technical: optimum reaction target is ~8.9 pH
          </div>
        </div>

        {/* Gauge 3: Heating temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2 font-medium">
            <span>Heating temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between gap-2 my-2">
            <div>
              <span className="text-3xl font-bold font-mono text-amber-300 tabular-nums">
                {formatNumber(currentTemp, 1)}°C
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${tempColor}`}>
              {tempStatus}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-snug">
            Runs at 60–70°C using factory waste heat.
          </p>
          <div className="text-xs text-slate-500 mt-2">
            technical: waste heat from the hot flue gas (via a heat exchanger)
          </div>
        </div>

        {/* Gauge 4: Filter pressure */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2 font-medium">
            <span>Filter pressure</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between gap-2 my-2">
            <div>
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {formatNumber(currentDiffPressure, 1)}
              </span>
              <span className="text-xs text-slate-400 ml-1">kPa</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${pressureColor}`}>
              {pressureStatus}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-snug">
            Clean filter, safe flow below 18 kPa.
          </p>
          <div className="text-xs text-slate-500 mt-2">
            technical: packed bed differential pressure
          </div>
        </div>
      </div>

      {/* Auto Fix & Early Warning Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Auto Fix (renamed from Auto-pH Buffer Loop) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Auto Fix</h3>
                  <span className="text-xs text-slate-400">automatic chemical helper</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
                dosingActive 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${dosingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {dosingActive ? 'Working now' : 'On standby'}
              </span>
            </div>

            {/* ONE line required */}
            <p className="text-sm text-slate-200 font-medium mt-2 leading-relaxed">
              Adds a chemical automatically if acidity drifts.
            </p>

            {/* Collapsed Technical Details Toggle */}
            <details className="group mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
              <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                <span className="flex items-center gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-open:rotate-180 transition-transform" />
                  Show technical details
                </span>
                <span className="text-slate-500 text-[11px]">Toggle</span>
              </summary>
              <div className="mt-3 pt-2 border-t border-slate-800 space-y-2 font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Pump Rate:</span>
                  <span className="text-white font-bold">{dosingActive ? `${dosingRate} ml/min` : '0 ml/min'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chemical Reagent:</span>
                  <span className="text-emerald-400">Alkaline Slag Leachate (Ca(OH)₂)</span>
                </div>
                <div className="flex justify-between">
                  <span>Reservoir Volume:</span>
                  <span className="text-slate-300">84% (420 L / 500 L)</span>
                </div>
                <div className="flex justify-between">
                  <span>Control Algorithm:</span>
                  <span className="text-cyan-400">Adaptive Feed-Forward PID</span>
                </div>
              </div>
            </details>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Responds in under 5 seconds to keep the chalk pure.</span>
          </div>
        </div>

        {/* Center & Right: Early Warning (renamed from AI pH Drift Predictor) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Early Warning</h3>
                  <span className="text-xs text-slate-400">looks ahead 5 minutes</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Forecast in 5 min:</span>
                <span className={`font-mono font-bold text-sm ml-2 ${
                  predictedPHIn5Min < 8.5 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {formatNumber(predictedPHIn5Min, 2)} pH
                </span>
              </div>
            </div>

            {/* ONE line required */}
            <div className={`p-3.5 rounded-xl border text-sm font-medium ${
              predictedPHIn5Min < 8.5
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {predictedPHIn5Min < 8.5 ? (
                  <TrendingDown className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <span>
                  {predictedPHIn5Min < 8.5
                    ? 'Watch: Smoke surge detected, system fixing it now.'
                    : 'All normal. No problem expected in next 5 minutes.'}
                </span>
              </div>
            </div>

            {/* Real-time Multi-Parameter Live Chart */}
            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="timeLabel" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    interval={3}
                  />
                  <YAxis 
                    yAxisId="ph" 
                    stroke="#10b981" 
                    domain={[7.5, 10.0]} 
                    fontSize={10} 
                    tickLine={false}
                    unit=" pH"
                  />
                  <YAxis 
                    yAxisId="co2" 
                    orientation="right" 
                    stroke="#06b6d4" 
                    domain={[8, 18]} 
                    fontSize={10} 
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'Tank acidity' ? `${val} pH` : `${val}%`,
                      name
                    ]}
                  />
                  <ReferenceLine yAxisId="ph" y={8.5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Safe low 8.5', fill: '#eab308', fontSize: 10 }} />
                  <ReferenceLine yAxisId="ph" y={9.5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Safe high 9.5', fill: '#eab308', fontSize: 10 }} />
                  <Line 
                    yAxisId="ph" 
                    type="monotone" 
                    dataKey="reactorPH" 
                    name="Tank acidity" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    dot={false} 
                  />
                  <Line 
                    yAxisId="co2" 
                    type="monotone" 
                    dataKey="flueGasCO2" 
                    name="Smoke CO₂" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3 gap-2">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-1 bg-emerald-500 rounded" />
              Green line: Tank acidity (pH must stay 8.5–9.5)
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-1 bg-cyan-400 rounded" />
              Cyan line: Smoke CO₂ %
            </span>
            <span className="text-slate-500 font-mono">Live 30-sec sensor feed</span>
          </div>
        </div>
      </div>

      {/* System Event Logs: Keep 2 items, one plain sentence each */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Safety and Status Log
        </h3>
        <div className="space-y-2.5">
          {disturbanceActive ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-sm text-slate-200">
              <span>Smoke surge detected: auto-fix system added liquid to protect the powder.</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold font-mono uppercase bg-amber-500/20 text-amber-300">
                Watch
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-sm text-slate-200">
              <span>Auto-fix system is running normally at 65°C.</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold font-mono uppercase bg-emerald-500/20 text-emerald-300">
                Good
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-sm text-slate-200">
            <span>Machine is heated safely at 60–70°C by waste heat from the hot flue gas (via a heat exchanger).</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold font-mono uppercase bg-emerald-500/20 text-emerald-300">
              Good
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

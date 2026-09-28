import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { computeSkid, DEFAULT_SKID_PARAMS, SkidOutputs } from './calc';

export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string;
  flueGasCO2: number; // % (e.g. 12.0)
  reactorPH: number; // pH (target 8.5 - 9.5)
  temperature: number; // °C (60 - 70)
  differentialPressure: number; // kPa (12 - 16)
  captureEfficiency: number; // % (approx 85%)
  pccYieldRate: number; // kg/h
  dosingRateMlMin: number; // ml/min of alkaline buffer
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  predictedImpact?: string;
  suggestedAction?: string;
}

export function useSimulation() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(0);

  // Single source of truth baseline
  const defaultSkid = useMemo(() => computeSkid(DEFAULT_SKID_PARAMS), []);

  // Disturbance simulation state
  const [disturbanceActive, setDisturbanceActive] = useState<boolean>(false);
  const disturbanceStepRef = useRef<number>(0);

  // Live telemetry state (showing nominal 85% efficiency, 12% CO2)
  const [currentCO2, setCurrentCO2] = useState<number>(12.0);
  const [currentPH, setCurrentPH] = useState<number>(8.92);
  const [currentTemp, setCurrentTemp] = useState<number>(65.2);
  const [currentDiffPressure, setCurrentDiffPressure] = useState<number>(14.2);
  const [captureEfficiency, setCaptureEfficiency] = useState<number>(85.0);
  const [dosingActive, setDosingActive] = useState<boolean>(false);
  const [dosingRate, setDosingRate] = useState<number>(120); // ml/min

  // AI pH prediction state
  const [predictedPHIn5Min, setPredictedPHIn5Min] = useState<number>(8.90);
  const [phTrendSlope, setPhTrendSlope] = useState<number>(-0.01);

  // Rolling telemetry history for live charts
  const [recentReadings, setRecentReadings] = useState<TelemetryPoint[]>(() => {
    const initial: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * 2000);
      initial.push({
        timestamp: t.toISOString(),
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        flueGasCO2: Number((12.0 + (Math.sin(i * 0.4) * 0.2)).toFixed(2)),
        reactorPH: Number((8.92 + (Math.cos(i * 0.3) * 0.08)).toFixed(2)),
        temperature: Number((65.0 + (Math.sin(i * 0.2) * 0.8)).toFixed(1)),
        differentialPressure: Number((14.1 + (Math.cos(i * 0.5) * 0.2)).toFixed(2)),
        captureEfficiency: Number((85.0 + (Math.sin(i * 0.3) * 0.5)).toFixed(1)),
        pccYieldRate: Math.round(defaultSkid.pcc_th * 1000 + Math.sin(i * 0.4) * 20),
        dosingRateMlMin: 120,
      });
    }
    return initial;
  });

  // 24h history for Overview line chart where sums EXACTLY match the 24 hourly points
  const [hourly24hData] = useState(() => {
    const list = [];
    const baseHour = new Date().getHours();
    // Diurnal weights summing to 24
    const weights: number[] = [];
    let weightSum = 0;
    for (let h = 23; h >= 0; h--) {
      const hourNum = (baseHour - h + 24) % 24;
      const w = 0.92 + 0.16 * Math.sin((hourNum - 6) * (Math.PI / 12));
      weights.push(w);
      weightSum += w;
    }

    // Allocate exact daily_co2 (~14.52) and daily_pcc (~29.72) across 24 points
    let co2Allocated = 0;
    let pccAllocated = 0;

    for (let i = 0; i < 24; i++) {
      const h = 23 - i;
      const hourNum = (baseHour - h + 24) % 24;
      const label = `${hourNum.toString().padStart(2, '0')}:00`;
      const normalizedWeight = weights[i] / weightSum;

      let co2Val: number;
      let pccVal: number;

      if (i === 23) {
        // Last point absorbs rounding difference so exact sum equals daily_co2 and daily_pcc
        co2Val = Number((defaultSkid.daily_co2 - co2Allocated).toFixed(2));
        pccVal = Number((defaultSkid.daily_pcc - pccAllocated).toFixed(2));
      } else {
        co2Val = Number((defaultSkid.daily_co2 * normalizedWeight).toFixed(2));
        pccVal = Number((defaultSkid.daily_pcc * normalizedWeight).toFixed(2));
        co2Allocated += co2Val;
        pccAllocated += pccVal;
      }

      const efficiency = Number((85.0 + (Math.sin(hourNum * 0.5) * 0.8)).toFixed(1));
      list.push({
        hour: label,
        co2Captured: co2Val,
        pccProduced: pccVal,
        efficiency,
      });
    }
    return list;
  });

  // System alerts list
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert-init',
      timestamp: 'Just now',
      severity: 'info',
      title: 'Auto-pH Buffer Loop Engaged',
      message: 'Amino-acid promoter stream (L-arginine promoted K₂CO₃) in steady-state equilibrium at 65°C.',
      suggestedAction: 'No intervention required. AI drift monitoring nominal.',
    },
    {
      id: 'alert-regen',
      timestamp: '12m ago',
      severity: 'success',
      title: 'Waste Heat Recovery Stable',
      message: 'Desorber operating at 60–70°C on waste heat from the hot flue gas (via a heat exchanger). Zero auxiliary fuel burned.',
    },
  ]);

  // Elapsed hours today for scaling default values with slight natural variance
  const elapsedHoursToday = useMemo(() => {
    const d = new Date();
    const hrs = d.getHours() + d.getMinutes() / 60;
    return Math.max(4.0, hrs);
  }, []);

  // Cumulative metrics today = defaults scaled by elapsed hours with tiny noise
  const [co2CapturedTodayTonnes, setCo2CapturedTodayTonnes] = useState<number>(() => {
    return Number((defaultSkid.captured_th * elapsedHoursToday * 0.995).toFixed(2));
  });
  const [pccProducedTodayTonnes, setPccProducedTodayTonnes] = useState<number>(() => {
    return Number((defaultSkid.pcc_th * elapsedHoursToday * 0.995).toFixed(2));
  });

  // Trigger disturbance
  const triggerDisturbance = useCallback(() => {
    setDisturbanceActive(true);
    disturbanceStepRef.current = 1;

    setAlerts((prev) => [
      {
        id: `disturb-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'alert',
        title: '⚠️ Flue-Gas Acid Surge Detected (CO₂ Spike to 14.8%)',
        message: 'Sudden kilning fluctuation injected higher acidic load into absorber column. Reactor pH falling rapidly.',
        predictedImpact: 'Forecasted drift to pH 7.64 within 180s without compensation. Mineralization yield risked.',
        suggestedAction: 'Auto-pH buffer loop engaging high-rate dosing (+350 ml/min alkaline buffer).',
      },
      ...prev.slice(0, 7),
    ]);
  }, []);

  const resetTelemetry = useCallback(() => {
    setDisturbanceActive(false);
    disturbanceStepRef.current = 0;
    setCurrentCO2(12.0);
    setCurrentPH(8.92);
    setCurrentTemp(65.2);
    setCurrentDiffPressure(14.2);
    setCaptureEfficiency(85.0);
    setDosingActive(false);
    setDosingRate(120);
    setPredictedPHIn5Min(8.90);
  }, []);

  // Main simulation tick effect (every 2 seconds)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);

      // Handle disturbance sequence if active
      if (disturbanceActive) {
        disturbanceStepRef.current += 1;
        const step = disturbanceStepRef.current;

        if (step <= 5) {
          // Surge phase: CO2 jumps, pH drops, DP rises slightly
          const driftCo2 = Number((14.5 + Math.random() * 0.3).toFixed(2));
          const droppingPH = Number((8.92 - (step * 0.22)).toFixed(2));
          setCurrentCO2(driftCo2);
          setCurrentPH(Math.max(7.82, droppingPH));
          setCurrentDiffPressure(15.8);
          setCaptureEfficiency(80.5);
          setPredictedPHIn5Min(Number((droppingPH - 0.45).toFixed(2)));
          setPhTrendSlope(-0.18);
          setDosingActive(true);
          setDosingRate(480); // High dosing activated
        } else if (step <= 12) {
          // Counteraction phase: Auto-pH buffer loop pump actively dosing
          const recoveringPH = Number((7.82 + ((step - 5) * 0.16)).toFixed(2));
          setCurrentCO2(Number((12.5 + Math.random() * 0.3).toFixed(2)));
          setCurrentPH(Math.min(8.92, recoveringPH));
          setPredictedPHIn5Min(Number((recoveringPH + 0.15).toFixed(2)));
          setPhTrendSlope(0.12);
          setDosingActive(true);
          setDosingRate(360);
        } else if (step === 13) {
          // Stabilized
          setCurrentCO2(12.0);
          setCurrentPH(8.92);
          setCaptureEfficiency(85.0);
          setCurrentDiffPressure(14.2);
          setDosingActive(false);
          setDosingRate(120);
          setPredictedPHIn5Min(8.91);
          setPhTrendSlope(0.00);
          setDisturbanceActive(false);

          setAlerts((prev) => [
            {
              id: `resolved-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              severity: 'success',
              title: 'Auto-pH Buffer Compensation Complete',
              message: 'Reactor pH restored to target band (8.92 pH). Flue-gas flow normalized. Dosing returned to maintenance baseline.',
              suggestedAction: 'System in optimal steady-state.',
            },
            ...prev.slice(0, 7),
          ]);
        }
      } else {
        // Normal stochastic fluctuation around nominal 85% efficiency & 12% CO2
        const noiseCO2 = (Math.random() - 0.5) * 0.2;
        const noisePH = (Math.random() - 0.5) * 0.04;
        const noiseTemp = (Math.random() - 0.5) * 0.3;
        const noiseDP = (Math.random() - 0.5) * 0.1;
        const noiseEff = (Math.random() - 0.5) * 0.4;

        const newCO2 = Number((12.0 + noiseCO2).toFixed(2));
        const newPH = Number((8.92 + noisePH).toFixed(2));
        const newTemp = Number((65.2 + noiseTemp).toFixed(1));
        const newDP = Number((14.2 + noiseDP).toFixed(2));
        const newEff = Number((85.0 + noiseEff).toFixed(1));

        setCurrentCO2(newCO2);
        setCurrentPH(newPH);
        setCurrentTemp(newTemp);
        setCurrentDiffPressure(newDP);
        setCaptureEfficiency(newEff);

        // Linear forecast 5 min out
        const predicted = Number((newPH + (noisePH * 1.5)).toFixed(2));
        setPredictedPHIn5Min(predicted);
        setPhTrendSlope(Number((noisePH * 0.3).toFixed(3)));

        // Micro dosing pulses if pH drifts near 8.75 or 9.25
        const needsPulse = newPH < 8.75 || newPH > 9.25;
        setDosingActive(needsPulse);
        setDosingRate(needsPulse ? 240 : 110);
      }

      // Increment counters in real-time
      setCo2CapturedTodayTonnes((prev) => Number((prev + defaultSkid.captured_th * (2 / 3600)).toFixed(4)));
      setPccProducedTodayTonnes((prev) => Number((prev + defaultSkid.pcc_th * (2 / 3600)).toFixed(4)));

      // Add to rolling history
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setRecentReadings((prev) => {
        const next = [
          ...prev.slice(1),
          {
            timestamp: now.toISOString(),
            timeLabel,
            flueGasCO2: currentCO2,
            reactorPH: currentPH,
            temperature: currentTemp,
            differentialPressure: currentDiffPressure,
            captureEfficiency,
            pccYieldRate: Math.round(defaultSkid.pcc_th * 1000 + (currentPH - 8.5) * 40),
            dosingRateMlMin: dosingRate,
          },
        ];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    disturbanceActive,
    currentCO2,
    currentPH,
    currentTemp,
    currentDiffPressure,
    captureEfficiency,
    dosingRate,
    defaultSkid,
  ]);

  return {
    isRunning,
    setIsRunning,
    tick,
    currentCO2,
    currentPH,
    currentTemp,
    currentDiffPressure,
    captureEfficiency,
    dosingActive,
    dosingRate,
    predictedPHIn5Min,
    phTrendSlope,
    disturbanceActive,
    triggerDisturbance,
    resetTelemetry,
    recentReadings,
    hourly24hData,
    alerts,
    co2CapturedTodayTonnes,
    pccProducedTodayTonnes,
    defaultSkid,
  };
}


/**
 * EcoCarb Formula & Calculation Engine
 * Team Carbon Mod - NIT Raipur Watt's Next Ideathon
 * Carbon Capture and Climate Mitigation (PS8)
 */

export interface SkidParams {
  flowRate: number; // Nm3/h flue gas (default 3000)
  co2VolumePercent: number; // % CO2 in flue gas (default 12)
  captureEfficiency: number; // % capture efficiency (default 85)
  carbonationConversion: number; // % carbonation conversion (default 90)
  operatingHoursPerDay: number; // hours/day (default 24)
  operatingDaysPerYear: number; // days/year (default 330 standard industrial uptime)
  slagCaoContent: number; // % CaO in slag (default 40)
  caLeachingEfficiency: number; // % Ca leaching efficiency (default 60)
  pccPricePerTonne: number; // INR/tonne PCC (default 6000: base case; 11000: optimistic)
  carbonCreditPricePerTonne: number; // INR/tonne CO2 (default 1200)
  slagTippingFeePerTonne: number; // INR/tonne slag diverted (default 0: upside unverified)
  skidCapexCr: number; // Skid CapEx in INR Crores (default 3.0 Cr)
  opexPerTonneCO2: number; // OpEx INR per tonne CO2 captured (default 4500)
}

export const DEFAULT_SKID_PARAMS: SkidParams = {
  flowRate: 3000,
  co2VolumePercent: 12,
  captureEfficiency: 85,
  carbonationConversion: 90,
  operatingHoursPerDay: 24,
  operatingDaysPerYear: 330,
  slagCaoContent: 40,
  caLeachingEfficiency: 60,
  pccPricePerTonne: 6000, // Base case: ₹6,000/t (illustrative placeholder, to be validated in pilot)
  carbonCreditPricePerTonne: 1200,
  slagTippingFeePerTonne: 0, // Default ₹0: upside, unverified (illustrative placeholder)
  skidCapexCr: 3.0, // Default ₹3.0 Cr (illustrative placeholder, to be validated in pilot)
  opexPerTonneCO2: 4500, // Default ₹4,500/t CO2 (slag leaching, filtration, PCC purification, solvent make-up, power, labor, logistics)
};

export interface SkidOutputs {
  // Hourly rates (t/h)
  co2_th: number; // CO2 in flue gas (t/h)
  captured_th: number; // Captured CO2 (t/h)
  pcc_th: number; // PCC produced (t/h)
  slag_th: number; // Slag required (t/h)

  // Daily totals
  daily_co2: number; // tonnes/day
  daily_pcc: number; // tonnes/day
  daily_slag: number; // tonnes/day

  // Annual totals (all using operatingDaysPerYear = 330)
  annual_co2: number; // tonnes/year
  annual_pcc: number; // tonnes/year
  annual_slag: number; // tonnes/year

  // Daily revenue per stream (INR/day)
  daily_pcc_revenue: number;
  daily_credit_revenue: number;
  daily_slag_tipping_revenue: number;
  daily_total_revenue: number;

  // Annual revenue per stream (INR/year)
  annual_pcc_revenue: number;
  annual_credit_revenue: number;
  annual_slag_tipping_revenue: number;
  annual_total_revenue: number;

  // Percentage revenue shares (computed)
  pcc_revenue_share_pct: number;
  credit_revenue_share_pct: number;
  slag_tipping_share_pct: number;

  // Financial metrics
  capex_inr: number; // total CapEx (INR)
  annual_opex: number; // annual OpEx (INR)
  annual_net_cash: number; // annual net cash flow (INR)
  payback: number; // payback period in years
  payback_months: number; // payback period in months
  payback_range_3k_11k: { min: number; max: number }; // computed payback range across PCC 3000 - 11000
  breakeven_pcc_price: number; // INR/tonne PCC to reach zero net cash
  breakeven_pcc_label: string; // Formatted or "PCC not required to cover OpEx"
  max_affordable_capex_3yr: number; // 3 x annual net cash (INR)

  // Energy & comparison metrics
  energy_saved_percent: number;
  amine_thermal_duty_gj: number;
  ecocarb_thermal_duty_gj: number;
}

/**
 * SINGLE SOURCE OF TRUTH calculation function: computeSkid(params)
 * Used across Overview, Live Process, Waste Coupling, Economics, Simulator, and Scalability.
 */
export function computeSkid(params: Partial<SkidParams> = {}): SkidOutputs {
  const p: SkidParams = { ...DEFAULT_SKID_PARAMS, ...params };

  const co2Fraction = Math.max(0, p.co2VolumePercent) / 100;
  const captureFraction = Math.max(0, p.captureEfficiency) / 100;
  const convFraction = Math.max(0, p.carbonationConversion) / 100;
  const caoFraction = Math.max(0.01, p.slagCaoContent) / 100;
  const leachFraction = Math.max(0.01, p.caLeachingEfficiency) / 100;

  // 1. CO2 in flue gas: flow x (vol% / 100) x 1.977 / 1000
  // Default: 3000 x 0.12 x 1.977 / 1000 = 0.71172 t/h (~0.712 t/h)
  const co2_th = (p.flowRate * co2Fraction * 1.977) / 1000;

  // 2. Captured CO2: CO2 x captureEfficiency
  // Default: 0.71172 x 0.85 = 0.604962 t/h (~0.605 t/h)
  const captured_th = co2_th * captureFraction;

  // 3. PCC produced: captured x (100.09 / 44.01) x carbonationConversion
  // Default: 0.604962 x 2.27425585 x 0.90 = 1.23826 t/h
  const pcc_th = captured_th * (100.09 / 44.01) * convFraction;

  // 4. Slag required: PCC x 0.5603 / (CaO fraction x leaching fraction)
  // Default: 1.23826 x 0.5603 / (0.40 x 0.60) = 2.89088 t/h
  const slag_th = (pcc_th * 0.5603) / (caoFraction * leachFraction);

  // Daily outputs
  // Default: 0.604962 * 24 = 14.519 t/day (~14.5 t/day)
  const daily_co2 = captured_th * p.operatingHoursPerDay;
  // Default: 1.23826 * 24 = 29.718 t/day (~29.7 t/day)
  const daily_pcc = pcc_th * p.operatingHoursPerDay;
  // Default: 2.89088 * 24 = 69.38 t/day (~69 t/day)
  const daily_slag = slag_th * p.operatingHoursPerDay;

  // Annual outputs using operatingDaysPerYear for ALL annual calculations
  const annual_co2 = daily_co2 * p.operatingDaysPerYear;
  const annual_pcc = daily_pcc * p.operatingDaysPerYear;
  const annual_slag = daily_slag * p.operatingDaysPerYear;

  // Revenue streams (exactly three)
  // Stream 1: PCC sales
  const daily_pcc_revenue = daily_pcc * p.pccPricePerTonne;
  const annual_pcc_revenue = annual_pcc * p.pccPricePerTonne;

  // Stream 2: Carbon credits
  const daily_credit_revenue = daily_co2 * p.carbonCreditPricePerTonne;
  const annual_credit_revenue = annual_co2 * p.carbonCreditPricePerTonne;

  // Stream 3: Slag tipping fee (diverted solid waste)
  const daily_slag_tipping_revenue = daily_slag * p.slagTippingFeePerTonne;
  const annual_slag_tipping_revenue = annual_slag * p.slagTippingFeePerTonne;

  const daily_total_revenue =
    daily_pcc_revenue + daily_credit_revenue + daily_slag_tipping_revenue;
  const annual_total_revenue =
    annual_pcc_revenue + annual_credit_revenue + annual_slag_tipping_revenue;

  // Shares
  const pcc_revenue_share_pct =
    annual_total_revenue > 0
      ? (annual_pcc_revenue / annual_total_revenue) * 100
      : 0;
  const credit_revenue_share_pct =
    annual_total_revenue > 0
      ? (annual_credit_revenue / annual_total_revenue) * 100
      : 0;
  const slag_tipping_share_pct =
    annual_total_revenue > 0
      ? (annual_slag_tipping_revenue / annual_total_revenue) * 100
      : 0;

  // Financial model
  const capex_inr = p.skidCapexCr * 10000000;
  const annual_opex = annual_co2 * p.opexPerTonneCO2;
  const annual_net_cash = annual_total_revenue - annual_opex;

  const payback =
    annual_net_cash > 0 ? Number((capex_inr / annual_net_cash).toFixed(1)) : 99;
  const payback_months = Math.round(payback * 12);

  // Payback range across PCC Rs 3,000 to 11,000
  const netCashAt3k =
    annual_pcc * 3000 +
    annual_credit_revenue +
    annual_slag_tipping_revenue -
    annual_opex;
  const netCashAt11k =
    annual_pcc * 11000 +
    annual_credit_revenue +
    annual_slag_tipping_revenue -
    annual_opex;

  const paybackAt3k =
    netCashAt3k > 0 ? Number((capex_inr / netCashAt3k).toFixed(1)) : 99;
  const paybackAt11k =
    netCashAt11k > 0 ? Number((capex_inr / netCashAt11k).toFixed(1)) : 99;

  const payback_range_3k_11k = {
    min: Math.min(paybackAt3k, paybackAt11k),
    max: Math.max(paybackAt3k, paybackAt11k),
  };

  // Breakeven PCC price: (Annual OpEx - Credits - Slag Tipping) / Annual PCC
  const nonPccRevenue = annual_credit_revenue + annual_slag_tipping_revenue;
  const rawBreakeven =
    annual_pcc > 0 ? (annual_opex - nonPccRevenue) / annual_pcc : 0;

  const breakeven_pcc_price = Math.round(rawBreakeven);
  const breakeven_pcc_label =
    rawBreakeven <= 0
      ? 'PCC not required to cover OpEx'
      : `${formatINR(breakeven_pcc_price)}/t`;

  // Max affordable CapEx for 3-year payback = 3 x annual net cash
  const max_affordable_capex_3yr = Math.max(0, 3 * annual_net_cash);

  // Thermal energy & savings
  const amine_thermal_duty_gj = 3.8;
  const ecocarb_thermal_duty_gj = 1.32;
  const energy_saved_percent = Math.round(
    ((amine_thermal_duty_gj - ecocarb_thermal_duty_gj) /
      amine_thermal_duty_gj) *
      100
  );

  return {
    co2_th,
    captured_th,
    pcc_th,
    slag_th,
    daily_co2,
    daily_pcc,
    daily_slag,
    annual_co2,
    annual_pcc,
    annual_slag,
    daily_pcc_revenue,
    daily_credit_revenue,
    daily_slag_tipping_revenue,
    daily_total_revenue,
    annual_pcc_revenue,
    annual_credit_revenue,
    annual_slag_tipping_revenue,
    annual_total_revenue,
    pcc_revenue_share_pct,
    credit_revenue_share_pct,
    slag_tipping_share_pct,
    capex_inr,
    annual_opex,
    annual_net_cash,
    payback,
    payback_months,
    payback_range_3k_11k,
    breakeven_pcc_price,
    breakeven_pcc_label,
    max_affordable_capex_3yr,
    energy_saved_percent,
    amine_thermal_duty_gj,
    ecocarb_thermal_duty_gj,
  };
}

/**
 * Currency formatter for Indian Rupees (Lakhs and Crores support)
 */
export function formatINR(val: number, compact = false): string {
  if (isNaN(val)) return '₹0';
  if (compact) {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    if (Math.abs(val) >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumber(val: number, decimals = 1): string {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(val);
}

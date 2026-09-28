import React from 'react';
import { 
  IndianRupee, 
  Layers, 
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { computeSkid, DEFAULT_SKID_PARAMS, formatINR, formatNumber } from '../lib/calc';

export const EconomicsTab: React.FC = () => {
  // Single source of truth calculation for baseline module
  const skid = computeSkid(DEFAULT_SKID_PARAMS);

  const capexLakhs = Number((skid.capex_inr / 100000).toFixed(1)); // 300.0 L (3.0 Cr)
  const netAnnualCashLakhs = Number((skid.annual_net_cash / 100000).toFixed(1)); // 430.3 L

  // 5-Year Cumulative Cash Flow Projection
  const cashFlowData = [
    { year: 'Yr 0 (Install)', annualCashFlow: -capexLakhs, cumulativeCashFlow: -capexLakhs },
    ...[1, 2, 3, 4, 5].map((yr) => {
      return {
        year: `Year ${yr}`,
        annualCashFlow: netAnnualCashLakhs,
        cumulativeCashFlow: Number((-capexLakhs + yr * netAnnualCashLakhs).toFixed(1)),
      };
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Rule 3: Top Green Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm md:text-base font-medium flex items-center gap-2.5 shadow-sm">
        <span className="font-bold text-white whitespace-nowrap">In one line:</span>
        <span>The factory pays nothing. We earn from powder and carbon credits.</span>
      </div>

      {/* Header and 3 Income Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Where the Money Comes From
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Three income streams pay for the machine and create solid profit
            </p>
          </div>
          <span className="text-sm font-mono px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold whitespace-nowrap">
            Yearly income: {formatINR(skid.annual_total_revenue, true)} / machine
          </span>
        </div>

        {/* Three income cards, 2 lines each under 12 words */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Powder sales (91%) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded whitespace-nowrap">
                  STREAM 1 · 91% of income
                </span>
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Chalk powder sales (91%)</h3>
              
              {/* 2 lines only */}
              <div className="pt-1 text-sm text-slate-200 font-medium space-y-1">
                <p>1. ₹6,000 per ton, 9,807 tons a year.</p>
                <p>2. Sold directly to nearby cement and paint plants.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">Yearly sales:</span>
              <span className="font-mono font-bold text-emerald-400 text-base whitespace-nowrap">
                {formatINR(skid.annual_pcc_revenue, true)}
              </span>
            </div>
          </div>

          {/* Card 2: Carbon credits (9%) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded whitespace-nowrap">
                  STREAM 2 · 9% of income
                </span>
                <IndianRupee className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Carbon credits (9%)</h3>
              
              {/* 2 lines only */}
              <div className="pt-1 text-sm text-slate-200 font-medium space-y-1">
                <p>1. ₹1,200 per ton of CO₂ caught.</p>
                <p>2. Earned from certified green credits.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">Yearly credits:</span>
              <span className="font-mono font-bold text-cyan-400 text-base whitespace-nowrap">
                {formatINR(skid.annual_credit_revenue, true)}
              </span>
            </div>
          </div>

          {/* Card 3: Waste fee (0%) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded whitespace-nowrap">
                  STREAM 3 · 0% of income
                </span>
                <Briefcase className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Waste fee (0%)</h3>
              
              {/* 2 lines only */}
              <div className="pt-1 text-sm text-slate-200 font-medium space-y-1">
                <p>1. Possible bonus, not counted yet.</p>
                <p>2. Steel mills may pay us to take slag.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">Default base value:</span>
              <span className="font-mono font-bold text-slate-400 text-base whitespace-nowrap">
                ₹0 (bonus upside)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: Keep only 5 rows, everything else under details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Our method vs old method (amine)
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Why our modular machine beats traditional carbon capture
            </p>
          </div>
          <span className="text-xs text-slate-400">
            For standard 3,000 Nm³/h kiln chimney
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20 border-x border-emerald-500/20">
                  Our Method (EcoCarb)
                </th>
                <th className="py-3 px-4 text-rose-300">
                  Old Method (Liquid Amine)
                </th>
                <th className="py-3 px-4 text-slate-300">Why It Matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {/* Row 1: Cost to factory */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Cost to factory</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-950/10 border-x border-emerald-500/20 whitespace-nowrap">
                  ₹0 (Zero-cost for factory)
                </td>
                <td className="py-3.5 px-4 font-mono text-rose-300 whitespace-nowrap">
                  ₹12 – 18 Crores
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  Factory pays nothing; we install and own it
                </td>
              </tr>

              {/* Row 2: Heat needed */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Heat needed</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-950/10 border-x border-emerald-500/20">
                  60 – 70°C (waste heat from the hot flue gas (via a heat exchanger))
                </td>
                <td className="py-3.5 px-4 font-mono text-rose-300 whitespace-nowrap">
                  120 – 140°C (costly fuel)
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  Runs on waste heat from the hot flue gas (via a heat exchanger) at 60–70°C with zero extra fuel
                </td>
              </tr>

              {/* Row 3: Energy use */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Energy use</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-950/10 border-x border-emerald-500/20 whitespace-nowrap">
                  1.32 GJ per ton
                </td>
                <td className="py-3.5 px-4 font-mono text-rose-300 whitespace-nowrap">
                  4.00 GJ per ton
                </td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold whitespace-nowrap">
                  65% less energy used
                </td>
              </tr>

              {/* Row 4: What you get (Keep PCC in table header) */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">What you get (Product)</td>
                <td className="py-3.5 px-4 font-medium text-emerald-300 bg-emerald-950/10 border-x border-emerald-500/20 whitespace-nowrap">
                  Solid chalk powder to sell
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  Compressed gas with nowhere to go
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  Earns profit from day one without pipelines
                </td>
              </tr>

              {/* Row 5: Money-back time with Base case and Estimate grey text */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Money-back time</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-950/10 border-x border-emerald-500/20 whitespace-nowrap">
                  <div>0.7 years (about 8 months)</div>
                  <div className="text-[11px] font-sans font-normal text-slate-300 mt-0.5">
                    Base case: ₹6,000/t powder price
                  </div>
                  <div className="text-[10px] font-sans font-normal text-slate-500 mt-0.5">
                    Estimate. Excludes tax, financing, ramp-up, maintenance.
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                  Never pays back (pure loss)
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  Machine cost is recovered rapidly
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Collapsed Technical Details Toggle for chemical & plant specs */}
        <details className="group mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
          <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
            <span className="flex items-center gap-1.5">
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-open:rotate-180 transition-transform" />
              Show technical details (chemical toxicity, corrosion, and civil works)
            </span>
            <span className="text-slate-500 text-[11px]">Toggle</span>
          </summary>
          <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 font-mono text-slate-400 text-xs">
            <p>• Chemical safety: EcoCarb uses food-grade potassium carbonate + amino acid. Old amine degrades into toxic nitrosamines.</p>
            <p>• Steel waste utilization: EcoCarb consumes ~{formatNumber(skid.daily_slag, 1)} tons/day ({Math.round(skid.annual_slag).toLocaleString('en-IN')} t/year) BOF slag per machine. Amine uses zero solid waste.</p>
            <p>• Installation time: 7 days plug-and-play ISO container. Amine requires 9–14 months heavy civil works.</p>
          </div>
        </details>
      </div>

      {/* Cumulative Cash-Flow Chart & Payback Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              5-Year Profit Trajectory
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Machine cost is fully recovered in about 8 months (Month {skid.payback_months})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Total profit in bank (₹ Lakhs)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
              Yearly cash earned
            </span>
          </div>
        </div>

        {/* Bug fix: YAxis tickFormatter cleaned up, no duplicate unit=" L" */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#475569" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(val) => `₹${val} L`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  `₹${val} Lakhs`,
                  name === 'Total profit' ? 'Total profit' : 'Yearly profit'
                ]}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="2 2" />
              <Bar dataKey="annualCashFlow" fill="#334155" radius={[4, 4, 0, 0]} name="Yearly profit" />
              <Line 
                type="monotone" 
                dataKey="cumulativeCashFlow" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#090d16' }}
                activeDot={{ r: 7 }}
                name="Total profit" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Mandatory line under chart */}
        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-sm font-semibold text-emerald-300">
          Machine cost ₹3.0 Cr is recovered in about 8 months.
        </div>

        {/* 3 Summary Cards */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Machine cost</div>
            <div className="text-base font-bold font-mono text-white mt-1">₹3.0 Cr</div>
            <div className="text-xs text-emerald-400 mt-0.5">Zero-cost for client factory</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Money-back time</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-1">
              0.7 yrs (about 8 months)
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">
              Base case: ₹6,000/t (range 0.3–2.2 yrs)
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
              Estimate. Excludes tax, financing, ramp-up, maintenance.
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Yearly profit</div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-1">
              ₹4.30 Cr / year
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              (5-year total profit: ₹18.5 Cr)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

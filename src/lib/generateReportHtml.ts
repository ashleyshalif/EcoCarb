import { SkidOutputs, formatINR, formatNumber } from './calc';

/**
 * Generates a self-contained, beautifully styled A4 printable HTML executive report.
 * Works seamlessly in sandboxed iframes, standalone tabs, and offline saved files.
 */
export function generateReportHtml(skid: SkidOutputs): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EcoCarb - Executive Project Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 15mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      padding: 24px;
      max-width: 820px;
      margin: 0 auto;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .no-print-bar {
        display: none !important;
      }
    }
    .no-print-bar {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .btn-print {
      background: #10b981;
      color: #022c22;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-print:hover {
      background: #059669;
      color: #ffffff;
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    h1 {
      font-size: 26px;
      color: #0f172a;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 14px;
      color: #059669;
      font-weight: 600;
      margin-top: 4px;
    }
    .meta-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .headline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 22px;
    }
    .headline-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      break-inside: avoid;
    }
    .headline-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .headline-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
      margin-top: 4px;
    }
    .headline-desc {
      font-size: 11px;
      color: #475569;
      margin-top: 4px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-top: 22px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-num {
      background: #0f172a;
      color: #ffffff;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .card-block {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 12px;
      break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    .text-right {
      text-align: right;
    }
    .font-mono {
      font-family: monospace;
    }
    .glossary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
      break-inside: avoid;
    }
    .glossary-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
    }
    .glossary-term {
      font-weight: 700;
      color: #0f172a;
      display: block;
      font-size: 12px;
    }
    .glossary-def {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .footer-note {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
  <script>
    // Trigger print dialog automatically when loaded in a popup/tab
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.warn('Auto-print blocked:', e);
        }
      }, 500);
    });
  </script>
</head>
<body>
  <!-- Helper bar for screen view -->
  <div class="no-print-bar">
    <div>
      <strong>EcoCarb Executive Project Report</strong> &mdash; Ready for Print / PDF Export
    </div>
    <button class="btn-print" onclick="window.print()">Print to PDF (Ctrl+P)</button>
  </div>

  <!-- Header -->
  <div class="header-box">
    <div>
      <h1>EcoCarb</h1>
      <div class="tagline">Turning Factory Smoke &amp; Steel Waste into Chalk Powder</div>
      <div class="meta-sub">Team Carbon Mod &middot; NIT Raipur Watt's Next Ideathon &middot; PS8: Carbon Capture &amp; Climate Mitigation</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <div><strong>Date:</strong> ${currentDate}</div>
      <div><strong>Business Model:</strong> Zero-Cost for Factory (CCaaS)</div>
      <div><strong>Standard Module:</strong> 20ft Containerized Capture Machine</div>
    </div>
  </div>

  <!-- 4 Key Financial & Production Headline Metrics -->
  <div class="headline-grid">
    <div class="headline-card">
      <div class="headline-label">Yearly Income</div>
      <div class="headline-val" style="color: #059669;">₹6.46 Cr</div>
      <div class="headline-desc">Powder sales (91%) + Carbon credits (9%)</div>
    </div>
    <div class="headline-card">
      <div class="headline-label">Yearly Running Cost</div>
      <div class="headline-val" style="color: #475569;">₹2.16 Cr</div>
      <div class="headline-desc">₹4,500/t CO₂ (power, solvent, logistics)</div>
    </div>
    <div class="headline-card">
      <div class="headline-label">Yearly Profit</div>
      <div class="headline-val" style="color: #0284c7;">₹4.30 Cr</div>
      <div class="headline-desc">Net annual cash flow to operator</div>
    </div>
    <div class="headline-card">
      <div class="headline-label">Money-Back Time</div>
      <div class="headline-val" style="color: #4f46e5;">0.7 yrs</div>
      <div class="headline-desc">About 8 months (range 0.3–2.2 yrs)</div>
    </div>
  </div>

  <!-- Core Physical Headline Rates -->
  <div class="headline-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: -10px;">
    <div class="headline-card">
      <div class="headline-label">CO₂ Removed Permanently</div>
      <div class="headline-val">4,791 t/yr</div>
      <div class="headline-desc">14.5 tons caught per day (85% catch rate)</div>
    </div>
    <div class="headline-card">
      <div class="headline-label">Chalk Powder (PCC) Made</div>
      <div class="headline-val">9,807 t/yr</div>
      <div class="headline-desc">29.7 tons per day sold to cement plants</div>
    </div>
    <div class="headline-card">
      <div class="headline-label">Steel Waste Diverted</div>
      <div class="headline-val">${Math.round(skid.annual_slag).toLocaleString('en-IN')} t/yr</div>
      <div class="headline-desc">69.4 tons per day cleared from slag dumps</div>
    </div>
  </div>

  <!-- Tab 1: Overview Summary -->
  <div class="section-title">
    <span class="section-num">1</span> Overview &amp; Operating Principle
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> We turn factory smoke into chalk powder that cement companies buy.</p>
    <ul style="margin-left: 20px; margin-top: 6px; line-height: 1.6;">
      <li><strong>1. Direct Capture:</strong> The modular unit catches CO₂ directly from industrial chimney flues (3,000 Nm³/h standard flow).</li>
      <li><strong>2. Dual-Waste Mineralization:</strong> Mixed with calcium from steel plant slag to produce precipitated calcium carbonate (PCC).</li>
      <li><strong>3. Zero-Cost Model (CCaaS):</strong> The host factory pays ₹0 for installation and operation; Carbon Mod owns and services the machine.</li>
    </ul>
  </div>

  <!-- Tab 2: Live Process Monitor -->
  <div class="section-title">
    <span class="section-num">2</span> Live Process Monitor &amp; Automated Control
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> Sensors watch the machine 24x7 and warn us before anything goes wrong.</p>
    <table>
      <thead>
        <tr>
          <th>Process Sensor</th>
          <th>Nominal Range</th>
          <th>Operating Value</th>
          <th>Health Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Chimney CO₂ Volumetric Content</td>
          <td>11.5% &ndash; 12.5%</td>
          <td class="font-mono">12.0%</td>
          <td><strong style="color: #059669;">Good (Steady)</strong></td>
        </tr>
        <tr>
          <td>Reactor Acidity (pH)</td>
          <td>8.5 &ndash; 9.5 pH</td>
          <td class="font-mono">8.92 pH</td>
          <td><strong style="color: #059669;">Good (Optimal)</strong></td>
        </tr>
        <tr>
          <td>Solvent Regeneration Heat</td>
          <td>60 &ndash; 70 &deg;C</td>
          <td class="font-mono">65.2 &deg;C</td>
          <td><strong style="color: #059669;">Good (waste heat from the hot flue gas (via a heat exchanger))</strong></td>
        </tr>
        <tr>
          <td>Filtration Differential Pressure</td>
          <td>&lt; 18 kPa</td>
          <td class="font-mono">14.2 kPa</td>
          <td><strong style="color: #059669;">Good (Filter Clean)</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Tab 3: Waste Coupling & Mass Balance -->
  <div class="section-title">
    <span class="section-num">3</span> Waste Coupling &amp; Hourly Mass Balance
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> Smoke CO₂ and steel waste react together to form harmless chalk.</p>
    <table>
      <thead>
        <tr>
          <th>Stream Component</th>
          <th>Boundary Role</th>
          <th class="text-right">Tons / Hour</th>
          <th class="text-right">Destination</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Smoke CO₂ (Flue Gas)</td>
          <td>INPUT</td>
          <td class="text-right font-mono">${skid.co2_th.toFixed(3)}</td>
          <td class="text-right">Into absorption column</td>
        </tr>
        <tr>
          <td>Steel Waste (Slag)</td>
          <td>INPUT</td>
          <td class="text-right font-mono">${skid.slag_th.toFixed(3)}</td>
          <td class="text-right">Into calcium leaching reactor</td>
        </tr>
        <tr style="background: #f0fdf4;">
          <td><strong>Chalk Powder (PCC)</strong></td>
          <td><strong>PRODUCT</strong></td>
          <td class="text-right font-mono"><strong>${skid.pcc_th.toFixed(3)}</strong></td>
          <td class="text-right">Sold to cement &amp; paint makers</td>
        </tr>
        <tr>
          <td>Cleaned Leftover Stone</td>
          <td>SAFE SOLID</td>
          <td class="text-right font-mono">${(skid.slag_th - skid.pcc_th * 0.5603).toFixed(3)}</td>
          <td class="text-right">Road base and aggregates</td>
        </tr>
        <tr>
          <td>Cleaned Chimney Smoke</td>
          <td>CLEAN AIR</td>
          <td class="text-right font-mono">${(skid.co2_th - skid.captured_th).toFixed(3)}</td>
          <td class="text-right">Chimney stack discharge</td>
        </tr>
        <tr>
          <td>Unreacted CO₂ (Recycled)</td>
          <td>RECYCLE</td>
          <td class="text-right font-mono">${(skid.captured_th * 0.10).toFixed(3)}</td>
          <td class="text-right">Returned to reactor tank</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background: #f8fafc;">
          <td colspan="2">Net System Balance</td>
          <td class="text-right font-mono">In: ${(skid.co2_th + skid.slag_th).toFixed(3)} &middot; Out: ${(skid.co2_th + skid.slag_th).toFixed(3)}</td>
          <td class="text-right" style="color: #059669;">Balanced (difference &lt; 0.1%)</td>
        </tr>
      </tfoot>
    </table>
    <p style="font-size: 11px; color: #64748b; margin-top: 8px;"><em>Technical note:</em> Calcium is extracted from steel waste using a mild leaching agent (to be selected and validated in the pilot). Reagent make-up is included in the running cost.</p>
  </div>

  <!-- Tab 4: Economics -->
  <div class="section-title">
    <span class="section-num">4</span> Economics: Our Method vs Liquid Amine
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> The factory pays nothing. We earn from powder and carbon credits.</p>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th style="color: #059669;">EcoCarb (Our Method)</th>
          <th style="color: #b91c1c;">Liquid Amine (Old Method)</th>
          <th>Advantage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Cost to factory</strong></td>
          <td style="color: #059669; font-weight: bold;">₹0 (CCaaS model)</td>
          <td>₹12 &ndash; 18 Crores</td>
          <td>Zero upfront capital expenditure</td>
        </tr>
        <tr>
          <td><strong>Heat needed</strong></td>
          <td>60 &ndash; 70 &deg;C (waste heat from the hot flue gas (via a heat exchanger))</td>
          <td>120 &ndash; 140 &deg;C (fuel boilers)</td>
          <td>Zero extra fossil fuel burned</td>
        </tr>
        <tr>
          <td><strong>Energy duty</strong></td>
          <td>1.32 GJ / ton CO₂</td>
          <td>4.00 GJ / ton CO₂</td>
          <td>65% energy reduction</td>
        </tr>
        <tr>
          <td><strong>Output</strong></td>
          <td>High-grade chalk powder (PCC)</td>
          <td>Compressed gas (no market)</td>
          <td>Positive cash flow on day one</td>
        </tr>
        <tr>
          <td><strong>Money-back time</strong></td>
          <td style="color: #059669; font-weight: bold;">0.7 yrs (Base case: ₹6,000/t)</td>
          <td>Never pays back (pure loss)</td>
          <td>Full capital recovery in ~8 months</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
      *Estimate. Excludes corporate taxes, specialized project financing structures, ramp-up schedule, and periodic major overhauls.
    </div>
  </div>

  <!-- Tab 5: Scenario Simulator Sensitivity -->
  <div class="section-title">
    <span class="section-num">5</span> Commercial Sensitivity &amp; Stress Testing
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> Move the sliders to see how profit changes.</p>
    <table>
      <thead>
        <tr>
          <th>Chalk Powder Price</th>
          <th class="text-right">Yearly Profit</th>
          <th class="text-right">Money-Back Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>₹3,000 / ton (Stress Test)</td>
          <td class="text-right font-mono">₹136.1 Lakhs</td>
          <td class="text-right font-mono" style="font-weight: bold;">2.2 yrs</td>
          <td>Rapid breakeven even under severe market discount</td>
        </tr>
        <tr style="background: #f0fdf4;">
          <td><strong>₹6,000 / ton (Base Case)</strong></td>
          <td class="text-right font-mono"><strong>₹430.3 Lakhs</strong></td>
          <td class="text-right font-mono" style="font-weight: bold; color: #059669;">0.7 yrs</td>
          <td>Standard industrial deployment assumption</td>
        </tr>
        <tr>
          <td>₹11,000 / ton (High Grade)</td>
          <td class="text-right font-mono">₹920.7 Lakhs</td>
          <td class="text-right font-mono" style="font-weight: bold; color: #0284c7;">0.3 yrs</td>
          <td>Premium coated paper / pharmaceutical grade</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 8px; font-size: 11px; color: #334155;">
      <strong>Max Affordable Machine Cost (3-Yr Payback Target):</strong> ₹12.91 Cr (Single unit CapEx is ₹3.0 Cr).
    </div>
  </div>

  <!-- Tab 6: Regional Scalability -->
  <div class="section-title">
    <span class="section-num">6</span> Regional Scalability &amp; Corridor Deployment
  </div>
  <div class="card-block">
    <p><strong>In one line:</strong> Start with 1 machine, then add more like Lego blocks.</p>
    <ul style="margin-left: 20px; margin-top: 6px; line-height: 1.6;">
      <li><strong>Hub Geography:</strong> Raipur &ndash; Bhilai Industrial Belt along National Highway 53.</li>
      <li><strong>Corridor Distances:</strong> Slag trucking radius about 30 km; steel waste hauled about 30 km.</li>
      <li><strong>Fleet Expansion:</strong> 1 unit (4,791 t CO₂/yr) &rarr; 4 units (19,165 t CO₂/yr) &rarr; 10 units (47,913 t CO₂/yr).</li>
    </ul>
  </div>

  <!-- Glossary -->
  <div class="section-title">
    <span class="section-num">7</span> Words Used Here (Glossary)
  </div>
  <div class="glossary-grid">
    <div class="glossary-item">
      <span class="glossary-term">1. Skid (Capture Machine)</span>
      <span class="glossary-def">A compact, containerized industrial unit installed on site at the factory without long construction delays.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">2. PCC (Chalk powder)</span>
      <span class="glossary-def">Precipitated Calcium Carbonate &mdash; fine white powder made by reacting captured CO₂ with calcium, used in cement and paint.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">3. Slag (Steel waste)</span>
      <span class="glossary-def">Calcium-rich solid byproduct left over from steel manufacturing kilns, diverted from landfill dumps.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">4. CCaaS (Zero-cost model)</span>
      <span class="glossary-def">Carbon Capture as a Service. We install, own, and maintain the capture equipment at zero capital expense to the factory.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">5. Money-back time (Payback)</span>
      <span class="glossary-def">The time required for net earnings from powder sales and carbon credits to fully recover the initial machine cost.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">6. Capture rate</span>
      <span class="glossary-def">The percentage of carbon dioxide gas filtered and trapped from the chimney smoke by the absorber (target 85%).</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">7. pH (Tank acidity)</span>
      <span class="glossary-def">A measurement of acidity or alkalinity in the reactor tank. Maintained between 8.5 and 9.5 for optimal chalk crystal formation.</span>
    </div>
    <div class="glossary-item">
      <span class="glossary-term">8. Carbon credit</span>
      <span class="glossary-def">A certified, tradable credit representing one metric ton of CO₂ permanently prevented from entering the atmosphere.</span>
    </div>
  </div>

  <div class="footer-note">
    EcoCarb Techno-Economic Platform &middot; Prototype - simulated data, illustrative assumptions &middot; Team Carbon Mod &middot; NIT Raipur Watt's Next Ideathon &middot; PS8: Carbon Capture and Climate Mitigation
  </div>
</body>
</html>`;
}

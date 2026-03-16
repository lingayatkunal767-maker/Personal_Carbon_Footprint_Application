import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const EmissionsBreakdown = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Emissions Breakdown <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>This Week</span></div>
        <div className="card-empty">
          <span>📊</span>
          <p>No emissions data yet</p>
          <small>Log activities to see your breakdown by category</small>
        </div>
      </div>
    );
  }

  const total = breakdown.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const data = {
    labels: breakdown.map((item) => item.label),
    datasets: [{
      data: breakdown.map((item) => Number(item.value || 0)),
      backgroundColor: breakdown.map((item) => item.color),
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} kg CO₂`
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart',
    },
  };

  const legendItems = breakdown.map((item) => ({
    icon: item.icon,
    label: item.label,
    value: `${Number(item.value || 0).toFixed(2)} kg`,
    percent: total > 0 ? ((Number(item.value || 0) / total) * 100).toFixed(1) : '0.0',
    color: item.color
  }));

  return (
    <div className="card breakdown-card">
      <div className="card-title">Emissions Breakdown <span style={{ fontSize: '0.75rem', color: 'var(--g-mid)', fontWeight: 600 }}>This Week</span></div>
      <div className="donut-wrap">
        <div className="donut-canvas-wrap breakdown-shadow">
          <Doughnut data={data} options={options} />
          <div className="donut-center breakdown-center">
            <span className="dc-val breakdown-total">{total.toFixed(1)}<span className="dc-unit"> kg</span></span>
            <span className="dc-lbl breakdown-label">Total CO₂</span>
          </div>
        </div>
        <div className="legend breakdown-legend">
          {legendItems.map((item, index) => (
            <div key={index} className="legend-row breakdown-row">
              <div className="l-dot breakdown-dot" style={{ background: item.color }}></div>
              <span className="l-label breakdown-label">{item.icon} {item.label}</span>
              <span className="l-val breakdown-value">{item.value} <span className="breakdown-percent">({item.percent}%)</span></span>
              <div className="breakdown-bar" style={{ width: `${item.percent}%`, background: item.color, opacity: 0.18, height: '6px', borderRadius: '4px', marginLeft: '8px' }}></div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .breakdown-card { background: linear-gradient(135deg,#f4f2ec 0%,#eef6ef 100%); }
        .breakdown-shadow { box-shadow: 0 6px 28px rgba(45,122,79,0.13); border-radius: 16px; }
        .breakdown-center { font-family: 'Playfair Display',serif; }
        .breakdown-total { font-size: 2.1rem; font-weight: 700; color: #2d7a4f; letter-spacing: -1px; }
        .dc-unit { font-size: 1rem; color: #6b8c72; margin-left: 2px; }
        .breakdown-label { font-size: 0.85rem; color: #6b8c72; font-weight: 600; margin-top: 2px; }
        .breakdown-legend { margin-top: 0.5rem; }
        .breakdown-row { align-items: center; padding: 0.18rem 0; }
        .breakdown-dot { width: 14px; height: 14px; border-radius: 4px; }
        .breakdown-value { font-weight: 600; color: #2d7a4f; font-size: 0.95rem; }
        .breakdown-percent { color: #6b8c72; font-size: 0.85rem; margin-left: 2px; }
        .breakdown-bar { transition: width 1.2s cubic-bezier(.42,0,.58,1); }
      `}</style>
    </div>
  );
};

export default EmissionsBreakdown;

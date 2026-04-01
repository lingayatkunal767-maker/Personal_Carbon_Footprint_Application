import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const EmissionsBreakdown = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="card breakdown-card">
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
      borderColor: '#f6faf6',
      borderWidth: 2,
      hoverOffset: 4
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
        backgroundColor: 'rgba(28,46,33,0.92)',
        titleColor: '#eef6ef',
        bodyColor: '#f7fbf7',
        borderColor: '#5aaa72',
        borderWidth: 1,
        displayColors: false,
        padding: 10,
        cornerRadius: 8,
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
    progress: total > 0 ? Math.max(6, Number(((Number(item.value || 0) / total) * 100).toFixed(1))) : 0,
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
            <span className="dc-lbl breakdown-total-label">Total CO₂</span>
          </div>
        </div>
        <div className="legend breakdown-legend">
          {legendItems.map((item, index) => (
            <div key={index} className="breakdown-item">
              <div className="breakdown-row-top">
                <div className="breakdown-meta">
                  <div className="l-dot breakdown-dot" style={{ background: item.color }}></div>
                  <span className="breakdown-icon">{item.icon}</span>
                  <span className="l-label breakdown-name">{item.label}</span>
                </div>
                <div className="breakdown-metrics">
                  <span className="l-val breakdown-value">{item.value}</span>
                  <span className="breakdown-percent">({item.percent}%)</span>
                </div>
              </div>
              <div className="breakdown-track">
                <div className="breakdown-fill" style={{ width: `${item.progress}%`, background: item.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .breakdown-card { background: linear-gradient(135deg,#f6f3ee 0%,#ecf6ee 100%); }
        .breakdown-shadow { box-shadow: 0 6px 24px rgba(45,122,79,0.14); border-radius: 16px; }
        .breakdown-center { font-family: 'Playfair Display',serif; }
        .breakdown-total { font-size: 2rem; font-weight: 700; color: #245f3f; letter-spacing: -0.8px; }
        .dc-unit { font-size: 1rem; color: #5b7f66; margin-left: 2px; }
        .breakdown-total-label { font-size: 0.86rem; color: #567a62; font-weight: 700; margin-top: 2px; }
        .breakdown-legend { margin-top: 0.4rem; gap: 0.48rem; }
        .breakdown-item { padding: 0.12rem 0; }
        .breakdown-row-top { display: flex; align-items: center; justify-content: space-between; gap: 0.65rem; }
        .breakdown-meta { display: flex; align-items: center; gap: 0.42rem; min-width: 0; }
        .breakdown-icon { font-size: 0.92rem; line-height: 1; }
        .breakdown-name { font-size: 0.95rem; color: #3d6449; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .breakdown-metrics { display: flex; align-items: baseline; gap: 0.3rem; white-space: nowrap; }
        .breakdown-dot { width: 14px; height: 14px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgba(20,50,35,0.12); }
        .breakdown-value { font-weight: 700; color: #245f3f; font-size: 1.05rem; letter-spacing: -0.2px; }
        .breakdown-percent { color: #5f8169; font-size: 0.9rem; font-weight: 600; }
        .breakdown-track { margin-top: 0.34rem; height: 7px; border-radius: 999px; background: rgba(36,95,63,0.15); overflow: hidden; }
        .breakdown-fill { height: 100%; border-radius: inherit; transition: width 1.15s cubic-bezier(.42,0,.58,1); }
      `}</style>
    </div>
  );
};

export default EmissionsBreakdown;

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const EmissionsBreakdown = ({ breakdown }) => {
  const total = breakdown.reduce((sum, item) => sum + item.value, 0);
  const data = {
    labels: breakdown.map((item) => item.label),
    datasets: [{
      data: breakdown.map((item) => item.value),
      backgroundColor: breakdown.map((item) => item.color),
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  const legendItems = breakdown.map((item) => ({
    icon: item.icon,
    label: item.label,
    value: `${Math.round(item.value)} kg`,
    color: item.color
  }));

  return (
    <div className="card">
      <div className="card-title">Emissions Breakdown <a>This Week ▾</a></div>
      <div className="donut-wrap">
        <div className="donut-canvas-wrap">
          <Doughnut data={data} options={options} />
          <div className="donut-center">
            <span className="dc-val">{Math.round(total)}</span>
            <span className="dc-lbl">kg total</span>
          </div>
        </div>
        <div className="legend">
          {legendItems.map((item, index) => (
            <div key={index} className="legend-row">
              <div className="l-dot" style={{ background: item.color }}></div>
              <span className="l-label">{item.icon} {item.label}</span>
              <span className="l-val">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmissionsBreakdown;

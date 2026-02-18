import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const EmissionsBreakdown = () => {
  const data = {
    labels: ['Transport', 'Energy', 'Food', 'Shopping'],
    datasets: [{
      data: [142, 98, 72, 36],
      backgroundColor: ['#2d7a4f', '#5aaa72', '#e8a624', '#4a90d9'],
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

  const legendItems = [
    { icon: '🚗', label: 'Transport', value: '142 kg', color: '#2d7a4f' },
    { icon: '⚡', label: 'Energy', value: '98 kg', color: '#5aaa72' },
    { icon: '🍔', label: 'Food', value: '72 kg', color: '#e8a624' },
    { icon: '🛍️', label: 'Shopping', value: '36 kg', color: '#4a90d9' }
  ];

  return (
    <div className="card">
      <div className="card-title">Emissions Breakdown <a>This Week ▾</a></div>
      <div className="donut-wrap">
        <div className="donut-canvas-wrap">
          <Doughnut data={data} options={options} />
          <div className="donut-center">
            <span className="dc-val">348</span>
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

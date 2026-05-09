import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const CarbonFootprintLog = ({ data, weeklyTotal, trendLabel }) => {
  const [activeTab, setActiveTab] = useState('week');
  const navigate = useNavigate();
  const chartRef = useRef(null);

  const chartData = {
    labels: data[activeTab].labels,
    datasets: [{
      data: data[activeTab].data,
      fill: true,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, 'rgba(90,170,114,.3)');
        gradient.addColorStop(1, 'rgba(90,170,114,.02)');
        return gradient;
      },
      borderColor: '#2d7a4f',
      borderWidth: 2.5,
      pointBackgroundColor: '#2d7a4f',
      pointRadius: 4,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b8c72' } },
      y: { grid: { color: '#e8f0e9' }, ticks: { font: { size: 10 }, color: '#6b8c72' } }
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        Carbon Footprint Log
        <button className="card-action" onClick={() => navigate('/history')}>
          View Full History →
        </button>
      </div>
      <div className="chart-tabs">
        {['week', 'month', 'year'].map(tab => (
          <button
            key={tab}
            className={`ctab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="big-num">{Math.round(weeklyTotal)} <small>kg CO₂e / Week</small></div>
      <div className={`trend-lbl ${trendLabel.includes('▲') ? 'up' : 'dn'}`}>{trendLabel}</div>
      <div className="chart-wrap">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CarbonFootprintLog;

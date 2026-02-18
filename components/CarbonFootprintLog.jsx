import React, { useRef, useState, useEffect } from 'react';
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

const CarbonFootprintLog = () => {
  const [activeTab, setActiveTab] = useState('week');
  const chartRef = useRef(null);

  const datasets = {
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [260, 278, 305, 295, 330, 320, 348] },
    month: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [1100, 1250, 1180, 1380] },
    year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [4200, 4050, 3900, 4100, 3800, 3600, 3700, 3850, 3500, 3400, 3600, 3480] }
  };

  const chartData = {
    labels: datasets[activeTab].labels,
    datasets: [{
      data: datasets[activeTab].data,
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
      <div className="card-title">Carbon Footprint Log <a>View Full History →</a></div>
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
      <div className="big-num">348 <small>kg CO₂e / Week</small></div>
      <div className="trend-lbl up">▲ +12% from last week</div>
      <div className="chart-wrap">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CarbonFootprintLog;

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MonthlyComparison = ({ data }) => {
  const hasData = data && data.labels && data.labels.length > 0 &&
    data.datasets && data.datasets.some(ds => ds.data && ds.data.some(v => v > 0));

  const prevYear = data.prevYear || (new Date().getFullYear() - 1);
  const currentYear = data.currentYear || new Date().getFullYear();
  const titleLabel = `${prevYear} vs ${currentYear}`;

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((dataset) => ({
      ...dataset,
      borderRadius: 6,
      borderSkipped: false
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11 },
          color: '#6b8c72',
          boxWidth: 12,
          padding: 16
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b8c72' } },
      y: { grid: { color: '#e8f0e9' }, ticks: { font: { size: 10 }, color: '#6b8c72' } }
    }
  };

  return (
    <div className="card">
      <div className="card-title">Monthly Comparison <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{titleLabel}</span></div>
      {!hasData ? (
        <div className="card-empty">
          <span>📅</span>
          <p>No monthly data yet</p>
          <small>Log activities over time to see your monthly comparison</small>
        </div>
      ) : (
        <div className="compare-wrap">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default MonthlyComparison;

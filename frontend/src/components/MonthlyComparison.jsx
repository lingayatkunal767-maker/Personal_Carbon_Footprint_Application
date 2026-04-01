import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MonthlyComparison = ({ data }) => {
  const isLargeViewport = typeof window !== 'undefined'
    && window.matchMedia('(min-width: 1600px)').matches;

  const hasData = data && data.labels && data.labels.length > 0 &&
    data.datasets && data.datasets.some(ds => ds.data && ds.data.some(v => v > 0));

  const prevYear = data.prevYear || (new Date().getFullYear() - 1);
  const currentYear = data.currentYear || new Date().getFullYear();
  const titleLabel = `${prevYear} vs ${currentYear}`;

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((dataset) => ({
      ...dataset,
      maxBarThickness: isLargeViewport ? 42 : 28,
      categoryPercentage: 0.72,
      barPercentage: 0.65,
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
          font: { size: isLargeViewport ? 13 : 11 },
          color: '#6b8c72',
          boxWidth: isLargeViewport ? 16 : 12,
          padding: isLargeViewport ? 20 : 16
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: isLargeViewport ? 12 : 10 }, color: '#6b8c72' } },
      y: { grid: { color: '#e8f0e9' }, ticks: { font: { size: isLargeViewport ? 12 : 10 }, color: '#6b8c72' } }
    }
  };

  return (
    <div className="card monthly-card">
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

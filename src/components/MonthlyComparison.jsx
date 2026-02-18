import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MonthlyComparison = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '2024',
        data: [420, 410, 390, 430, 380, 360],
        backgroundColor: '#d4edda',
        borderRadius: 6,
        borderSkipped: false
      },
      {
        label: '2025',
        data: [390, 370, 350, 400, 340, 320],
        backgroundColor: '#2d7a4f',
        borderRadius: 6,
        borderSkipped: false
      }
    ]
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
      <div className="card-title">Monthly Comparison <a>2024 vs 2025</a></div>
      <div className="compare-wrap">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MonthlyComparison;

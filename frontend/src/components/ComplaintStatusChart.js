import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ComplaintStatusChart = ({ complaints }) => {
  const chartRef = useRef(null);

  // Count complaints by status
  const countByStatus = {
    pending: 0,
    'in progress': 0,
    resolved: 0,
    rejected: 0
  };

  // Process the complaints data
  complaints.forEach(complaint => {
    const status = complaint.status?.toLowerCase() || 'pending';
    if (countByStatus.hasOwnProperty(status)) {
      countByStatus[status]++;
    }
  });

  // Chart data
  const data = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [
      {
        data: [
          countByStatus.pending,
          countByStatus['in progress'],
          countByStatus.resolved,
          countByStatus.rejected
        ],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',  // Warning - Pending
          'rgba(13, 110, 253, 0.8)',  // Primary - In Progress
          'rgba(25, 135, 84, 0.8)',   // Success - Resolved
          'rgba(220, 53, 69, 0.8)'    // Danger - Rejected
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(13, 110, 253, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options with 3D effect
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return percentage > 0 ? `${percentage}%` : '';
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        }
      }
    },
    // 3D effect using CSS
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Add 3D effect using CSS after component mounts
  useEffect(() => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      canvas.style.transform = 'perspective(1000px) rotateX(20deg)';
      canvas.style.transition = 'transform 0.5s';
      
      // Add hover effect
      canvas.addEventListener('mouseover', () => {
        canvas.style.transform = 'perspective(1000px) rotateX(10deg) scale(1.05)';
      });
      
      canvas.addEventListener('mouseout', () => {
        canvas.style.transform = 'perspective(1000px) rotateX(20deg)';
      });
    }
  }, []);

  return (
    <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
      <Pie ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default ComplaintStatusChart;

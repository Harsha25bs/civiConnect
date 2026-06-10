import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ComplaintCategoryChart = ({ complaints }) => {
  const chartRef = useRef(null);

  // Count complaints by category
  const categories = {};
  
  // Process the complaints data
  complaints.forEach(complaint => {
    const category = complaint.category?.toLowerCase().replace('_', ' ') || 'other';
    if (categories[category]) {
      categories[category]++;
    } else {
      categories[category] = 1;
    }
  });

  // Sort categories by count (descending)
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Take top 5 categories

  // Prepare labels and data
  const labels = sortedCategories.map(([category]) => 
    category.charAt(0).toUpperCase() + category.slice(1)
  );
  const counts = sortedCategories.map(([, count]) => count);

  // Chart data
  const data = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',   // Success
          'rgba(13, 110, 253, 0.8)',   // Primary
          'rgba(255, 193, 7, 0.8)',    // Warning
          'rgba(220, 53, 69, 0.8)',    // Danger
          'rgba(108, 117, 125, 0.8)',  // Secondary
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(13, 110, 253, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(108, 117, 125, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options with 3D effect
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
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
          return percentage > 5 ? `${percentage}%` : '';
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
      canvas.style.transform = 'perspective(1000px) rotateY(20deg)';
      canvas.style.transition = 'transform 0.5s';
      
      // Add hover effect
      canvas.addEventListener('mouseover', () => {
        canvas.style.transform = 'perspective(1000px) rotateY(10deg) scale(1.05)';
      });
      
      canvas.addEventListener('mouseout', () => {
        canvas.style.transform = 'perspective(1000px) rotateY(20deg)';
      });
    }
  }, []);

  return (
    <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
      <Doughnut ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default ComplaintCategoryChart;

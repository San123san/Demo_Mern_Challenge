import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const months = [
  'Selected month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function Bar() {

  const [selectedMonth, setSelectedMonth] = useState('Selected month');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedMonth === 'Selected month') return;

      setLoading(true);
      try {
        const response = await axios.post('https://demo-mern-challenge.onrender.com', { month: selectedMonth });
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  useEffect(() => {
    if (chartData && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(chartData),
          datasets: [{
            label: 'Number of Items',
            data: Object.values(chartData),
            backgroundColor: 'rgba(0, 51, 102, 0.8)', 
            borderColor: 'rgba(0, 51, 102, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false, 
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: false, 
              },
              title: {
                display: true,
                text: 'Price Ranges',
                font: {
                  size: 18, 
                },
              },
              ticks: {
                font: {
                  size: 14, 
                },
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Items',
                font: {
                  size: 18, 
                },
              },
              ticks: {
                font: {
                  size: 14, 
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16,
                },
              },
            },
            tooltip: {
              titleFont: {
                size: 16, 
              },
              bodyFont: {
                size: 14, 
              },
            },
          },
        },
      });

      chartInstanceRef.current = newChartInstance;
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className='px-32 bg-slate-100 p-3'>
        <div className='flex flex-col items-center p-20 border-2 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.1)]
                 bg-gray-50'>
          <div className='mt-10'>
            <div className='flex justify-center mb-10 text-3xl font-bold bg-fuchsia-500 p-3 rounded-md'> Transactions Bar Chart </div>
               <div className='bg-white p-5 rounded-md min-w-[600px] max-w-[100%]'>
                  <div className='flex justify-center place-items-center'>
                    <div className='font-bold'>Bar Charts stats -</div>
                  <div className='border-2 rounded-md p-1 ml-1'>
                    <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className='p-2 outline-none rounded-full'
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                   </select>
                 </div>
               </div>
            <div className='mt-5'>
              {loading ? <p>Loading...</p> : (
                <div className='relative h-96 w-full'>
                  <canvas
                    ref={chartRef}
                    className='absolute top-0 left-0 w-full h-full'
                  ></canvas>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
    </div>
    
  )
}

export default Bar
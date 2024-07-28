import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const months = [
  'Selected month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

function Bar() {

  const [selectedMonth, setSelectedMonth] = useState('Selected month');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null); // Reference to the canvas element
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedMonth === 'Selected month') return;

      setLoading(true);
      try {
        const response = await axios.post('/api/v1/transactional/bar_chart', { month: selectedMonth });
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

      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(chartData),
          datasets: [{
            label: 'Number of Items',
            data: Object.values(chartData),
            backgroundColor: 'rgba(0, 51, 102, 0.8)', // Dark blue color with some transparency
            borderColor: 'rgba(0, 51, 102, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true, // Ensures the chart resizes with its container
          maintainAspectRatio: false, // Allows the chart to fill its container without maintaining aspect ratio
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: false, // Hide vertical grid lines
              },
              title: {
                display: true,
                text: 'Price Ranges',
                font: {
                  size: 18, // Font size for x-axis title
                },
              },
              ticks: {
                font: {
                  size: 14, // Font size for x-axis tick labels
                },
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Items',
                font: {
                  size: 18, // Font size for y-axis title
                },
              },
              ticks: {
                font: {
                  size: 14, // Font size for y-axis tick labels
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16, // Font size for legend labels
                },
              },
            },
            tooltip: {
              titleFont: {
                size: 16, // Font size for tooltip title
              },
              bodyFont: {
                size: 14, // Font size for tooltip body
              },
            },
          },
        },
      });

      // Store the new chart instance in the ref
      chartInstanceRef.current = newChartInstance;
    }

    // Cleanup function to destroy the chart instance when the component unmounts or chartData changes
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


// import React, { useState, useRef, useEffect } from 'react'
// import axios from 'axios'

// const months = [
//   'Selected month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
// ];

// function Bar() {

//   const [selectedMonth, setSelectedMonth] = useState('Selected month');
//   const [chartData, setChartData] = useState({});
//   const chartRef = useRef(null);
//   const chartInstance = useRef(null); // Ref to keep track of the chart instance

//   useEffect(() => {
//     if (selectedMonth === 'Selected month') return;

//     const fetchData = async () => {
//       try {
//         const response = await axios.post('/api/v1/transactional/bar_chart', { month: selectedMonth });
//         const data = response.data.data; // Extract the actual data

//         // Check if priceRanges is defined and is an object
//         if (data && typeof data === 'object') {
//           setChartData({
//             labels: Object.keys(data),
//             datasets: [
//               {
//                 label: 'Number of Items',
//                 data: Object.values(data),
//                 backgroundColor: 'green',
//                 // backgroundColor: 'rgba(54, 162, 235, 0.8)',
//                 borderColor: 'rgba(75, 192, 192, 1)',
//                 borderWidth: 1,
//               },
//             ],
//           });
//         } else {
//           console.error('Invalid data format:', data);
//           setChartData({}); // Set empty data to avoid rendering errors
//         }
//       } catch (error) {
//         console.error('Error fetching chart data', error);
//       }
//     };

//     fetchData();
//   }, [selectedMonth]);

//   useEffect(() => {
//     if (chartData.labels && chartData.datasets) {
//       const ctx = chartRef.current.getContext('2d');
      
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }

//       chartInstance.current = new Chart(ctx, {
//         type: 'bar',
//         data: chartData,
//         options: {
//           responsive: true,
//           plugins: {
//             legend: {
//               position: 'top',
//             },
//             tooltip: {
//               callbacks: {
//                 label: function (tooltipItem) {
//                   return `Number of Items: ${tooltipItem.raw}`;
//                 },
//               },
//             },
//           },
//           scales: {
//             x: {
//               beginAtZero: true,
//               title: {
//                 display: true,
//                 text: 'Price Ranges',
//               },
//               grid: {
//                 display: false, // Remove vertical lines
//               },
//             },
//             y: {
//               beginAtZero: true,
//               title: {
//                 display: true,
//                 text: 'Number of Items',
//               },
//               grid: {
//                 drawBorder: false, // Optional: remove border on y-axis
//               },
//             },
//           },
//         },
//       });
//     }
//   }, [chartData]);

//   const handleMonthChange = (event) => {
//     setSelectedMonth(event.target.value);
//   };

//   return (
//     <>
//       <div className='mt-10'>
//         <div> Transactions Bar Chart </div>
//         <div>
//           <div className='flex'>
//             <div>Bar Charts stats -</div>
//             <div className='border-2 rounded-md p-1'>
//               <select
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 className='p-2 outline-none rounded-full bg-white'
//               >
//                 {months.map((month) => (
//                   <option key={month} value={month}>
//                     {month}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className='mt-5'>
//             <canvas ref={chartRef}></canvas>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default Bar
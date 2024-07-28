import React, { useState } from 'react'
import axios from 'axios'

const months = [
    'Selected month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

function Statics() {
    const [selectedMonth, setSelectedMonth] = useState('Selected month')
    const [statistics, setStatistics] = useState({
        totalSales: 0,
        soldItems: 0,
        notSoldItems: 0,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchStatistics = async (month) => {
        setLoading(true)
        setError(null)

        try {
            const response = await axios.post('https://demo-mern-challenge.onrender.com/api/v1/transactional/statistics', { month })
            setStatistics(response.data.data)  
        } catch (err) {
            setError('Failed to fetch statistics')
        } finally {
            setLoading(false)
        }
    }

    const handleMonthChange = (event) => {
        const newMonth = event.target.value
        setSelectedMonth(newMonth)
        if (newMonth !== 'Selected month') {
            fetchStatistics(newMonth)
        } else {
            setStatistics({
                totalSales: 0,
                soldItems: 0,
                notSoldItems: 0,
            })
        }
    }

    return (
        <>
            <div className='px-32 bg-slate-100 p-3'>
                <div className='flex flex-col items-center p-20 border-2 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.1)]
                 bg-gray-50 mb-10'>
                    <div className='mt-10'>
                        <div className='flex justify-center mb-10 text-3xl font-bold bg-violet-500 p-3 rounded-md'>
                            Transctions Statistics
                        </div>

                        <div className='bg-white p-3 rounded-md bg-orange-500'>
                            <div className='flex justify-center place-items-center'>
                                <div className='font-bold'>
                                    Statics -
                                </div>
                                <div className='border-2 rounded-md p-1 bg-white ml-1 mb-1'>
                                    <select
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        className='p-2 outline-none rounded-full bg-white'
                                    >
                                        {months.map((month) => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col justify-center place-items-center mt-1'>
                                {loading ? (
                                    <div>Loading...</div>
                                ) : error ? (
                                    <div>{error}</div>
                                ) : (
                                    <>
                                        <div className='font-bold'>Total sale: Rs {statistics.totalSales.toFixed(2)}</div>
                                        <div className='font-bold'>Total sold items: Rs {statistics.soldItems}</div>
                                        <div className='font-bold'>Total not sold items: Rs {statistics.notSoldItems}</div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </>
    )
}

export default Statics
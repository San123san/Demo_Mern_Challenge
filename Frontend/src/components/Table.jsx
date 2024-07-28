import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Close from '../assets/Close.svg'

const months = [
    'Selected month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]

function Table() {
    const [transactions, setTransactions] = useState([])
    const [selectedMonth, setSelectedMonth] = useState('March')
    const [searchTerm, setSearchTerm] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [fetchall, setfetchall] = useState([])

    const tableContainerRef = useRef(null)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const response = await axios.post('/api/v1/transactional/search', {
                search: searchTerm,
                page: pageNumber,
                month: selectedMonth
            })
            const transactionsData = response.data.data.transactions

            const transformedTransactions = transactionsData.map(transaction => ({
                ...transaction,
                sold: transaction.sold ? 'Yes' : 'No'
            }))

            setTransactions(transformedTransactions)
            setTotalPages(response.data.data.totalPages)
            console.log(transactions)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [pageNumber, searchTerm, selectedMonth])


    const fetchAllTransactions = async () => {
        setLoading(true)
        try {
            const response = await axios.post('/api/v1/transactional/initialize')
            setfetchall(response.data)
            console.log(transactions)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllTransactions()
    }, [])

    useEffect(() => {
        fetchTransactions()
    }, [pageNumber, searchTerm, selectedMonth])

    useEffect(() => {
        const scrollToPosition = window.innerHeight / 3 
        window.scrollTo(0, scrollToPosition)
    }, [pageNumber])

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value)
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value)
        setSelectedMonth('Selected month')
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault() 
            setPageNumber(1) 
            fetchTransactions()
        }
    }

    const handleClearSearch = () => {
        setSelectedMonth('Selected month')
        setSearchTerm('')
        setPageNumber(1) 
        fetchTransactions() 
    }

    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1)
        }
    }

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1)
        }
    }

    return (
        <>
            <div className='bg-slate-100 '>
                <div className='p-20 '>
                    <div
                        ref={tableContainerRef}
                        className='flex flex-col items-center p-20 border-2 rounded-2xl 
                        shadow-[0_20px_40px_rgba(0,0,0,0.2),0_10px_20px_rgba(0,0,0,0.1)] bg-gray-50'>
                        <div className='p-3 font-semibold border-2 rounded-full w-[130px] h-[130px] text-center flex place-items-center
                        text-xl bg-amber-300'>
                            Transaction DashBoard
                        </div>

                        <div className='flex space-x-10 mt-10 '>
                            <div className='relative border-2 rounded-full p-1 bg-amber-300'>
                                <input
                                    type="text"
                                    placeholder='Search Transaction'
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown} 
                                    className='p-2 outline-none rounded-full w-full pr-10' 
                                />
                                {searchTerm && (
                                    <button
                                        onClick={handleClearSearch}
                                        className='absolute right-2 top-1/2 transform -translate-y-1/2'
                                    >
                                        <img src={Close} alt="Close" className='w-5 h-5' />
                                    </button>
                                )}
                            </div>
                            <div className='border-2 rounded-md p-1 bg-amber-300'>
                                <select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className='p-2 outline-none rounded-full bg-amber-300'
                                >
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='w-full mt-10 p-10 px-20'>
                            <table className='min-w-full border-collapse border border-gray-500'>
                                <thead>
                                    <tr className='bg-gray-200'>
                                        <th className='border border-gray-500 p-2'>ID</th>
                                        <th className='border border-gray-500 p-2'>Title</th>
                                        <th className='border border-gray-500 p-2'>Description</th>
                                        <th className='border border-gray-500 p-2'>Price</th>
                                        <th className='border border-gray-500 p-2'>Category</th>
                                        <th className='border border-gray-500 p-2'>Sold</th>
                                        <th className='border border-gray-500 p-2'>Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className='text-center p-2 bg-amber-300'>Loading...</td>
                                        </tr>
                                    ) : transactions.length ? (
                                        transactions.map(transaction => (
                                            <tr key={transaction._id}>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>{transaction._id}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>{transaction.title}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>{transaction.description}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300 width-[95px]'>Rs {transaction.price}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>{transaction.category}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>{transaction.sold}</td>
                                                <td className='border border-gray-500 p-2 bg-amber-300'>
                                                    <img src={transaction.image} alt={transaction.title} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className='text-center p-2'>No Transactions Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='flex space-x-32 mt-4'>
                            <div className='border-2 p-3 rounded-2xl bg-orange-500 font-bold'>Page No: {pageNumber} of {totalPages}</div>
                            <button
                                onClick={handlePreviousPage}
                                disabled={pageNumber === 1}
                                className={`p-3 rounded-md font-bold transition-colors duration-300
            ${pageNumber === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 cursor-pointer'}
        `}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={pageNumber === totalPages}
                                className={`p-3 rounded-md w-[80px] font-bold transition-colors duration-300
            ${pageNumber === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 cursor-pointer'}
        `}
                            >
                                Next
                            </button>
                            <div className='border-2 p-3 rounded-2xl bg-white font-bold'>Per Page: 10</div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Table
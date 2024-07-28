import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { transaction } from "../models/transaction.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import axios from "axios"

// Controller function to initialize database
//Create an API to list the all transactions
const initializeInformation = async () => {
    try {
        const response = await axios.get('process.env.API_URL')
        console.log('API response data:', response.data)
        const transactions = response.data

        const existingTransactions = await transaction.find({}).select('id price').lean()
        const existingTransactionMap = new Map(existingTransactions.map(t => [t.id, t]))

        const bulkOps = transactions.map(t => {
            const priceAsString = t.price.toFixed(2)
            const transactionWithPriceString = { ...t, priceAsString }

            const existingTransaction = existingTransactionMap.get(t.id)

            if (!existingTransaction || JSON.stringify(existingTransaction) !== JSON.stringify(transactionWithPriceString)) {
                return {
                    updateOne: {
                        filter: { id: t.id },
                        update: { $set: transactionWithPriceString },
                        upsert: true
                    }
                }
            }
        }).filter(Boolean)

        if (bulkOps.length > 0) {
            await transaction.bulkWrite(bulkOps)
            console.log('Database updated successfully.')
        }
    } catch (error) {
        console.error('Error initializing database:', error.message)
        console.error('Error stack:', error.stack)
        throw new ApiError(500, 'Failed to initialize database', error.message)
    }
}

// List all transactions
// Create an API for show all transaction
const allTransaction = asyncHandler(async (req, res, next) => {
    try {
        const transactions = await transaction.find()
        res.status(200).json(new ApiResponse(200, transactions, "All Transaction show successfully"))
    } catch (error) {
        throw new ApiError(500, 'Failed to initialize database', error.message)
    }
})

// Search and pagination
const searchAndpagination = asyncHandler(async (req, res, next) => {
     console.log("Request body:", req.body)

     const { search = '', page = 1, perPage = 10 } = req.body

     const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1
     const itemsPerPage = parseInt(perPage, 10) > 0 ? parseInt(perPage, 10) : 10
     const skip = (pageNumber - 1) * itemsPerPage
     const limit = itemsPerPage

     console.log("search=", search) 

     const query = {}

     if (search) {
         const numericSearch = parseFloat(search)
         if (!isNaN(numericSearch)) {
             query.$or = [
                 { price: numericSearch }
             ]
         } else {
             query.$or = [
                 { title: { $regex: search, $options: 'i' } },
                 { description: { $regex: search, $options: 'i' } }
             ]
         }
     }

     try {
         const transactions = await transaction.find(query).skip(skip).limit(limit)
         res.status(200).json(new ApiResponse(200, transactions, "Search and Pagination successful"))
     } catch (error) {
         console.error(error)
         next(new ApiError(500, 'Failed to Search and Paginate', error.message)) 
     }
})

// Search and pagination and also month search
// For frontend
const searchInformation = asyncHandler(async (req, res, next) => {
    console.log("Request body:", req.body)

    const { search = '', page = 1, month = 'March' } = req.body 

    const pageNumber = Number.isInteger(parseInt(page, 10)) && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1
    const itemsPerPage = 10
    const skip = (pageNumber - 1) * itemsPerPage

    console.log("search=", search)

    const monthIndex = monthMap[month]

    const query = {}

    if (month !== 'Selected month' && monthIndex !== undefined) {
        query.$expr = {
            $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] 
        }
    }

    if (search) {
        const numericSearch = parseFloat(search)
        if (!isNaN(numericSearch)) {
            query.priceAsString = { $regex: `^${search}`, $options: 'i' }
        } else {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }
    }

    try {
        const transactions = await transaction.find(query).skip(skip).limit(itemsPerPage)
        const totalTransactions = await transaction.countDocuments(query)

        res.status(200).json({
            data: {
                transactions,
                totalPages: Math.ceil(totalTransactions / itemsPerPage)
            }
        })
    } catch (error) {
        console.error(error)
        next(new ApiError(500, 'Failed to Search and Paginate', error.message))
    }
})


// month
const monthMap = {
    'January': 0,
    'February': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11
}
// Create an API for statistics
const statisticsInformation = asyncHandler(async (req, res, next) => {
    let { month } = req.body

    if (!month) {
        throw new ApiError(400, 'Month is required')
    }

    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()

    const monthIndex = monthMap[month]
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided')
    }

    try {
        const transactions = await transaction.aggregate([
            {
                $project: {
                    price: 1,
                    sold: 1,
                    month: { $month: "$dateOfSale" } 
                }
            },
            {
                $match: {
                    month: monthIndex + 1 
                }
            }
        ])

        console.log("transaction:", transactions)

        const totalSales = transactions.reduce((sum, t) => sum + (t.price || 0), 0)
        const soldItems = transactions.filter(t => t.sold).length
        const notSoldItems = transactions.length - soldItems

        res.status(200).json(new ApiResponse(200, {
            totalSales,
            soldItems,
            notSoldItems
        }, "Statistics generated successfully"))
    } catch (error) {
        next(new ApiError(500, 'Failed to show statistics', error.message))
    }
})

// Create an API for bar chart 
const barChart = asyncHandler(async (req, res, next) => {
    let { month } = req.body

    if (!month) {
        throw new ApiError(400, 'Month is required')
    }

    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()

    const monthIndex = monthMap[month]
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided')
    }

    try {
        const transactions = await transaction.aggregate([
            {
                $project: {
                    price: 1,
                    month: { $month: "$dateOfSale" } 
                }
            },
            {
                $match: {
                    month: monthIndex + 1 
                }
            }
        ])

        console.log("transaction:", transactions)

        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0
        }

        transactions.forEach(t => {
            if (t.price <= 100) priceRanges['0-100']++
            else if (t.price <= 200) priceRanges['101-200']++
            else if (t.price <= 300) priceRanges['201-300']++
            else if (t.price <= 400) priceRanges['301-400']++
            else if (t.price <= 500) priceRanges['401-500']++
            else if (t.price <= 600) priceRanges['501-600']++
            else if (t.price <= 700) priceRanges['601-700']++
            else if (t.price <= 800) priceRanges['701-800']++
            else if (t.price <= 900) priceRanges['801-900']++
            else priceRanges['901-above']++
        })
        console.log("Price Ranges:", priceRanges)
        res.status(200).json(new ApiResponse(200, priceRanges, "PriceRanges show successfully"))
    } catch (error) {
        throw new ApiError(500, 'Failed to show priceRanges', error.message)
    }
})

//  Create an API for pie chart
const pieChart = asyncHandler(async (req, res, next) => {
    let { month } = req.body

    if (!month) {
        throw new ApiError(400, 'Month is required')
    }

    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()

    const monthIndex = monthMap[month]
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided')
    }

    try {
        const transactions = await transaction.aggregate([
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    category: 1 
                }
            },
            {
                $match: {
                    month: monthIndex + 1 
                }
            },
            {
                $group: {
                    _id: "$category", 
                    count: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ])

        res.status(200).json(new ApiResponse(200, transactions, "Category Count show successfully"))
    } catch (error) {
        throw new ApiError(500, 'Failed to show categoryCount', error.message)
    }
})

// Combined data
// Create an API which fetches the data from all the 3 APIs mentioned above, combines the response and sends a final response of the combined JSON

const combineData = asyncHandler(async (req, res, next) => {
    let { month } = req.body

    if (!month) {
        return next(new ApiError(400, 'Month parameter is required'))
    }

    // Normalize month format
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()

    const monthIndex = monthMap[month]
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided')
    }

    try {
        console.log(`Fetching data for month: ${month}`)
        // Sending the month parameter in the request body
        const statisticsResponse = await axios.post('http://localhost:8000/api/v1/transactional/statistics', { month })
        const barChartResponse = await axios.post('http://localhost:8000/api/v1/transactional/bar_chart', { month })
        const pieChartResponse = await axios.post('http://localhost:8000/api/v1/transactional/pie_chart', { month })

        res.status(200).json(new ApiResponse(200, {
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        }, "Category Count show successfully"))
    } catch (error) {
        console.error('Error initializing database:', error.message)
        console.error('Error stack:', error.stack)
        next(new ApiError(500, 'Failed to initialize database', error.message))
    }
})


export {
    initializeInformation,
    allTransaction,
    searchAndpagination,
    searchInformation,
    statisticsInformation,
    barChart,
    pieChart,
    combineData
}
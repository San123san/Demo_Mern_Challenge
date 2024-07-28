import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { transaction } from "../models/transaction.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

// Controller function to initialize database
// const initializeInformation = asyncHandler(async (req, res, next) => {
//     try {
//         // Fetch data from the third-party API
//         const response = await axios.get('https://product_transaction.json');

//         // Log the API response data
//         console.log('API response data:', response.data);

//         const transactions = response.data;

//         // Extract IDs of existing transactions in the database
//         const existingTransactions = await transaction.find({}).select('id').lean();
//         const existingTransactionIds = existingTransactions.map(t => t.id);

//         // Create a map of existing transactions by ID
//         const existingTransactionMap = new Map(existingTransactions.map(t => [t.id, t]));

//         // Prepare arrays to hold new and updated transactions
//         const newTransactions = [];
//         const updatedTransactions = [];

//         // Compare and categorize transactions
//         transactions.forEach(t => {
//             // Convert price to string
//             const priceAsString = t.price.toFixed(2); // Convert number to string with 2 decimal places

//             // Create transaction object with price as string
//             const transactionWithPriceString = {
//                 ...t,
//                 priceAsString
//             };
//             if (existingTransactionIds.includes(t.id)) {
//                 // Check if the document has changed
//                 const existingTransaction = existingTransactionMap.get(t.id);
//                 // if (JSON.stringify(existingTransaction) !== JSON.stringify(t)) {
//                 //     // Document has changed, add to updates
//                 //     updatedTransactions.push(t);
//                 // }
//                 if (JSON.stringify(existingTransaction) !== JSON.stringify(transactionWithPriceString)) {
//                     // Document has changed, add to updates
//                     updatedTransactions.push(transactionWithPriceString);
//                 }
//             } else {
//                 // Document is new, add to new transactions
//                 newTransactions.push(transactionWithPriceString);
//             }
//         });

//         // Insert new data into the database
//         if (newTransactions.length > 0) {
//             await transaction.insertMany(newTransactions);
//             console.log('New transactions inserted:', newTransactions);
//         }

//         // Update existing records
//         if (updatedTransactions.length > 0) {
//             const bulkOps = updatedTransactions.map(t => ({
//                 updateOne: {
//                     filter: { id: t.id },
//                     update: { $set: t },
//                     upsert: true // Only update, do not insert if the document does not exist
//                 }
//             }));
//             await transaction.bulkWrite(bulkOps);
//             console.log('Updated transactions:', updatedTransactions);
//         }

//         // Send a success response
//         res.status(200).json(new ApiResponse(200, {
//             new: newTransactions,
//             updated: updatedTransactions
//         }, "Database updated successfully"));
//     } catch (error) {
//         console.error('Error initializing database:', error.message);
//         console.error('Error stack:', error.stack);
//         next(new ApiError(500, 'Failed to initialize database', error.message));
//     }
// });
const initializeInformation = async () => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        console.log('API response data:', response.data);
        const transactions = response.data;

        const existingTransactions = await transaction.find({}).select('id price').lean();
        const existingTransactionMap = new Map(existingTransactions.map(t => [t.id, t]));

        const bulkOps = transactions.map(t => {
            const priceAsString = t.price.toFixed(2);
            const transactionWithPriceString = { ...t, priceAsString };

            const existingTransaction = existingTransactionMap.get(t.id);

            if (!existingTransaction || JSON.stringify(existingTransaction) !== JSON.stringify(transactionWithPriceString)) {
                return {
                    updateOne: {
                        filter: { id: t.id },
                        update: { $set: transactionWithPriceString },
                        upsert: true
                    }
                };
            }
        }).filter(Boolean);

        if (bulkOps.length > 0) {
            await transaction.bulkWrite(bulkOps);
            console.log('Database updated successfully.');
        }
    } catch (error) {
        console.error('Error initializing database:', error.message);
        console.error('Error stack:', error.stack);
        throw new ApiError(500, 'Failed to initialize database', error.message); // Ensure ApiError is defined correctly
    }
};

// List all transactions
const allTransaction = asyncHandler(async (req, res, next) => {
    try {
        const transactions = await transaction.find();
        res.status(200).json(new ApiResponse(200, transactions, "All Transaction show successfully"));
    } catch (error) {
        throw new ApiError(500, 'Failed to initialize database', error.message);
    }
});

// // Search and pagination
// const searchInfromation = asyncHandler(async (req, res, next) => {
//      // Log the entire request body
//      console.log("Request body:", req.body);

//      // Extract and validate search parameters
//      const { search = '', page = 1, perPage = 10 } = req.body;

//      // Ensure page and perPage are positive integers
//      const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
//      const itemsPerPage = parseInt(perPage, 10) > 0 ? parseInt(perPage, 10) : 10;
//      const skip = (pageNumber - 1) * itemsPerPage;
//      const limit = itemsPerPage;

//      console.log("search=", search); // Debugging output

//      // Build the query object
//      const query = {};

//      if (search) {
//          const numericSearch = parseFloat(search);
//          if (!isNaN(numericSearch)) {
//              // Handle numeric search (price)
//              query.$or = [
//                  { price: numericSearch }
//              ];
//          } else {
//              // Handle text search (title or description)
//              query.$or = [
//                  { title: { $regex: search, $options: 'i' } },
//                  { description: { $regex: search, $options: 'i' } }
//              ];
//          }
//      }

//      try {
//          // Find records based on the query
//          const transactions = await transaction.find(query).skip(skip).limit(limit);
//          res.status(200).json(new ApiResponse(200, transactions, "Search and Pagination successful"));
//      } catch (error) {
//          console.error(error);
//          next(new ApiError(500, 'Failed to Search and Paginate', error.message)); // Use next() for error handling middleware
//      }
// });
// const searchInformation = asyncHandler(async (req, res, next) => {
//     // Log the entire request body
//     console.log("Request body:", req.body);

//     // Extract and validate search parameters
//     const { search = '', page = 1 } = req.body;

//     // Ensure page is a positive integer
//     const pageNumber = Number.isInteger(parseInt(page, 10)) && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
//     const itemsPerPage = 10; // Always show 10 items per page
//     const skip = (pageNumber - 1) * itemsPerPage;

//     console.log("search=", search); // Debugging output

//     // Build the query object
//     const query = {};

//     if (search) {
//         const numericSearch = parseFloat(search);
//         if (!isNaN(numericSearch)) {
//             // Handle numeric search (price)
//             query.price = { $eq: numericSearch };
//         } else {
//             // Handle text search (title or description)
//             query.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } }
//             ];
//         }
//     }

//     console.log("Query object:", query);

//     try {
//         // Find records based on the query
//         const transactions = await transaction.find(query).skip(skip).limit(itemsPerPage);
//         const totalCount = await transaction.countDocuments(query); // Count the total number of documents matching the query

//         const totalPages = Math.ceil(totalCount / itemsPerPage);

//         res.status(200).json(new ApiResponse(200, {
//             transactions,
//             totalCount,
//             totalPages,
//             currentPage: pageNumber
//         }, "Search and Pagination successful"));
//     } catch (error) {
//         console.error(error);
//         next(new ApiError(500, 'Failed to Search and Paginate', error.message)); // Use next() for error handling middleware
//     }
// });

const searchInformation = asyncHandler(async (req, res, next) => {
    console.log("Request body:", req.body);

    const { search = '', page = 1, month = 'March' } = req.body; // Default to March

    // Validate page number
    const pageNumber = Number.isInteger(parseInt(page, 10)) && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const itemsPerPage = 10;
    const skip = (pageNumber - 1) * itemsPerPage;

    console.log("search=", search);

    // Convert month name to zero-based month index (1 for January, 2 for February, ..., 12 for December)
    const monthIndex = monthMap[month];

    // MongoDB query object
    const query = {};

    // Filter transactions based on month if not "Selected month"
    if (month !== 'Selected month' && monthIndex !== undefined) {
        query.$expr = {
            $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] // $month returns 1-based index, so add 1
        };
    }

    if (search) {
        const numericSearch = parseFloat(search);
        if (!isNaN(numericSearch)) {
            // query.price = { $eq: numericSearch };
            query.priceAsString = { $regex: `^${search}`, $options: 'i' };
        } else {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
    }

    try {
        const transactions = await transaction.find(query).skip(skip).limit(itemsPerPage);
        const totalTransactions = await transaction.countDocuments(query);

        res.status(200).json({
            data: {
                transactions,
                totalPages: Math.ceil(totalTransactions / itemsPerPage)
            }
        });
    } catch (error) {
        console.error(error);
        next(new ApiError(500, 'Failed to Search and Paginate', error.message));
    }
});


// Statistics
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
};
const statisticsInformation = asyncHandler(async (req, res, next) => {
    let { month } = req.body;

    if (!month) {
        throw new ApiError(400, 'Month is required');
    }

    // Normalize month input to match the format in monthMap
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided');
    }

    try {
        // Aggregation pipeline
        const transactions = await transaction.aggregate([
            {
                $project: {
                    price: 1,
                    sold: 1,
                    month: { $month: "$dateOfSale" } // Extract month from dateOfSale
                }
            },
            {
                $match: {
                    month: monthIndex + 1 // Match the monthIndex (1-based month)
                }
            }
        ]);

        console.log("transaction:", transactions)

        // Calculate total sales, sold items, and not sold items
        const totalSales = transactions.reduce((sum, t) => sum + (t.price || 0), 0);
        const soldItems = transactions.filter(t => t.sold).length;
        const notSoldItems = transactions.length - soldItems;

        res.status(200).json(new ApiResponse(200, {
            totalSales,
            soldItems,
            notSoldItems
        }, "Statistics generated successfully"));
    } catch (error) {
        next(new ApiError(500, 'Failed to show statistics', error.message));
    }
});

// Bar chart
const barChart = asyncHandler(async (req, res, next) => {
    let { month } = req.body;

    if (!month) {
        throw new ApiError(400, 'Month is required');
    }

    // Normalize month input to match the format in monthMap
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided');
    }

    try {
        // Aggregation pipeline
        const transactions = await transaction.aggregate([
            {
                $project: {
                    price: 1,
                    month: { $month: "$dateOfSale" } // Extract month from dateOfSale
                }
            },
            {
                $match: {
                    month: monthIndex + 1 // MongoDB months are 1-based (1 for January, 2 for February, etc.)
                }
            }
        ]);

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
        };

        transactions.forEach(t => {
            if (t.price <= 100) priceRanges['0-100']++;
            else if (t.price <= 200) priceRanges['101-200']++;
            else if (t.price <= 300) priceRanges['201-300']++;
            else if (t.price <= 400) priceRanges['301-400']++;
            else if (t.price <= 500) priceRanges['401-500']++;
            else if (t.price <= 600) priceRanges['501-600']++;
            else if (t.price <= 700) priceRanges['601-700']++;
            else if (t.price <= 800) priceRanges['701-800']++;
            else if (t.price <= 900) priceRanges['801-900']++;
            else priceRanges['901-above']++;
        });
        console.log("Price Ranges:", priceRanges);
        res.status(200).json(new ApiResponse(200, priceRanges, "PriceRanges show successfully"));
    } catch (error) {
        throw new ApiError(500, 'Failed to show priceRanges', error.message);
    }
});

// Pie chart
const pieChart = asyncHandler(async (req, res, next) => {
    let { month } = req.body;

    if (!month) {
        throw new ApiError(400, 'Month is required');
    }

    // Normalize month input to match the format in monthMap
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided');
    }

    try {
        // Aggregation pipeline
        const transactions = await transaction.aggregate([
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    category: 1 // Keep the category field
                }
            },
            {
                $match: {
                    month: monthIndex + 1 // MongoDB months are 1-based (1 for January, 2 for February, etc.)
                }
            },
            {
                $group: {
                    _id: "$category", // Group by category
                    count: { $sum: 1 } // Count the number of items per category
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, transactions, "Category Count show successfully"));
    } catch (error) {
        throw new ApiError(500, 'Failed to show categoryCount', error.message);
    }
});

// Combined data
const combineData = asyncHandler(async (req, res, next) => {
    let { month } = req.body;

    if (!month) {
        return next(new ApiError(400, 'Month parameter is required'));
    }

    // Normalize month format
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
        throw new ApiError(400, 'Invalid month provided');
    }

    try {
        console.log(`Fetching data for month: ${month}`);
        // Sending the month parameter in the request body
        const statisticsResponse = await axios.post('http://localhost:8000/api/v1/transactional/statistics', { month });
        const barChartResponse = await axios.post('http://localhost:8000/api/v1/transactional/bar_chart', { month });
        const pieChartResponse = await axios.post('http://localhost:8000/api/v1/transactional/pie_chart', { month });

        res.status(200).json(new ApiResponse(200, {
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        }, "Category Count show successfully"));
    } catch (error) {
        console.error('Error initializing database:', error.message);
        console.error('Error stack:', error.stack);
        next(new ApiError(500, 'Failed to initialize database', error.message));
    }
});


export {
    initializeInformation,
    allTransaction,
    searchInformation,
    statisticsInformation,
    barChart,
    pieChart,
    combineData
}

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    priceAsString: {
        type: String, // Add this field to support partial matches
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    sold: {
        type: Boolean,
        default: false
    },
    dateOfSale: {
        type: Date,
        default: Date.now
    }
  });
  
export const transaction = mongoose.model("transaction",transactionSchema)
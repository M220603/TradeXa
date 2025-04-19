import mongoose from "mongoose";

const MONGO_URL = "mongodb://127.0.0.1:27017/tradexaa";

// Connect to MongoDB
const connect = mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connect
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => console.log("Database cannot be Connected", err));

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/ 
    },
    password: {
        type: String,
        required: true
    }
});

// Collection (Model)
const collection = mongoose.models.Login || mongoose.model('Login', Loginschema);

// ✅ Named exports
export { mongoose, collection };

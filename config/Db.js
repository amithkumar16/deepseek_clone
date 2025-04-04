import mongoose from "mongoose";

if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGO_URL is not defined in environment variables.");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectdb() {
    if (cached.conn) {
        console.log("✅ Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🚀 Connecting to MongoDB...");
        cached.promise = mongoose.connect(process.env.MONGO_URL).then((mongooseInstance) => {
            console.log("✅ MongoDB Connected");
            return mongooseInstance;
        }).catch((error) => {
            console.error("❌ MongoDB Connection Error:", error);
            cached.promise = null;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

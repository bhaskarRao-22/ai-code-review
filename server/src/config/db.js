import mongoose from 'mongoose';

async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI is not defined in .env file');
    }

    try {
        await mongoose.connect(uri);

        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
}

export { connectDB };
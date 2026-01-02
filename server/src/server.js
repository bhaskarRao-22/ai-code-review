import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

async function startServer() {
    try {
        await connectDB();

        app.listen(config.port, () => {
            console.log(`Server is running on port http://localhost:${config.port}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}
startServer();
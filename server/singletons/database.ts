import mongoose, { ConnectOptions } from "mongoose";

export class Database {

    constructor() {}

    getConnectionString() {

        const isProduction = process.env['PRODUCTION'] === 'true'

        const username = process.env[isProduction ? 'MONGODB_USERNAME_PRODUCTION' : 'MONGODB_USERNAME_DEBUG']!;
        const password = process.env[isProduction ? 'MONGODB_PASSWORD_PRODUCTION' : 'MONGODB_PASSWORD_DEBUG']!;
        const database = process.env[isProduction ? 'MONGODB_DATABASE_PRODUCTION' : 'MONGODB_DATABASE_DEBUG']!;
        console.log(isProduction ? 'Connecting to production database...' : 'Connecting to debug database...')
        return `mongodb+srv://${username}:${password}@${database}/?retryWrites=true&w=majority`;
    }

    // must call this function to initialize the MongoDB connection
    async connect() {
        const connectionString = this.getConnectionString();
        console.log("Connecting to MongoDB instance:", connectionString);

        try {
            await mongoose.connect(connectionString);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
        
    }
}

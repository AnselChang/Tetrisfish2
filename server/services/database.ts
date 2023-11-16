import mongoose, { ConnectOptions } from "mongoose";

export namespace Database {

    function getConnectionString() {

        const username = process.env['MONGODB_USERNAME']!;
        const password = process.env['MONGODB_PASSWORD']!;
        console.log("Username:", username);
        console.log("Password:", password);

        return `mongodb+srv://${username}:${password}@serverlessinstance0.hznwj0u.mongodb.net/?retryWrites=true&w=majority`;
    }

    // must call this function to initialize the MongoDB connection
    export async function connect() {
        const connectionString = getConnectionString();
        console.log("Connecting to MongoDB instance:", connectionString);

        try {
            await mongoose.connect(connectionString);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
        
    }

}
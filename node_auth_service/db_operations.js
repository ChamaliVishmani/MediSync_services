// dbFunctions.js
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = "mongodb+srv://goal_setting:goal_setting_123@cluster0.wxus2z3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Database Name
const dbName = 'goal_setting';

// Connect function to establish connection with MongoDB
async function connect() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");
        return client.db(dbName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// CRUD operations

async function create(tableName, data) {
    try {
        const db = await connect();
        const collection = db.collection(tableName);
        const result = await collection.insertOne(data);
        if (result && result.insertedId) {
            console.log("Document inserted successfully:", data);
            return data;
        } else {
            throw new Error("Failed to insert document or result is unexpected.");
        }
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;
    }
}

async function read(tableName, filter) {
    try {
        const db = await connect();
        const collection = db.collection(tableName);
        return collection.find(filter).toArray();
    } catch (error) {
        console.error("Error reading documents:", error);
        throw error;
    }
}

async function update(tableName, filter, newData) {
    try {
        const db = await connect();
        const collection = db.collection(tableName);
        return collection.updateMany(filter, { $set: newData });
    } catch (error) {
        console.error("Error updating documents:", error);
        throw error;
    }
}

async function del(tableName, filter) {
    try {
        const db = await connect();
        const collection = db.collection(tableName);
        return collection.deleteMany(filter);
    } catch (error) {
        console.error("Error deleting documents:", error);
        throw error;
    }
}

async function executeQuery(query) {
    try {
        const db = await connect();
        return db.execute(query);
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

module.exports = { create, read, update, del, executeQuery };

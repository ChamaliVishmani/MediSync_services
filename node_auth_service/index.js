const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const UserData = require('./data_classes/user_data');
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const fs = require('fs');  // Import the fs module here

const configFile = fs.readFileSync('config.json');
const config = JSON.parse(configFile);

// Access MongoDB URI and database name
const mongoURI = config.mongodb.uri;
const mongoDBName = config.mongodb.dbName;
// Access Supabase URL, API key, and table names
const supabaseUrl = config.supabase.supabaseUrl;
const supabaseKey = config.supabase.supabaseKey;
const idTableName = config.supabase.supabasetables.id;

const {
    createRecord,
    readRecord,
    updateRecord,
    deleteRecord,
    crud,
    login_post_method,
    signupByRole,
    sendOTP,
    verifyOTP,
    reset_pass_function
} = require('./auth_operations');


// index.js
const { create, read, update, del, executeQuery } = require('./db_operations');
const app = express();
app.use(cors());
const port = 3500;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ID_table = idTableName

const supabase = createClient(supabaseUrl, supabaseKey);



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await login_post_method(email, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    try {
        await signupByRole(req.body);
        res.status(200).json({ success: true, message: 'Signup successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});






// Send OTP route
app.post('/send_otp', async (req, res) => {
    const { method, contact, isNumericOTP, otpDigitCount, otpCountdownTime } = req.body;
    try {
        const result = await sendOTP(contact, method, isNumericOTP, otpDigitCount);
        res.json(result);
    } catch (error) {
        console.error('Error occurred while sending OTP:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});

// Verify OTP route
app.post('/verify_otp', async (req, res) => {
    const { method, contact, otp } = req.body;

    try {
        const result = await verifyOTP(method, contact, otp);
        res.json(result);
    } catch (error) {
        console.error('Error occurred while verifying OTP:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});

// Reset password route
app.post('/reset_password', async (req, res) => {
    const { method, contact, password } = req.body;

    try {
        reset_pass_function(method, contact, password, res);
    } catch (error) {
        console.error('Error occurred while resetting password:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});
// TODO: Auth End



// Function to create or retrieve user UUID based on username and password

// TODO: MongoDB Atles cluster
async function connect() {
    const uri = mongoURI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = mongoDBName;
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");
        return client.db(dbName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

function generateUniqueID() {
    // Generate a random number and convert it to base 36
    const randomNumber = Math.random().toString(36).substring(2);
    // Generate a timestamp and convert it to base 36
    const timestamp = (new Date()).getTime().toString(36);
    // Concatenate the random number and timestamp to create a unique ID
    const uniqueID = randomNumber + timestamp;
    return uniqueID;
}

async function getUserUUID(username, password, FirebaseServiceToken) {
    try {
        // Check if the user with the provided username and password exists
        const { data: existingUsers, error } = await supabase
            .from(ID_table)
            .select('uuid')
            .eq('username', username)
            .eq('password', password);

        if (error) {
            console.error('Error checking for existing user:', error.message);
            return { error: 'Internal server error' };
        }

        if (existingUsers && existingUsers.length > 0) {
            // User already exists, return the UUID
            return { uuid: existingUsers[0].uuid };
        } else {
            // User doesn't exist, generate a unique ID and save it
            const newUuid = generateUniqueID();

            // Insert the new user with the generated UUID
            const { data: newUser, error: insertError } = await supabase
                .from(ID_table)
                .insert([{ username, password, uuid: newUuid, firebaseservicetoken: FirebaseServiceToken }]);

            if (insertError) {
                console.error('Error inserting new user:', insertError.message);
                return { error: 'Internal server error' };
            }

            // Return the generated UUID for the new user
            return { uuid: newUser[0].uuid };
        }
    } catch (e) {
        console.error('Exception occurred:', e);
        return { error: 'Internal server error' };
    }
}

async function saveGlobalData(globalData, uniqueId) {
    try {
        // Check if the document with the unique ID exists in MongoDB
        const existingData = await read('goal_setting', { uuid: uniqueId });
        if (existingData.length > 0) {
            // Document exists, update the document with the provided GlobalData
            await update('goal_setting', { uuid: uniqueId }, { globalData });
        } else {
            // Document doesn't exist, create a new document with the provided GlobalData and unique ID
            await create('goal_setting', { uuid: uniqueId, globalData });
        }
    } catch (error) {
        console.error('Error while saving GlobalData:', error);
        throw error;
    }
}

async function getGlobalData(uniqueId) {
    try {
        // Read the document with the provided unique ID from MongoDB
        const data = await read('goal_setting', { uuid: uniqueId });
        if (data.length > 0) {
            // Document found, return the GlobalData
            return data[0].globalData;
        } else {
            // Document not found, return null
            console.log('No data found for the provided unique ID:', uniqueId);
            return null;
        }
    } catch (error) {
        console.error('Error while fetching GlobalData:', error);
        throw error;
    }
}

// TODO: You can save data on MongoDB Atles cluster with this post method.
app.post('/update_global_data', async (req, res) => {
    try {
        // Extract username and password from userData
        const { username, password } = req.body.userData;
        const globalData = req.body;

        // Print username and password on CLI
        console.log('Username:', username);
        console.log('Password:', password);

        const uniqueId = await getUserUUID(username, password);

        await saveGlobalData(globalData, uniqueId);

        console.log("the data is : ", globalData)

        // Send response
        res.json({ success: true, uuid, message: 'Data received successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while processing the request.' });
    }
});

// TODO: You can get data on MongoDB Atles cluster with this post method.
// Endpoint to send global data to frontend based on username and password
app.post('/get_global_data', async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password, FirebaseServiceToken } = req.body;

        console.log("\n\nFirebaseServiceToken is : ", FirebaseServiceToken, "\n\n");

        const uniqueId = await getUserUUID(username, password, FirebaseServiceToken);

        const globalDataFromDatabase = await getGlobalData(uniqueId);

        if (globalDataFromDatabase) {
            // Send global data as JSON response
            res.json({ globalDataFromDatabase });
        } else {
            res.status(404).json({ success: false, message: 'Global data not found for the provided username and password.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching global data.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

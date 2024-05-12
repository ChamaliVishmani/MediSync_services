const express = require('express');
const bodyParser = require('body-parser');
const UserData = require('./data_classes/user_data');
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

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
// // index.js
const { create, read, update, del, executeQuery } = require('./db_operations');
const app = express();
const port = 3500;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO: To .env file
const supabaseUrl = 'https://ovfsgdwhyiojhmfayaio.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZnNnZHdoeWlvamhtZmF5YWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU1MTc4NDEsImV4cCI6MjAzMTA5Mzg0MX0.y_npzg3H7gASrCn_-2SNfPZoWLZmc72CGbUMhJaRO04';
const ID_table = "medisync_users_id"
////////////////


const supabase = createClient(supabaseUrl, supabaseKey);

// // TODO: Firebase Push Notifications
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebase_service.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// // Store scheduled notifications and their timers
// const scheduledNotifications = {};

// // Custom method for scheduling notifications
// function scheduleNotification(time, notificationData, deviceToken) {
//   // Get the current time
//   const currentTime = new Date();
//   const currentHours = currentTime.getHours();// 
//   const currentMinutes = currentTime.getMinutes();

//   // Parse the provided time string (e.g., "14:30")
//   const [targetHour, targetMinute] = time.split(':').map(Number);

//   // Calculate the time difference until the target time
//   let timeDifference = (targetHour - currentHours) * 60 + (targetMinute - currentMinutes);

//   // If the target time has already passed for today, add 24 hours to the time difference
//   if (timeDifference < 0) {
//     timeDifference += 24 * 60;
//   }

//   // Convert the time difference to milliseconds
//   const delayMilliseconds = timeDifference * 60 * 1000;

//   // Set a timer to execute the function after the delay
//   const timer = setTimeout(() => {
//     // Construct the message with notification data
//     const message = {
//       notification: {
//         title: notificationData.title,
//         body: notificationData.body,
//         imageUrl: notificationData.imageUrl,
//       },
//       token: deviceToken,
//     };

//     // Send the notification
//     admin.messaging().send(message)
//       .then((response) => {
//         console.log('Successfully sent message:', response);
//       })
//       .catch((error) => {
//         console.log('Error sending message:', error);
//       });

//     // Remove the timer from the scheduled notifications
//     delete scheduledNotifications[deviceToken];
//   }, delayMilliseconds);

//   // Store the timer for cancellation later
//   scheduledNotifications[deviceToken] = timer;
// }


// // Example usage:
// const notificationTime1 = '16:18'; // Time in HH:mm format
// const notificationData1 = {
//   title: 'Notification Title',
//   body: 'Notification Body',
//   icon: 'notification_icon',
//   imageUrl: 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg',
// };


// // Schedule a notification
// scheduleNotification(notificationTime1, notificationData1, registrationToken);




// TODO: Auth Start - Implementations on the auth_operations.js file
// Login route
app.post('/login', async (req, res) => {
    let { username, password } = req.body;

    try {
        const result = await login_post_method(username, password);
        res.json(result);
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});

// // Signup route
// app.post('/signup', async (req, res) => {
//     const { name, age, username, email, mobile, password } = req.body;

//     try {
//         const result = await signup_post_method(name, age, username, email, mobile, password);
//         res.json(result);
//     } catch (error) {
//         console.error('Error occurred during signup:', error);
//         res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
//     }
// });

// Signup route
app.post('/signup', async (req, res) => {
    const { role, formData } = req.body;
    console.log(formData, role);
    try {
        // Call the function to handle signup based on role
        // await signupByRole(role, formData);
        res.status(200).json({ success: true, message: 'Signup successful' });
    } catch (error) {
        console.error('Error occurred during signup:', error);
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to create or retrieve user UUID based on username and password




// TODO: MongoDB Atles cluster
async function connect() {
    const uri = "mongodb+srv://goal_setting:goal_setting_123@cluster0.wxus2z3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = 'goal_setting';
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
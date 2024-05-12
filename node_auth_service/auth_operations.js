const express = require('express');
const bodyParser = require('body-parser');
const UserData = require('./data_classes/user_data');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3500;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO: To .env file
const supabaseUrl = 'https://jqmrqedgufyvwewpqcfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbXJxZWRndWZ5dndld3BxY2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyODY5NDgsImV4cCI6MjAyODg2Mjk0OH0.z3aOq_fMqXC1GJUvSdvmC-hpZkmbSW26U-qdWU9hJq8';

const users_table = "medisync_users";
const otp_table = "medisync_otpdata";
////////////////

const supabase = createClient(supabaseUrl, supabaseKey);




//TODO: Crud functions
// Function to create a new record
async function createRecord(tableName, data) {
    return await supabase.from(tableName).insert(data);
  }
  
  // Function to read a record
  async function readRecord(tableName, filters) {
    return await supabase.from(tableName).select('*').match(filters);
  }
  
  // Function to update a record
  async function updateRecord(tableName, filters, newData) {
    return await supabase.from(tableName).update(newData).match(filters);
  }
  
  // Function to delete a record
  async function deleteRecord(tableName, filters) {
    return await supabase.from(tableName).delete().match(filters);
  }
  
  
  
  // CRUD function to handle all CRUD operations
  async function crud(tableName, operation, filters = {}, newData = {}) {
    let result;
    switch (operation) {
      case 'create':
        result = await createRecord(tableName, newData);
        break;
      case 'read':
        result = await readRecord(tableName, filters);
        break;
      case 'update':
        result = await updateRecord(tableName, filters, newData);
        break;
      case 'delete':
        result = await deleteRecord(tableName, filters);
        break;
      default:
        result = { error: 'Invalid operation' };
    }
    return result;
  }
  



async function login_post_method(username, password) {
    // Trim whitespace from username
    username = username.trim();
    console.log(username, "  ", password);
    const { data, error } = await crud(users_table, 'read', { username });

  
    if (error) {
      console.error('Error occurred while fetching user data:', error.message);
      throw new Error('Failed to fetch user data');
    }
  
    // Check if data is retrieved and passwords match (case-insensitive)
    if (data && data.length > 0) {
      const user = data[0]; // Assuming username is unique, so we take the first user
      
      if (user.password.toLowerCase() === password.toLowerCase() && user.username.toLowerCase() === username.toLowerCase()) {
        return { success: true, user };
      } else {
        console.log("Login failed");
        throw new Error('Invalid username or password');
      }
    } else {
      console.log("User not found");
      throw new Error('User not found');
    }
  }



  async function signupByRole(role, formData) {
    switch (role) {
        case 'patient':
            await signupPatient(formData);
            break;
        case 'doctor':
            await signupDoctor(formData);
            break;
        case 'admin':
            await signupAdmin(formData);
            break;
        default:
            throw new Error('Invalid role provided');
    }
}

async function signupPatient(formData) {
  const { fullName, contactNumber, email, password, age, locationAddress, allowExtraEmails } = formData;

  // Add logic to save patient data to medisync_patient_users table
  const newUser = {
    fullName,
    contactNumber,
    email,
    password,
    age,
    locationAddress,
    allowExtraEmails,
    role: 'patient'
  };

  await createRecord('medisync_patient_users', newUser);
}



async function signupDoctor(formData) {
  const { fullName, contactNumber, email, password, age, nic } = formData;

  // Add logic to save doctor data to medisync_doctor_users table
  const newUser = {
    fullName,
    contactNumber,
    email,
    password,
    age,
    nic,
    role: 'doctor'
  };

  await createRecord('medisync_doctor_users', newUser);
}

async function signupAdmin(formData) {
  const { fullName, contactNumber, email, password, age, requestId } = formData;

  // Add logic to save admin data to medisync_admin_users table
  const newUser = {
    fullName,
    contactNumber,
    email,
    password,
    age,
    requestId,
    role: 'admin'
  };

  await createRecord('medisync_admin_users', newUser);
}




  async function signup_post_method(name, age, username, email, mobile, password) {
    // Check if username or email already exists
    const { data: existingUser, error } = await crud(users_table, 'read', {
      or: [
        { username },
        { email }
      ]
    });
  
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
  
    // Create new user object
    const newUser = {
      name,
      age,
      username,
      email,
      mobile,
      password
    };
  
    // Add new user to the Supabase table
    const { data: createdUser, error: createError } = await crud(users_table, 'create', {}, newUser);
  
    if (createError) {
      throw new Error('Failed to create user');
    }
  
    console.log('User signed up:', createdUser);
    return { success: true, message: 'Signup successful', user: createdUser };
  }





  async function sendOTP(contact, method, isNumericOTP, otpDigitCount) {
    // Check if there's an existing OTP entry for the provided contact and method
    const { data: existingOTP, error: existingOTError } = await supabase.from(otp_table).select('id').eq('contact', contact).eq('method', method);
  
    if (existingOTError) {
      throw new Error('An error occurred while checking for existing OTP. Please try again later.');
    }
  
    let otp;
    if (existingOTP && existingOTP.length > 0) {
      // If there's an existing OTP entry, replace the OTP with a new one for resend
      otp = generateOTP(isNumericOTP, otpDigitCount);
      const existingOTPId = existingOTP[0].id;
      await supabase.from(otp_table).update({ otp: otp }).eq('id', existingOTPId);
      console.log(`Resent OTP for ${contact}: ${otp}`);
    } else {
      // Generate OTP based on provided parameters
      otp = generateOTP(isNumericOTP, otpDigitCount);
      // Save OTP along with contact and method to Supabase table
      const { data: createdOTP, error: createError } = await supabase.from(otp_table).insert([{ method, contact, otp: otp }]);
  
      if (createError) {
        // Error occurred while inserting OTP data
        console.error('Failed to save OTP data to the database:', createError);
        throw new Error('Failed to send OTP. Please try again later.');
      }
      console.log(`New OTP sent for ${contact}: ${otp}`);
    }
  
    // Implement sending OTP logic based on the method (email or mobile)
    if (method === 'email') {
      sendEmailOTP(contact, otp);
      console.log(`Email OTP sent to ${contact}: ${otp}`);
    } else if (method === 'mobile') {
      sendMobileOTP(contact, otp);
      console.log(`Mobile OTP sent to ${contact}: ${otp}`);
    } else {
      // Invalid method provided
      throw new Error('Invalid method');
    }
  
    return { success: true, message: 'OTP sent successfully' };
  }
  
  // Function to generate OTP based on provided parameters
  function generateOTP(isNumeric, digitCount) {
    let otp = '';
    const characters = isNumeric ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < digitCount; i++) {
      otp += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return otp;
  }
  
  // Placeholder functions for sending OTP through email or mobile
  function sendEmailOTP(email, OTP) {
    // Implement logic to send OTP through email
  }
  
  function sendMobileOTP(mobile, OTP) {
    // Implement logic to send OTP through SMS to the provided mobile number
  }

// verifyOTP
  async function verifyOTP(method, contact, otp) {
    // Find the OTP data based on the provided method and contact
    const { data: otpData, error } = await supabase.from(otp_table).select('otp').eq('method', method).eq('contact', contact);
  
    if (error) {
      throw new Error('An error occurred while fetching OTP data. Please try again later.');
    }
  
    if (otpData && otpData.length > 0) {
      // OTP data found for the provided method and contact
      const storedOTP = otpData[0].otp;
  
      // Check if the provided OTP matches the stored OTP
      if (storedOTP === otp) {
        // OTP verification successful
        console.log(`OTP verification successful for ${contact}`);
        return { success: true, message: 'OTP verification successful' };
      } else {
        // OTP verification failed
        console.log(`Incorrect OTP for ${contact}`);
        throw new Error('Incorrect OTP');
      }
    } else {
      // No OTP data found for the provided method and contact
      console.log(`No OTP data found for ${contact}`);
      throw new Error('OTP data not found');
    }
  }

  async function reset_pass_function(method, contact, password, res){
    // Check if the provided method and contact exist in the Supabase table
    const { data: user, error } = await supabase.from(users_table)
        .select('*')
        .eq(method === 'email' ? 'email' : 'mobile', contact);

    if (error) {
        console.error('Error occurred while resetting password:', error.message);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }

    if (user) {
        // User found, update the password
        const { data: updatedUser, updateError } = await supabase.from(users_table)
            .update({ password })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error occurred while updating password:', updateError.message);
            return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again later.' });
        }

        console.log(`Password reset successful for ${contact}`);
        res.status(200).json({ success: true, message: 'Password reset successful' });
    } else {
        // User not found
        console.log(`User not found for ${contact}`);
        res.status(404).json({ success: false, message: 'User not found' });
    }
}





  module.exports = {
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
  };
  
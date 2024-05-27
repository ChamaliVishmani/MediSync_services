const express = require('express');
const bodyParser = require('body-parser');
const UserData = require('./data_classes/user_data');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const configFile = fs.readFileSync('config.json');
const config = JSON.parse(configFile);

// Access Supabase URL, API key, and table names
const supabaseUrl = config.supabase.supabaseUrl;
const supabaseKey = config.supabase.supabaseKey;
const patient_users_tableName = config.supabase.supabasetables.patient_users;//TODO: add the other two
const doctor_users_tableName = config.supabase.supabasetables.doctor_users;//TODO: add the other two
const admin_users_tableName = config.supabase.supabasetables.admin_users;//TODO: add the other two
const superadmin_users_tableName = config.supabase.supabasetables.superadmin_users;//TODO: add the other two
const otpTableName = config.supabase.supabasetables.otp;

const app = express();
const port = 3500;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const otp_table = otpTableName;
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




async function login_post_method(email, password) {
  email = email.trim();
  console.log(email, "  ", password);

  const tables = [
      patient_users_tableName,
      doctor_users_tableName,
      admin_users_tableName,
      superadmin_users_tableName
  ];

  for (const table of tables) {
      const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('email', email);

      if (error) {
          console.error(`Error occurred while fetching user data from ${table}:`, error.message);
          continue;
      }

      if (data && data.length > 0) {
          const user = data[0];
          const passwordMatch = password===user.password;
          if (passwordMatch) {
              return { success: true, user, message: "successful login" };
          } else {
              console.log("Password mismatch for table", table);
          }
      }
  }

  console.log("User not found in any table");
  return { success: false, message: "password or the email mismatch" };
}



async function signupByRole(body) {
  let newUser;
  switch (body.role) {
    case 'patient':
      newUser = {
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        email: body.email || '',
        password: body.password || '',
        phone_number: body.phoneNumber || '',
        date_of_birth: body.dateOfBirth || '',
        gender: body.gender || '',
        medical_history: body.medicalHistory || '',
        current_medications: body.currentMedications || '',
        emergency_contact: body.emergencyContact || '',
        insurance_information: body.insuranceInformation || '',
        location_address: body.locationAddress || '',
        allow_extra_emails: body.allowExtraEmails || false,
        role: body.role || 'patient'
      };
      await signupUser(newUser, patient_users_tableName, body.role);
      break;
    case 'doctor':
      newUser = {
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        email: body.email || '',
        password: body.password || '',
        phone_number: body.phoneNumber || '',
        date_of_birth: body.dateOfBirth || '',
        gender: body.gender || '',
        specialization: body.specialization || '',
        medical_license_number: body.medicalLicenseNumber || '',
        years_of_experience: body.yearsOfExperience || '',
        clinic_affiliation: body.clinicAffiliation || '',
        allow_extra_emails: body.allowExtraEmails || false,
        role: body.role || 'doctor'
      };
      await signupUser(newUser, doctor_users_tableName, body.role);
      break;
    case 'admin':
      newUser = {
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        email: body.email || '',
        password: body.password || '',
        phone_number: body.phoneNumber || '',
        date_of_birth: body.dateOfBirth || '',
        gender: body.gender || '',
        department: body.department || '',
        employee_id: body.employeeID || '',
        office_location: body.officeLocation || '',
        allow_extra_emails: body.allowExtraEmails || false,
        role: body.role || 'admin'
      };
      await signupUser(newUser, admin_users_tableName, body.role);
      break;
    case 'superadmin':
      newUser = {
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        email: body.email || '',
        password: body.password || '',
        phone_number: body.phoneNumber || '',
        date_of_birth: body.dateOfBirth || '',
        gender: body.gender || '',
        access_level: body.accessLevel || '',
        security_clearance: body.securityClearance || '',
        employee_id: body.employeeID || '',
        allow_extra_emails: body.allowExtraEmails || false,
        role: body.role || 'superadmin'
      };
      await signupUser(newUser, superadmin_users_tableName, body.role);
      break;
    default:
      throw new Error('Invalid role provided');
  }
}


async function signupUser(newUser, dbName, role) {
  console.log("new user is : ", newUser);
  switch (role) {
    case 'patient':
    case 'doctor':
    case 'admin':
    case 'superadmin':
      await createRecord(dbName, newUser);
      break;
    default:
      throw new Error('Invalid role provided');
  }
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

async function reset_pass_function(method, contact, password, res) {
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

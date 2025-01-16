const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const UserOTPVerificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

// Create the model
const UserOTPVerification = mongoose.model(
    "UserOTPVerification",
    UserOTPVerificationSchema
);

module.exports = UserOTPVerification;


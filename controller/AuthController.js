const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/Users");
const nodemailer = require("nodemailer");
const UserOTPVerification = require("../Models/UserOTPVerification");
require("dotenv").config();

// Validate email configuration
if (!process.env.AUTH_EMAIL || !process.env.AUTH_PASSWORD) {
    throw new Error("Email configuration is missing. Check your environment variables.");
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    },
});

// Signup function
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                message: "User already exists. You can login.",
                success: false,
            });
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword });
        await newUser.save();

        // Send OTP email for verification
        await sendOTPVerificationEmail(newUser);

        return res.status(201).json({
            message: "Signup successful. Please verify your email.",
            success: true,
        });
    } catch (err) {
        console.error("Error during signup:", err.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

// Send OTP Verification Email
const sendOTPVerificationEmail = async ({ _id, email }) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save OTP to database
        const otpVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000, // 1 hour
        });
        await otpVerification.save();

        // Email options
        const mailOptions = {
            from: `Find Your Roommate <${process.env.AUTH_EMAIL}>`,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Your OTP is <b>${otp}</b>. It will expire in 1 hour.</p>`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Failed to send OTP email:", error.message);
        throw new Error("Failed to send OTP email.");
    }
};

// Test email sending function (optional, for debugging)
const sendTestEmail = async () => {
    try {
        const info = await transporter.sendMail({
            from: `Find Your Roommate <${process.env.AUTH_EMAIL}>`,
            to: "sakshimehra072@gmail.com",
            subject: "Test Email",
            text: "Hello World",
            html: "<b>Hello World!</b>",
        });
        console.log("Test email sent:", info);
    } catch (error) {
        console.error("Error sending test email:", error.message);
    }
};

// to test email sending
sendTestEmail();

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errorMsg = "Authentication failed. Email or password is incorrect.";

        // Find user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(403).json({
                message: errorMsg,
                success: false,
            });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({
                message: errorMsg,
                success: false,
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email,
            name: user.name,
        });
    } catch (err) {
        console.error("Error during login:", err.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

module.exports = {
    signup,
    login,
};



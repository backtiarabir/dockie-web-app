const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    user.password_hash = undefined; // Remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = catchAsync(async (req, res, next) => {
    // 1) Validate Input
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('student', 'printer').required(), // Admin cannot self-register usually
        university: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { name, email, password, role, university } = req.body;

    // 2) Check if email exists
    const [existingUser] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        return next(new AppError('Email already exists', 400));
    }

    // 3) Hash Password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4) Create User
    const [newUser] = await db.execute(
        'INSERT INTO users (name, email, password_hash, role, university) VALUES (?, ?, ?, ?, ?)',
        [name, email, passwordHash, role, university]
    );

    const insertId = newUser.insertId;

    // 5) Create Profile based on role
    if (role === 'student') {
        await db.execute('INSERT INTO student_profiles (user_id) VALUES (?)', [insertId]);
    } else if (role === 'printer') {
        // Create Printer Profile AND Student Profile (since Printer is also a student usually)
        await db.execute('INSERT INTO printer_profiles (user_id, printer_type) VALUES (?, ?)', [insertId, 'Generic Printer']);
        // Ideally ask for printer type, but defaults work for MVP
    }

    // 6) Return Token
    const user = { id: insertId, name, email, role, university };
    createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token
    createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
    // req.user is set by protect middleware
    const user = req.user;
    user.password_hash = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

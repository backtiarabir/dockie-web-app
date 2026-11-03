const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

exports.uploadFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No file uploaded', 400));
    }

    // Insert Record into DB
    const { originalname, filename, size, mimetype } = req.file;

    // We assume page count is 1 for MVP or sent in body, logic to count pages from PDF is heavy
    const totalPages = req.body.totalPages || 1;

    const [result] = await db.execute(
        'INSERT INTO print_files (student_id, original_name, file_path, file_name, file_type, file_size, total_pages) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, originalname, req.file.path, filename, mimetype, size, totalPages]
    );

    res.status(201).json({
        status: 'success',
        data: {
            fileId: result.insertId,
            filename
        }
    });
});

exports.createOrder = catchAsync(async (req, res, next) => {
    // Validate Input
    const schema = Joi.object({
        printerId: Joi.number().required(),
        fileId: Joi.number().required(),
        printType: Joi.string().valid('bw', 'color').required(),
        pages: Joi.number().min(1).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { printerId, fileId, printType, pages } = req.body;

    // 1. Get Printer Rates & Status
    const [printers] = await db.execute('SELECT * FROM printer_profiles WHERE user_id = ?', [printerId]);
    const printerProfile = printers[0];

    if (!printerProfile) return next(new AppError('Printer not found', 404));
    if (!printerProfile.is_active_for_work) return next(new AppError('Printer is not currently active', 400));

    // 2. Determine Price
    const pricePerPage = printType === 'color' ? printerProfile.price_per_page_color : printerProfile.price_per_page_bw;
    const totalPrice = parseFloat(pricePerPage) * parseInt(pages);
    const commission = totalPrice * 0.10; // 10%
    const printerEarning = totalPrice - commission;

    // 3. Create Transaction (Order + Payment)
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const orderCode = uuidv4().split('-')[0].toUpperCase();

        // Insert Order
        const [orderResult] = await connection.execute(
            `INSERT INTO print_orders 
      (order_code, student_id, printer_id, file_id, pages, print_type, total_price, commission_amount, printer_earning, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [orderCode, req.user.id, printerId, fileId, pages, printType, totalPrice, commission, printerEarning]
        );

        const orderId = orderResult.insertId;

        // Simulate Payment (Immediate Capture for MVP)
        await connection.execute(
            `INSERT INTO payments (order_id, amount_paid, payment_method, payment_status, paid_at) 
       VALUES (?, ?, 'balance', 'paid', NOW())`,
            [orderId, totalPrice]
        );

        // Commit
        await connection.commit();

        res.status(201).json({
            status: 'success',
            data: {
                orderId,
                orderCode,
                totalPrice
            }
        });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const [orders] = await db.execute(
        `SELECT po.*, u.name as printer_name, pf.original_name 
     FROM print_orders po 
     JOIN users u ON po.printer_id = u.id 
     JOIN print_files pf ON po.file_id = pf.id 
     WHERE po.student_id = ? 
     ORDER BY po.created_at DESC`,
        [req.user.id]
    );

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

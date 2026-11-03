const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');

exports.toggleStatus = catchAsync(async (req, res, next) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return next(new AppError('isActive must be a boolean', 400));
    }

    // Update printer_profiles
    await db.execute(
        'UPDATE printer_profiles SET is_active_for_work = ? WHERE user_id = ?',
        [isActive, req.user.id]
    );

    res.status(200).json({
        status: 'success',
        message: `Printer status updated to ${isActive ? 'Active' : 'Inactive'}`
    });
});

exports.getDashboard = catchAsync(async (req, res, next) => {
    // 1. Get Profile Stats
    const [profiles] = await db.execute(
        'SELECT rating_avg, total_jobs, is_active_for_work FROM printer_profiles WHERE user_id = ?',
        [req.user.id]
    );

    if (profiles.length === 0) return next(new AppError('Printer profile not found', 404));

    // 2. Get Pending/Active Orders
    const [activeOrders] = await db.execute(
        `SELECT po.*, pf.original_name, pf.file_path, u.name as student_name 
     FROM print_orders po
     JOIN print_files pf ON po.file_id = pf.id
     JOIN users u ON po.student_id = u.id
     WHERE po.printer_id = ? AND po.status IN ('pending', 'accepted', 'printing')
     ORDER BY po.created_at ASC`,
        [req.user.id]
    );

    // 3. Get Lifetime Earnings (Sum of completed orders)
    const [earnings] = await db.execute(
        `SELECT SUM(printer_earning) as total 
     FROM print_orders 
     WHERE printer_id = ? AND status = 'completed'`,
        [req.user.id]
    );

    res.status(200).json({
        status: 'success',
        data: {
            profile: profiles[0],
            activeOrders,
            lifetimeEarnings: earnings[0].total || 0
        }
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['accepted', 'printing', 'completed'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status update', 400));
    }

    // Check if order belongs to printer
    const [orders] = await db.execute(
        'SELECT * FROM print_orders WHERE id = ? AND printer_id = ?',
        [orderId, req.user.id]
    );

    if (orders.length === 0) {
        return next(new AppError('Order not found or not assigned to you', 404));
    }

    // Update Status
    await db.execute('UPDATE print_orders SET status = ? WHERE id = ?', [status, orderId]);

    // If completed, increment total_jobs in profile
    if (status === 'completed') {
        await db.execute('UPDATE printer_profiles SET total_jobs = total_jobs + 1 WHERE user_id = ?', [req.user.id]);
    }

    res.status(200).json({
        status: 'success',
        message: `Order ${orderId} updated to ${status}`
    });
});

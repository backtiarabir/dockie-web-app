const db = require('../config/db');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAnalytics = catchAsync(async (req, res, next) => {
    // 1. Total Revenue (Commission)
    const [revenue] = await db.execute('SELECT SUM(commission_amount) as total FROM print_orders WHERE status = "completed"');

    // 2. Total Commission
    // Note: Depending on logic, revenue might be same as commission.
    // Let's assume 'Revenue' = platform cut.

    // 3. Active Users Count
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');

    // 4. Pending Disputes
    const [disputes] = await db.execute('SELECT COUNT(*) as count FROM disputes WHERE status = "open"');

    res.status(200).json({
        status: 'success',
        data: {
            totalRevenue: revenue[0].total || 0,
            activeUsers: users[0].count,
            pendingDisputes: disputes[0].count
        }
    });
});

exports.suspendUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { isActive } = req.body; // true to unsuspend, false to suspend

    if (typeof isActive !== 'boolean') {
        return next(new AppError('isActive must be a boolean', 400));
    }

    // Prevent suspending self (though admin generally can't suspend admin in simpler systems)
    if (parseInt(userId) === req.user.id) {
        return next(new AppError('Cannot suspend yourself', 400));
    }

    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);

    // Log action
    await db.execute(
        'INSERT INTO admin_logs (admin_id, action, target_table, target_id) VALUES (?, ?, ?, ?)',
        [req.user.id, isActive ? 'UNSUSPEND_USER' : 'SUSPEND_USER', 'users', userId]
    );

    res.status(200).json({
        status: 'success',
        message: `User ${userId} status updated`
    });
});

exports.resolveDispute = catchAsync(async (req, res, next) => {
    const { disputeId } = req.params;
    const { status, note } = req.body; // 'resolved', 'rejected'

    const validStatuses = ['resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status', 400));
    }

    // Update Dispute
    await db.execute(
        'UPDATE disputes SET status = ?, admin_note = ?, resolved_at = NOW() WHERE id = ?',
        [status, note, disputeId]
    );

    // Logic: If resolved (in favor of student), maybe refund?
    // Logic: If rejected (in favor of printer), release funds?
    // MVP: Just update status.

    // Log action
    await db.execute(
        'INSERT INTO admin_logs (admin_id, action, target_table, target_id) VALUES (?, ?, ?, ?)',
        [req.user.id, `RESOLVE_DISPUTE_${status.toUpperCase()}`, 'disputes', disputeId]
    );

    res.status(200).json({
        status: 'success',
        message: 'Dispute resolved'
    });
});

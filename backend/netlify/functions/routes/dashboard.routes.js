const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const Property = require('../models/property.model');
const Lease = require('../models/lease.model');
const Maintenance = require('../models/maintenance.model');
const Payment = require('../models/payment.model');

/**
 * @route GET /api/dashboard
 * @desc Get dashboard data
 * @access Private
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total properties
    const totalProperties = await Property.countDocuments({ userId });

    // Get previous month's properties for trend calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const totalPropertiesLastMonth = await Property.countDocuments({
      userId,
      createdAt: { $lt: lastMonth }
    });

    // Calculate property trend
    const propertyTrend = totalPropertiesLastMonth > 0
      ? ((totalProperties - totalPropertiesLastMonth) / totalPropertiesLastMonth) * 100
      : 0;

    // Get active leases
    const activeLeases = await Lease.countDocuments({
      userId,
      status: 'active'
    });

    // Get previous month's active leases for trend calculation
    const activeLeasesLastMonth = await Lease.countDocuments({
      userId,
      status: 'active',
      startDate: { $lt: lastMonth }
    });

    // Calculate lease trend
    const leaseTrend = activeLeasesLastMonth > 0
      ? ((activeLeases - activeLeasesLastMonth) / activeLeasesLastMonth) * 100
      : 0;

    // Get monthly revenue (sum of payments for current month)
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const payments = await Payment.find({
      userId,
      paymentDate: {
        $gte: currentMonth,
        $lt: nextMonth
      },
      status: 'completed'
    });

    const monthlyRevenue = payments.reduce((total, payment) => total + payment.amount, 0);

    // Get previous month's revenue for trend calculation
    const previousMonthStart = new Date(currentMonth);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    
    const previousMonthPayments = await Payment.find({
      userId,
      paymentDate: {
        $gte: previousMonthStart,
        $lt: currentMonth
      },
      status: 'completed'
    });

    const previousMonthRevenue = previousMonthPayments.reduce((total, payment) => total + payment.amount, 0);

    // Calculate revenue trend
    const revenueTrend = previousMonthRevenue > 0
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // Get active maintenance requests
    const activeMaintenance = await Maintenance.countDocuments({
      userId,
      status: { $in: ['open', 'in-progress'] }
    });

    // Get previous month's active maintenance requests for trend calculation
    const activeMaintenanceLastMonth = await Maintenance.countDocuments({
      userId,
      status: { $in: ['open', 'in-progress'] },
      createdAt: { $lt: lastMonth }
    });

    // Calculate maintenance trend (negative is good for maintenance)
    const maintenanceTrend = activeMaintenanceLastMonth > 0
      ? ((activeMaintenance - activeMaintenanceLastMonth) / activeMaintenanceLastMonth) * -100
      : 0;

    // Return dashboard data
    return res.json({
      totalProperties,
      activeLeases,
      monthlyRevenue,
      activeMaintenance,
      propertyTrend,
      leaseTrend,
      revenueTrend,
      maintenanceTrend
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
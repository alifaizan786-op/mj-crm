const { WebChangeLog } = require('../models/');

module.exports = {
  // Generic Change Log Viewer Controller
  // Generic Change Log Viewer Controller
  // Generic Change Log Viewer Controller
  async getChangeLogs(req, res) {
    try {
      const {
        destination,
        id,
        user,
        fieldName,
        source,
        fromDate,
        toDate,
        page = 1,
        limit = 50,
      } = req.query;

      // Build filter object
      const filter = {};

      if (destination) filter.destination = destination;
      if (id) filter.id = id;
      if (user) filter.user = new RegExp(user, 'i');
      if (fieldName) filter['changes.fieldName'] = fieldName;
      if (source) filter['changes.source'] = source;

      // Date range filter
      if (fromDate || toDate) {
        filter.timestamp = {};
        if (fromDate) filter.timestamp.$gte = new Date(fromDate);
        if (toDate) filter.timestamp.$lte = new Date(toDate);
      }

      // Pagination
      const skip = (page - 1) * limit;
      const totalLogs = await WebChangeLog.countDocuments(filter);
      const totalPages = Math.ceil(totalLogs / limit);

      // Get logs with pagination and populate user details (remove .lean() to keep instance methods)
      const logs = await WebChangeLog.find(filter)
        .populate(
          'user',
          'firstName lastName email username name employeeId'
        ) // Added employeeId
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Add readable summaries with populated user data (now we can use getSummary())
      const logsWithSummary = logs.map((log) => ({
        _id: log._id,
        timestamp: log.timestamp,
        user: log.user,
        destination: log.destination,
        id: log.id,
        changes: log.changes,
        summary: log.getSummary(), // This will now work!
      }));

      res.json({
        message: 'Change logs retrieved successfully',
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalLogs,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        logs: logsWithSummary,
      });
    } catch (error) {
      console.error('Failed to retrieve change logs:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve change logs',
        details: error.message,
      });
    }
  },
};

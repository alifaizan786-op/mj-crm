const { UserLogs } = require('../models/');

module.exports = {
  async getAllUserLogs(req, res) {
    try {
      const logs = await UserLogs.find().populate('user');
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getUserLogsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const logs = await UserLogs.find({ user: userId }).populate(
        'user'
      );
      if (!logs.length) {
        return res
          .status(404)
          .json({ message: 'No logs found for this user.' });
      }
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getUserLogsByLogId(req, res) {
    try {
      const { logId } = req.params;
      const log = await UserLogs.findById(logId).populate('user');
      if (!log) {
        return res.status(404).json({ message: 'Log not found.' });
      }
      res.status(200).json(log);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async createLog(req, res) {
    try {
      const { user, body } = req.body;
      if (!user || !body) {
        return res
          .status(400)
          .json({ message: 'User and body are required.' });
      }
      const newLog = await UserLogs.create({ user, body });
      res.status(201).json(newLog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async updateLogById(req, res) {
    try {
      const { logId } = req.params;
      const updates = req.body;
      const updatedLog = await UserLogs.findByIdAndUpdate(
        logId,
        updates,
        { new: true }
      ).populate('user');
      if (!updatedLog) {
        return res.status(404).json({ message: 'Log not found.' });
      }
      res.status(200).json(updatedLog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteLogById(req, res) {
    try {
      const { logId } = req.params;
      const deletedLog = await UserLogs.findByIdAndDelete(logId);
      if (!deletedLog) {
        return res.status(404).json({ message: 'Log not found.' });
      }
      res
        .status(200)
        .json({ message: 'Log deleted successfully.', deletedLog });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

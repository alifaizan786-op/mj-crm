const { User } = require('../models');
const { signToken } = require('../utils/auth');

module.exports = {
  async createUser(req, res) {
    try {
      const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        employeeId: req.body.employeeId,
        department: req.body.department,
        password: req.body.password,
        active: true,
        views: req.body.views,
        permissions: req.body.permissions,
      });
      res.status(200).json(newUser);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async login(req, res) {
    const { employeeId, password } = req.body;
    const user = await User.findOne({ employeeId });

    if (!user) {
      res.status(401).json({ error: 'User Not Found' });
      return;
    }

    const correctPassword = await user.isCorrectPassword(password);

    if (!correctPassword) {
      res.status(401).json({ error: 'Password Is Incorrect' });
      return;
    }

    const token = signToken(user);

    res.status(200).json({ user, token });
  },
  async getAllUsers(req, res) {
    try {
      const allUsers = await User.find({});
      res.status(200).json(allUsers);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async deleteUserById(req, res) {
    try {
      const { id } = req.params;

      const deactivatedUser = await User.findByIdAndUpdate(
        id,
        { active: false },
        { new: true, runValidators: true }
      );

      if (!deactivatedUser) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      res.status(200).json({
        message: 'User Deactivated Successfully',
        user: deactivatedUser,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

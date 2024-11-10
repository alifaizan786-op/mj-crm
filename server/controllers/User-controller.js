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
};

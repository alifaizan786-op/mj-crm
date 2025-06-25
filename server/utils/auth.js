const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET;
const expiration = '8h';

module.exports = {
  authMiddleware: function (req, res, next) {
    let token =
      req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return res.status(400).json({ message: 'No token provided!' });
    }

    try {
      const { data } = jwt.verify(token, secret, {
        maxAge: expiration,
      });

      req.user = data;
      next();
    } catch {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token!' }); // Add this line
    }
  },

  signToken: function ({
    _id,
    firstName,
    lastName,
    employeeId,
    department,
    views,
    permissions,
    region,
    title,
    bookmarks,
  }) {
    const payload = {
      _id,
      firstName,
      lastName,
      employeeId,
      department,
      views,
      permissions,
      region,
      title,
      bookmarks,
    };
    return jwt.sign({ data: payload }, secret, {
      expiresIn: expiration,
    });
  },
};

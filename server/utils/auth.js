const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET;
const expiration = '8h';

module.exports = {
  authMiddleware: function ({ req }) {
    let token =
      req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, {
        maxAge: expiration,
      });
      req.user = data;
    } catch {
      // console.log('Invalid token');
    }

    return req;
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

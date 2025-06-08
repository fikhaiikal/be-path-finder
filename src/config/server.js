require('dotenv').config();

const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 5000,
};

module.exports = config; 
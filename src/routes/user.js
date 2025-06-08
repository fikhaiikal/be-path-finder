const { registerValidation, loginValidation } = require('../validations/user');
const { registerHandler, loginHandler } = require('../handlers/user');

const userRoutes = [
  {
    method: 'POST',
    path: '/users/register',
    options: {
      handler: registerHandler,
      validate: {
        payload: registerValidation,
        failAction: async (request, h, error) => {
          const errors = error.details.map(detail => detail.message);
          const response = {
            status: 'fail',
            message: errors[0]
          };
          return h.response(response).code(400).takeover();
        }
      },
      description: 'Register user baru',
      notes: 'Endpoint untuk mendaftarkan user baru',
      tags: ['api', 'users']
    }
  },
  {
    method: 'POST',
    path: '/users/login',
    options: {
      handler: loginHandler,
      validate: {
        payload: loginValidation,
        failAction: async (request, h, error) => {
          const errors = error.details.map(detail => detail.message);
          const response = {
            status: 'fail',
            message: errors[0]
          };
          return h.response(response).code(400).takeover();
        }
      },
      description: 'Login user',
      notes: 'Endpoint untuk login user',
      tags: ['api', 'users']
    }
  }
];

module.exports = userRoutes; 
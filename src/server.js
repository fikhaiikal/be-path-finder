const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const config = require('./config/server');
const userRoutes = require('./routes/user');
const uploadCvRoute = require('./routes/upload');

const init = async () => {
  const server = Hapi.server({
    host: config.host,
    port: config.port,
    routes: {
      cors: {
        origin: ['*'],
      },
      validate: {
        validator: Joi
      }
    }
  });

  // Register routes
  server.route(userRoutes);
  server.route(uploadCvRoute);

  // Route dasar untuk testing
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Server berjalan dengan baik!',
      }).code(200);
    },
  });

  // Endpoint health check
  server.route({
    method: 'GET',
    path: '/health',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
      }).code(200);
    },
  });

  // Error handling
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    
    // Jika response adalah error
    if (response.isBoom) {
      const errorResponse = {
        status: 'fail',
        message: response.message
      };
      return h.response(errorResponse).code(response.output.statusCode);
    }

    // Jika response adalah error biasa
    if (response instanceof Error) {
      return h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server'
      }).code(500);
    }

    // Jika response adalah object biasa
    if (typeof response === 'object' && response !== null) {
      return h.response(response).code(response.statusCode || 200);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init(); 
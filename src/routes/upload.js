const path = require('path');
const fs = require('fs');
const Joi = require('@hapi/joi');
const { uploadCvHandler } = require('../handlers/upload');

const uploadCvRoute = [
  {
    method: 'POST',
    path: '/upload/cv',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 5 * 1024 * 1024, // 5MB
        multipart: true
      },
      validate: {
        payload: Joi.object({
          file: Joi.any()
            .meta({ swaggerType: 'file' })
            .required()
            .description('File PDF CV')
        }),
        failAction: async (request, h, error) => {
          const errors = error.details.map(detail => detail.message);
          return h.response({
            status: 'fail',
            message: errors[0]
          }).code(400).takeover();
        }
      },
      handler: uploadCvHandler
    }
  }
];

module.exports = uploadCvRoute; 
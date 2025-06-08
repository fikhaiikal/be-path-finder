const Joi = require('@hapi/joi');

const registerValidation = Joi.object({
  fullname: Joi.string().required().min(3).max(100).messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
    'string.min': 'Nama lengkap minimal 3 karakter',
    'string.max': 'Nama lengkap maksimal 100 karakter',
    'any.required': 'Nama lengkap harus diisi'
  }),
  email: Joi.string().required().email().messages({
    'string.empty': 'Email tidak boleh kosong',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email harus diisi'
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Password tidak boleh kosong',
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password harus diisi'
  })
});

const loginValidation = Joi.object({
  email: Joi.string().required().email().messages({
    'string.empty': 'Email tidak boleh kosong',
    'string.email': 'Format email tidak valid',
    'any.required': 'Email harus diisi'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password tidak boleh kosong',
    'any.required': 'Password harus diisi'
  })
});

module.exports = {
  registerValidation,
  loginValidation
}; 
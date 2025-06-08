const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES_IN = '1h';

const registerHandler = async (request, h) => {
  try {
    const { fullname, email, password } = request.payload;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      const response = {
        status: 'fail',
        message: 'Email sudah terdaftar'
      };
      return h.response(response).code(400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await User.create({
      name: fullname,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Hapus password dari response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const response = {
      status: 'success',
      message: 'User berhasil didaftarkan',
      data: userResponse
    };
    
    return h.response(response).code(201);

  } catch (error) {
    const errorResponse = {
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name
      } : undefined
    };
    
    return h.response(errorResponse).code(500);
  }
};

const loginHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;

    // Cari user berdasarkan email
    const user = await User.findOne({ 
      where: { email },
    });

    if (!user) {
      const response = {
        status: 'fail',
        message: 'Email atau password salah'
      };
      return h.response(response).code(401);
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const response = {
        status: 'fail',
        message: 'Email atau password salah'
      };
      return h.response(response).code(401);
    }

    // Generate JWT token
    const tokenPayload = {
      name: user.name,
      role: user.role
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Hapus password dari response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const response = {
      status: 'success',
      message: 'Login berhasil',
      data: {
        user: userResponse,
        accessToken
      }
    };
    
    return h.response(response).code(200);

  } catch (error) {
    const errorResponse = {
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name
      } : undefined
    };
    
    return h.response(errorResponse).code(500);
  }
};

module.exports = {
  registerHandler,
  loginHandler
}; 
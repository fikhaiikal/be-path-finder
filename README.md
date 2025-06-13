# 🎯 BE-Pathfinder

Backend service untuk aplikasi Pathfinder - platform job matching dengan integrasi AI/ML untuk CV analysis dan job recommendations.

## 🏗️ Tech Stack

### Backend Framework & Runtime
- **Node.js v18** - Runtime environment JavaScript
- **Hapi.js (@hapi/hapi v21.4.0)** - Web framework untuk membangun API
- **Nodemon** - Development tool untuk auto-restart server

### Database & ORM
- **PostgreSQL v17.2** - Database utama
- **Sequelize v6.37.7** - ORM (Object-Relational Mapping)
- **Sequelize CLI** - Command line tools untuk migration

### Authentication & Security
- **JWT (jsonwebtoken)** - JSON Web Token untuk autentikasi
- **bcryptjs** - Hashing password dengan salt
- **@hapi/joi** - Validasi input dan schema

### File Processing & External APIs
- **pdf-parse** - Library untuk mengekstrak text dari file PDF
- **SerpApi** - API untuk mencari lowongan pekerjaan dari Google Jobs
- **Axios** - HTTP client untuk request ke external APIs

### Containerization
- **Docker** - Containerization untuk development dan deployment
- **Docker Compose** - Multi-container orchestration

## 🚀 Features

- ✅ User authentication (register/login) dengan JWT
- ✅ CV upload dan text extraction dari PDF
- ✅ Integrasi dengan ML API untuk job recommendations
- ✅ Integrasi dengan Review API untuk CV analysis
- ✅ Job search via SerpApi (Google Jobs)
- ✅ Similarity scoring untuk job matching
- ✅ Comprehensive error handling dan logging
- ✅ Health check endpoint
- ✅ CORS enabled

## 📋 Prerequisites

- Node.js v18 atau lebih tinggi
- PostgreSQL v17.2
- Docker & Docker Compose (opsional)
- API keys:
  - SerpApi key
  - ML API endpoint
  - Review API endpoint

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd be-pathfinder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Buat file `.env` di root directory:
```env
# Server Configuration
HOST=0.0.0.0
PORT=9000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=pathfinder

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# External APIs
SERPAPI_KEY=your_serpapi_key
ML_API_URL=http://172.20.10.11:8000/process-resume
REVIEW_API_URL=http://172.20.10.11:8000/review
```

### 4. Database Setup
```bash
# Run migrations
npm run migrate

# Undo migrations (if needed)
npm run migrate:undo
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# Stop containers
docker-compose down
```

## 📚 API Documentation

### Base URL
```
http://localhost:9000
```

### Authentication
API menggunakan JWT Bearer token. Setelah login, include token di header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2024-05-07T12:34:56.789Z"
}
```

#### 2. User Registration
```http
POST /users/register
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "User berhasil didaftarkan",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-05-07T12:34:56.789Z"
  }
}
```

#### 3. User Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4. CV Upload & Processing
```http
POST /upload/cv
Content-Type: multipart/form-data

file: [PDF file]
```
**Response:**
```json
{
  "status": "success",
  "message": "File berhasil diupload",
  "data": {
    "filename": "1712345678901_cv.pdf",
    "path": "/path/to/uploads/1712345678901_cv.pdf",
    "pdfText": "Extracted text from PDF...",
    "recommendedJobs": [
      {
        "cv_index": 1,
        "recommended_job_title": "Data Scientist, Co-Op",
        "similarity_score": "67.128"
      }
    ],
    "review": {
      "strengths": [
        "Strong technical background...",
        "Proficient in javascript..."
      ],
      "suggestions": [
        "Add quantifiable achievements...",
        "Include specific project outcomes..."
      ],
      "weaknesses": [
        "Consider adding more specific project achievements...",
        "Could benefit from more detailed metrics..."
      ]
    },
    "jobs": [
      {
        "job": "Data Scientist, Co-Op",
        "percent": 67.128,
        "list_jobs": [
          {
            "title": "Data Scientist",
            "company_name": "Tech Corp",
            "location": "Jakarta, Indonesia",
            "via": "LinkedIn",
            "description": "Job description...",
            "job_highlights": [],
            "related_links": [],
            "thumbnail": "https://...",
            "extensions": ["Full-time", "Mid-Senior level"],
            "detected_extensions": {
              "posted_at": "2 days ago",
              "schedule_type": "Full-time",
              "experience_level": "Mid-Senior level"
            },
            "job_id": "job_id_here"
          }
        ]
      }
    ]
  }
}
```
## 🐳 Docker Deployment

### Build Image
```bash
docker build -t be-pathfinder .
```

### Run Container
```bash
docker run -p 9000:9000 --env-file .env be-pathfinder
```

### Docker Compose
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```
## 📁 Project Structure

```
be-pathfinder/
├── src/
│   ├── config/          # Konfigurasi database dan server
│   │   ├── database.js
│   │   └── server.js
│   ├── models/          # Sequelize models
│   │   ├── index.js
│   │   └── user.js
│   ├── routes/          # API route definitions
│   │   ├── user.js
│   │   └── upload.js
│   ├── handlers/        # Business logic handlers
│   │   ├── user.js
│   │   └── upload.js
│   ├── validations/     # Input validation schemas
│   │   └── user.js
│   ├── migrations/      # Database migrations
│   │   └── 20250606071017-create-users.js
│   └── server.js        # Entry point aplikasi
├── uploads/             # Uploaded files directory
├── .env                 # Environment variables
├── .gitignore
├── .sequelizerc         # Sequelize configuration
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Docker configuration
├── package.json
└── README.md
```

## 📄 License

This project is licensed under the ISC License.
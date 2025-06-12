const path = require('path');
const fs = require('fs');
const { getJson } = require('serpapi');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const FormData = require('form-data');

const SERPAPI_KEY = process.env.SERPAPI_KEY || 'YOUR_SERPAPI_KEY';
const ML_API_URL = process.env.ML_API_URL || 'http://172.20.10.11:8000/process-resume';
const REVIEW_API_URL = process.env.REVIEW_API_URL || 'http://172.20.10.11:8000/review';

const searchJobs = (query) => {
  return new Promise((resolve, reject) => {
    getJson({
      engine: 'google_jobs',
      api_key: SERPAPI_KEY,
      q: query,
      hl: 'id',
      location: 'Indonesia',
      google_domain: 'google.com',
      gl: 'id',
    }, (json) => {
      if (json && json.jobs_results) {
        resolve(json.jobs_results);
      } else {
        resolve([]);
      }
    });
  });
};

const getRecommendedJobs = async (filePath) => {
  try {
    console.log('Mengirim file ke ML API...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(ML_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log('Response dari ML API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling ML API:', error.message);
    // Fallback ke positions default jika ML API error
    return [
      { recommended_job_title: 'back end' },
      { recommended_job_title: 'front end' },
      { recommended_job_title: 'designer' }
    ];
  }
};

const getReview = async (filePath) => {
  try {
    console.log('Mengirim file ke Review API...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(REVIEW_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log('Response dari Review API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling Review API:', error.message);
    // Fallback review jika API error
    return {
      review: {
        strengths: ['Tidak dapat mendapatkan review'],
        suggestions: ['Coba lagi nanti'],
        weaknesses: ['Tidak dapat menganalisis']
      }
    };
  }
};

const uploadCvHandler = async (request, h) => {
  const { file } = request.payload;

  if (!file || !file.hapi) {
    return h.response({
      status: 'fail',
      message: 'File tidak ditemukan'
    }).code(400);
  }
  // Validasi ekstensi
  const filename = file.hapi.filename;
  const ext = path.extname(filename).toLowerCase();
  if (ext !== '.pdf') {
    return h.response({
      status: 'fail',
      message: 'Hanya file PDF yang diperbolehkan'
    }).code(400);
  }
  // Simpan file ke folder uploads
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const savePath = path.join(uploadDir, `${Date.now()}_${filename}`);
  
  // Simpan file dengan promise
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(savePath);
    file.pipe(fileStream);
    file.on('end', () => {
      fileStream.end();
      resolve();
    });
    file.on('error', reject);
    fileStream.on('error', reject);
  });

  // Validasi file tersimpan
  if (!fs.existsSync(savePath)) {
    return h.response({
      status: 'fail',
      message: 'Gagal menyimpan file'
    }).code(500);
  }

  // Convert PDF ke text untuk logging
  let pdfText = '';
  try {
    // Tunggu sebentar untuk memastikan file benar-benar tersimpan
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Baca file yang sudah tersimpan
    const dataBuffer = fs.readFileSync(savePath);
    
    // Debug: log file size
    console.log('File size:', dataBuffer.length, 'bytes');
    console.log('File path:', savePath);
    
    // Validasi file tidak kosong
    if (!dataBuffer || dataBuffer.length === 0) {
      pdfText = 'File PDF kosong';
      console.log('Buffer kosong, file mungkin belum selesai ditulis');
    } else {
      console.log('Mencoba parse PDF...');
      const data = await pdfParse(dataBuffer);
      pdfText = data.text || 'Tidak ada text yang dapat diekstrak dari PDF';
      console.log('PDF berhasil di-parse, text length:', pdfText.length);
    }
  } catch (err) {
    console.error('Error parsing PDF:', err);
    pdfText = `Gagal membaca file PDF: ${err.message}`;
  }

  // Get recommended jobs from ML API (kirim file)
  const recommendedJobs = await getRecommendedJobs(savePath);
  const positions = recommendedJobs.map(job => job.recommended_job_title);

  // Get review from Review API (kirim file)
  const reviewData = await getReview(savePath);

  // Search jobs untuk setiap posisi yang direkomendasikan
  let jobsResult = [];
  try {
    const jobsList = await Promise.all(
      positions.map(async (pos, index) => {
        const list_jobs = await searchJobs(pos);
        // Gunakan similarity score dari ML API, atau random jika tidak ada
        const similarityScore = recommendedJobs[index]?.similarity_score || Math.floor(Math.random() * 91) + 10;
        return {
          job: pos,
          percent: parseFloat(similarityScore),
          list_jobs
        };
      })
    );
    jobsResult = jobsList;
  } catch (err) {
    jobsResult = [];
  }

  return h.response({
    status: 'success',
    message: 'File berhasil diupload',
    data: {
      filename: path.basename(savePath),
      path: savePath,
      pdfText,
      recommendedJobs,
      review: reviewData.review,
      jobs: jobsResult
    }
  }).code(201);
};

module.exports = { uploadCvHandler }; 
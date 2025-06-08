const path = require('path');
const fs = require('fs');
const { getJson } = require('serpapi');

const SERPAPI_KEY = process.env.SERPAPI_KEY || 'YOUR_SERPAPI_KEY';

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

const uploadCvHandler = async (request, h) => {
  const { file } = request.payload;
  // Dummy positions, nanti bisa diganti dinamis
  const positions = ['back end', 'front end', 'designer'];

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
  const fileStream = fs.createWriteStream(savePath);
  await new Promise((resolve, reject) => {
    file.pipe(fileStream);
    file.on('end', resolve);
    file.on('error', reject);
  });

  // Search jobs untuk setiap posisi
  let jobsResult = [];
  try {
    const jobsList = await Promise.all(
      positions.map(async (pos) => {
        const list_jobs = await searchJobs(pos);
        // percent dummy (random 10-100)
        const percent = Math.floor(Math.random() * 91) + 10;
        return {
          job: pos,
          percent,
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
      jobs: jobsResult
    }
  }).code(201);
};

module.exports = { uploadCvHandler }; 
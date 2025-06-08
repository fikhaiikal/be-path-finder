# Menggunakan Node.js versi LTS terbaru
FROM node:18

# Membuat direktori kerja
WORKDIR /usr/src/app

# Menyalin package.json dan package-lock.json
COPY package*.json ./

# Menginstall dependencies
RUN npm install

# Menyalin semua file aplikasi
COPY . .

# Mengekspos port yang digunakan aplikasi
EXPOSE 9000

# Menjalankan aplikasi
CMD ["npm", "run", "dev"] 
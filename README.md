# PasteDL 📋✈️

**PasteDL** (Paste-to-Download) adalah sebuah aplikasi web utilitas *single-page* estat statis yang sangat ringan, premium, dan minimalis. Aplikasi ini berjalan **100% di sisi klien (client-side)** di peramban Anda, menjamin seluruh proses pemformatan, kompresi, dan pembacaan berkas berjalan aman secara lokal tanpa mengirimkan data apa pun ke server luar.

Dirancang khusus dengan estetika **Light Mode Sand & Chestnut Brown** yang bersih dan padat, PasteDL sangat ramah digunakan sebagai alat pembantu pengembang (*developer tool*) baik di komputer maupun di layar sentuh ponsel (*mobile optimized*).

---

## ✨ Fitur Utama

1. **Smart Text & Code Editor**:
   * Penomoran baris (*line numbering*) yang responsif.
   * Deteksi cerdas format teks otomatis (menyisir dan menyarankan ekstensi berkas untuk JSON, Markdown, JavaScript, HTML, CSS, CSV, Python, Shell Script, XML, dll.).
   * Opsi penamaan berkas keluaran kustom sebelum diunduh.

2. **Image Clipboard Converter**:
   * Cukup salin (*copy*) gambar dari mana saja, lalu tempel (*paste*) atau seret-dan-lepas (*drag & drop*) di area pratinjau.
   * Menampilkan metadata lengkap gambar (lebar/tinggi dalam piksel dan ukuran asli berkas).
   * Konversi format gambar instan ke **PNG Lossless**, **JPEG Standard**, atau **WebP Modern** dengan dukungan pengatur kualitas (*Quality Slider*).

3. **Base64 Binary Decoder**:
   * Mendekode teks terenkripsi Base64 (baik format standar maupun *URL-safe*) kembali menjadi berkas biner aslinya (seperti gambar, PDF, dokumen Word, arsip ZIP, dll.).
   * Deteksi otomatis jenis MIME dan taksiran ukuran biner akhir.

4. **SVG Previewer & PNG Renderer**:
   * Tempel kode mentah `<svg>` Anda untuk melihat pratinjau vektornya secara instan pada layar transparan (*checkerboard grid*).
   * Render vector ke format raster **PNG resolusi tinggi** dengan lebar dan tinggi keluaran piksel kustom yang bisa Anda atur sendiri.

5. **CORS-Aware URL Downloader**:
   * Tempel tautan URL berkas langsung untuk mengunduhnya ke memori browser.
   * Dilengkapi penanganan pembatasan CORS andal dan menyediakan tautan cadangan langsung (*fallback link*) jika akses eksternal diblokir.

6. **Mobile Optimized & Native-App Experience**:
   * **Bilah Navigasi Bawah Sticky**: Di layar ponsel, menu samping otomatis bergeser ke bawah layar mirip aplikasi ponsel modern (Spotify/Instagram).
   * **Tombol Paste Global Seluler**: Terintegrasi tombol khusus **[📋 Paste Clipboard]** di bagian paling kanan banner atas khusus untuk mobile, didukung oleh *Clipboard API peramban* dan ikon kustom yang sangat tajam untuk memudahkan penempelan data dalam sekali ketuk.

---

## 🛠️ Teknologi yang Digunakan

*   **HTML5 & CSS3**: Struktur semantik modern dengan CSS Custom Properties (Variabel CSS) untuk kerapatan layout yang sangat efisien.
*   **Vanilla ES6 JavaScript**: Seluruh alur kerja fungsionalitas (File Blob API, Canvas rendering, base64 decoding, Clipboard read, dan toast) menggunakan javascript murni bebas ketergantungan (*dependency-free*).
*   **Lucide Icons**: Pustaka ikon vektor yang tajam dan minimalis.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi **MIT**. Anda bebas menyalin, memodifikasi, dan menggunakannya secara gratis.

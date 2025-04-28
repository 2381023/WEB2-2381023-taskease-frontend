import axios from "axios";

// Baca base URL dari environment variable, fallback ke localhost jika tidak ada
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Log untuk memastikan URL benar saat aplikasi frontend dimuat
console.log("Connecting to API Base URL:", API_BASE_URL);

// Buat instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Axios Request Interceptor =====
// Tugas: Menambahkan token JWT ke header Authorization untuk setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (tempat kita menyimpannya setelah login/register)
    const token = localStorage.getItem("taskease_token");
    // Jika token ada, tambahkan ke header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('Interceptor: Attaching token to request header'); // Uncomment for debugging
    } else {
      // console.log('Interceptor: No token found in localStorage'); // Uncomment for debugging
    }
    return config; // Kembalikan config yang sudah dimodifikasi (atau asli jika tanpa token)
  },
  (error) => {
    // Tangani error pada setup request
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ===== Axios Response Interceptor =====
// Tugas: Menangani error response global, khususnya 401 Unauthorized
api.interceptors.response.use(
  // Fungsi ini dipanggil jika response SUKSES (status 2xx)
  (response) => {
    // Langsung kembalikan response jika sukses
    return response;
  },
  // Fungsi ini dipanggil jika response GAGAL (status non-2xx)
  (error) => {
    console.error("Axios response error:", error.response || error.message); // Log error response

    // Cek jika error disebabkan oleh response server dan statusnya 401
    if (error.response && error.response.status === 401) {
      console.warn("Interceptor: Received 401 Unauthorized response.");
      // Hapus token yang mungkin tidak valid/kadaluwarsa dari localStorage
      localStorage.removeItem("taskease_token");

      // Redirect ke halaman login jika kita tidak sedang di halaman login
      // Ini mencegah infinite redirect loop jika halaman login itu sendiri gagal
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        console.log("Interceptor: Redirecting to /login due to 401.");
        // Cara redirect paling sederhana, atau gunakan navigate dari React Router jika setup memungkinkan
        window.location.href = "/login";
      } else {
        console.log(
          "Interceptor: Already on login/register page or no response, not redirecting."
        );
      }
    }
    // Penting: Kembalikan error agar bisa ditangani lebih lanjut oleh pemanggil (misalnya di komponen React)
    return Promise.reject(error);
  }
);

// Ekspor instance Axios yang sudah dikonfigurasi
export default api;

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "../types/user"; // Asumsi path ini benar
import api from "../services/api"; // <-- Impor instance Axios yang benar

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("taskease_token")
  ); // Baca dari local storage saat init
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Mulai loading

  // Fungsi untuk mengambil profil user dari backend
  const fetchUserProfile = useCallback(async () => {
    const currentToken = localStorage.getItem("taskease_token"); // Cek token lagi
    if (!currentToken) {
      // console.log("fetchUserProfile: No token found, clearing user state."); // Debug log
      setToken(null); // Pastikan state token konsisten
      setUser(null);
      setIsLoading(false);
      return;
    }

    // console.log("fetchUserProfile: Token found, attempting to fetch profile..."); // Debug log
    setIsLoading(true); // Set loading true saat fetching
    try {
      // Gunakan instance 'api' yang sudah ada interceptor token-nya
      const response = await api.get<User>("/users/me"); // Endpoint profile
      setUser(response.data);
      // console.log("fetchUserProfile: Profile fetched successfully:", response.data); // Debug log
    } catch (error: any) {
      console.error(
        "Failed to fetch user profile:",
        error.response?.data || error.message
      );
      // Jika gagal (misal token invalid/expired), hapus token dan user
      logout(); // Panggil logout untuk membersihkan state
    } finally {
      setIsLoading(false); // Set loading false setelah selesai
    }
  }, []); // useCallback tanpa dependensi jika logout menangani state

  // Cek token saat komponen pertama kali mount
  useEffect(() => {
    if (token) {
      // console.log("AuthProvider Mount: Token exists, fetching profile."); // Debug log
      fetchUserProfile(); // Panggil fetch jika token ada
    } else {
      // console.log("AuthProvider Mount: No token, setting loading false."); // Debug log
      setIsLoading(false); // Jika tidak ada token, selesai loading
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya run sekali saat mount

  // Fungsi untuk menangani login
  const login = async (newToken: string) => {
    // console.log("AuthContext: login called."); // Debug log
    localStorage.setItem("taskease_token", newToken); // Simpan token ke localStorage
    setToken(newToken); // Update state token
    await fetchUserProfile(); // Ambil profile user setelah login
  };

  // Fungsi untuk menangani logout
  const logout = () => {
    // console.log("AuthContext: logout called."); // Debug log
    localStorage.removeItem("taskease_token"); // Hapus token
    setToken(null); // Reset state token
    setUser(null); // Reset state user
    // setIsLoading(false); // Tidak perlu set isLoading di sini, fetchUserProfile akan handle
  };

  const contextValue: AuthContextType = {
    // Anggap terotentikasi jika ada token DAN data user (setelah fetch berhasil)
    isAuthenticated: !!token && !!user,
    user,
    token,
    isLoading, // Expose loading state
    login,
    logout,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Tampilkan children hanya jika tidak loading, atau tampilkan loader */}
      {/* {!isLoading ? children : <div>Loading Authentication...</div>} */}
      {children} {/* Atau biarkan komponen anak yang handle loading */}
    </AuthContext.Provider>
  );
};

/**
 * Get the stored auth token
 * @returns {string|null} The auth token or null if not found
 */
export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Get the stored user name
 * @returns {string|null} The user name or null if not found
 */
export function getUserName() {
  return localStorage.getItem('user_name');
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user has a valid token
 */
export function isLoggedIn() {
  return !!getAuthToken();
}

/**
 * Logout user by removing token from localStorage
 */
export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_name');
  console.log('✅ Logout berhasil, token dihapus dari localStorage');
}

/**
 * Display auth information in console
 */
export function displayAuthInfo() {
  const token = getAuthToken();
  const userName = getUserName();
  
  if (token) {
    console.log('✅ Anda sudah login');
    console.log('👤 Nama:', userName);
    console.log('🔑 Token:', token.substring(0, 20) + '...' + token.substring(token.length - 10));
    console.log('📦 Token tersimpan di: localStorage.getItem("auth_token")');
    return true;
  } else {
    console.log('❌ Belum login');
    return false;
  }
}

export default {
  getAuthToken,
  getUserName,
  isLoggedIn,
  logout,
  displayAuthInfo,
};


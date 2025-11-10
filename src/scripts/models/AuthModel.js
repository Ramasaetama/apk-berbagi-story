/**
 * Authentication Model - Handles auth data operations
 */
import DicodingStoryAPI from '../data/api.js';
import { getAuthToken, getUserName, isLoggedIn, logout } from '../utils/auth.js';

class AuthModel {
  constructor() {
    this.api = new DicodingStoryAPI();
    this.loading = false;
    this.error = null;
  }

  async login(email, password) {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.api.login(email, password);
      
      if (result.error === false && result.loginResult) {
        const { token, name } = result.loginResult;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_name', name);
        
        return { success: true, token, name };
      } else {
        throw new Error(result.message || 'Login gagal');
      }
    } catch (error) {
      this.error = error.message;
      return { success: false, error: error.message };
    } finally {
      this.loading = false;
    }
  }

  async register(name, email, password) {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.api.register(name, email, password);
      
      if (result.error === false) {
        return { success: true, message: result.message || 'Registrasi berhasil' };
      } else {
        throw new Error(result.message || 'Registrasi gagal');
      }
    } catch (error) {
      this.error = error.message;
      return { success: false, error: error.message };
    } finally {
      this.loading = false;
    }
  }

  logout() {
    logout();
    return { success: true };
  }

  getCurrentUser() {
    return {
      isLoggedIn: isLoggedIn(),
      token: getAuthToken(),
      name: getUserName()
    };
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }
}

export default AuthModel;
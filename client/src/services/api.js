import axios from 'axios'

/**
 * Axios instance for API requests
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // Добавляем для работы с cookies
})

// // Хранилище для CSRF токена
// let csrfToken = null;

// // Функция для получения CSRF токена
// export const getCsrfToken = async () => {
//   try {
//     const response = await api.get('/auth/csrf-token');
//     csrfToken = response.data.csrfToken;
//     return csrfToken;
//   } catch (error) {
//     console.error('Ошибка получения CSRF токена:', error);
//     throw error;
//   }
// };

// Добавляем перехватчик запросов для установки токена
/**
 * Request interceptor to add authorization token and CSRF token
 * @param {import('axios').InternalAxiosRequestConfig} config
 * @returns {import('axios').InternalAxiosRequestConfig}
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // // Добавляем CSRF токен для POST, PUT, DELETE запросов
    // if (csrfToken && ['POST', 'PUT', 'DELETE'].includes(config.method?.toUpperCase())) {
    //   config.headers['X-CSRF-Token'] = csrfToken;
    // }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Перехватчик для обработки ошибок
/**
 * Response interceptor for error handling
 * @param {import('axios').AxiosResponse} response
 * @returns {import('axios').AxiosResponse}
 */
api.interceptors.response.use(
  response => response,
  error => {
    // Проверяем, является ли ошибка связанной с дублированием вопроса
    if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
      // Не выводим сообщение в консоль для этой ошибки
      // Просто передаем ошибку дальше без дополнительного логирования
      return Promise.reject(error)
    }
    
    // Для всех остальных ошибок выводим в консоль
    console.error('API Error:', error.response?.data || error.message || error)
    return Promise.reject(error)
  }
)


/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.username - Username
 * @param {string} profileData.email - Email address
 * @param {string} [profileData.password] - New password (optional)
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const updateProfile = (profileData) => {
  return api.put('/auth/profile', profileData)
}

/**
 * Get action logs with pagination
 * @param {number} page - Page number
 * @param {number} limit - Number of items per page
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getActionLogs = (page = 1, limit = 20) => {
  return api.get(`/actionlogs?page=${page}&limit=${limit}`)
}

/**
 * Export action logs as CSV
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const exportActionLogs = () => {
  return api.get('/actionlogs/export', {
    responseType: 'blob'
  })
}

export default api
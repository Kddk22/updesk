const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return { data, status: response.status, headers: response.headers }
      }

      return { data: null, status: response.status, headers: response.headers }
    } catch (error) {
      console.error(`API Request failed: ${config.method || 'GET'} ${url}`, error)
      throw error
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    return this.request(url, {
      method: 'GET'
    })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    })
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }
}

export const api = new ApiClient(API_BASE_URL)

// Health check utility
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('API health check failed:', error)
    return null
  }
}
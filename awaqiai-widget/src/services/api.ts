import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

interface ApiConfig {
  id: string
  token?: string
  projectId?: string
}

class ApiService {
  private client: AxiosInstance
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      // @ts-ignore
      (axiosConfig: AxiosRequestConfig) => {
        axiosConfig.withCredentials = true
        return axiosConfig
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        status: error.response.status,
        message: error.response.data || 'Server error',
      })
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error',
      })
    } else {
      // Request setup error
      return Promise.reject({
        status: 0,
        message: error.message,
      })
    }
  }

  async sendMessage(content: string) {
    try {
      const response = await this.client.post(`/chat/widget/${this.config.id}/chat`, {
        content,
      })
      return response.data
    } catch (error) {
      return this.handleError(error as AxiosError)
    }
  }

  async streamMessage(content: string, onChunk: (chunk: string) => void, {
    delay = 100
  }: {
    delay?: number
  } = {}) {
    try {
      // Make the request
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/widget/${this.config.id}/chat/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Set up stream reading
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode and split into lines
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n').map(line => line.trim());
          buffer = lines.pop() || '';

          // Process complete lines
          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;

            const data = line.slice(5); // Remove 'data: ' prefix
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) continue;
              
              if (parsed.content) {
                // wait for delay before calling onChunk
                if (delay) {
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
                onChunk(parsed.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }

        // Process any remaining data in buffer
        if (buffer) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            try {
              const parsed = JSON.parse(line.slice(5));
              if (!parsed.done && parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getMessageHistory() {
    try {
      const response = await this.client.get('/messages')
      return response.data
    } catch (error) {
      return this.handleError(error as AxiosError)
    }
  }
}

export default ApiService

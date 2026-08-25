const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/v1';

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = `Error HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.mensaje) {
        errorMessage = errData.mensaje;
      } else if (errData.message) {
        errorMessage = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
      } else if (errData.error) {
        errorMessage = typeof errData.error === 'string' ? errData.error : JSON.stringify(errData.error);
      }
    } catch {
      // Ignorar fallo de parseo JSON
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('dsp_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async get(endpoint: string, headers: Record<string, string> = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { ...getAuthHeaders(), ...headers },
    });
    return handleResponse(res);
  },

  async post(endpoint: string, data: any, headers: Record<string, string> = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...headers },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async patch(endpoint: string, data?: any, headers: Record<string, string> = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...headers },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },

  async put(endpoint: string, data: any, headers: Record<string, string> = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...headers },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

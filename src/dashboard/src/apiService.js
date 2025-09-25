/**
 * API Service für ATS Dashboard
 * Verbindet mit PHP Backend oder HubSpot
 */

// API Konfiguration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/admin/api/ats-api.php';
const USE_HUBSPOT = import.meta.env.VITE_API_MODE === 'hubspot';

class APIService {
  constructor() {
    this.baseURL = API_BASE;
  }

  // Helper für API Calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}?endpoint=${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  // ==================== KANDIDATEN ====================

  async getCandidates() {
    const response = await this.request('candidates');
    return response.data;
  }

  async createCandidate(candidateData) {
    const response = await this.request('candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData)
    });
    return response;
  }

  async updateCandidate(id, candidateData) {
    const response = await this.request('candidates', {
      method: 'PUT',
      body: JSON.stringify({ id, ...candidateData })
    });
    return response;
  }

  async deleteCandidate(id) {
    const response = await this.request(`candidates&id=${id}`, {
      method: 'DELETE'
    });
    return response;
  }

  // ==================== JOBS ====================

  async getJobs() {
    const response = await this.request('jobs');
    return response.data;
  }

  async createJob(jobData) {
    const response = await this.request('jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
    return response;
  }

  async updateJob(id, jobData) {
    const response = await this.request('jobs', {
      method: 'PUT',
      body: JSON.stringify({ id, ...jobData })
    });
    return response;
  }

  async deleteJob(id) {
    const response = await this.request(`jobs&id=${id}`, {
      method: 'DELETE'
    });
    return response;
  }

  // ==================== PIPELINE ====================

  async getPipeline(jobId) {
    const response = await this.request(`pipeline&job_id=${jobId}`);
    return response.data;
  }

  async moveCandidateInPipeline(candidateId, jobId, fromStage, toStage) {
    const response = await this.request('pipeline', {
      method: 'POST',
      body: JSON.stringify({
        candidateId,
        jobId,
        fromStage,
        toStage,
        timestamp: new Date().toISOString()
      })
    });
    return response;
  }

  // ==================== ACTIVITIES ====================

  async getActivities(limit = 10) {
    const response = await this.request(`activities&limit=${limit}`);
    return response.data;
  }

  async createActivity(activity) {
    const response = await this.request('activities', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
    return response;
  }

  // ==================== CV UPLOAD ====================

  async uploadCV(file) {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch(`${this.baseURL}?endpoint=upload-cv`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('CV Upload failed');
    }

    return await response.json();
  }

  // ==================== STATISTICS ====================

  async getStatistics() {
    const response = await this.request('stats');
    return response.data;
  }

  // ==================== SEARCH ====================

  async searchCandidates(query) {
    const response = await this.request(`candidates&search=${encodeURIComponent(query)}`);
    return response.data;
  }

  async searchJobs(query) {
    const response = await this.request(`jobs&search=${encodeURIComponent(query)}`);
    return response.data;
  }
}

// Singleton Instance
const apiService = new APIService();

export default apiService;
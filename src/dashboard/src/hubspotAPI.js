// HubSpot API Integration Service
// This module handles all HubSpot CRM operations

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

// HubSpot API configuration
// In production, use environment variables
const config = {
  // Replace with your actual HubSpot API key
  apiKey: import.meta.env.VITE_HUBSPOT_API_KEY || 'YOUR_HUBSPOT_API_KEY',
  // Optional: Use Private App access token instead of API key
  accessToken: import.meta.env.VITE_HUBSPOT_ACCESS_TOKEN || ''
};

// Helper function to get authorization header
const getAuthHeader = () => {
  if (config.accessToken) {
    return { 'Authorization': `Bearer ${config.accessToken}` };
  }
  return { 'hapikey': config.apiKey };
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${HUBSPOT_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[HubSpot API Error]', error);
    throw error;
  }
};

// ==================== CONTACTS API ====================

export const hubspotContacts = {
  // Create a new contact (candidate)
  create: async (candidateData) => {
    const properties = {
      email: candidateData.email,
      firstname: candidateData.name?.split(' ')[0] || '',
      lastname: candidateData.name?.split(' ').slice(1).join(' ') || '',
      phone: candidateData.phone,
      city: candidateData.location,
      jobtitle: candidateData.primarySkill,
      candidate_status: candidateData.status,
      skills: candidateData.skills?.join(', ') || ''
    };

    return await apiRequest('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties })
    });
  },

  // Get all contacts
  getAll: async (limit = 100) => {
    return await apiRequest(`/crm/v3/objects/contacts?limit=${limit}`);
  },

  // Get contact by ID
  getById: async (contactId) => {
    return await apiRequest(`/crm/v3/objects/contacts/${contactId}`);
  },

  // Update contact
  update: async (contactId, properties) => {
    return await apiRequest(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties })
    });
  },

  // Delete contact
  delete: async (contactId) => {
    return await apiRequest(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'DELETE'
    });
  },

  // Search contacts
  search: async (searchTerm) => {
    const filterGroups = [{
      filters: [
        {
          propertyName: 'email',
          operator: 'CONTAINS_TOKEN',
          value: searchTerm
        }
      ]
    }];

    return await apiRequest('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify({ filterGroups })
    });
  }
};

// ==================== COMPANIES API ====================

export const hubspotCompanies = {
  // Create a new company
  create: async (companyData) => {
    const properties = {
      name: companyData.company,
      city: companyData.location,
      domain: companyData.domain || '',
      description: companyData.description || ''
    };

    return await apiRequest('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties })
    });
  },

  // Get all companies
  getAll: async (limit = 100) => {
    return await apiRequest(`/crm/v3/objects/companies?limit=${limit}`);
  },

  // Get company by ID
  getById: async (companyId) => {
    return await apiRequest(`/crm/v3/objects/companies/${companyId}`);
  }
};

// ==================== DEALS API (Jobs/Opportunities) ====================

export const hubspotDeals = {
  // Create a new deal (job opportunity)
  create: async (jobData) => {
    const properties = {
      dealname: jobData.title,
      amount: jobData.salary || '',
      dealstage: jobData.status === 'open' ? 'qualifiedtobuy' : 'closedwon',
      pipeline: 'default',
      closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      job_location: jobData.location,
      job_requirements: jobData.requirements,
      job_description: jobData.description
    };

    return await apiRequest('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties })
    });
  },

  // Get all deals
  getAll: async (limit = 100) => {
    return await apiRequest(`/crm/v3/objects/deals?limit=${limit}`);
  },

  // Update deal stage (for pipeline management)
  updateStage: async (dealId, stage) => {
    return await apiRequest(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          dealstage: stage
        }
      })
    });
  },

  // Associate contact with deal
  associateContact: async (dealId, contactId) => {
    return await apiRequest(`/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`, {
      method: 'PUT'
    });
  }
};

// ==================== ENGAGEMENTS API (Activities) ====================

export const hubspotEngagements = {
  // Create a note
  createNote: async (contactId, noteContent) => {
    const engagement = {
      engagement: {
        active: true,
        type: 'NOTE',
        timestamp: Date.now()
      },
      associations: {
        contactIds: [contactId]
      },
      metadata: {
        body: noteContent
      }
    };

    return await apiRequest('/engagements/v1/engagements', {
      method: 'POST',
      body: JSON.stringify(engagement)
    });
  },

  // Create a task
  createTask: async (contactId, taskData) => {
    const engagement = {
      engagement: {
        active: true,
        type: 'TASK',
        timestamp: Date.now()
      },
      associations: {
        contactIds: [contactId]
      },
      metadata: {
        body: taskData.description,
        subject: taskData.subject,
        status: 'NOT_STARTED'
      }
    };

    return await apiRequest('/engagements/v1/engagements', {
      method: 'POST',
      body: JSON.stringify(engagement)
    });
  }
};

// ==================== CUSTOM OBJECTS ====================

// For managing recruitment pipelines as custom objects
export const hubspotPipeline = {
  // Get pipeline stages
  getPipelineStages: async () => {
    return await apiRequest('/crm/v3/pipelines/deals');
  },

  // Move candidate through pipeline
  moveCandidate: async (candidateId, fromStage, toStage, jobId) => {
    // Create an engagement to track the movement
    const note = `Candidate moved from ${fromStage} to ${toStage}`;
    await hubspotEngagements.createNote(candidateId, note);

    // Update the deal stage if it exists
    if (jobId) {
      await hubspotDeals.updateStage(jobId, toStage);
    }

    return { success: true, candidateId, newStage: toStage };
  }
};

// ==================== SYNC FUNCTIONS ====================

export const hubspotSync = {
  // Sync all candidates to HubSpot
  syncCandidates: async (candidates) => {
    const results = [];

    for (const candidate of candidates) {
      try {
        const result = await hubspotContacts.create(candidate);
        results.push({
          success: true,
          candidate: candidate.name,
          hubspotId: result.id
        });
      } catch (error) {
        results.push({
          success: false,
          candidate: candidate.name,
          error: error.message
        });
      }
    }

    return results;
  },

  // Sync all jobs to HubSpot as deals
  syncJobs: async (jobs) => {
    const results = [];

    for (const job of jobs) {
      try {
        const result = await hubspotDeals.create(job);
        results.push({
          success: true,
          job: job.title,
          hubspotId: result.id
        });
      } catch (error) {
        results.push({
          success: false,
          job: job.title,
          error: error.message
        });
      }
    }

    return results;
  },

  // Fetch candidates from HubSpot
  fetchCandidatesFromHubSpot: async () => {
    try {
      const response = await hubspotContacts.getAll();

      // Transform HubSpot contacts to our candidate format
      return response.results.map(contact => ({
        id: contact.id,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        email: contact.properties.email,
        phone: contact.properties.phone,
        location: contact.properties.city,
        primarySkill: contact.properties.jobtitle,
        skills: contact.properties.skills?.split(',').map(s => s.trim()) || [],
        status: contact.properties.candidate_status || 'available',
        addedAt: contact.properties.createdate,
        hubspotId: contact.id
      }));
    } catch (error) {
      console.error('Error fetching candidates from HubSpot:', error);
      return [];
    }
  },

  // Fetch jobs from HubSpot
  fetchJobsFromHubSpot: async () => {
    try {
      const response = await hubspotDeals.getAll();

      // Transform HubSpot deals to our job format
      return response.results.map(deal => ({
        id: deal.id,
        title: deal.properties.dealname,
        company: deal.properties.company_name || 'Unknown Company',
        location: deal.properties.job_location,
        status: deal.properties.dealstage === 'closedwon' ? 'filled' : 'open',
        description: deal.properties.job_description,
        requirements: deal.properties.job_requirements,
        createdAt: deal.properties.createdate,
        hubspotId: deal.id
      }));
    } catch (error) {
      console.error('Error fetching jobs from HubSpot:', error);
      return [];
    }
  }
};

// ==================== WEBHOOK HANDLERS ====================

export const hubspotWebhooks = {
  // Handle incoming webhook from HubSpot
  handleWebhook: (eventType, data) => {
    console.log(`[HubSpot Webhook] Event: ${eventType}`, data);

    switch (eventType) {
      case 'contact.creation':
        console.log('New contact created in HubSpot:', data);
        break;
      case 'contact.deletion':
        console.log('Contact deleted in HubSpot:', data);
        break;
      case 'deal.creation':
        console.log('New deal created in HubSpot:', data);
        break;
      case 'deal.propertyChange':
        console.log('Deal property changed in HubSpot:', data);
        break;
      default:
        console.log('Unhandled webhook event:', eventType);
    }
  }
};

// Export all modules
export default {
  contacts: hubspotContacts,
  companies: hubspotCompanies,
  deals: hubspotDeals,
  engagements: hubspotEngagements,
  pipeline: hubspotPipeline,
  sync: hubspotSync,
  webhooks: hubspotWebhooks
};
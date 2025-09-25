/**
 * HubSpot Integration für NOBA ATS
 * Main entry point for HubSpot project
 */

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HubSpot Configuration
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'active',
    project: 'NOBA ATS HubSpot Integration',
    version: '1.0.0'
  });
});

// Webhook endpoint for HubSpot events
app.post('/api/webhook', async (req, res) => {
  console.log('[HubSpot Webhook] Received:', req.body);

  try {
    const { eventType, objectId, propertyName, propertyValue } = req.body;

    // Handle different event types
    switch (eventType) {
      case 'contact.creation':
        console.log(`New contact created: ${objectId}`);
        break;

      case 'contact.propertyChange':
        console.log(`Contact ${objectId} property ${propertyName} changed to ${propertyValue}`);
        break;

      case 'deal.creation':
        console.log(`New deal created: ${objectId}`);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// API Endpoints for NOBA ATS integration

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const response = await axios.get(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 100,
        properties: 'firstname,lastname,email,phone,jobtitle'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create a new contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { firstname, lastname, email, phone, jobtitle, skills } = req.body;

    const response = await axios.post(
      `${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`,
      {
        properties: {
          firstname,
          lastname,
          email,
          phone,
          jobtitle,
          hs_content_membership_notes: skills // Using notes field for skills
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Get all deals (jobs)
app.get('/api/deals', async (req, res) => {
  try {
    const response = await axios.get(`${HUBSPOT_BASE_URL}/crm/v3/objects/deals`, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 100,
        properties: 'dealname,amount,dealstage,closedate'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Create a new deal (job)
app.post('/api/deals', async (req, res) => {
  try {
    const { dealname, amount, description, requirements, location } = req.body;

    const response = await axios.post(
      `${HUBSPOT_BASE_URL}/crm/v3/objects/deals`,
      {
        properties: {
          dealname,
          amount: amount || '0',
          dealstage: 'qualifiedtobuy',
          pipeline: 'default',
          description: `${description}\n\nRequirements: ${requirements}\n\nLocation: ${location}`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Associate contact with deal
app.post('/api/associations', async (req, res) => {
  try {
    const { contactId, dealId } = req.body;

    const response = await axios.put(
      `${HUBSPOT_BASE_URL}/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('[API Error]', error.message);
    res.status(500).json({ error: 'Failed to create association' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NOBA HubSpot Integration running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/api/webhook`);
});
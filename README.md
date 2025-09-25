# NOBA HubSpot Integration

HubSpot CRM integration for NOBA Experts ATS Dashboard.

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Muchel187/Hubspot.git
cd Hubspot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create `.env` file:
```env
HUBSPOT_API_KEY=your-private-app-token
PORT=3000
```

4. **Run the project**
```bash
npm start
```

## 📁 Project Structure

```
.
├── hsproject.json      # HubSpot project configuration (REQUIRED)
├── src/
│   ├── index.js        # Main application
│   ├── api/
│   │   ├── contacts.js # Contacts API
│   │   ├── deals.js    # Deals API
│   │   └── webhook.js  # Webhook handlers
│   └── utils/
│       └── hubspot.js  # HubSpot client
├── package.json
└── README.md
```

## 🔑 HubSpot Setup

1. Create a Private App in HubSpot
2. Grant these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
3. Copy the Access Token
4. Add to `.env` file

## 📡 API Endpoints

- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create new deal
- `POST /api/webhook` - HubSpot webhook receiver

## 🔗 Integration with NOBA ATS

This project integrates with the NOBA ATS Dashboard to:
- Sync candidates as HubSpot contacts
- Sync jobs as HubSpot deals
- Track application pipeline stages
- Handle real-time updates via webhooks

## 📝 License

MIT - NOBA Experts GmbH 2024
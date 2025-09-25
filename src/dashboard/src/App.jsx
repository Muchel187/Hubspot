import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeftIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

// Import HubSpot API and OAuth
import hubspotAPI from './hubspotAPI';
import HubSpotOAuth from './HubSpotOAuth';

// Check if we're in mock mode or live mode
const API_MODE = import.meta.env.VITE_API_MODE || 'mock';

// ==================== MOCK DATA ====================
const mockCandidates = [
  { id: 1, name: 'Dr. Anna Schmidt', email: 'anna.schmidt@email.de', phone: '+49 176 1234567', location: 'Frankfurt', primarySkill: 'SAP FI/CO', skills: ['SAP FI', 'S/4HANA', 'IFRS'], status: 'available', addedAt: '2024-03-15', avatar: 'AS' },
  { id: 2, name: 'Max Mustermann', email: 'max.m@email.de', phone: '+49 175 9876543', location: 'München', primarySkill: 'Java Developer', skills: ['Java', 'Spring Boot', 'AWS'], status: 'in_process', addedAt: '2024-03-14', avatar: 'MM' },
  { id: 3, name: 'Julia Weber', email: 'j.weber@email.de', phone: '+49 171 2345678', location: 'Berlin', primarySkill: 'Project Manager', skills: ['Agile', 'Scrum', 'SAP'], status: 'placed', addedAt: '2024-03-12', avatar: 'JW' },
  { id: 4, name: 'Thomas Klein', email: 'thomas.k@email.de', phone: '+49 172 3456789', location: 'Hamburg', primarySkill: 'DevOps Engineer', skills: ['Kubernetes', 'Docker', 'CI/CD'], status: 'available', addedAt: '2024-03-10', avatar: 'TK' },
  { id: 5, name: 'Sarah Bauer', email: 'sarah.b@email.de', phone: '+49 173 4567890', location: 'Düsseldorf', primarySkill: 'SAP SD', skills: ['SAP SD', 'EDI', 'Logistics'], status: 'in_process', addedAt: '2024-03-08', avatar: 'SB' },
  { id: 6, name: 'Michael Wagner', email: 'm.wagner@email.de', phone: '+49 174 5678901', location: 'Stuttgart', primarySkill: 'Cloud Architect', skills: ['Azure', 'AWS', 'Terraform'], status: 'available', addedAt: '2024-03-05', avatar: 'MW' },
  { id: 7, name: 'Lisa Hoffmann', email: 'l.hoffmann@email.de', phone: '+49 175 6789012', location: 'Köln', primarySkill: 'HR Manager', skills: ['Recruiting', 'SAP HCM', 'Employer Branding'], status: 'inactive', addedAt: '2024-03-01', avatar: 'LH' },
  { id: 8, name: 'Dr. Robert Fischer', email: 'r.fischer@email.de', phone: '+49 176 7890123', location: 'Hannover', primarySkill: 'Data Scientist', skills: ['Python', 'Machine Learning', 'TensorFlow'], status: 'available', addedAt: '2024-02-28', avatar: 'RF' }
];

const mockJobs = [
  { id: 101, title: 'Senior SAP FI/CO Berater', company: 'TechCorp GmbH', location: 'Frankfurt', status: 'open', createdAt: '2024-03-10', description: 'Wir suchen einen erfahrenen SAP FI/CO Berater für ein spannendes Transformationsprojekt.', requirements: 'Mind. 5 Jahre Erfahrung, S/4HANA Kenntnisse' },
  { id: 102, title: 'Java Full-Stack Developer', company: 'Digital Solutions AG', location: 'Berlin', status: 'open', createdAt: '2024-03-08', description: 'Moderne Java-Entwicklung in agilem Umfeld.', requirements: 'Spring Boot, React, AWS' },
  { id: 103, title: 'IT-Projektleiter', company: 'Innovation Labs', location: 'München', status: 'filled', createdAt: '2024-02-20', description: 'Leitung von IT-Großprojekten im Bankensektor.', requirements: 'PMP Zertifizierung, Agile Methoden' },
  { id: 104, title: 'Cloud DevOps Engineer', company: 'CloudFirst GmbH', location: 'Hamburg', status: 'open', createdAt: '2024-03-12', description: 'Aufbau und Betrieb von Cloud-Infrastrukturen.', requirements: 'Kubernetes, CI/CD, Azure/AWS' },
  { id: 105, title: 'SAP SD Consultant', company: 'Logistics Pro', location: 'Düsseldorf', status: 'archived', createdAt: '2024-01-15', description: 'Optimierung von Vertriebsprozessen.', requirements: 'SAP SD, EDI, Prozessoptimierung' }
];

const mockActivities = [
  { id: 1, text: 'CV von Anna Schmidt hinzugefügt', time: 'vor 2 Stunden', type: 'cv' },
  { id: 2, text: 'Status für Max Mustermann geändert: Interview', time: 'vor 4 Stunden', type: 'status' },
  { id: 3, text: 'Neuer Job: Senior SAP Berater bei TechCorp', time: 'vor 1 Tag', type: 'job' },
  { id: 4, text: 'Julia Weber erfolgreich vermittelt', time: 'vor 2 Tagen', type: 'placement' },
  { id: 5, text: 'Interview geplant: Thomas Klein für DevOps Position', time: 'vor 3 Tagen', type: 'interview' }
];

// Initial pipeline data for job 101 (Senior SAP FI/CO Berater)
const initialPipelineData = {
  'Neue Bewerber': [
    { id: 1, name: 'Dr. Anna Schmidt', skill: 'SAP FI/CO', avatar: 'AS' },
    { id: 6, name: 'Michael Wagner', skill: 'Cloud Architect', avatar: 'MW' }
  ],
  'Screening': [
    { id: 5, name: 'Sarah Bauer', skill: 'SAP SD', avatar: 'SB' }
  ],
  'Interview': [
    { id: 2, name: 'Max Mustermann', skill: 'Java Developer', avatar: 'MM' }
  ],
  'Angebot': [
    { id: 4, name: 'Thomas Klein', skill: 'DevOps Engineer', avatar: 'TK' }
  ],
  'Eingestellt': [],
  'Abgelehnt': [
    { id: 7, name: 'Lisa Hoffmann', skill: 'HR Manager', avatar: 'LH' }
  ]
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="relative bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STATUS BADGE COMPONENT ====================
const StatusBadge = ({ status, type = 'candidate' }) => {
  const getStyles = () => {
    if (type === 'candidate') {
      switch (status) {
        case 'available':
          return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'in_process':
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'placed':
          return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'inactive':
          return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      }
    } else {
      switch (status) {
        case 'open':
          return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'filled':
          return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'archived':
          return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      }
    }
  };

  const getLabel = () => {
    if (type === 'candidate') {
      switch (status) {
        case 'available': return 'Verfügbar';
        case 'in_process': return 'In Prozess';
        case 'placed': return 'Vermittelt';
        case 'inactive': return 'Inaktiv';
        default: return status;
      }
    } else {
      switch (status) {
        case 'open': return 'Offen';
        case 'filled': return 'Besetzt';
        case 'archived': return 'Archiviert';
        default: return status;
      }
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {getLabel()}
    </span>
  );
};

// ==================== DASHBOARD VIEW ====================
const DashboardView = ({ onNavigate }) => {
  const stats = [
    { label: 'Aktive Kandidaten', value: 78, icon: UserGroupIcon, color: 'text-emerald-400' },
    { label: 'Offene Stellen', value: 12, icon: BriefcaseIcon, color: 'text-sky-400' },
    { label: 'Kandidaten in Interviews', value: 8, icon: ClockIcon, color: 'text-yellow-400' },
    { label: 'Vermittlungen Q3', value: 4, icon: CheckCircleIcon, color: 'text-green-400' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Willkommen, Admin</h1>
        <p className="text-gray-400 mt-2">Hier ist Ihre Übersicht für heute</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => onNavigate('kandidaten')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Neuer Kandidat
        </button>
        <button
          onClick={() => onNavigate('jobs')}
          className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Neuer Job
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Letzte Aktivitäten</h2>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-slate-700 last:border-0">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
              <div className="flex-1">
                <p className="text-gray-300">{activity.text}</p>
                <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== KANDIDATEN VIEW ====================
const KandidatenView = ({ onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // AI CV Upload Simulation
  const handleCvUpload = async (file) => {
    console.log('[AI Integration] CV Upload gestartet:', file.name);
    setIsUploading(true);

    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate AI extraction response
    const extractedData = {
      name: 'Dr. Erika Mustermann',
      email: 'erika.m@email.de',
      phone: '+491761234567',
      location: 'München',
      skills: ['SAP FI/CO', 'S/4HANA Finance', 'Projektleitung', 'Jahresabschluss'],
      experience: [
        { company: 'Global Finance AG', role: 'Senior SAP Consultant', duration: '2019-2024' },
        { company: 'Tech Solutions GmbH', role: 'SAP FI Specialist', duration: '2016-2019' }
      ],
      education: [
        { degree: 'Dr. rer. pol.', field: 'Wirtschaftsinformatik', university: 'TU München', year: '2016' }
      ]
    };

    console.log('[AI Simulation] CV analysiert. Extrahierte Daten:', extractedData);

    // Pre-fill form with extracted data
    setFormData({
      name: extractedData.name,
      email: extractedData.email,
      phone: extractedData.phone,
      location: extractedData.location,
      skills: extractedData.skills.join(', ')
    });

    setIsUploading(false);
  };

  const filteredCandidates = mockCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.primarySkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Kandidaten-Datenbank</h1>
        <p className="text-gray-400 mt-2">Verwalten Sie alle Kandidaten und deren Profile</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Kandidaten suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
        {isLiveMode && (
          <button
            onClick={async () => {
              console.log('[HubSpot Sync] Starting candidates sync...');
              try {
                const results = await hubspotAPI.sync.syncCandidates(filteredCandidates);
                console.log('[HubSpot Sync] Results:', results);
                alert(`Sync abgeschlossen! ${results.filter(r => r.success).length} von ${results.length} Kandidaten synchronisiert.`);
              } catch (error) {
                console.error('[HubSpot Sync] Error:', error);
                alert('Fehler beim Synchronisieren mit HubSpot');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            HubSpot Sync
          </button>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Neuen Kandidaten anlegen
        </button>
      </div>

      {/* Candidates Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name/Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Primär-Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hinzugefügt am
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {candidate.avatar}
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium">{candidate.name}</p>
                        <p className="text-gray-400 text-sm">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {candidate.primarySkill}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={candidate.status} type="candidate" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 2).map((skill, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-slate-700 text-gray-300 rounded">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-slate-700 text-gray-400 rounded">
                          +{candidate.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {candidate.addedAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewProfile(candidate)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Profil ansehen"
                      >
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Löschen"
                      >
                        <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Candidate Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ name: '', email: '', phone: '', location: '', skills: '' });
        }}
        title="Neuen Kandidaten anlegen"
      >
        <form className="space-y-4">
          {/* CV Upload with AI Feature */}
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <label className="cursor-pointer">
              <span className="text-emerald-400 hover:text-emerald-300 font-medium">
                CV hochladen
              </span>
              <span className="text-gray-400"> für automatische Datenextraktion</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleCvUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
            {isUploading && (
              <div className="mt-4">
                <div className="animate-pulse text-emerald-400">
                  KI analysiert CV...
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Standort</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Skills (kommagetrennt)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="z.B. SAP FI/CO, S/4HANA, IFRS"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                console.log('[Form Submit] Kandidat gespeichert:', formData);
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', location: '', skills: '' });
              }}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Kandidat speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', location: '', skills: '' });
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== KANDIDATEN PROFIL VIEW ====================
const KandidatenProfilView = ({ candidate, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const applications = [
    { id: 1, job: 'Senior SAP FI/CO Berater', company: 'TechCorp GmbH', stage: 'Interview', date: '2024-03-15' },
    { id: 2, job: 'SAP Consultant', company: 'Finance Solutions', stage: 'Screening', date: '2024-03-10' }
  ];

  const history = [
    { id: 1, action: 'CV hochgeladen', date: '2024-03-15 09:30', user: 'Admin' },
    { id: 2, action: 'Status geändert: Verfügbar', date: '2024-03-15 10:15', user: 'Admin' },
    { id: 3, action: 'Zu Job "SAP FI/CO Berater" hinzugefügt', date: '2024-03-16 14:00', user: 'Admin' }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Zurück zur Übersicht
      </button>

      {/* Profile Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {candidate.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{candidate.name}</h1>
            <p className="text-gray-400 mt-1">{candidate.primarySkill}</p>
            <div className="flex items-center gap-4 mt-3">
              <StatusBadge status={candidate.status} type="candidate" />
              <div className="flex items-center gap-2 text-gray-400">
                <MapPinIcon className="h-4 w-4" />
                <span>{candidate.location}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-300">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{candidate.phone}</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            CV herunterladen
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="border-b border-slate-700">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Übersicht' },
              { id: 'applications', label: 'Bewerbungen' },
              { id: 'history', label: 'Historie & Notizen' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Kontaktinformationen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">E-Mail</p>
                    <p className="text-white">{candidate.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Telefon</p>
                    <p className="text-white">{candidate.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Standort</p>
                    <p className="text-white">{candidate.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Hinzugefügt am</p>
                    <p className="text-white">{candidate.addedAt}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Job</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Unternehmen</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Stadium</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-400">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-700">
                      <td className="py-3 text-white">{app.job}</td>
                      <td className="py-3 text-gray-300">{app.company}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                          {app.stage}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Aktivitäten</h3>
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-2">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-300">{item.action}</p>
                        <p className="text-gray-500 text-sm">{item.date} • {item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Notizen hinzufügen</h3>
                <textarea
                  placeholder="Interne Notizen..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  rows="4"
                />
                <button className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                  Notiz speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== JOBS VIEW ====================
const JobsView = ({ onViewPipeline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: ''
  });

  const filteredJobs = mockJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Jobverwaltung</h1>
        <p className="text-gray-400 mt-2">Alle offenen Stellen und deren Status</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Jobs suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-500"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Neuen Job anlegen
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Jobtitel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Unternehmen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Standort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{job.title}</p>
                    <p className="text-gray-500 text-sm">ID: {job.id}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {job.company}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {job.location}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} type="job" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewPipeline(job)}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm transition-colors"
                      >
                        Pipeline ansehen
                      </button>
                      <button
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Löschen"
                      >
                        <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Job Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ title: '', company: '', location: '', description: '', requirements: '' });
        }}
        title="Neuen Job anlegen"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Jobtitel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Unternehmen</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Standort</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Jobbeschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Anforderungen</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                console.log('[Form Submit] Job gespeichert:', formData);
                setShowModal(false);
                setFormData({ title: '', company: '', location: '', description: '', requirements: '' });
              }}
              className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              Job speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setFormData({ title: '', company: '', location: '', description: '', requirements: '' });
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==================== PIPELINE VIEW (KANBAN BOARD) ====================
const PipelineView = ({ job, onBack }) => {
  const [pipelineData, setPipelineData] = useState(initialPipelineData);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState(null);

  const columns = ['Neue Bewerber', 'Screening', 'Interview', 'Angebot', 'Eingestellt', 'Abgelehnt'];

  const handleDragStart = (candidate, column) => {
    setDraggedCandidate(candidate);
    setDraggedFromColumn(column);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();

    if (draggedCandidate && draggedFromColumn && draggedFromColumn !== targetColumn) {
      // Remove candidate from source column
      const newPipelineData = { ...pipelineData };
      newPipelineData[draggedFromColumn] = newPipelineData[draggedFromColumn].filter(
        c => c.id !== draggedCandidate.id
      );

      // Add candidate to target column
      newPipelineData[targetColumn] = [...newPipelineData[targetColumn], draggedCandidate];

      setPipelineData(newPipelineData);

      // Log the change
      console.log(`[ATS] Moved ${draggedCandidate.name} to '${targetColumn}' stage for Job ID ${job.id}`);
    }

    setDraggedCandidate(null);
    setDraggedFromColumn(null);
  };

  const getColumnColor = (column) => {
    switch (column) {
      case 'Neue Bewerber': return 'border-gray-500';
      case 'Screening': return 'border-yellow-500';
      case 'Interview': return 'border-blue-500';
      case 'Angebot': return 'border-purple-500';
      case 'Eingestellt': return 'border-green-500';
      case 'Abgelehnt': return 'border-red-500';
      default: return 'border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            Zurück zu Jobs
          </button>
          <h1 className="text-2xl font-bold text-white">
            Pipeline für: {job.title}
          </h1>
          <p className="text-gray-400 mt-1">{job.company} • {job.location}</p>
        </div>
        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500">
          <option value={job.id}>{job.title}</option>
          {mockJobs.filter(j => j.id !== job.id && j.status === 'open').map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column}
              className={`bg-slate-800 border-t-4 ${getColumnColor(column)} rounded-lg w-72`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
            >
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">{column}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {pipelineData[column].length} Kandidat{pipelineData[column].length !== 1 ? 'en' : ''}
                </p>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {pipelineData[column].map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={() => handleDragStart(candidate, column)}
                    className="bg-slate-700 rounded-lg p-4 cursor-move hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {candidate.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{candidate.name}</p>
                        <p className="text-gray-400 text-xs">{candidate.skill}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Kandidaten</p>
          <p className="text-2xl font-bold text-white mt-1">
            {Object.values(pipelineData).reduce((sum, arr) => sum + arr.length, 0)}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">In Interviews</p>
          <p className="text-2xl font-bold text-white mt-1">
            {pipelineData['Interview'].length}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Angebote</p>
          <p className="text-2xl font-bold text-white mt-1">
            {pipelineData['Angebot'].length}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Eingestellt</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {pipelineData['Eingestellt'].length}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== SETTINGS VIEW ====================
const SettingsView = () => {
  const [settings, setSettings] = useState({
    hubspot_api_key: '',
    hubspot_sync_enabled: false,
    email_notifications: true,
    company_name: 'NOBA Experts'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings laden
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/api/settings-simple.php?action=get');
      const data = await response.json();
      if (data.success) {
        const loadedSettings = {};
        Object.keys(data.data).forEach(key => {
          loadedSettings[key] = data.data[key].value;
        });
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/admin/api/settings-simple.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert('Einstellungen erfolgreich gespeichert!');
        // Seite neu laden um HubSpot Integration zu aktivieren
        if (settings.hubspot_sync_enabled) {
          window.location.reload();
        }
      } else {
        alert('Fehler: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Fehler beim Speichern');
    }
    setIsSaving(false);
  };

  const testHubSpotConnection = async () => {
    if (!settings.hubspot_api_key) {
      alert('Bitte geben Sie einen API Key ein');
      return;
    }

    setTestResult({ testing: true });
    try {
      const response = await fetch('http://localhost:8000/admin/api/settings-simple.php?action=test-hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: settings.hubspot_api_key })
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Einstellungen</h1>
        <p className="text-gray-400 mt-2">System-Konfiguration und API-Verbindungen</p>
      </div>

      {/* HubSpot Integration */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <KeyIcon className="h-6 w-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">HubSpot Integration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              HubSpot API Key (Private App Access Token)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.hubspot_api_key}
                  onChange={(e) => setSettings({ ...settings, hubspot_api_key: e.target.value })}
                  placeholder="pat-eu1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? '👁' : '👁‍🗨'}
                </button>
              </div>
              <button
                onClick={testHubSpotConnection}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                Verbindung testen
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Erstellen Sie einen Private App in HubSpot: Settings → Integrations → Private Apps
            </p>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
              {testResult.testing ? (
                <p className="text-gray-300">Teste Verbindung...</p>
              ) : testResult.success ? (
                <div>
                  <p className="text-green-400">{testResult.message || '✅ Verbindung erfolgreich!'}</p>
                </div>
              ) : (
                <div>
                  <p className="text-red-400">❌ {testResult.error}</p>
                  {testResult.hint && (
                    <p className="text-gray-400 text-sm mt-2">{testResult.hint}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hubspot_sync"
              checked={settings.hubspot_sync_enabled}
              onChange={(e) => setSettings({ ...settings, hubspot_sync_enabled: e.target.checked })}
              className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="hubspot_sync" className="text-gray-300">
              HubSpot Sync aktivieren (Kandidaten & Jobs werden automatisch synchronisiert)
            </label>
          </div>
        </div>
      </div>

      {/* Weitere Einstellungen */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Allgemeine Einstellungen</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Firmenname
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="email_notifications"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
              className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="email_notifications" className="text-gray-300">
              E-Mail Benachrichtigungen aktivieren
            </label>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {settings.hubspot_sync_enabled && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Sync Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Synchronisierte Kandidaten</p>
              <p className="text-2xl font-bold text-white mt-1">0 / 8</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Synchronisierte Jobs</p>
              <p className="text-2xl font-bold text-white mt-1">0 / 5</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isHubSpotConnected, setIsHubSpotConnected] = useState(false);

  // Check if we're in live mode with HubSpot
  const isLiveMode = API_MODE === 'live' && isHubSpotConnected;

  const handleNavigation = (view) => {
    setCurrentView(view);
    setSelectedCandidate(null);
    setSelectedJob(null);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setCurrentView('kandidaten-profil');
  };

  const handleViewPipeline = (job) => {
    setSelectedJob(job);
    setCurrentView('pipeline');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'kandidaten', label: 'Kandidaten', icon: UserGroupIcon },
    { id: 'jobs', label: 'Jobs', icon: BriefcaseIcon },
    { id: 'pipeline', label: 'Pipelines', icon: ChartBarIcon },
    { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">NOBA ATS</h2>
          <p className="text-gray-400 text-sm mt-1">Admin Dashboard</p>
        </div>
        <nav className="px-4 pb-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                currentView === item.id || (item.id === 'pipeline' && currentView === 'pipeline')
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigation} />}
          {currentView === 'kandidaten' && <KandidatenView onViewProfile={handleViewProfile} />}
          {currentView === 'kandidaten-profil' && selectedCandidate && (
            <KandidatenProfilView
              candidate={selectedCandidate}
              onBack={() => handleNavigation('kandidaten')}
            />
          )}
          {currentView === 'jobs' && <JobsView onViewPipeline={handleViewPipeline} />}
          {currentView === 'pipeline' && selectedJob && (
            <PipelineView
              job={selectedJob}
              onBack={() => handleNavigation('jobs')}
            />
          )}
          {currentView === 'pipeline' && !selectedJob && (
            <PipelineView
              job={mockJobs[0]}
              onBack={() => handleNavigation('jobs')}
            />
          )}
          {currentView === 'settings' && (
            <SettingsView onAuthSuccess={(portalInfo) => {
              setIsHubSpotConnected(true);
              console.log('[App] HubSpot connected:', portalInfo);
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
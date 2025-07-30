export const environment = {
  production: true,
  apiUrl: 'https://api.famlink.com/api', // Replace with actual production API URL
  
  // AWS Configuration (Production)
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX', // Replace with actual Production User Pool ID
      clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual Production Client ID
      domain: 'famlink-auth.auth.us-east-1.amazoncognito.com' // Replace with actual production domain
    },
    s3: {
      bucketName: 'famlink-media-prod', // Replace with actual production bucket name
      region: 'us-east-1'
    }
  },

  // Feature flags
  features: {
    enableChatbot: true,
    enableCommunity: true,
    enableMedicalRecords: true,
    enableAppointments: true,
    enableNotifications: true,
    enableAnalytics: true // Enabled in production
  },

  // API endpoints
  endpoints: {
    auth: '/auth',
    users: '/users',
    children: '/children',
    medicalRecords: '/medical-records',
    community: '/community',
    hospitals: '/hospitals',
    appointments: '/appointments',
    chatbot: '/chatbot'
  },

  // App configuration
  app: {
    name: 'FamLink',
    version: '1.0.0',
    supportEmail: 'support@famlink.com',
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    refreshTokenThreshold: 5 * 60 * 1000 // 5 minutes
  },

  // Third-party integrations
  integrations: {
    googleMaps: {
      apiKey: 'YOUR_PRODUCTION_GOOGLE_MAPS_API_KEY', // Replace with actual production API key
      libraries: ['places', 'geometry']
    },
    stripe: {
      publishableKey: 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXX' // Replace with actual production key
    }
  },

  // Logging configuration
  logging: {
    level: 'error',
    enableConsoleLogging: false,
    enableRemoteLogging: true
  }
};
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  
  // AWS Configuration (Placeholder)
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX', // Replace with actual User Pool ID
      clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual Client ID
      domain: 'famlink-auth.auth.us-east-1.amazoncognito.com' // Replace with actual domain
    },
    s3: {
      bucketName: 'famlink-media-dev', // Replace with actual bucket name
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
    enableAnalytics: false // Disabled in development
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
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with actual API key
      libraries: ['places', 'geometry']
    },
    stripe: {
      publishableKey: 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX' // Replace with actual key
    }
  },

  // Logging configuration
  logging: {
    level: 'debug',
    enableConsoleLogging: true,
    enableRemoteLogging: false
  }
};
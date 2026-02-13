export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  
  // AWS Configuration
  aws: {
    region: 'us-east-1',
    cognito: {
      userPoolId: 'us-east-1_66SRClznp', // Replace with your actual User Pool ID
      clientId: '65qng4sknav247e3dkicgsa5tf', // Replace with your actual Client ID
      domain: 'us-east-166srclznp.auth.us-east-1.amazoncognito.com', // Replace with your actual domain (without https://)
      redirectSignIn: 'http://localhost:4200/',
      redirectSignOut: 'http://localhost:4200/',
      responseType: 'code' // Use authorization code flow
    },
    s3: {
      bucketName: 'famlink-media-dev',
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
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      libraries: ['places', 'geometry']
    },
    stripe: {
      publishableKey: 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'
    }
  },

  // Logging configuration
  logging: {
    level: 'debug',
    enableConsoleLogging: true,
    enableRemoteLogging: false
  }
};
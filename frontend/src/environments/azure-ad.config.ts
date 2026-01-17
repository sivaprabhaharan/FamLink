// Azure AD Configuration
export const azureAdConfig = {
  auth: {
    clientId: '6028a59b-15a0-4567-9a95-d9981f630852', // Replace with your Azure AD client ID
    authority: 'https://login.microsoftonline.com/f47b9bef-b9d9-4ea8-a990-b17ceafcf304', // Replace with your tenant ID
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/auth/login'
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  scopes: [
    'user.read',
    'api://6028a59b-15a0-4567-9a95-d9981f630852/access_as_user' // Replace with your API scope
  ]
};

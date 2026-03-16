export const environment = {
  production: false,
  // Relative URL — Angular dev-server proxy will forward /api → http://localhost:8080
  apiBaseUrl: '/api',
  skipCognito: true,
  // Hardcoded token your local backend accepts (e.g. a static dev token or empty string)
  localAuthToken: 'local-dev-token',
  cognito: {
    userPoolId: '',
    userPoolClientId: '',
    region: 'us-east-1',
  },
};


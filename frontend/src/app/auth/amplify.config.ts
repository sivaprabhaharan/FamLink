import { Amplify } from 'aws-amplify';
import { environment } from '../../environments/environment';

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: environment.aws.cognito.userPoolId,
      userPoolClientId: environment.aws.cognito.clientId,
      loginWith: {
        oauth: {
          domain: environment.aws.cognito.domain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [environment.aws.cognito.redirectSignIn],
          redirectSignOut: [environment.aws.cognito.redirectSignOut],
          responseType: environment.aws.cognito.responseType as 'code' | 'token'
        }
      }
    }
  }
};

export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}
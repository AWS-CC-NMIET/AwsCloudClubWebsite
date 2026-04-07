// lib/amplify-config.ts
// Client-side Amplify configuration for Cognito auth
// This runs in the browser — only NEXT_PUBLIC_ env vars are safe here

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: "code" as const,
      loginWith: {
        email: true,
        username: false,
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
}

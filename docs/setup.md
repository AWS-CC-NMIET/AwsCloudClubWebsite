# Setting up AWS from scratch

Everything the website needs, in one account and region (`ap-south-1`, Mumbai). You need the AWS CLI v2 signed in with a profile that can create these resources (e.g. `aws sso login --profile sbg`), and Node.js 20.9+.

Each step ends with the environment variables it produces. Put them in `.env.local` for local development and in **Amplify → Environment variables** for production (template: [`.env.local.example`](../.env.local.example)).

## 1. Cognito — sign-in and admins

1. **Cognito → Create user pool**
   - Sign-in: **email**; self-registration **on**; verify email by code.
   - Required attribute: `email` (the app also stores `name`).
2. **App client** (on the pool → App integration):
   - Type: **confidential** — generate a **client secret**.
   - Auth flows: `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`.
3. **Groups → Create group** named `admins`. Anyone in it can open the Admin Panel; the server checks the group inside the signed token, so it can't be faked from the browser.

```
NEXT_PUBLIC_COGNITO_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_…
NEXT_PUBLIC_COGNITO_CLIENT_ID=…
COGNITO_CLIENT_SECRET=…
```

## 2. DynamoDB — content

```bash
AWS_PROFILE=sbg node scripts/setup-aws.mjs
```

Creates the nine tables (on-demand billing, key `id`). Empty tables are fine: the site shows its built-in content until admins add items. The `DYNAMODB_*_TABLE` variables only need setting if you change the default names.

## 3. S3 — uploads

1. Create a bucket (e.g. `acc-nmiet-media`, `ap-south-1`) and keep **Block all public access** on — images are served through short-lived presigned links from `/api/image`.
2. **Permissions → CORS** — admins upload straight from the browser:

```json
[
  {
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["https://www.awscloudclubsnmiet.org", "https://*.amplifyapp.com", "http://localhost:3000"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

```
NEXT_PUBLIC_S3_BUCKET=acc-nmiet-media
NEXT_PUBLIC_S3_REGION=ap-south-1
```

## 4. SES — contact form

1. **SES → Identities → Create identity → Email address** for the sender, and confirm the email AWS sends.
2. While the account is in the SES sandbox, also verify the recipient address (or request production access).

```
SES_REGION=ap-south-1
SES_FROM_EMAIL=<verified sender>
SES_TO_EMAIL=aws.studentbuildersgroup.nmiet@gmail.com
```

## 5. Amplify — hosting

1. **Amplify → Create app → GitHub**, pick this repository and the `main` branch. Amplify detects Next.js (SSR); the default build settings work.
2. Add every variable from steps 1–4 under **Environment variables**, plus `APP_REGION=ap-south-1`. Do **not** add access keys.
3. Give the server its permissions with an IAM role: follow [aws/amplify-compute-role.md](aws/amplify-compute-role.md).
4. **Hosting → Custom domains** for `awscloudclubsnmiet.org`.

Every push to `main` now builds and deploys.

## 6. First admin

1. Create an account on the website (lock screen → **Create a member account**) and verify the email.
2. Add it to the `admins` group:

```bash
aws cognito-idp admin-add-user-to-group --profile sbg \
  --user-pool-id ap-south-1_… --username you@example.com --group-name admins
```

3. Sign out and back in (the group is read from a fresh token), then open **Admin Panel**:
   - **System → Health** should be green for DynamoDB, S3, SES and Cognito.
   - **Team → Import roster** copies the built-in team (with portraits) into DynamoDB. From then on the Admin Panel is the source of truth.
   - Further admins can be promoted from **Members & Admins**.

## Local development against AWS

Use your own CLI session (`aws sso login --profile sbg`, then `AWS_PROFILE=sbg npm run dev`) — the server picks up the profile automatically. Access keys in `.env.local` (`APP_ACCESS_KEY_ID` / `APP_SECRET_ACCESS_KEY`) still work but are best avoided.

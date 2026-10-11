# Amplify SSR compute role (no access keys)

The website's API routes talk to DynamoDB, S3, SES and Cognito. Instead of an
IAM access key (which can leak, expire or be deactivated — that is what broke
production in October 2026), Amplify runs the server code with an **IAM role**.
The code (`lib/aws-clients.ts`) uses that role automatically whenever no
`APP_ACCESS_KEY_ID` / `APP_SECRET_ACCESS_KEY` is configured.

## 1. Create the role (once)

IAM console → **Roles → Create role**

- Trusted entity: **Custom trust policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "amplify.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

- Name: `aws-sbg-nmiet-website-compute`
- Add an **inline policy** (replace `ACCOUNT_ID` and `USER_POOL_ID`; region is `ap-south-1`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ContentTables",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:ACCOUNT_ID:table/acc-nmiet-*"
    },
    {
      "Sid": "MediaBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::acc-nmiet-media/*"
    },
    {
      "Sid": "MediaBucketHealthCheck",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::acc-nmiet-media"
    },
    {
      "Sid": "ContactEmail",
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:GetSendQuota"],
      "Resource": "*"
    },
    {
      "Sid": "AdminUserManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:ListUsers", "cognito-idp:ListUsersInGroup",
        "cognito-idp:AdminAddUserToGroup", "cognito-idp:AdminRemoveUserFromGroup"
      ],
      "Resource": "arn:aws:cognito-idp:ap-south-1:ACCOUNT_ID:userpool/USER_POOL_ID"
    }
  ]
}
```

## 2. Attach it to the Amplify app

Amplify console → your app → **App settings → IAM roles → Compute role → Edit** →
choose `aws-sbg-nmiet-website-compute` → Save.

## 3. Remove the old keys

Amplify console → **Hosting → Environment variables**: delete
`APP_ACCESS_KEY_ID` and `APP_SECRET_ACCESS_KEY` (and any `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY`). In IAM, delete or deactivate the old access key.

Keep the non-secret variables: `NEXT_PUBLIC_COGNITO_*`, `COGNITO_CLIENT_SECRET`,
`DYNAMODB_*_TABLE`, `NEXT_PUBLIC_S3_BUCKET`, `SES_REGION`, `SES_FROM_EMAIL`,
`SES_TO_EMAIL`.

## 4. Redeploy and verify

Redeploy the branch, sign in as an admin and open
`https://www.awscloudclubsnmiet.org/api/health` in the same browser session's
Admin → Health view (or call it with your access token). Every service should
report `"ok": true`. Anonymous visitors only see `{ "ok": true }`.

## 5. Import the team roster (once)

Sign in as an admin → **Admin → Team → Import roster**. This copies the built-in
roster into DynamoDB using the site's own role (no local keys needed). From then
on the Admin panel is the single source of truth for the team.

(Alternative for developers with AWS credentials: `node scripts/seed-team.mjs --apply`.)

## Local development

Put a **personal** IAM user's keys in `.env.local` as `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` (never commit them), or use `aws sso login` with a
profile and `AWS_PROFILE=…`. The same code picks them up.

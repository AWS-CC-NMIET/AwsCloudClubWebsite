# AWS Cognito Setup — AWS Cloud Club NMIET

Complete step-by-step guide to create and configure the Cognito User Pool for this project.

---

## Table of Contents

1. [Create the User Pool](#1-create-the-user-pool)
2. [Configure Sign-In Options](#2-configure-sign-in-options)
3. [Configure Security Requirements](#3-configure-security-requirements)
4. [Configure Sign-Up Options](#4-configure-sign-up-options)
5. [Configure Message Delivery (Email)](#5-configure-message-delivery-email)
6. [Configure App Client](#6-configure-app-client)
7. [Enable USER_PASSWORD_AUTH Flow](#7-enable-user_password_auth-flow)
8. [Create the Admins Group](#8-create-the-admins-group)
9. [Copy Values to .env.local](#9-copy-values-to-envlocal)
10. [Make Yourself Admin](#10-make-yourself-admin)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Create the User Pool

1. Open the [AWS Console](https://console.aws.amazon.com/) and sign in.
2. In the search bar at the top, type **Cognito** and click it.
3. Click **Create user pool** (top-right button).
4. You will see a multi-step wizard. Keep going through the steps below.

---

## 2. Configure Sign-In Options

**Step: Configure sign-in experience**

| Setting | Value |
|---|---|
| Cognito user pool sign-in options | ✅ Email |
| User name requirements | Leave all unchecked |
| Enable case insensitivity | ✅ Yes (recommended) |

Click **Next**.

---

## 3. Configure Security Requirements

**Step: Configure security requirements**

### Password policy

| Setting | Value |
|---|---|
| Password minimum length | 8 |
| Contains at least 1 uppercase letter | ✅ |
| Contains at least 1 lowercase letter | ✅ |
| Contains at least 1 number | ✅ |
| Contains at least 1 special character | ❌ (leave unchecked) |

### Multi-factor authentication

| Setting | Value |
|---|---|
| MFA enforcement | **No MFA** (you can add later) |

### User account recovery

| Setting | Value |
|---|---|
| Enable self-service account recovery | ✅ Yes |
| Delivery method for user account recovery messages | Email only |

Click **Next**.

---

## 4. Configure Sign-Up Options

**Step: Configure sign-up experience**

| Setting | Value |
|---|---|
| Enable self-registration | ✅ Yes |
| Allow Cognito to automatically send messages to verify and confirm | ✅ Yes |
| Attributes to verify | Email address |
| Verifying attribute changes | ✅ Keep original attribute value active when an update is pending |

### Required attributes

Click **Add attribute** and add:

| Attribute | Required |
|---|---|
| name | ✅ Yes |

> `email` is already required by default since you chose it as the sign-in option.

Click **Next**.

---

## 5. Configure Message Delivery (Email)

**Step: Configure message delivery**

| Setting | Value |
|---|---|
| Email provider | **Send email with Cognito** |

> This uses Cognito's built-in email (free, limited to 50 emails/day). For production, you can switch to SES later.

Click **Next**.

---

## 6. Configure App Client

**Step: Integrate your app**

### User pool name

Give it a name, e.g.:

```
acc-nmiet-userpool
```

### Hosted UI

| Setting | Value |
|---|---|
| Use the Cognito Hosted UI | ❌ No (leave unchecked) |

### App client

| Setting | Value |
|---|---|
| App type | **Confidential client** |
| App client name | `acc-nmiet-web-client` |
| Client secret | **Generate a client secret** ✅ |

> The project is already configured to handle the client secret securely on the server side, so keep it generated.

Click **Next**.

---

## 7. Enable USER_PASSWORD_AUTH Flow

After the user pool is created, you **must** enable the `USER_PASSWORD_AUTH` auth flow on the app client. The server-side auth route uses this flow.

1. In the Cognito console, go to your newly created user pool.
2. Click **App clients** in the left sidebar (under **App integration**).
3. Click your app client name (`acc-nmiet-web-client`).
4. Scroll down to **Authentication flows** and click **Edit**.
5. Enable the following:

| Auth Flow | Enable |
|---|---|
| ALLOW_USER_PASSWORD_AUTH | ✅ |
| ALLOW_REFRESH_TOKEN_AUTH | ✅ |
| ALLOW_USER_SRP_AUTH | ✅ (optional but fine to keep) |

6. Click **Save changes**.

---

## 8. Create the Admins Group

This group controls who can access the Admin Panel in the website.

1. In your user pool, click **Groups** in the left sidebar.
2. Click **Create group**.
3. Fill in:

| Field | Value |
|---|---|
| Group name | `admins` |
| Description | Website administrators |
| Precedence | 0 |

4. Click **Create group**.

---

## 9. Copy Values to .env.local

You need three values from Cognito. Here is where to find each one:

### User Pool ID

1. Go to your user pool.
2. On the **Overview** tab, copy the **User pool ID**.
   - Looks like: `ap-south-1_AbCdEfGhI`

### App Client ID

1. Go to **App clients** (left sidebar under App integration).
2. Click your client.
3. Copy the **Client ID**.
   - Looks like: `5ehkrftldod82feneh82d98h7o`

### App Client Secret

1. On the same App client page, scroll to **Client secret**.
2. Click **Show client secret** and copy it.
   - Looks like: `1a2b3c4d5e6f7g8h...` (long string)

### Add to .env.local

Open `.env.local` in your project root and fill in:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=ap-south-1
```

> `COGNITO_CLIENT_SECRET` is server-side only — it does NOT have the `NEXT_PUBLIC_` prefix, so it is never exposed to the browser.

---

## 10. Make Yourself Admin

After the user pool is set up and you have registered your first account through the website:

### Option A — AWS Console (easiest)

1. In your user pool, click **Users** in the left sidebar.
2. Click your username.
3. Scroll down to **Group memberships** and click **Add user to group**.
4. Select `admins` and click **Add**.

### Option B — AWS CLI

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-south-1_XXXXXXXXX \
  --username your@email.com \
  --group-name admins \
  --region ap-south-1
```

After adding yourself to the group, **sign out and sign back in** on the website. The Admin Panel icon will appear on the desktop.

---

## 11. Troubleshooting

### "Client is configured with secret but SECRET_HASH was not received"

Your app client has a secret but the server isn't sending the hash. Check:
- `COGNITO_CLIENT_SECRET` is set in `.env.local` (no `NEXT_PUBLIC_` prefix)
- You restarted the dev server after editing `.env.local`

### "USER_PASSWORD_AUTH is not enabled for this client"

You skipped step 7. Go to App clients → your client → Authentication flows → enable `ALLOW_USER_PASSWORD_AUTH`.

### "NotAuthorizedException: Incorrect username or password"

- The user may not be confirmed yet. Check the user's status in the Cognito console (Users tab). It should say **Confirmed**.
- Password is wrong — use Forgot Password to reset.

### "UsernameExistsException"

An account with that email already exists. Use Sign In instead, or delete the user from the Cognito console and retry.

### "InvalidParameterException: USER_PASSWORD_AUTH flow not enabled"

Same as above — enable `ALLOW_USER_PASSWORD_AUTH` on the app client (step 7).

### Verification email not arriving

- Check your spam folder.
- Cognito's built-in email is limited to 50 emails/day. If you've exceeded that, switch to SES in the user pool's **Messaging** settings.
- Make sure the email attribute is required and set to auto-verify (step 4).

### Admin Panel not showing after being added to group

The JWT in `localStorage` is from before you were added to the group, so it doesn't contain the `admins` claim yet. Sign out and sign back in — the new token will include the group.

---

## Summary of What You Created

| Resource | Value |
|---|---|
| User Pool | `acc-nmiet-userpool` |
| App Client | `acc-nmiet-web-client` (confidential, with secret) |
| Auth Flows | USER_PASSWORD_AUTH, REFRESH_TOKEN_AUTH |
| Sign-in method | Email |
| MFA | None |
| Group | `admins` |
| Email delivery | Cognito built-in (free tier) |

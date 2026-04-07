// app/api/auth/route.ts
// Server-side Cognito auth — computes SECRET_HASH so the client secret never
// leaves the server. The browser calls these routes instead of Cognito directly.

import { NextRequest, NextResponse } from "next/server"
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { createHmac } from "crypto"

const CLIENT_ID     = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!
const REGION        = process.env.APP_REGION || "ap-south-1"

const cognito = new CognitoIdentityProviderClient({ region: REGION })

function secretHash(username: string) {
  return createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64")
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body as { action: string; [k: string]: string }

  try {
    // ── Sign In ──────────────────────────────────────────────
    if (action === "signin") {
      const { username, password } = body
      const res = await cognito.send(new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: secretHash(username),
        },
      }))
      return NextResponse.json({
        accessToken:  res.AuthenticationResult?.AccessToken,
        idToken:      res.AuthenticationResult?.IdToken,
        refreshToken: res.AuthenticationResult?.RefreshToken,
        expiresIn:    res.AuthenticationResult?.ExpiresIn,
      })
    }

    // ── Sign Up ──────────────────────────────────────────────
    if (action === "signup") {
      const { username, password, name } = body
      await cognito.send(new SignUpCommand({
        ClientId:   CLIENT_ID,
        SecretHash: secretHash(username),
        Username:   username,
        Password:   password,
        UserAttributes: [
          { Name: "email", Value: username },
          { Name: "name",  Value: name },
        ],
      }))
      return NextResponse.json({ success: true })
    }

    // ── Confirm Sign Up ──────────────────────────────────────
    if (action === "confirm") {
      const { username, code } = body
      await cognito.send(new ConfirmSignUpCommand({
        ClientId:         CLIENT_ID,
        SecretHash:       secretHash(username),
        Username:         username,
        ConfirmationCode: code,
      }))
      return NextResponse.json({ success: true })
    }

    // ── Resend Confirmation Code ─────────────────────────────
    if (action === "resend") {
      const { username } = body
      await cognito.send(new ResendConfirmationCodeCommand({
        ClientId:   CLIENT_ID,
        SecretHash: secretHash(username),
        Username:   username,
      }))
      return NextResponse.json({ success: true })
    }

    // ── Forgot Password ──────────────────────────────────────
    if (action === "forgot-password") {
      const { username } = body
      await cognito.send(new ForgotPasswordCommand({
        ClientId:   CLIENT_ID,
        SecretHash: secretHash(username),
        Username:   username,
      }))
      return NextResponse.json({ success: true })
    }

    // ── Confirm Reset Password ───────────────────────────────
    if (action === "reset-password") {
      const { username, code, newPassword } = body
      await cognito.send(new ConfirmForgotPasswordCommand({
        ClientId:         CLIENT_ID,
        SecretHash:       secretHash(username),
        Username:         username,
        ConfirmationCode: code,
        Password:         newPassword,
      }))
      return NextResponse.json({ success: true })
    }

    // ── Refresh Token ────────────────────────────────────────
    if (action === "refresh") {
      const { refreshToken, username } = body
      const res = await cognito.send(new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH:   secretHash(username),
        },
      }))
      return NextResponse.json({
        accessToken: res.AuthenticationResult?.AccessToken,
        idToken:     res.AuthenticationResult?.IdToken,
        expiresIn:   res.AuthenticationResult?.ExpiresIn,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: unknown) {
    const message = (err as { message?: string })?.message || "Auth error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

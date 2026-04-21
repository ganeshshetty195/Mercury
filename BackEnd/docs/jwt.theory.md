# JWT — Complete Theory

## One Line Summary
JWT is just a signed note — you carry it, server trusts it only if the math checks out, and without the secret key nobody can fake it.

---

## Why it exists
HTTP forgets everything. JWT is how you prove who you are on every request — without logging in every time.

## The Core Idea
Instead of the server remembering you → you carry proof of who you are.
Payload is NOT encrypted. Anyone can read it.
Security comes only from the signature.
Never put passwords, card numbers, or sensitive data in payload.

---

## How it works in 2 steps

### Step 1 — Login
```
server takes your data + secret key → generates signature
token = header + payload + signature → sent to client
```

### Step 2 — Every request after
```
server receives token
  → splits into header, payload, signature
  → recomputes signature using same secret key: HMAC_SHA256(header + payload, secret_key)
  → recomputed === received signature? ✅ trust it
  → recomputed !== received signature? ❌ reject → 401
  → check expiry: current time > exp? ❌ reject → 401
  → attach decoded payload to req.user → next()
```

---

## What's inside a JWT
Three parts joined by dots: header.payload.signature

- Header → algorithm used: { "alg": "HS256" }
- Payload → your data: { "userId": 42, "email": "...", "iat": 000, "exp": 000 }
- Signature → proof nobody tampered with it

---

## Multiple servers?
All servers share the same secret key.
No shared DB needed. Any server can verify any token independently.
This is JWT's superpower.

---

## Two tokens — why?

| | Access Token | Refresh Token |
|---|---|---|
| Lifespan | 15min – 1hr | 7–30 days |
| Stored in | JS memory | HttpOnly cookie |
| Sent on | Every request | Only /auth/refresh |
| Server stores? | No | Yes — so it can be revoked |

## The one trade-off
Stateless = fast and scalable, but can't revoke instantly.
Everything else (short expiry, refresh tokens, blacklisting) exists to fix this one problem.

---

## Must-know security

| Threat | Fix |
|---|---|
| Stolen access token | Short expiry — dead in 15min anyway |
| Stolen refresh token | Store in DB → delete it → attacker locked out |
| Forged token | Signature math — impossible without secret key |
| Algorithm attack | Always whitelist: { algorithms: ['HS256'] } |
| CSRF on cookies | SameSite=Strict on refresh token cookie |
| Need to revoke NOW | Blacklist the jti in Redis |
| Microservices | RS256 — private key signs, public key verifies |
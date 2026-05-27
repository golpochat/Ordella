# Developer Onboarding — Account Creation

Create your Ordella developer identity, verify email, configure security, and optionally link a partner organization. This is **step 1** of the [onboarding overview](./OVERVIEW.md) (~3 minutes).

**Related:** [Developer Portal — account settings](../developer-portal/pages/account-settings.md) · [Authentication](../docs/public/developers/authentication.md)

---

## Account creation steps

1. Navigate to the **Developer Portal** sign-up URL (`<!-- PLACEHOLDER: https://developers.ordella.com/signup -->`) or accept an **invitation** from your organization admin.  
2. Enter **work email**, full name, and organization name (company or personal dev shop).  
3. Choose a strong password or continue with approved SSO if enabled for your domain (enterprise—placeholder).  
4. Accept **Terms of Service** and **Developer Agreement** (links in UI).  
5. Complete CAPTCHA or bot protection if prompted.  
6. Land on [Dashboard](../developer-portal/pages/dashboard.md) with onboarding checklist visible.

Retail staff accounts created only in Admin UI are **not** the same as developer portal accounts—integrators should use the developer signup path unless invited explicitly.

---

## Email verification

After signup, Ordella sends a **verification email** to the address provided. Click the link within **24 hours** (placeholder expiry) to activate API access. Unverified accounts may read documentation but cannot create API keys or sandboxes.

If the email does not arrive:

- Check spam and corporate filters  
- Request **resend verification** from the login screen  
- Ensure `+` aliases and disposable domains are allowed (some may be blocked—placeholder policy)  

Support: `developers@ordella.com` <!-- PLACEHOLDER --> with signup timestamp.

---

## Security setup

Complete these steps before production keys (recommended before sandbox keys too):

| Control | Recommendation |
|---------|----------------|
| **MFA** | Enable TOTP or WebAuthn on [Account settings](../developer-portal/pages/account-settings.md) |
| **Recovery codes** | Store offline after MFA enrollment |
| **Organization roles** | Owner vs Developer vs Billing—least privilege ([api-key-management](../developer-portal/sections/api-key-management.md)) |
| **Session** | Sign out shared machines; short session timeout for contractors |

Ordella may require MFA for **partner** organizations and before **production** key issuance. Never share portal passwords; use individual accounts.

JWT sessions for interactive portal use differ from **API keys** for automation—see [API_KEYS.md](./API_KEYS.md).

---

## Linking to partner portal (optional)

If your company is an Ordella **partner**, link your developer user to the partner org:

1. Accept **partner invitation** email from partner admin, **or**  
2. Apply at [partner program](../partner-program/PROGRAM_OVERVIEW.md) and reference your developer org ID, **or**  
3. Complete [Partner onboarding](../developer-portal/pages/partner-onboarding.md) stepper after acceptance.

Linked accounts see **partner tools** ([partner-tools](../developer-portal/sections/partner-tools.md)): app publishing, deal registration (Gold+), training modules.

Developers who are not partners skip this section and proceed to [SANDBOX_SETUP.md](./SANDBOX_SETUP.md).

---

## Next steps

- [SANDBOX_SETUP.md](./SANDBOX_SETUP.md) — create isolated tenant  
- [API_KEYS.md](./API_KEYS.md) — issue sandbox credentials  
- [Beta program](../beta-program/ONBOARDING_FLOW.md#developers) if joining beta cohort

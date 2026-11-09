# SmartBond AI (scaffold, UNTESTED)
1. Create Supabase project; run supabase/schema.sql; enable email auth.
2. Copy .env.example to web/.env.local, fill in. Set ANTHROPIC_MODEL to a current model.
3. `cd web && npm i && npm run dev`
4. Extension: `cd extension && npm i`, create .env with VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY; `npm run build`; copy manifest.json and sidepanel.html into dist; Chrome > Extensions > Developer mode > Load unpacked > dist. Put the extension ID in EXTENSION_ORIGIN and your backend URL in manifest host_permissions.
## Status
Done (written, not run): schema+RLS, chat API (auth, validation, rate limit, history, prompt-injection framing), web chat with modes + EN/BN, extension side panel, context-menu text actions, on-click page summarize, enable/clear/sign-out.
Added (untested): tasks + reminders API/UI (reminders stay unconfirmed until user confirms; no delivery worker yet), history page with delete, system dark mode, Open web app button.
Not done: dedicated tool pages, file upload/PDF/image, reminder delivery/scheduler, profile/settings sync, i18n of UI, tests, deployment, store checklist.


## Security and test notes (review pass)
- Chat API now verifies that a supplied conversation ID belongs to the signed-in user before loading or writing conversation messages. This prevents cross-account conversation-ID injection.
- Extension CORS preflight now explicitly allows POST and OPTIONS.
- The API now checks both Anthropic environment variables and handles database write failures rather than silently reporting success.
- Keep `ANTHROPIC_API_KEY` server-side only. Never put it in a `NEXT_PUBLIC_*` or `VITE_*` variable.
- The extension's `VITE_*` Supabase URL/anon key are public client configuration; enable the supplied Row Level Security policies before using real accounts.
- Reminder rows are only stored/confirmed. There is no notification delivery worker or scheduler in this scaffold.

Build verification was not completed in this environment because dependency installation was interrupted. Run `npm install` and `npm run build` in both `web/` and `extension/` before deployment.

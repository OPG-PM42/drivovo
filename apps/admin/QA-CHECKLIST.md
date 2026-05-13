# Admin App — Manual Smoke QA Checklist

Run after architectural changes. Each step lists expected URL + facade.admin() snapshot + localStorage state.

1. **Cold start without session**
   - Action: open admin in clean browser (no cookies).
   - Expected URL: `/login`
   - Expected `facade.admin()`: `null`
   - Expected localStorage: empty (no admin keys)

2. **Login happy path**
   - Action: enter valid credentials, submit.
   - Expected URL: `/cars` (or default authenticated route)
   - Expected `facade.admin()`: `{ id, email, name, role }` truthy
   - Expected localStorage: session token if used

3. **Refresh authenticated**
   - Action: with valid session, hard-refresh `/cars`.
   - Expected URL: `/cars` (no flicker to /login)
   - Expected `facade.admin()`: still truthy after bootstrap probe

4. **Refresh expired session**
   - Action: invalidate cookie/token in DevTools, hard-refresh `/cars`.
   - Expected URL: `/login`
   - Expected `facade.admin()`: `null`

5. **Logout**
   - Action: click logout in shell.
   - Expected URL: `/login`
   - Expected `facade.admin()`: `null`
   - Expected: no duplicate HTTP requests if double-clicked

6. **401 on CRUD → forced logout**
   - Action: open Network tab, override any CRUD response with 401.
   - Expected URL: redirect to `/login`
   - Expected `facade.admin()`: `null` after redirect
   - Expected console: `[AdminErrorHandler] forced sign-out due to 401`

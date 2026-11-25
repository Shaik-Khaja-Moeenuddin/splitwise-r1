# SplitWise – Shared Expense Manager

A responsive React + Vite front-end project for tracking shared group expenses.

## Implemented features
- React component-based architecture and React Router page navigation.
- Signup, login, logout and demo role-based User/Admin screens using browser Local Storage.
- Group creation and member selection.
- Expense creation, equal division among group members, and transaction history.
- Per-group net balance calculation, suggested repayments, and group-specific settlement recording.
- Admin dashboard with user search, role management, user deletion, group deletion, CSV export and activity overview.
- Bootstrap 5, Bootstrap Icons, custom CSS, Flexbox/Grid and responsive layouts.

## Run locally

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. To test a production build:

```bash
npm run build
npm run preview
```

## Demo administrator
- Email: `admin@splitwise.com`
- Password: `admin123`

Create regular accounts using the Sign up page.

## Deploy to Vercel
1. Create a GitHub repository and push this project.
2. In Vercel choose **Add New → Project**, import the repository.
3. Select **Vite**; build command `npm run build`; output directory `dist`.
4. Deploy. `vercel.json` includes the SPA rewrite required for React Router refreshes.

## Git collaboration evidence
See `CONTRIBUTIONS.md` for a feature-branch workflow and a contribution table. Replace the blank rows with your real team members, actual tasks and commit evidence. Do not invent contribution records.

## Testing checklist
- Sign up two or more users in the same browser.
- Create a group and add those users.
- Add expenses with different payers; check **Balances & settlements**.
- Record a repayment and verify balances update.
- Sign in as admin and test user search, role changes, CSV export and group deletion.
- Resize the browser to desktop, tablet and mobile widths.
- Run `npm run build` before submitting.

## Important limitation
This is an academic front-end demo. Local Storage is browser-specific, passwords are stored in plain text, and role enforcement is client-side. It is not production-secure and does not process real money transfers. Use test credentials only. A production version requires a backend, database, password hashing and server-side authorization.

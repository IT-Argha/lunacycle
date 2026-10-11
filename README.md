# LunaCycle

LunaCycle is a mobile-first period prediction and cycle tracking app built with HTML, CSS, vanilla JavaScript, Firebase Authentication, Cloud Firestore, Chart.js, and Lucide icons. The provided CycleCare logo is used as the visual mark while the product name remains LunaCycle.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server. The project opens in a demo-friendly mode: accounts and period records are stored in `localStorage` so every screen can be explored without credentials. Use **Try the demo dashboard** to see sample data. Demo data is not appropriate for real health records.

## GitHub Pages hosting + Firebase backend

This project can be hosted on GitHub Pages while Firebase provides Authentication, Firestore, and Cloud Functions. GitHub Pages only serves the static files; it does not replace Firebase security rules or backend functions.

1. Push the project to a GitHub repository with `index.html` at the repository root.
2. On GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main`, and select `/ (root)`.
4. Copy the resulting URL, for example `https://yourname.github.io/CycleCare/`.
5. In Firebase Console, open **Authentication → Settings → Authorized domains** and add your GitHub Pages hostname, such as `yourname.github.io`.
6. Keep the Firebase configuration in `js/firebase-config.js`; it is used by the browser SDK.
7. Deploy only the Firebase backend from the project root:

```powershell
firebase deploy --only firestore,functions
```

The `firebase.json` Hosting section is retained for local emulation, but production frontend hosting is handled by GitHub Pages.

## Connect Firebase

1. Create a Firebase project and enable Email/Password Authentication and Cloud Firestore.
2. Copy the web app configuration into `js/firebase-config.js` and replace the demo auth/data adapters in `js/auth.js` and `js/app.js` with the Firebase modular SDK calls for your project.
3. Deploy the trusted registration and account-deletion functions from `functions/` after installing its dependencies.
4. Deploy `firestore.rules` and `firestore.indexes.json`.
5. Run `firebase deploy --only hosting,firestore,functions` from this directory.

The callable function `registerWithUsername` reserves normalized usernames in a Firestore transaction before writing a profile. Passwords are accepted only by Firebase Authentication; never write them to Firestore or client storage. The rules require `request.auth.uid` to match the user document path.

## Three-stage period logging

The tracking flow is intentionally progressive:

1. **Start** — required start date/time plus initial flow, symptom, mood, pain, and notes. Future start date/time is rejected.
2. **During** — while the period is ongoing, the user can return after each period day and save that day's details. Day dates are limited from the start date through today.
3. **Finish** — the user enters the end date/time and final details. End date/time must be on or after the start and no later than the current moment.

After sign-in, an ongoing record is detected and the user can continue from the During step or finish it later. No end date is required at the start.

## Firestore shape

```text
users/{uid}
  firstName, lastName, age, username, usernameNormalized, createdAt, preferences
users/{uid}/periods/{periodId}
  startDate, startTime, endDate, endTime, isOngoing, flowIntensity,
  symptoms, mood, painLevel, notes, createdAt, updatedAt
usernames/{usernameNormalized}
  uid, createdAt
```

## Prediction behavior

The transparent client-side engine sorts starts, ignores implausible gaps outside 15–100 days, averages valid cycle lengths, computes completed-period duration, and produces an estimate plus a variability window when at least two observed cycles exist. With one start it uses the configurable default (28 days by default). Estimates are informational and are not medical advice or contraception guidance.

## Test scenarios

- Register with valid details, then try the same username using different capitalization.
- Reject short passwords, invalid usernames, missing names, and mismatched confirmation.
- Sign out and sign back in; confirm private history remains tied to the account.
- Log an ongoing period, complete it later, edit it, and confirm an overlapping record prompts for confirmation.
- Add three starts and confirm the dashboard estimate, range, and cycle trend update.
- Export CSV from Reports and Profile.
- Delete a history row and confirm it disappears from calendar and reports.
- In Firebase, attempt to read another UID path and confirm Security Rules deny it.

## Privacy note

Menstrual records are sensitive health-adjacent data. Keep analytics off, avoid logging record contents, use HTTPS hosting, and make reminders opt-in. Browser notifications should only be requested after a user action and should always be described as estimate-based.

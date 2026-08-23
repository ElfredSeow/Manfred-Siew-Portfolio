# GitHub Actions: Firebase Hosting deploy setup

Two workflows automate deployment of `public/` to Firebase Hosting
(project `manfred-siew`):

- **`.github/workflows/deploy.yml`** — on every push to `main` (i.e. after
  a PR merges), runs a link check then deploys straight to the live site.
- **`.github/workflows/pr-preview.yml`** — on every pull request into
  `main`, runs the same link check then deploys to a temporary Firebase
  preview channel (expires after 7 days) and comments the preview URL on
  the PR.

Both need one repository secret before they'll work: `FIREBASE_SERVICE_ACCOUNT`.

## 1. Generate a Firebase service account key

1. Go to the [Firebase console](https://console.firebase.google.com/) →
   select the **manfred-siew** project.
2. Click the gear icon → **Project settings** → **Service accounts** tab.
3. Click **Generate new private key**, confirm, and a JSON file downloads.
   Keep this file secret — it grants deploy access to the project.

(Equivalent CLI path: `firebase init hosting:github` from a machine with
the Firebase CLI logged in will generate the key and offer to create the
GitHub secret for you automatically — if you use that instead, just make
sure the secret ends up named `FIREBASE_SERVICE_ACCOUNT` to match these
workflows, or update the workflow files to match whatever name it picks.)

## 2. Add it as a GitHub secret

1. In the GitHub repo, go to **Settings → Secrets and variables →
   Actions → New repository secret**.
2. Name: `FIREBASE_SERVICE_ACCOUNT`
3. Value: paste the **entire contents** of the JSON file downloaded above.
4. Save. Delete the local JSON file once it's saved as a secret (or keep
   it somewhere secure, outside the repo).

No other secrets are required — `GITHUB_TOKEN` used for posting preview
links is provided automatically by GitHub Actions.

## 3. Verify

- Open any pull request against `main` — the **Deploy PR Preview**
  workflow should run and comment a preview link within a minute or two.
- Merge a PR into `main` — the **Deploy to Firebase Hosting (Live)**
  workflow should run and publish to the production URL.

If a run fails at the deploy step with an auth error, the secret is
either missing, misnamed, or the JSON was pasted incorrectly (make sure
no extra quoting/escaping was added).

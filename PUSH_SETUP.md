# KFC Chakwal Delivery — Admin Push Notifications

The application includes admin FCM token registration, a root-scoped `/sw.js` service worker registration, foreground notification display, and a Firebase Cloud Function that sends a push alert when a document is created in the configured Firestore database's `orders` collection. The service-worker registration fix is on branch `fix/admin-push-notifications` until that branch is merged and the app is redeployed.

## One-time Firebase setup

1. Open Firebase Console and select project `gen-lang-client-0313861453`.
2. Open **Project settings → Cloud Messaging → Web Push certificates** and generate a key pair if none exists. Copy the **public VAPID key** only.
3. Merge `fix/admin-push-notifications` and deploy the updated storefront/admin app. On an Android phone, open `https://kfc-chakwal-delivery.kfcchakwal.workers.dev/seller` in Chrome and sign in as an authorized admin. If you want an app icon, use Chrome menu → **Install app** (or **Add to Home screen**), then open the installed app and go to Orders. Paste the public VAPID key into **Firebase Web Push public key (VAPID)**, click **Save Push Key**, then **Enable This Device Notifications** and allow the browser prompt. Repeat the enable step on every admin phone/browser that should receive alerts.
4. Publish the repository's `firestore.rules` to the named database `ai-studio-kfcchakwaldelive-c794408e-894c-4201-b835-4e01c97c705e`.
5. Install Firebase CLI, sign in with an account that has deployment permissions, and from the repository root run:

   ```sh
   firebase deploy --project gen-lang-client-0313861453 --only functions
   ```

6. FCM messaging itself is free, but deploying the server-side Cloud Function may require the Firebase project to use the **Blaze (pay-as-you-go)** plan and enable Cloud Functions, Cloud Build, Artifact Registry, Eventarc, and Cloud Run APIs. Check the Firebase billing page and console prompts before enabling billing; do not assume the whole server-side setup has zero possible charges.

## Important

- The VAPID public key is not a private secret; never paste a private key or service-account JSON into the storefront.
- Push alerts require the function to be deployed, current Firestore rules published, a VAPID public key saved, and at least one admin device registered.
- Mobile push support depends on the browser/OS. On iPhone/iPad, web push generally requires a supported iOS/iPadOS version and the site installed as a Home Screen web app.
- The function watches the configured named Firestore database and sends the order ID, customer name, and total in the alert. Tap the notification to open Seller Center.

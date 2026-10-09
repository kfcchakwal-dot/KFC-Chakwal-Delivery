# KFC Chakwal Delivery — Admin Push Notifications

The application now includes the client-side FCM token registration and a Firebase Cloud Function that sends a push alert when a document is created in the configured Firestore database's `orders` collection.

## One-time Firebase setup

1. Open Firebase Console and select project `gen-lang-client-0313861453`.
2. Open **Project settings → Cloud Messaging → Web Push certificates** and generate a key pair if none exists. Copy the **public VAPID key** only.
3. Deploy the latest storefront/admin app. Sign in as an authorized admin, open the Orders area, paste the public VAPID key into **Firebase Web Push public key (VAPID)**, click **Save Push Key**, then **Enable This Device Notifications**. Repeat on every admin phone/browser that should receive alerts.
4. Publish the repository's `firestore.rules` to the named database `ai-studio-kfcchakwaldelive-c794408e-894c-4201-b835-4e01c97c705e`.
5. Install Firebase CLI, sign in with an account that has deployment permissions, and from the repository root run:

   ```sh
   firebase deploy --project gen-lang-client-0313861453 --only functions
   ```

6. Cloud Functions deployment may require the Firebase project to use the **Blaze (pay-as-you-go)** plan and to enable Cloud Functions, Cloud Build, Artifact Registry, Eventarc, and Cloud Run APIs. Check Firebase's console prompts before enabling billing.

## Important

- The VAPID public key is not a private secret; never paste a private key or service-account JSON into the storefront.
- Push alerts require the function to be deployed, current Firestore rules published, a VAPID public key saved, and at least one admin device registered.
- Mobile push support depends on the browser/OS. On iPhone/iPad, web push generally requires a supported iOS/iPadOS version and the site installed as a Home Screen web app.
- The function watches the configured named Firestore database and sends the order ID, customer name, and total in the alert. Tap the notification to open Seller Center.

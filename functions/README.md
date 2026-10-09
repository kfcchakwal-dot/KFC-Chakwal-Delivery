# Firebase Functions setup

These server-side functions are required for product social previews and background order notifications.

## Deploy

1. Use a trusted computer with Node.js 22 and Firebase CLI installed.
2. Run `firebase login`, then from the repository root run:
   `firebase deploy --only functions --project gen-lang-client-0313861453`
3. The Firebase project must have billing enabled (Blaze) and Cloud Functions, Cloud Build, Artifact Registry, and Cloud Scheduler APIs available.
4. In the admin panel, open the push-notification settings, paste the **Web Push public VAPID key** from Firebase Console → Project settings → Cloud Messaging → Web Push certificates, save it, then enable notifications on every phone/browser that should receive order alerts.
5. Keep the admin panel signed in while registering each device. For mobile background alerts, install the site as a PWA where supported and allow notifications.

## WhatsApp review automation (optional)

The scheduled function is safe to deploy before WhatsApp is connected. Without these values it records eligible delivered orders as `pending_config` and does **not** claim a message was sent.

Create an ignored file named `functions/.env.gen-lang-client-0313861453` (do not commit it) with:

```dotenv
APP_ORIGIN=https://kfc-chakwal-delivery.kfcchakwal.workers.dev
WHATSAPP_ACCESS_TOKEN=your_meta_whatsapp_cloud_api_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_business_phone_number_id
WHATSAPP_REVIEW_TEMPLATE=your_approved_template_name
WHATSAPP_REVIEW_TEMPLATE_LANGUAGE=en
```

Use a valid WhatsApp Cloud API access token, the WhatsApp **phone-number ID** (not the phone number), and an approved template whose body contains two placeholders: `{{1}}` for the customer's name and `{{2}}` for the review URL. The template language must match the approved template. Redeploy Functions after changing these values.

In the Admin → Reviews section, enable automated review requests and choose the delay. Only orders whose status is Delivered are eligible. WhatsApp may still reject requests if the token expires, the template/language is incorrect, or Meta account setup is incomplete; those requests are recorded as failed for troubleshooting.

## Automatic customer order-status emails (optional)

The Functions code sends an email when an order is created and whenever its status changes (Confirmed/Received, In Kitchen/Processing, Dispatched, Delivered, or Cancelled). It requires the customer to provide an email address at checkout and requires a verified sender domain in Resend.

1. Create a Resend account and verify the domain you will send from.
2. Set `RESEND_API_KEY` and `ORDER_EMAIL_FROM` in the Firebase Functions environment for the target project. The sender must use the verified domain, for example `KFC Chakwal Delivery <orders@yourdomain.com>`.
3. Redeploy with `firebase deploy --only functions --project gen-lang-client-0313861453`.
4. Place a test order with an email address and update its status from Admin → Orders. Check delivery logs in Firebase Functions if an email fails.

Without the API key, verified sender, and customer email, the function safely skips sending and records the reason in logs; it does not report an email as sent.

## Product previews

The `productShare` HTTPS function serves server-rendered Open Graph and Twitter metadata using the public catalogue, then opens the product in the storefront. It needs to be deployed before Facebook/WhatsApp can generate the product-specific preview. Social platforms cache previews, so use their sharing/debugging tools to refresh a previously cached URL after a product image or description changes.

## Important

- The storefront remains hosted on the existing Cloudflare Worker. This setup does not change or redirect the main `kintrends.com` domain.
- Never commit Firebase service-account keys, WhatsApp tokens, or private keys.

# APSTGA ID Card Kit

Portrait CR80 membership card (54 x 85.6 mm), front + back, matching the reference design.

## 1. Install

```
npm i qrcode html-to-image jspdf
npm i -D @types/qrcode
```

## 2. Copy files into your project

| Kit file | Goes to |
|---|---|
| lib/idcard.ts | lib/idcard.ts |
| lib/idcard-export.ts | lib/idcard-export.ts |
| lib/idcard-data.ts | lib/idcard-data.ts (EDIT THIS) |
| components/idcard/* | components/idcard/ |
| app/verify/[memberId]/page.tsx | app/verify/[memberId]/page.tsx |

If your project does not use the `@/` alias, change the imports.

## 3. Environment

```
NEXT_PUBLIC_SITE_URL=https://your-real-domain.in
```

The QR encodes `<SITE_URL>/verify/<memberId>`. Do not leave localhost here, or every printed QR will be dead.

## 4. Public assets (in /public)

- `logo.png` association logo
- `signature.png` authorised signatory, transparent PNG
- `tea-leaf.png` optional leaf image for header and back (cards still work without it)

Different file names? Change `DEFAULT_ASSETS` in lib/idcard.ts.

## 5. Connect the database (lib/idcard-data.ts)

1. `mapGrowerRow` maps your registration-form record to card fields (photo, garden, DOB, address, valid-until).
2. `getPublicMember` is the public lookup for the QR page. Return only name, ID, district, validity, status. Only approved growers.

## 6. Use on the grower page

```tsx
import IdCardPanel from '@/components/idcard/IdCardPanel';
import { mapGrowerRow } from '@/lib/idcard-data';

<IdCardPanel
  grower={mapGrowerRow(row)}
  approved={row.registration_status === 'APPROVED'}
  siteUrl={process.env.NEXT_PUBLIC_SITE_URL!}
  latestPdfUrl={row.card_pdf_url}
  latestPdfName={row.card_pdf_name}
  onGenerated={async (pdf, filename) => {
    // your existing upload + save logic, return { url, name }
  }}
/>
```

Replace the old card block with this component. Keep your existing upload code inside `onGenerated`.

## 7. Photo CORS

The photo is fetched and converted to a data URL before export. If your storage bucket blocks cross-origin reads, allow your site origin in the bucket CORS settings (Supabase public buckets allow it by default).

## 8. Fonts

For identical PDF and PNG output on every machine, host the fonts yourself: Cinzel (headings) and Inter (body). With `next/font/local` or `@font-face`, name the families `Cinzel` and `Inter`. Without them the card falls back to Georgia and Segoe UI and still works.

## 9. Test before printing

1. Long name (30+ characters) and long address
2. Missing photo (should block with an error list)
3. Area with decimals (for example 3.75 Ha)
4. Expired and suspended status on /verify
5. Print a test card at 100% scale and scan the QR with a phone

## Notes

- Validation blocks generation if photo, name, DOB, address, district, garden details or valid-until are missing, or the grower is not approved.
- Hectare to acre uses 1 Ha = 2.471 acres.
- The verify page hides DOB, address, phone and bank details by design.
- Protect admin routes, but keep `/verify/*` open in middleware.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Large video uploads on Vercel

This project now uses **client-side direct uploads to Vercel Blob** for videos.
The video file no longer goes through a Next.js serverless function body, which avoids the `413 FUNCTION_PAYLOAD_TOO_LARGE` limit (~4.5MB).

Required environment variables:

- `BLOB_READ_WRITE_TOKEN` (Vercel Blob RW token)
- `UPLOAD_TOKEN` (must equal `afa03c1d-ff92-4aae-b25d-ebbc53475fbb` for the protected upload route)

Optional size configuration:

- `MAX_VIDEO_SIZE_MB` (server-side hard limit for generated upload token, default: `1024`)
- `NEXT_PUBLIC_MAX_VIDEO_SIZE_MB` (client-side validation/display limit, default: `1024`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

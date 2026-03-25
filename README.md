# hmmLoyalty System

A modern, secure, and delightful digital loyalty platform for cafes handling stamps, rewards, and customer engagement. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Digital Loyalty Cards**: Customers can collect stamps and redeem rewards seamlessly.
- **Cafe Dashboard**: Owners can track metrics, manage settings, and view customer insights.
- **Super Admin Console**: Platform-wide management, partner approvals, and system health monitoring.
- **Secure & Private**: Row Level Security (RLS) ensures data isolation and integrity.
- **Delightful UX**: Animations (Confetti, Framer Motion) and "Daily Delight" content to engage users.

## Service Agreement (Quick Summary)

1. **DATA OWNERSHIP**: The Cafe Owner owns their customer list. hmmLoyalty does not sell or share your specific cafe's data with third parties or competitors.
2. **SECURITY**: All transactions (stamps) are protected by Row Level Security (RLS) and a 5-minute time-lock to prevent fraud and double-stamping.
3. **PRIVACY**: We only collect the minimum data required to run the loyalty program (User ID and visit timestamps). No sensitive financial data is stored on our servers.
4. **SERVICE**: hmmLoyalty provides the digital infrastructure. The Cafe Owner is responsible for honoring the rewards earned by customers as displayed in the app.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, Lucide Icons
- **Animations**: Framer Motion, Canvas Confetti

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 🎫 minipass

[minipass](https://www.minipass.com.br) is a modern, real-time event ticketing platform built with Next.js, Convex, Clerk, Resend, Stripe Connect and Asaas. Features a sophisticated queue system, real-time updates, and secure payment processing.

## Features

### For Event Attendees

-   🎫 Real-time ticket availability tracking
-   ⚡ Smart queuing system with position updates
-   🕒 Time-limited ticket offers
-   📱 Mobile-friendly ticket management
-   🔒 Secure payment processing with Stripe or Asaas
-   📲 Digital tickets with QR codes
-   💌 Automatic email delivery of tickets (with QR codes) after purchase, powered by Resend
-   💸 Automatic refunds for cancelled events

### For Event Organizers

-   💰 Direct payments via Stripe Connect
-   📊 Real-time sales monitoring
-   🎯 Automated queue management
-   📈 Event analytics and tracking
-   🔄 Automatic ticket recycling
-   🎟️ Customizable ticket limits
-   ❌ Event cancellation with automatic refunds
-   🔄 Bulk refund processing

### Technical Features

-   🚀 Real-time updates using Convex
-   👤 Authentication with Clerk
-   💳 Payment processing with Stripe Connect
-   💌 Automatic email delivery of tickets (with QR codes) after purchase, powered by Resend
-   🌐 Server-side and client-side rendering
-   🎨 Modern UI with Tailwind CSS and shadcn/ui
-   📱 Responsive design
-   🛡️ Rate limiting for queue joins and purchases
-   🔒 Automated fraud prevention
-   🔔 Toast notifications for real-time feedback
-   ✨ Beautiful, accessible components with shadcn/ui

### UI/UX Features

-   🎯 Instant feedback with toast notifications
-   🎨 Consistent design system using shadcn/ui
-   ♿ Fully accessible components
-   🎭 Animated transitions and feedback
-   📱 Responsive design across all devices
-   🔄 Loading states and animations
-   💫 Micro-interactions for better engagement

## Getting Started

### Prerequisites

-   Node.js 18+
-   bun
-   Stripe and Asaas Account
-   Clerk Account
-   Convex Account
-   Resend Account

### Environment Variables

Create a `.env.local` file following the examples from `.env.example`.

### Installation

```bash
# Clone the repository
git clone https://github.com/minipass/minipass

# Install dependencies
bun install

# Start the development server
bun run dev

# In a separate terminal, start Convex
bunx convex dev
```

## Thanks

This was initially forked from a [Zero to Full Stack Hero 2.0](https://www.papareact.com/course) course, taught by Sonny Sangha

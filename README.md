# Careleo Insurer CRM

A comprehensive CRM system for health insurers built with Next.js 14, TypeScript, and modern UI components. This application provides complete member management, outreach tracking, analytics, and compliance features for healthcare organizations.

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- pnpm (recommended) or npm

### Installation & Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── MockHealthcareCRM.tsx  # Main CRM component
│   ├── MembersTab.tsx    # Member management
│   ├── OutreachTab.tsx   # Outreach tracking
│   ├── AnalyticsTab.tsx  # Analytics dashboard
│   ├── AuditTab.tsx      # Audit trail
│   └── ...               # Other components
├── lib/                  # Utilities and helpers
│   ├── mock.ts          # Mock data generators
│   ├── csv.ts           # CSV export functionality
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
└── public/              # Static assets
```

## 🎯 Features

### Member Management
- **Searchable member directory** with filters
- **Risk assessment** with color-coded badges
- **Member profiles** with demographics and conditions
- **Quick actions** for outreach (Call, SMS, Email)

### Outreach Tracking
- **Multi-channel outreach** (Call, SMS, Email, Portal)
- **Status tracking** (Planned, In-Progress, Completed, Failed)
- **Filter and search** capabilities
- **KPI dashboard** with completion rates

### Analytics Dashboard
- **Real-time charts** using Recharts
- **Channel performance** analysis
- **Response rate trends** over 14 days
- **Outreach funnel** visualization
- **Risk distribution** pie charts

### Audit Trail
- **Complete activity logging** for compliance
- **Search and filter** audit entries
- **CSV export** functionality
- **Compliance check** simulation
- **Actor tracking** with timestamps and IP addresses

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner
- **Package Manager:** pnpm

## 🎨 Customization

### Colors & Branding
- Modify `tailwind.config.js` for color schemes
- Update `app/globals.css` for CSS variables
- Replace `public/logo.svg` with your logo

### Mock Data
- Edit `lib/mock.ts` to customize data generation
- Adjust member count, conditions, and vendors
- Modify risk calculation algorithms

### Components
- All components are modular and reusable
- Follow the existing patterns for consistency
- Use TypeScript interfaces for type safety

## 📊 Data Model

### Member
```typescript
interface Member {
  id: string
  name: string
  dob: string
  plan: string
  vendor: string
  phone: string
  email: string
  address: string
  conditions: string[]
  risk: number // 0-100
}
```

### Outreach
```typescript
interface Outreach {
  id: string
  memberId: string
  memberName: string
  channel: 'Call' | 'SMS' | 'Email' | 'Portal'
  status: 'Planned' | 'In-Progress' | 'Completed' | 'Failed'
  topic: string
  timestamp: string
  agent: string
  note: string
}
```

### Audit Entry
```typescript
interface AuditEntry {
  id: string
  actor: string
  action: string
  objectType: string
  objectId: string
  memberId: string
  timestamp: string
  ip: string
  vendor: string
  details: string
}
```

## 🔧 Development

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint configuration included
- Prettier formatting (recommended)
- Component-based architecture

## 🔧 System Requirements

- **Frontend:** Next.js 14 with React 18
- **Backend:** Configurable API endpoints
- **Database:** Compatible with major SQL databases
- **Authentication:** Supports SSO and role-based access
- **Compliance:** HIPAA and HITRUST ready

## 🔒 Compliance Features

This system includes comprehensive compliance features:
- **Audit trail** with complete activity logging
- **Data export** capabilities for external systems
- **Access controls** and role-based permissions
- **HITRUST-compliant** design patterns
- **HIPAA-ready** data handling

## 📝 License

This project is licensed for healthcare organizations. Please ensure compliance with healthcare regulations and implement proper security measures for production use.

## 🤝 Contributing

For production implementations, please consult with healthcare compliance experts and implement proper security measures according to your organization's requirements.

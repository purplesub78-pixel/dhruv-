# Purple Aster Studio - Product Requirements Document

## Project Overview
**Project Name:** Purple Aster Studio Website  
**Type:** Video Production Studio Website + Client Management Platform  
**Tech Stack:** React, FastAPI, MongoDB, Tailwind CSS, Shadcn UI  
**Status:** Core Features Complete - Production Ready  
**Last Updated:** February 19, 2025

## Original Problem Statement
Create a premium video production studio website with a complete client management system including:
- Modern, cinematic website with purple/black/white color scheme
- Client onboarding with file uploads
- Payment processing via Razorpay
- Email notifications for confirmations
- Role-based dashboards (Client, Admin, Talent)

## User Personas
1. **Brand Managers** - Looking for professional video production services
2. **Event Organizers** - Need event coverage for concerts, conferences
3. **Artists & Musicians** - Seeking creative music video production
4. **Marketing Teams** - Require social media content and commercials

---

## What's Been Implemented

### Phase 1: Public Website (Completed - Feb 9, 2025)
- Full-screen hero section with animations
- Services section with 8 service cards
- Influencer Marketing section
- Model Agency section with filters
- Multi-step project inquiry form
- Portfolio gallery with video modal
- About section with stats
- Contact form with validation
- Responsive header/footer
- Mobile responsive design

### Phase 2: Client Management System (Completed - Feb 19, 2025)
- Role-based authentication (Client/Admin/Talent) via Emergent Managed Auth
- Client Onboarding form (6 steps)
- Three role-based dashboards
- Project management CRUD operations
- Deliverables upload system

### Phase 3: Third-Party Integrations (Completed - Feb 19, 2025)

#### Cloudinary Integration (File Uploads)
- Signed upload endpoint: `/api/cloudinary/signature`
- Frontend file upload UI in ClientOnboarding (step 6)
- Support for images and videos up to 50MB
- Files stored in `references/` folder on Cloudinary

#### Razorpay Integration (Payments)
- Order creation: `/api/payments/create-order`
- Payment verification: `/api/payments/verify`
- Real test mode integration with rzp_test_SIBZYeCyxSbvVC
- Payment status tracking in database

#### Resend Integration (Email Notifications)
- Project confirmation emails on submission
- Payment confirmation emails on success
- Non-blocking async email sending
- Professional HTML email templates with Purple Aster branding
- Note: In test mode, only sends to verified email addresses

### Phase 4: Admin Dashboard Enhancement (Completed - Feb 19, 2025)
- Expandable project rows with full details
- Talent assignment modal
- Talent pool management tab
- Status update functionality
- New endpoints: `/api/admin/talents`, `/api/projects/{id}/assign`

---

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/session` | POST | Exchange session_id for token |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout user |

### Projects
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | POST | Create project |
| `/api/projects` | GET | List user's projects |
| `/api/projects/{id}` | GET | Get project details |
| `/api/projects/{id}/status` | PATCH | Update status (Admin) |

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/create-order` | POST | Create Razorpay order |
| `/api/payments/verify` | POST | Verify payment signature |
| `/api/payments/{project_id}` | GET | Get project payments |

### File Uploads
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cloudinary/signature` | GET | Get signed upload params |

### Admin
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/users` | GET | List all users |

---

## Database Schema

### Users Collection
```javascript
{
  user_id: string,
  email: string,
  name: string,
  picture: string?,
  role: "client" | "admin" | "talent",
  created_at: datetime
}
```

### Projects Collection
```javascript
{
  project_id: string,
  client_id: string,
  client_name: string,
  client_email: string,
  services: string[],
  goal: string,
  platform: string,
  timeline: string,
  budget: string,
  details: string,
  reference_files: string[],  // Cloudinary URLs
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled",
  assigned_talents: string[],
  created_at: datetime,
  updated_at: datetime
}
```

### Payments Collection
```javascript
{
  payment_id: string,
  project_id: string,
  client_id: string,
  amount: number,
  payment_method: "razorpay",
  status: "pending" | "completed" | "failed",
  razorpay_order_id: string,
  razorpay_payment_id: string?,
  transaction_id: string?,
  created_at: datetime
}
```

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=dip0xwkms
CLOUDINARY_API_KEY=234544221796724
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://purple-aster-studio.preview.emergentagent.com
```

---

## Prioritized Backlog

### P0 - Critical (Required for Launch)
- [x] Razorpay integration
- [x] Cloudinary file uploads
- [x] Email notifications
- [ ] Production deployment

### P1 - Important
- [ ] Full end-to-end payment flow testing with real cards
- [ ] Admin dashboard - assign talents to projects
- [ ] Talent dashboard - view assigned projects

### P2 - Nice to Have
- [ ] Client testimonials carousel
- [ ] Portfolio video uploads by admin
- [ ] Real-time project status updates
- [ ] SMS notifications via Twilio

---

## Testing Status

### Test Reports
- `/app/test_reports/iteration_1.json` - Initial testing
- `/app/test_reports/iteration_2.json` - Auth/CORS fixes
- `/app/test_reports/iteration_3.json` - Integration testing (All pass)

### Coverage
- Backend: 100% (13/13 tests passed)
- Frontend: 100% (All pages load, forms work)

---

## Design System

### Colors
- Primary Purple: #7C3AED
- Deep Purple: #6D28D9
- Light Purple: #A78BFA
- Black: #0A0A0A
- White: #FFFFFF

### Typography
- Headlines: Bold, clamp(2rem, 5vw, 5rem)
- Body: 1rem - 1.1rem
- Captions: 0.85rem - 0.95rem

---

## File Structure
```
/app
├── backend/
│   ├── .env              # Environment variables
│   ├── auth.py           # Auth helpers
│   ├── models.py         # Pydantic models
│   ├── requirements.txt  # Python dependencies
│   └── server.py         # FastAPI application
├── frontend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── components/   # React components
│       ├── App.js        # Router setup
│       ├── dashboard.css # Dashboard styles
│       └── pages.css     # Page styles
└── memory/
    └── PRD.md            # This file
```

---

## Notes
- All credentials stored in .env files (not committed)
- Resend emails only go to verified addresses in test mode
- Razorpay test mode uses rzp_test_* keys
- File uploads work for images/videos up to 50MB

# Purple Aster Studio - Product Requirements Document

## Project Overview
**Project Name:** Purple Aster Studio Website  
**Type:** Video Production Studio Website  
**Tech Stack:** React, FastAPI, MongoDB  
**Status:** Frontend MVP Complete (Mock Data)  
**Last Updated:** February 9, 2025

## Original Problem Statement
Create a modern, cinematic video production studio website called Purple Aster Studio.
Style should be premium, creative, and professional using purple, black, and white colors.
The site should be better than kweenmedia.in with the same core features.

## User Personas
1. **Brand Managers** - Looking for professional video production services for marketing campaigns
2. **Event Organizers** - Need event coverage for concerts, conferences, and celebrations
3. **Artists & Musicians** - Seeking creative music video production
4. **Marketing Teams** - Require social media content and commercials

## Core Requirements (Static)

### 1. Homepage
- Full-screen hero section with headline and CTAs
- Cinematic design with purple, black, white color scheme
- Smooth animations and premium feel

### 2. Services Section
- 8 clickable service cards:
  - Brand / Promo Video
  - Event Coverage (Concert, Conference)
  - Commercial / Advertisement
  - Social Media Content
  - Music Video
  - Documentary / Interview
  - Animation / Motion Graphics
  - Corporate Video

### 3. Project Inquiry Form
- Multi-step form (6 steps):
  1. Select video services (multi-select)
  2. Select project goal
  3. Select platform
  4. Select timeline
  5. Select budget range
  6. Project details + contact info
- Submit functionality

### 4. Portfolio
- Video gallery with thumbnails
- Filter by service type
- Click to preview video and description
- Modal popup for video playback

### 5. About Section
- Studio description
- Focus on storytelling and visual quality
- Stats display (500+ projects, 200+ clients, 50M+ views, 15+ awards)

### 6. Contact Section
- Contact form with validation
- Contact information display
- "Let's Work Together" CTA

### 7. Header & Footer
- Fixed header with smooth navigation
- Mobile-responsive menu
- Footer with social links and copyright

## What's Been Implemented

### Phase 1: Frontend with Mock Data (Completed - Feb 9, 2025)
✅ Complete React component structure
✅ Hero section with cinematic design and animations
✅ **Hire Options section with 3 large clickable cards** (NEW)
✅ Services section with 8 service cards
✅ **Influencer Marketing section with 4 services + stats** (NEW)
✅ **Model Agency section with 8 model cards + filters** (NEW)
✅ Multi-step project inquiry form (6 steps)
✅ Portfolio gallery with 9 sample videos
✅ Filter functionality for portfolio
✅ Video modal with iframe support
✅ About section with stats
✅ Contact form with validation
✅ Responsive header with mobile menu
✅ Footer with social links
✅ Premium purple, black, white color scheme
✅ Smooth scroll navigation
✅ Mobile responsive design
✅ Mock data in separate file (mock.js)
✅ Animations and hover effects
✅ Toast notifications for form submissions

**Components Created:**
- `/app/frontend/src/components/Header.jsx`
- `/app/frontend/src/components/Hero.jsx`
- `/app/frontend/src/components/HireOptions.jsx` (NEW)
- `/app/frontend/src/components/Services.jsx`
- `/app/frontend/src/components/InfluencerMarketing.jsx` (NEW)
- `/app/frontend/src/components/ModelAgency.jsx` (NEW)
- `/app/frontend/src/components/ProjectInquiry.jsx`
- `/app/frontend/src/components/Portfolio.jsx`
- `/app/frontend/src/components/About.jsx`
- `/app/frontend/src/components/Contact.jsx`
- `/app/frontend/src/components/Footer.jsx`
- `/app/frontend/src/mock.js` (Updated with new data)

**Styling:**
- Updated `/app/frontend/src/App.css` with premium design system
- Updated `/app/frontend/src/index.css` with purple theme colors
- Added styles for Hire Options, Influencer Marketing, and Model Agency sections

## Prioritized Backlog

### P0 - Backend Development (Next Phase)
- [ ] MongoDB schemas for:
  - Project Inquiries
  - Contact Form Submissions
  - Portfolio Videos (admin managed)
- [ ] API endpoints:
  - POST `/api/inquiries` - Submit project inquiry
  - POST `/api/contact` - Submit contact form
  - GET `/api/portfolio` - Fetch portfolio videos
  - GET `/api/services` - Fetch services
- [ ] Form validation on backend
- [ ] Email notifications for new inquiries
- [ ] Replace mock data with real API calls

### P1 - Enhanced Features
- [ ] Admin panel for portfolio management
- [ ] Real video upload/hosting integration
- [ ] Email service integration (SendGrid/Mailgun)
- [ ] Analytics tracking
- [ ] SEO optimization
- [ ] Performance optimization

### P2 - Nice to Have
- [ ] Client testimonials carousel
- [ ] Blog section
- [ ] Case studies
- [ ] Pricing calculator
- [ ] Real-time chat support
- [ ] Newsletter subscription
- [ ] Social media feed integration

## Technical Architecture

### Frontend Stack
- React 19
- Shadcn UI components
- Tailwind CSS
- React Router (optional for future pages)
- Axios for API calls
- Sonner for toast notifications

### Backend Stack (To be implemented)
- FastAPI
- MongoDB with Motor (async driver)
- Pydantic for validation
- Email service integration

### Mock Data Structure
```javascript
// Services: 8 service objects with id, title, description, icon, color
// Portfolio Videos: 9 video objects with id, title, description, category, thumbnail, videoUrl, client, duration
// Form Options: projectGoals, platforms, timelines, budgetRanges
// Hire Options: 3 option objects with id, title, icon, services, color, route
// Influencer Services: 4 service objects with id, title, description, icon
// Models: 8 model objects with id, name, category, image, experience, height
```

## Next Tasks

### Immediate Next Steps:
1. **Backend API Development**
   - Create MongoDB models for ProjectInquiry and ContactSubmission
   - Build POST `/api/inquiries` endpoint
   - Build POST `/api/contact` endpoint
   - Add email notification service

2. **Frontend-Backend Integration**
   - Replace mock data with API calls
   - Add loading states
   - Implement error handling
   - Test end-to-end flow

3. **Testing**
   - Test all forms with real backend
   - Test mobile responsiveness
   - Cross-browser testing
   - Performance testing

4. **Deployment Preparation**
   - Environment configuration
   - Production build optimization
   - SEO meta tags
   - Analytics setup

## API Contracts (To Be Implemented)

### POST /api/inquiries
**Request:**
```json
{
  "selectedServices": ["Brand / Promo Video", "Music Video"],
  "projectGoal": "Launch New Product/Service",
  "platform": "Instagram",
  "timeline": "Standard (3-4 weeks)",
  "budget": "₹1,00,000 - ₹2,50,000",
  "projectDetails": "Need a compelling brand video...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Project inquiry submitted successfully",
  "inquiryId": "abc123"
}
```

### POST /api/contact
**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91 98765 43210",
  "message": "I'd like to discuss a project..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

## Design System

### Colors
- **Primary Purple:** #7C3AED (Royal Purple)
- **Deep Purple:** #6D28D9
- **Light Purple:** #A78BFA
- **Black:** #0A0A0A
- **Dark Grey:** #1F1F1F
- **Grey:** #404040
- **Light Grey:** #737373
- **White:** #FFFFFF
- **Off White:** #F5F5F5

### Typography
- Headlines: Bold, large (clamp 2rem - 5rem)
- Subheadings: 1.25rem - 1.5rem
- Body: 1rem - 1.1rem
- Captions: 0.85rem - 0.95rem

### Animations
- Hover effects: transform translateY(-5px)
- Fade-ins on scroll
- Smooth transitions (0.2s - 0.3s ease)
- Floating background circles
- Scroll indicator animation

## Success Metrics
- Page load time < 3 seconds
- Mobile responsive on all devices
- Form submission success rate > 95%
- Bounce rate < 40%
- User engagement time > 2 minutes

## Notes
- All forms currently use mock data and console.log
- Portfolio videos link to YouTube embed placeholder
- Images use Unsplash URLs
- No authentication/authorization implemented
- Ready for backend integration

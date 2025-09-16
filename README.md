# 🍽️ QR Menu SaaS

A modern, responsive QR menu SaaS platform built with Next.js that allows restaurants to create digital menus accessible via QR codes.

## ✨ Features

### 🎨 **Menu Creation & Design**
- **5-Step Wizard**: Name, Categories, Items, Color Templates, Font Selection
- **15 Color Templates**: Pre-built professional color combinations
- **8 Google Fonts**: Distinct typography options (Inter, Playfair Display, Poppins, etc.)
- **Live Preview**: Real-time preview during creation and editing
- **Drag & Drop**: Reorder categories and items
- **Ingredients System**: Pre-built suggestions + custom input

### 📱 **Mobile-First Design**
- Fully responsive across all devices
- Touch-optimized interface
- Progressive Web App ready
- Optimized for restaurant staff workflow

### 📊 **Analytics & Tracking**
- QR code scan tracking
- Device type detection (mobile/tablet/desktop)
- Popular items analysis
- Time-based analytics
- User engagement metrics

### 🎯 **User Experience**
- **Landing Page**: Professional marketing site
- **Authentication**: Register, login, email/phone verification
- **Dashboard**: Intuitive menu management
- **Public Menus**: Fast-loading customer-facing menus
- **Custom Notifications**: In-app success/error messages

## 🏗️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens, bcryptjs
- **QR Generation**: qrcode npm package
- **Storage**: JSON files (development) → Database (production)
- **Deployment Ready**: Vercel, Netlify compatible

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd qr-menu-saas

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Development Features

```bash
# Available Scripts
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── menu/[id]/         # Public menu display
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utility functions & templates
└── types/                 # TypeScript interfaces

public/
└── qr-codes/             # Generated QR code images
```

## 🎯 **Current Status: Development Milestone**

### ✅ **Completed Features**
- Full UI/UX implementation
- Menu creation wizard (5 steps)
- Menu editing with live preview
- QR code generation
- Analytics tracking structure
- Font system with Google Fonts
- Color template system
- Responsive design
- Authentication flow (local)

### 🔄 **Production Ready Items**
- Next.js application structure
- Component architecture
- UI/UX design system
- Menu management logic
- QR code generation
- Analytics framework

### ⚠️ **Development-Only Components**
- File-based JSON storage
- Local authentication tokens
- Console-based email/SMS verification
- Local file storage for QR codes

## 🌐 **Production Deployment Plan**

### Phase 1: Basic Production (Planned)
- [ ] **Database**: Supabase/PostgreSQL integration
- [ ] **Authentication**: Environment-based JWT secrets
- [ ] **Storage**: Cloudinary for QR codes and images
- [ ] **Email**: SendGrid integration
- [ ] **Deployment**: Vercel/Netlify setup

### Phase 2: Full Production (Future)
- [ ] **Payment**: Stripe integration
- [ ] **Email/SMS**: Real verification services
- [ ] **Advanced Analytics**: Database-backed metrics
- [ ] **Multi-tenancy**: Restaurant chain support

## 🔧 **Environment Variables**

```bash
# Required for production
DATABASE_URL=              # Database connection
NEXTAUTH_SECRET=          # JWT secret
CLOUDINARY_URL=           # Image storage
SENDGRID_API_KEY=         # Email service
NEXT_PUBLIC_APP_URL=      # Application URL
```

## 📋 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Menus
- `GET /api/menus` - List user menus
- `POST /api/menus` - Create new menu
- `GET /api/menus/[id]` - Get menu details
- `PUT /api/menus/[id]` - Update menu
- `DELETE /api/menus/[id]` - Delete menu

### Public
- `GET /api/menu/[id]` - Get public menu
- `POST /api/analytics/scan` - Track QR scan

## 🎨 **Design System**

### Color Templates
15 professional color combinations including:
- Ocean Blue, Forest Green, Royal Purple
- Burgundy Wine, Navy Classic, Sunset Orange
- And 9 more carefully curated palettes

### Typography
8 Google Fonts with distinct characteristics:
- **Modern**: Inter, Poppins, Montserrat, Roboto
- **Elegant**: Playfair Display, Lora, Cormorant Garamond
- **Traditional**: Merriweather

### Components
- Consistent design language
- Accessible color contrasts
- Mobile-optimized touch targets
- Loading states and error handling

## 🤝 **Contributing**

This is a milestone version. Future contributions will focus on:
1. Database integration
2. Production deployment
3. Payment system integration
4. Advanced analytics features

## 📄 **License**

[License Type] - See LICENSE file for details.

## 🔮 **Roadmap**

### Immediate (Next Phase)
- [ ] Database migration from JSON files
- [ ] Production deployment setup
- [ ] Environment configuration
- [ ] Cloud storage integration

### Short Term
- [ ] Email/SMS verification services
- [ ] Enhanced analytics dashboard
- [ ] Menu templates marketplace
- [ ] Multi-language support

### Long Term
- [ ] Payment system integration
- [ ] Restaurant chain management
- [ ] Advanced customization options
- [ ] Mobile app companion

---

**Current Version**: Development Milestone  
**Last Updated**: September 2024  
**Status**: Ready for Production Migration
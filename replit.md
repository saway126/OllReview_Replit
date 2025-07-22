# AllReview Platform

## Overview

AllReview Platform is a comprehensive Korean marketing platform that connects advertisers with partners for product promotion and review campaigns. The platform facilitates campaign creation, partner recruitment, sample distribution, and performance tracking through an integrated web application.

## Recent Changes (July 19, 2025)

✓ **Authentication System Completed**: Fixed login/signup flow with bcrypt password encryption
✓ **Routing System Stabilized**: Implemented reliable post-authentication page navigation
✓ **Test Accounts Added**: Added 3 production-ready test accounts for all user roles
✓ **Session Management**: Enhanced server-side session handling with proper error responses
✓ **Database Integration**: All authentication flows now use PostgreSQL with proper schemas
✓ **Production Ready**: Platform ready for deployment with working login system
✓ **Error Handling**: Improved JSON parsing and API error handling across all components

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based frontend with the following architectural decisions:

**Framework Choice**: React with TypeScript for type safety and better developer experience
- **Rationale**: React provides excellent component reusability and ecosystem support
- **Alternative considered**: Vue.js - React chosen for larger community and better TypeScript integration

**Routing**: Wouter for lightweight client-side routing
- **Rationale**: Smaller bundle size compared to React Router while providing essential routing features
- **Trade-off**: Fewer advanced features but sufficient for the application's needs

**Styling**: Tailwind CSS with shadcn/ui component library
- **Rationale**: Utility-first CSS framework with pre-built accessible components
- **Benefits**: Rapid development, consistent design system, and responsive design out of the box

**State Management**: TanStack Query (React Query) for server state management
- **Rationale**: Excellent caching, background updates, and API synchronization
- **Alternative considered**: Redux - React Query chosen for simpler API integration

### Backend Architecture
The backend follows a REST API pattern with Express.js:

**Framework**: Express.js with TypeScript
- **Rationale**: Mature, lightweight, and excellent middleware ecosystem
- **Benefits**: Fast development, extensive documentation, and Node.js ecosystem compatibility

**Session Management**: Express-session with secure configuration
- **Rationale**: Server-side session storage for security
- **Trade-off**: Requires server memory but provides better security than JWT for this use case

**Authentication**: bcrypt for password hashing with role-based access control
- **Rationale**: Industry-standard password hashing with salt
- **Security consideration**: Implements role-based permissions (admin, advertiser, partner)

### Data Storage Solutions
**Primary Database**: PostgreSQL with Drizzle ORM
- **Rationale**: ACID compliance, excellent performance for complex queries, and strong typing with Drizzle
- **Alternative considered**: MongoDB - PostgreSQL chosen for relational data requirements
- **Benefits**: Type-safe database queries, migration support, and excellent performance

**Database Provider**: Neon (PostgreSQL-compatible)
- **Rationale**: Serverless PostgreSQL with automatic scaling
- **Benefits**: No infrastructure management, pay-per-use pricing model

## Key Components

### User Management System
- **Multi-role authentication**: Admin, Advertiser, Partner roles with different capabilities
- **Secure session management**: Server-side sessions with proper expiration
- **Profile management**: Company information, contact details, and role-specific data

### Campaign Management
- **Campaign lifecycle**: Draft → Recruiting → Active → Completed states
- **Target filtering**: Demographics, regions, interests with multiple selection support
- **Budget management**: Daily and total budget controls with automatic calculations
- **Partner recruitment**: Application and approval workflow

### Partner Operations
- **Sample product management**: Request and distribution tracking
- **Shipping record system**: Daily shipping data entry with tracking numbers
- **Performance analytics**: QR code tracking and conversion metrics

### Admin Dashboard
- **Platform oversight**: User management, campaign monitoring, performance analytics
- **Revenue tracking**: Payment processing and settlement management
- **System configuration**: Platform settings and category management

## Data Flow

### Campaign Creation Flow
1. Advertiser creates campaign with target criteria and budget
2. System validates input and sets campaign to "recruiting" status
3. Partners browse and apply to campaigns
4. Advertiser reviews applications and selects partners
5. Selected partners receive sample products
6. Campaign launches with daily shipping tracking
7. Performance metrics collected via QR code scanning
8. Results compiled for advertiser analysis

### Authentication Flow
1. User submits credentials via login form
2. Server validates against bcrypt-hashed passwords
3. Session created with user data and role information
4. Frontend redirects to role-appropriate dashboard
5. Subsequent requests authenticated via session cookies

### Data Synchronization
- **Real-time updates**: TanStack Query provides automatic background refetching
- **Optimistic updates**: UI updates immediately with server reconciliation
- **Error handling**: Comprehensive error boundaries and user feedback

## External Dependencies

### UI Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form handling with validation

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire stack

### Database Tools
- **Drizzle Kit**: Database migrations and schema management
- **Drizzle Zod**: Type-safe schema validation

### Runtime Dependencies
- **Date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class management
- **nanoid**: Unique ID generation

## Deployment Strategy

### Development Environment
- **Vite dev server**: Hot reload and fast development builds
- **Environment variables**: Database URL and session secrets
- **Development middleware**: Error overlay and debugging tools

### Production Build Process
1. **Frontend build**: Vite compiles React app to static assets
2. **Backend build**: ESBuild bundles server code for Node.js
3. **Database migrations**: Drizzle Kit applies schema changes
4. **Asset optimization**: Static files served efficiently

### Environment Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Session storage**: In-memory sessions (can be upgraded to Redis for scaling)
- **Static assets**: Served via Express static middleware
- **Environment variables**: Secure configuration for database and session secrets

### Scaling Considerations
- **Database**: Neon automatically scales with usage
- **Session storage**: Can migrate to Redis for distributed sessions
- **Frontend**: Static assets can be served via CDN
- **Backend**: Stateless design allows horizontal scaling
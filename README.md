Community Disaster Management System
A full-stack disaster reporting and coordination platform built for community emergency response, relief tracking, citizen reporting, and admin oversight.

This project includes:

a multi-page frontend built with HTML, CSS, JavaScript, and Bootstrap
a backend built with Node.js, Express, and MongoDB
separate Citizen/User and Admin access flows
working reporting, validation, donation, contact, profile, and tracker modules
optional Windows and Android app wrappers
Features
User Side
user signup and login with email or phone number
forgot password flow with OTP-based reset
remember login info with Save your info on this device
profile settings page
incident/disaster reporting form
recent citizen reports with live status tracking
filtered location-based updates
donation form
contact form
newsletter subscription
Admin Side
separate admin login page
admin dashboard overview
view all users
view reported incidents
approve pending authority accounts
track donations, contact requests, and subscriptions
change incident status to:
Open
In Progress
Resolved
Live Tracking
when admin updates an incident status, the same status is reflected on the user-side reports section
recent reports auto-refresh to show updated progress
Tech Stack
Frontend
HTML5
CSS3
JavaScript
Bootstrap 5
jQuery
Font Awesome
AOS
Backend
Node.js
Express.js
MongoDB
Mongoose
bcryptjs
morgan
cors
dotenv
nodemailer
twilio
App Wrappers
Electron for Windows
Capacitor for Android
Project Structure
newpro/
├── frontend/        # Main website pages, styles, scripts, assets
├── backend/         # Express + MongoDB backend
├── apps/
│   ├── windows/     # Electron desktop app
│   └── android/     # Capacitor Android app
├── assets/          # Older root-level assets
├── index.html       # Legacy root file
├── styles.css       # Legacy root file
└── script.js        # Legacy root file
Main Frontend Pages
frontend/index.html - Home page
frontend/about.html - About page
frontend/services.html - Services page
frontend/report.html - Login, signup, forgot password, incident reporting
frontend/admin.html - Separate admin login and dashboard
frontend/profile.html - User profile settings
frontend/resources.html - Safety guides and resources
frontend/contact.html - Contact page
frontend/donate.html - Donation page
frontend/gallery.html - Media/gallery page
Backend Modules
Authentication
Incident Management
Authority Validation
Profile Management
Donations
Contact Messages
Subscriptions
Updates Feed
Admin Overview Dashboard

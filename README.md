# DevExtreme Scheduler

[DevExtreme](https://js.devexpress.com/Angular/)
[Tailwind CSS](https://tailwindcss.com/)

A modern appointment management system built with DevExtreme Scheduler component, featuring AI-powered scheduling assistance and user-friendly interface.

## Features

- 📅 Interactive calendar interface
- 🤖 AI-powered features:
  - Smart appointment suggestions
  - Intelligent appointment modifications
  - Context-aware scheduling assistance
- 👥 User authentication and management
- 📊 Personal dashboard with user statistics
- 📝 List and calendar view for appointments
- 🔄 Real-time status updates
- 🎨 Modern and responsive design

## Tech Stack

- Frontend: Angular 19 with TypeScript
- CSS: Tailwind CSS
- UI Components: DevExtreme
- Backend: C# .NET 8
- Database: Microsoft SQL Server
- AI Integration: Google Gemini
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js
- Angular CLI v19
- Microsoft SQL Server
- Google Gemini API key - GEMINI_KEY on backend user's secret
- Microsoft SQL Server running instance with default settings
- MSSQL Database named 'scheduler'
- Visual Studio 2022 Community Edition

### Installation

1. Clone the repository

```bash
git clone https://github.com/EdoardoMenicucci/devextreme-scheuler
cd devextreme-scheduler
```

2. Frontend Setup

```bash
cd ClientApp
npm install
ng serve
```

3. Backend Setup

```bash
# Open the solution in Visual Studio 2022
# Restore NuGet packages
# Create a Database named 'scheduler'
# Update database connection string in appsettings.json
# Run the application
```

4. Access the application at `http://localhost:4200`

## Usage

1. Log in or create a new account
2. Navigate to the calendar view
3. Create, edit, or delete appointments
4. Use AI suggestions for optimal scheduling
5. View your statistics in the dashboard

## TODO:

- [ ] Handling previous chat / design feature
- [x] Logout handling
- [x] Icons
- [x] Login flow minor fixes
- [x] Dashboard for user stats
- [x] Appointment in list format
- [x] Use status instead of isCompleted on backend and adapt all logic with api / gemini response
- [x] Share appointments between users
- [x] Cleanup subscription only for "long lived" observable - not HTTP Req
- [x] Scheduler / Agenda View (Appointments Box and Form) Customization
- [x] Add Appointment Priority Feature
- [x] Move Sidebar to Template with router-outlet (then remove it from home - login - register view)
- [ ] Priority Implementation on Gemini Api Client (Backend)
- [ ] Gemini not recognising current date correctly (Backend)

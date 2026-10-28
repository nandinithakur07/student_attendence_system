# CU Nexus — Smart Campus Attendance & Analytics

A modern frontend-only Chandigarh University BCA attendance prototype designed to run directly in **VS Code + Live Server**.

## What's upgraded

- **Modern CU Nexus UI** with a polished glass/gradient login experience.
- **Role-aware dashboards** for Student, Faculty, HOD and Admin.
- Responsive **sidebar + mobile navigation**.
- Top navigation with **global search, notifications, theme toggle and profile menu**.
- Attendance KPI cards, subject progress bars and analytics charts.
- Improved **QR attendance** session generator / student check-in flow.
- Better **leave-management** workflow with approval/rejection badges.
- **Digital Student ID card** for students.
- PDF report preview + downloadable attendance report.
- Searchable attendance and user tables.
- Modern badges, buttons, cards, empty states and responsive layouts.
- LocalStorage persistence so demo data survives browser refreshes.
- Existing attendance, leave, QR, user-management and PDF functionality retained.

## Run in VS Code

1. Extract the ZIP.
2. Open the `cu_bca_final` folder in VS Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

No Node.js, npm install, build step or backend is required for this prototype.

> The UI uses CDN-hosted Chart.js, jsPDF, QRCode.js, Lucide icons and Google Fonts. An internet connection is recommended while running the demo.

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Student | `student` | `1234` |
| Faculty | `faculty` | `1234` |
| HOD | `hod` | `1234` |
| Admin | `admin` | `1234` |

The role buttons on the login page auto-fill the corresponding demo account.

## Project files

- `index.html` — application shell and CDN dependencies
- `style.css` — complete responsive CU Nexus design system
- `app.js` — role dashboards, attendance, QR, leave, reports, ID card, search, theme and localStorage logic
- `README.md` — setup and production notes

## Production upgrade path

This remains a browser-only academic project/demo. For professional deployment, replace localStorage authentication and data with a secure backend/database, hashed passwords, server-side authorization, real OTP/email delivery, audit logs, QR session validation, API security, role/permission policies and institution-approved data protection controls.

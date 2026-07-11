@echo off
rem One-click local admin for the storefront-kit staging site.
rem Opens two server windows (close them when done) + the admin in your browser.
cd /d C:\Users\ryanm\demo-hosting
start "decap-server (close to stop)" cmd /k npx -y decap-server
start "site-server (close to stop)" cmd /k python -m http.server 8788
timeout /t 4 >nul
start http://localhost:8788/sites/rose-honey-store/admin/

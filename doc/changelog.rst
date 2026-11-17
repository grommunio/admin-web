aweb 6.0 (2026-11-17)
=====================

* Build with Vite instead of Create React App
* Update to React 19, MUI 9, MUI X 9, i18next 27, react-router 8,
  apexcharts 8 and TinyMCE 8
* Sanitize out-of-office replies loaded into the editor
* Keep the session token out of localStorage; with admin-api 1.22 it is an
  HttpOnly cookie and revoked on logout
* Only redirect to local paths after login
* Keep link targets in out-of-office replies
* Limit geocoding requests to one per second
* Fix folder selection in the user folder tree
* Fix date locales for Chinese and the Ukrainian language selection
* Restore list icon spacing
* Hide the chart menus on the dashboard
* Ship third-party license notices
* Building requires Node.js 22.22 or newer


aweb 5.0 (2026-04-02/2026-04-07)
================================

* Migrate codebase to TypeScript


aweb 4.1 (2026-03-30)
=====================

* Improved dashboard chart labels
* Add store delegate helpertexts
* Do not reset update log when connection is interrupted
* Cache user list filters
* Improved orphaned users display
* Implemented single orphaned user deletion
* Implemented task cancel/delete buttons
* Show lastconnecttime for mobile devices
* Enabled same-org folder owners
* Added hide-from selector to contact details

Project L-X1: Advanced Competitive Programming Tracker
Project L-X1 is a high-performance dashboard designed specifically for competitive programmers. This platform helps users seamlessly track their progress, auto-sync their Codeforces submissions, and follow a highly structured problem-solving curriculum (spanning 900-1100 Ratings).

The standout highlights of this project are its Serverless Architecture and Clerk-powered Cloud Authentication.

✨ Key Features
Clerk Authentication: Secure and stateless login/signup system with Google and Email support.

Cloud Handle Linking: The user's Codeforces handle is securely saved in their cloud metadata. This ensures that no matter which device they log in from, their data and progress remain perfectly synced.

CP-31 Style Auto-Sync: Features a direct API verification system that fetches real-time submission data from the Codeforces API to automatically update user progress.

Dynamic Stats Dashboard: Live calculation of Solved/Total problems, an interactive Level-up system, and a dynamic Progress Heatmap.

Interactive Curriculum: Problems are meticulously categorized into difficulty Tiers (900, 1000, 1100) and topic-based Sub-categories (Greedy, Math, Two Pointers, etc.).

🛠️ Tech Stack
Frontend: React 18, Vite, TypeScript

Styling: Tailwind CSS (Optimized for Dark Mode)

Auth & Database: Clerk (User Sessions & Cloud Metadata)

API Integration: Codeforces API (REST)

Deployment: Vercel

🐛 The Debugging Journey: Challenges & Solutions
Building this project involved tackling and resolving several real-world frontend and deployment challenges:

1. Vercel 404 "Not Found" on Refresh
Problem: Because the project is a Single Page Application (SPA), refreshing the browser on custom routes (like /dashboard) threw a "404 Not Found" error on Vercel's servers.

Solution: Created a vercel.json configuration file in the root directory to implement URL Rewrites. This ensures all incoming requests are redirected to index.html, allowing React Router to successfully take over the client-side routing.

2. Clerk Authentication Redirect Loop
Problem: After successfully signing up, the application was forcefully kicking the user back to the login page.

Discovery: The React Router paths were too strictly defined (e.g., exactly /login). However, Clerk appends dynamic sub-routes to the URL during email verification and OAuth callbacks.

Solution: Updated App.tsx to use Wildcard Paths (/login/* and /signup/*). Additionally, implemented an isLoaded state check within the ProtectedRoute component to ensure the app waits for Clerk to verify the session before attempting any redirects.

3. Cross-Device Data Persistence (The L9G9ND Bug)
Problem: Initially, the user's Codeforces handle was stored strictly in the browser's localStorage. If a user logged in on a new device, their dashboard showed 0% progress because the local storage was empty.

Solution: Migrated the storage logic to use Clerk's unsafeMetadata. Now, when a user links their handle on the SettingsPage, it is permanently attached to their cloud profile. The GlobalContext automatically fetches this metadata upon login, keeping the app state synced across all devices globally.

4. Git Push "Rejected" Error
Problem: Encountered a ! [rejected] main -> main (fetch first) error during deployment because the remote GitHub repository and the local repository had divergent commit histories.

Solution: Executed git pull origin main --rebase to smoothly integrate the remote changes into the local branch without creating unnecessary merge commits, followed by a clean git push to upload the final codebase.

🚀 How to Setup Locally
Clone the Repository:

Bash
git clone https://github.com/L9G9N0/CP-Tracker-L-XX.git
cd CP-Tracker-L-XX
Install Dependencies:

Bash
npm install
Set Environment Variables:
Create a .env.local file in the root directory and add your Clerk Publishable Key:

Code snippet
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
Run the Development Server:

Bash
npm run dev
Developed with ❤️ for the Competitive Programming Community.

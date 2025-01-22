# SOS Lifelines

A real-time humanitarian aid distribution platform that connects aid organizations with regions in need. The platform provides a visual, map-based interface showing supply and demand across different regions, enabling efficient coordination of humanitarian aid efforts.

## Features

- Interactive map visualization of regions and their supply needs
- Real-time updates of supply levels and demands
- Organization authentication and management
- Donation system for registered organizations
- Supply type categorization (Food, Water, Medical, etc.)
- Multi-region support (Currently: Gaza, Qatar, Egypt)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Mapbox account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lifelines.git
cd lifelines
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add the Firebase configuration to your `.env.local` file

## Running the Project

1. Development mode:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

2. Production build:
```bash
npm run build
npm start
```



## Project Structure

- `/app` - Main application code
  - `/components` - React components
  - `/utils` - Utility functions
  - `/data` - Static data and types
  - `/auth` - Authentication pages
  - `/contexts` - React contexts
- `/database` - Firebase configuration
- `/scripts` - Seeding and utility scripts

## Dependencies

- Next.js - React framework
- Firebase - Backend and authentication
- Mapbox GL - Map visualization
- TailwindCSS - Styling

## Credits

- Mapbox GL JS for map visualization
- Firebase for backend services
- Next.js team for the framework
- TailwindCSS for the styling framework

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

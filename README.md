# SOS Lifelines

A mapping application for visualizing and managing humanitarian aid zones using Google Maps API and Firebase.

## Features

- Interactive map visualization
- Real-time data updates using Firebase
- Zone management and information display
- Support for multiple countries including Qatar, Gaza, Sudan, Egypt, Yemen, Jordan, and Saudi Arabia

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase account
- Mapbox account
- Geoapify API key

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js application pages and components
- `/database` - Firebase configuration and database utilities
- `/public` - Static assets
- `/styles` - CSS and styling files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

Please note that you should never commit your `.env.local` file or any other files containing sensitive information like API keys. These should be set up individually by each developer working on the project.

import "./globals.css";
import { Inter } from "next/font/google";
import ProfileIndicator from "./components/ProfileIndicator";
import DonateButton from "./components/DonateButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SOS Lifelines",
  description: "Humanitarian Aid Distribution Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProfileIndicator />
        <DonateButton />
        {children}
      </body>
    </html>
  );
}

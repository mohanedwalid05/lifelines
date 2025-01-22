"use client";
import { useRouter } from "next/navigation";

export default function DonateButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/donate")}
      className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg text-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
    >
      <span>❤️</span>
      <span>Donate Now</span>
    </button>
  );
}

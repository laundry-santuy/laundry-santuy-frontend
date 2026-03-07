"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-db`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Laundry Santuy Dashboard</h1>
      
      <div className="p-6 border rounded-xl bg-white shadow-lg text-black">
        <h2 className="text-xl font-semibold mb-2">Database Test Result:</h2>
        {data ? (
          <p className="text-green-600 font-mono">{data.message}</p>
        ) : (
          <p className="text-red-600 font-mono">Loading...</p>
        )}
      </div>
    </main>
  );
}
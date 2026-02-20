"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
                    <div className="text-center max-w-2xl">
                        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Critical Error
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            A critical error occurred. Our team has been notified and is working on a fix.
                        </p>
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
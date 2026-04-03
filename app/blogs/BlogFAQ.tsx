// components/blog/BlogFAQ.tsx
"use client";

import { useState, useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
  order: number;
}

interface BlogFAQProps {
  slug: string;
  initialFaqs?: FAQItem[]; // ✅ Add this prop
  apiUrl?: string;
}

export default function BlogFAQ({
  slug,
  initialFaqs = [],
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
}: BlogFAQProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const [loading, setLoading] = useState(!initialFaqs.length);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Only fetch client-side if no initial FAQs provided
  useEffect(() => {
    if (initialFaqs.length > 0) {
      setFaqs(initialFaqs);
      setLoading(false);
      return;
    }

    async function fetchFAQs() {
      try {
        const response = await fetch(`${apiUrl}/blogs/faq/${slug}`);
        const data = await response.json();

        if (data.success && data.data?.questions) {
          const sorted = [...data.data.questions].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );
          setFaqs(sorted);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, [slug, apiUrl, initialFaqs]);

  if (loading) return null;
  if (faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers from our experts
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center"
              >
                <span className="font-semibold text-gray-900 pr-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Note: Schema is now in the parent page.tsx, remove from here to avoid duplication */}
      </div>
    </section>
  );
}

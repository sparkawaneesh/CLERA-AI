import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-primary-600 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to meet your AI doctor?</h2>
        <p className="text-lg mb-8 opacity-90">
          No appointments. No waiting. Talk to AIDOC anytime in your language.
        </p>
        <Link
          href="/chat"
          className="inline-block bg-white text-primary-700 px-8 py-4 rounded-full font-semibold shadow hover:bg-gray-50 transition"
        >
          Chat Now – अभी बात करें
        </Link>
      </div>
    </section>
  );
}
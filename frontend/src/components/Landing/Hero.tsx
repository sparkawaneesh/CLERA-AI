import Link from "next/link";
import { FaStethoscope } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <FaStethoscope className="mx-auto text-6xl text-primary-600 mb-6" />
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          आपका AI डॉक्टर <span className="text-primary-600">AIDOC</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Your body has a story. Let's write a healthier next chapter together. 
          <br />Fluent in <strong>English & Hindi</strong>, AIDOC understands your symptoms, reads your reports, and guides you with precision.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/chat"
            className="rounded-full bg-primary-600 px-8 py-4 text-white font-semibold shadow hover:bg-primary-700 transition"
          >
            Start Consultation – मुफ़्त शुरू करें
          </Link>
        </div>
      </div>
    </section>
  );
}
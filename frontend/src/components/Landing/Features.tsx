import { FaHeartbeat, FaFileMedical, FaLanguage, FaUserClock } from "react-icons/fa";

const features = [
  {
    icon: <FaHeartbeat className="text-primary-500 text-4xl" />,
    title: "Cross‑questioning AI",
    desc: "Doesn’t just answer – asks you follow‑ups to nail down the problem, just like a real doctor.",
  },
  {
    icon: <FaFileMedical className="text-primary-500 text-4xl" />,
    title: "Reads reports & prescriptions",
    desc: "Upload lab reports or old prescriptions – it extracts data and connects the dots.",
  },
  {
    icon: <FaLanguage className="text-primary-500 text-4xl" />,
    title: "Fluent English & हिंदी",
    desc: "Speak naturally in your language. AI replies in perfect English or Hindi, with voice.",
  },
  {
    icon: <FaUserClock className="text-primary-500 text-4xl" />,
    title: "Remembers you always",
    desc: "Your daily health companion. Remembers past symptoms, allergies, and suggests improvements.",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Extraordinary Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
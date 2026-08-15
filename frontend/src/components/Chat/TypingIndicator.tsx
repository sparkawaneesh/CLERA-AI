export default function TypingIndicator({ isDark }: { isDark: boolean }) {
  const dotColor = isDark ? "bg-white/30" : "bg-gray-400";
  const textColor = isDark ? "text-gray-500" : "text-gray-400";
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="flex gap-1.5">
        <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${dotColor}`}></span>
        <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${dotColor}`}></span>
        <span className={`w-2 h-2 rounded-full animate-bounce ${dotColor}`}></span>
      </div>
      <span className={`text-sm ${textColor}`}>AIDOC is thinking...</span>
    </div>
  );
}
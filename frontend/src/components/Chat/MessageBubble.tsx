import { FaUserCircle } from "react-icons/fa";
import SpeakerButton from "./SpeakerButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ message, isDark }: { message: Message; isDark: boolean }) {
  const isUser = message.role === "user";
  const isHindi = /[\u0900-\u097F]/.test(message.content);

  const userBg = isDark ? "bg-[#252525]" : "bg-white";
  const userText = isDark ? "text-white/95" : "text-gray-800";
  const aiText = isDark ? "text-white/85" : "text-gray-700";
  const avatarBg = isDark ? "bg-white/12" : "bg-purple-100";
  const aiAvatarBg = isDark ? "bg-white/8" : "bg-purple-50";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${avatarBg}`}>
              <FaUserCircle className={`text-lg ${isDark ? "text-white/50" : "text-purple-400"}`} />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${aiAvatarBg}`}>
              <span className="text-lg">🩺</span>
            </div>
          )}
        </div>

        <div>
          {isUser ? (
            <div className={`p-4 rounded-2xl rounded-br-none glow-border ${userBg}`}>
              <p className={`whitespace-pre-wrap ${userText}`}>{message.content}</p>
            </div>
          ) : (
            <div className="p-2">
              <p className={`whitespace-pre-wrap leading-relaxed ${aiText}`}>{message.content}</p>
              <div className="mt-2 flex justify-start">
                <SpeakerButton text={message.content} lang={isHindi ? "hi" : "en"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
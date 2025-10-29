import { MessageCircle } from "lucide-react";

interface AssistantFABProps {
  onClick: () => void;
}

export function AssistantFAB({ onClick }: AssistantFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group"
      aria-label="Open AI Assistant"
    >
      <MessageCircle className="w-7 h-7 text-white" />
      <span className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ask SafetyPlus
      </span>
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
    </button>
  );
}

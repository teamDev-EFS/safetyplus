import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Volume2, VolumeX, Loader2 } from "lucide-react";
import { productsAPI, ASSET_BASE_URL, resolveApiBaseUrl } from "../../lib/api"; // unify bases

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  actions?: Array<{
    type: "openProduct" | "search" | "openOrder" | "openUrl";
    payload: any;
  }>;
};

type AssistantDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

/* ------------------------- Types & helpers ------------------------- */
type Team = {
  _id: string;
  name: string;
  role: string;
  dept?: string;
  bioHtml?: string;
  email?: string;
  phone?: string;
  socials?: { linkedin?: string };
  photoPath?: string;
};

type Product = {
  _id: string;
  slug?: string;
  name: string;
  priceSell?: number;
  priceMrp?: number;
  categoryId?: { name?: string } | string;
  images?: { path?: string }[];
};

const API_BASE = resolveApiBaseUrl();

const PRODUCT_IMG = (p?: Product) =>
  p?.images?.[0]?.path
    ? getImageUrl(p.images[0].path)
    : "/placeholder-product.png";

// mirrors your getImageUrl from utils (small inline version to avoid cycle)
function getImageUrl(path?: string) {
  if (!path) return "";
  const cleaned = path.startsWith("http")
    ? path
    : path.replace(/^\/?uploads\//, "/uploads/");
  const base = ASSET_BASE_URL || API_BASE || "";
  if (!base) return cleaned;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${String(base).replace(/\/$/, "")}${withSlash}`;
}

function productLink(p: Product) {
  const idOrSlug = p.slug ?? p._id;
  return `/product/${idOrSlug}`;
}

function textOnly(html?: string) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(tokens: string[], hay: string) {
  const h = norm(hay);
  let sc = 0;
  for (const t of tokens) if (h.includes(t)) sc += t.length;
  return sc;
}

/* ------------------------- Fetchers (with fallbacks) ------------------------- */

async function fetchTeamPublic(): Promise<Team[]> {
  if (!API_BASE) return [];
  const candidates = ["/public/team", "/team", "/api/team", "/teams"];
  for (const path of candidates) {
    try {
      const r = await fetch(`${API_BASE.replace(/\/$/, "")}${path}`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        // Accept either array or {items:[]}
        return Array.isArray(data) ? data : data.items || data.team || [];
      }
    } catch {}
  }
  return [];
}

async function searchProductsLive(q: string, limit = 8): Promise<Product[]> {
  // Try your typed client first
  try {
    const res: any = await productsAPI.getAll({ q, limit });
    const items = res?.items || res?.products || res || [];
    return Array.isArray(items) ? items.slice(0, limit) : [];
  } catch {}
  // Raw fallback
  try {
    const url = new URL((API_BASE || "") + "/products");
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("limit", String(limit));
    const r = await fetch(url.toString());
    if (r.ok) {
      const data = await r.json();
      const items = data?.items || data?.products || data || [];
      return Array.isArray(items) ? items.slice(0, limit) : [];
    }
  } catch {}
  return [];
}

/* ------------------------- Component ------------------------- */

export function AssistantDrawer({ isOpen, onClose }: AssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm SafetyPlus AI Assistant. I can help you find products, share team details, track orders, or schedule a meeting. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // lightweight caches
  const teamRef = useRef<Team[] | null>(null);
  const lastProductsRef = useRef<Product[] | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const savedSpeak = localStorage.getItem("assistant-speak-enabled");
    if (savedSpeak) setSpeakEnabled(JSON.parse(savedSpeak));
  }, []);

  // Escape closes on desktop
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  // Speech recognition bootstrap
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (ev: any) => {
        const transcript = Array.from(ev.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setInput(transcript);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
    return () => recognitionRef.current?.stop();
  }, []);

  // Prefetch team + a small product slice for quick answers
  useEffect(() => {
    (async () => {
      if (!teamRef.current) {
        teamRef.current = await fetchTeamPublic();
      }
      if (!lastProductsRef.current) {
        lastProductsRef.current = await searchProductsLive("", 8);
      }
    })();
  }, []);

  const speak = (text: string) => {
    if (!speakEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  const toggleSpeak = () => {
    const v = !speakEnabled;
    setSpeakEnabled(v);
    localStorage.setItem("assistant-speak-enabled", JSON.stringify(v));
    if (!v) window.speechSynthesis.cancel();
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMessage]);
    setInput("");
    setLoading(true);
    window.speechSynthesis.cancel();

    try {
      const response = await getAssistantResponse([...messages, userMessage]);
      setMessages((p) => [...p, response]);
      if (speakEnabled && response.content) speak(response.content);
    } catch (e) {
      console.error(e);
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "Sorry, I hit a snag while answering. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- Core brain ------------------------- */
  const getAssistantResponse = async (
    conversation: Message[]
  ): Promise<Message> => {
    const last = conversation[conversation.length - 1].content;
    const query = norm(last);
    const tokens = query.split(" ").filter(Boolean);

    // Meeting / schedule
    if (/(meeting|demo|schedule|book)/.test(query)) {
      return {
        role: "assistant",
        content:
          "I'd be happy to help you schedule a meeting. Use the button below to pick a slot.",
        actions: [
          {
            type: "openUrl",
            payload: {
              url:
                (import.meta as any).env?.VITE_CALENDLY_URL ||
                "https://calendly.com",
              label: "Schedule on Calendly",
            },
          },
        ],
      };
    }

    // Track order
    if (query.includes("track") && query.includes("order")) {
      return {
        role: "assistant",
        content:
          "To track your order, please share your order number & email, or open the tracker:",
        actions: [
          {
            type: "openUrl",
            payload: { url: "/track-order", label: "Track Order" },
          },
        ],
      };
    }

    // Contact
    if (/(contact|phone|call|email|address)/.test(query)) {
      return {
        role: "assistant",
        content:
          "You can reach us at:\n\n📞 0731-2430082-83 (Office)\n📱 94248-36079 (Mobile)\n📠 0731-2430084 (Fax)\n✉️ marketing@safetyplus.co.in / sales@safetyplus.co.in\n\nNeed anything else?",
        actions: [
          {
            type: "openUrl",
            payload: { url: "/contact", label: "Contact Us" },
          },
        ],
      };
    }

    // TEAM: "team", "member", role, person name
    if (
      /(team|members|founder|ceo|cto|director|operations|engineering|technical)/.test(
        query
      )
    ) {
      if (!teamRef.current) teamRef.current = await fetchTeamPublic();
      const team = teamRef.current || [];

      if (team.length === 0) {
        return {
          role: "assistant",
          content:
            "I couldn’t fetch the team list right now. You can view the team page below.",
          actions: [
            {
              type: "openUrl",
              payload: { url: "/team", label: "Open Team Page" },
            },
          ],
        };
      }

      // rank by fuzzy score across name/role/dept/bio
      const ranked = [...team]
        .map((t) => {
          const hay = [
            t.name,
            t.role,
            t.dept,
            textOnly(t.bioHtml),
            t.email,
            t.socials?.linkedin,
          ]
            .filter(Boolean)
            .join(" ");
          return {
            team: t,
            s: score(tokens, hay) + score(tokens, t.name) * 1.5,
          };
        })
        .sort((a, b) => b.s - a.s);

      const top = ranked
        .slice(0, Math.max(3, Math.min(5, team.length)))
        .map((r) => r.team);

      // If the query is generic "team", show all (up to 5)
      const generic = !tokens.some(
        (t) => t.length > 3 && t !== "team" && t !== "details"
      );
      const list = (generic ? team.slice(0, 5) : top).map((m) => {
        const lines = [
          `• **${m.name}** — ${m.role}${m.dept ? ` (${m.dept})` : ""}`,
          m.email ? `   • Email: ${m.email}` : "",
          m.phone ? `   • Phone: ${m.phone}` : "",
          m.socials?.linkedin ? `   • LinkedIn: ${m.socials.linkedin}` : "",
        ].filter(Boolean);
        return lines.join("\n");
      });

      return {
        role: "assistant",
        content:
          (generic
            ? "Here are our core team members:\n\n"
            : "Here’s what I found:\n\n") +
          list.join("\n") +
          (team.length > 5
            ? `\n\n…and ${team.length - 5} more on the team page.`
            : ""),
        actions: [
          {
            type: "openUrl",
            payload: { url: "/team", label: "Open Team Page" },
          },
        ],
      };
    }

    // PRODUCTS: "products", "show me …", keywords
    if (
      /(product|products|catalog|price|buy|helmet|mask|gloves|shoes|fire|ppe|safety|cabinet|extinguisher|respirator|harness|fall|ear|eye|goggles|shield)/.test(
        query
      ) ||
      query.startsWith("find ") ||
      query.startsWith("show ")
    ) {
      const q =
        query.replace(/^(find|show|products|product)\s*/g, "").trim() || // "find helmets"
        (tokens.length <= 2 ? "" : tokens.join(" ")); // broader
      const items =
        (await searchProductsLive(q, 8)) || lastProductsRef.current || [];

      if (!items.length) {
        return {
          role: "assistant",
          content:
            "I couldn’t find matching products right now. You can browse the full catalog:",
          actions: [
            {
              type: "openUrl",
              payload: { url: "/shop", label: "Browse Products" },
            },
          ],
        };
      }

      lastProductsRef.current = items;

      const lines = items.slice(0, 6).map((p) => {
        const cat =
          typeof p.categoryId === "string"
            ? ""
            : p.categoryId?.name
            ? ` • ${p.categoryId?.name}`
            : "";
        const price = p.priceSell
          ? ` — ₹${Number(p.priceSell).toLocaleString("en-IN")}`
          : "";
        return `• **${p.name}**${cat}${price}`;
      });

      return {
        role: "assistant",
        content:
          (q
            ? `Here are top results for “${q}”:\n\n`
            : "Here are some popular items:\n\n") +
          lines.join("\n") +
          `\n\nWant me to narrow it down by category, price or brand?`,
        actions: [
          { type: "openUrl", payload: { url: "/shop", label: "Open Catalog" } },
          // Deep-link first 3 items
          ...items.slice(0, 3).map((p) => ({
            type: "openUrl" as const,
            payload: { url: productLink(p), label: p.name },
          })),
        ],
      };
    }

    // Greetings / Help
    if (/(help|hi|hello|hey|how are you)/.test(query)) {
      return {
        role: "assistant",
        content:
          "Hello! I can help you with:\n• Finding safety products (e.g., “find helmets”)\n• Sharing team details (e.g., “team” or “CEO”)\n• Tracking orders\n• Scheduling a meeting\n• Contact info\n\nWhat would you like to do?",
      };
    }

    // Fallback
    return {
      role: "assistant",
      content:
        "I can help you find products, share team details, track orders, or schedule a meeting. Tell me what you need.",
    };
  };

  const quickActions = [
    { label: "Show team", query: "team details" },
    { label: "Popular products", query: "products" },
    { label: "Find safety helmets", query: "find helmets" },
    { label: "Schedule a meeting", query: "schedule meeting" },
    { label: "Contact us", query: "contact" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60] md:hidden"
        onClick={onClose}
      />
      <div
        id="assistant-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        className="fixed bottom-4 right-4 z-[60] w-[min(92vw,420px)] h-[clamp(520px,80dvh,720px)] md:w-[clamp(376px,28vw,460px)] md:h-[clamp(520px,72vh,760px)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden md:bottom-4 md:right-4"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 id="assistant-title" className="text-lg sm:text-2xl font-bold">
              SafetyPlus AI Assistant
            </h2>
            <p className="text-xs sm:text-sm opacity-90">SafetyPlus • Online</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {messages.length === 1 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              🔒 Your conversations are private and secure. We only use your
              input to assist you.
            </p>
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain [-webkit-overflow-scrolling:touch]"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, i) => (
                      <a
                        key={i}
                        href={action.payload.url}
                        target={
                          action.payload.url.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          action.payload.url.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="block w-full px-4 py-2 bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-center font-medium text-sm"
                      >
                        {action.payload.label || "Open Link"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 [@media(max-height:580px)]:hidden">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.query)}
                  className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-100 dark:hover:bg-green-900/30 transition whitespace-nowrap"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md space-y-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleRecording}
              disabled={loading}
              className={`p-3 rounded-xl transition ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={toggleSpeak}
              className={`p-3 rounded-xl transition ${
                speakEnabled
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              title={
                speakEnabled ? "Disable voice output" : "Enable voice output"
              }
            >
              {speakEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  144
                )}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message…"
              disabled={loading || isRecording}
              rows={1}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none resize-none max-h-36 overflow-y-auto"
            />

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            AI Assistant • Powered by SafetyPlus
          </p>
        </div>
      </div>
    </>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import {
  Users,
  Shield,
  BadgeCheck,
  Linkedin,
  Mail,
  Phone,
  X,
  Filter,
} from "lucide-react";

/** -------------------------------------------------------
 *  Configure where images are served from
 *  .env: VITE_FILES_BASE_URL=https://your-backend.com
 *  (fallbacks: VITE_API_URL, then http://localhost:5000)
 * ------------------------------------------------------*/
const FILES_BASE =
  (import.meta as any)?.env?.VITE_FILES_BASE_URL ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:5000";

/** Convert a stored file path into an absolute URL on the backend. */
function fileUrl(path?: string | null): string | null {
  if (!path) return null;
  // Clean weird cases like "/undefined/team/..."
  const cleaned = path.replace("/undefined/", "/team/");

  // Already absolute?
  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  // Ensure leading slash
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;

  // Typical stored value is "/uploads/team/xxx.jpg"
  // If the stored value missed the "/uploads" prefix, add it.
  const ensured = withSlash.startsWith("/uploads/")
    ? withSlash
    : `/uploads${withSlash}`;

  // Compose
  return `${FILES_BASE.replace(/\/$/, "")}${ensured}`;
}

/** ---------- Types ---------- */
type TeamMember = {
  _id: string;
  name: string;
  role: string;
  dept?: string;
  photoPath?: string;
  email?: string;
  phone?: string;
  socials?: { linkedin?: string };
  bioHtml?: string;
  priority?: number;
  isActive?: boolean;
};

/** ---------- Data Fetch ---------- */
async function fetchTeam(): Promise<TeamMember[]> {
  const res = await fetch(`${FILES_BASE.replace(/\/$/, "")}/api/team`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load team");
  return res.json();
}

/** Minimal sanitizer for admin-entered HTML (no external deps) */
function sanitizeBasic(html?: string) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

/** Tiny helpers */
const badge =
  "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium ring-1 ring-emerald-200";

/** ---------- Card ---------- */
function TeamCard({
  m,
  onOpen,
}: {
  m: TeamMember;
  onOpen: (tm: TeamMember) => void;
}) {
  const img = fileUrl(m.photoPath);

  return (
    <article
      className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 shadow-sm overflow-hidden hover:shadow-lg transition-all"
      role="button"
      onClick={() => onOpen(m)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(m)}
      aria-label={`${m.name}, ${m.role}${m.dept ? " — " + m.dept : ""}`}
    >
      {/* glow ring on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-emerald-300/40" />
      </div>

      {/* photo */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {img ? (
          <img
            src={img}
            alt={m.name}
            crossOrigin="anonymous"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400">
            <Users className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {m.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{m.role}</p>
          </div>
          {m.dept && (
            <span className="text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {m.dept}
            </span>
          )}
        </div>

        {m.socials?.linkedin && (
          <a
            href={m.socials.linkedin}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}

/** ---------- Dialog ---------- */
function TeamDialog({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
}) {
  if (!open || !member) return null;
  const img = fileUrl(member.photoPath);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile: ${member.name}`}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-[320px,1fr] gap-0">
          <div className="bg-gray-50 dark:bg-gray-800">
            <div className="aspect-[4/5] overflow-hidden">
              {img ? (
                <img
                  src={img}
                  alt={member.name}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-gray-400">
                  <Users className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {member.name}
              </h2>
              <span className={badge}>
                <BadgeCheck className="w-3.5 h-3.5" />
                Core Team
              </span>
              {member.dept && (
                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {member.dept}
                </span>
              )}
            </div>

            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-4">
              {member.role}
            </p>

            {/* contacts */}
            <div className="flex flex-wrap gap-3 mb-5">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-700"
                >
                  <Mail className="w-4 h-4" />
                  {member.email}
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </a>
              )}
              {member.socials?.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-700"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>

            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeBasic(member.bioHtml),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Page ---------- */
export function TeamPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["team-public"],
    queryFn: fetchTeam,
    staleTime: 5 * 60 * 1000,
  });

  const [dept, setDept] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [open, setOpen] = useState(false);

  const members = useMemo(() => {
    const src = (data || [])
      .slice()
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    const filtered =
      dept === "All"
        ? src
        : src.filter(
            (m) => (m.dept || "").toLowerCase() === dept.toLowerCase()
          );
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.dept || "").toLowerCase().includes(q)
    );
  }, [data, dept, search]);

  const depts = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((m) => m.dept && set.add(m.dept));
    return ["All", ...Array.from(set).sort()];
  }, [data]);

  const openDialog = (m: TeamMember) => {
    setSelected(m);
    setOpen(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700 text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className={badge.replace(
                "bg-emerald-50 text-emerald-700",
                "bg-white/15 text-white ring-white/30"
              )}
            >
              <Shield className="w-3.5 h-3.5" /> SafetyPlus Core Team
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            Our Team. <span className="opacity-90">Your Advantage.</span>
          </h1>
          <p className="text-white/90 max-w-3xl">
            Specialists in PPE, fire safety engineering, compliance, and
            nationwide fulfillment. Meet the people who make reliable safety
            possible.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Years Expertise", value: "30+" },
              { label: "Happy Customers", value: "12.5k+" },
              { label: "SKU Coverage", value: "3k+" },
              { label: "Customer Care", value: "24/7" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 text-center ring-1 ring-white/20"
              >
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm opacity-90">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Users className="w-4 h-4" />
              {isLoading
                ? "Loading…"
                : `${members.length} member${members.length === 1 ? "" : "s"}`}
            </span>
            {isError && (
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dept Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="pl-9 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {depts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, role, dept…"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm w-64"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-[300px] rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-10 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load team members
              </h3>
              <p className="text-sm mb-4">
                There was an error loading the team information.
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-600 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              No team members found
            </h3>
            <p className="text-sm">
              {search || dept !== "All"
                ? "Try adjusting your search or filter criteria."
                : "No team members are currently available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((m) => (
              <TeamCard key={m._id} m={m} onOpen={openDialog} />
            ))}
          </div>
        )}
      </section>

      <TeamDialog
        open={open}
        onClose={() => setOpen(false)}
        member={selected}
      />
    </Layout>
  );
}

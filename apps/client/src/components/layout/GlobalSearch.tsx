"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Users,
  MessageSquare,
  Megaphone,
  FileText,
  UserCog,
  ArrowRight,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContactResult {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  status: string;
}

interface MessageResult {
  id: string;
  content: string;
  direction: string;
  createdAt: string;
  conversation: {
    id: string;
    contact: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      name: string | null;
      phone: string;
    };
  };
}

interface CampaignResult {
  id: string;
  name: string;
  status: string;
  sent: number;
  delivered: number;
  scheduledAt: string | null;
  createdAt: string;
}

interface TemplateResult {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  createdAt: string;
}

interface UserResult {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface SearchResults {
  contacts: ContactResult[];
  messages: MessageResult[];
  campaigns: CampaignResult[];
  templates: TemplateResult[];
  users: UserResult[];
}

interface SearchGroup {
  key: keyof SearchResults;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: any[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function contactDisplayName(c: { firstName?: string | null; lastName?: string | null; name?: string | null }) {
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(" ");
  return c.name || "Unknown";
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-400",
  SCHEDULED: "bg-blue-500/15 text-blue-400",
  RUNNING: "bg-amber-500/15 text-amber-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
  PAUSED: "bg-orange-500/15 text-orange-400",
  APPROVED: "bg-emerald-500/15 text-emerald-400",
  SUBMITTED: "bg-blue-500/15 text-blue-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ──────────── Keyboard shortcut (Ctrl+K / Cmd+K) ────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ──────────── Focus input when opening ────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults(null);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // ──────────── Debounced search ────────────
  const doSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get("/search", { params: { q: term } });
      setResults(res.data);
      setActiveIndex(0);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doSearch]);

  // ──────────── Build flat list of navigable items ────────────
  const groups: SearchGroup[] = results
    ? [
        { key: "contacts" as keyof SearchResults, label: "Contacts", icon: <Users className="h-4 w-4" />, color: "text-blue-400", items: results.contacts },
        { key: "messages" as keyof SearchResults, label: "Messages", icon: <MessageSquare className="h-4 w-4" />, color: "text-violet-400", items: results.messages },
        { key: "campaigns" as keyof SearchResults, label: "Campaigns", icon: <Megaphone className="h-4 w-4" />, color: "text-amber-400", items: results.campaigns },
        { key: "templates" as keyof SearchResults, label: "Templates", icon: <FileText className="h-4 w-4" />, color: "text-emerald-400", items: results.templates },
        { key: "users" as keyof SearchResults, label: "Users", icon: <UserCog className="h-4 w-4" />, color: "text-pink-400", items: results.users },
      ].filter((g) => g.items.length > 0)
    : [];

  const flatItems = groups.flatMap((g) => g.items.map((item) => ({ group: g.key, item })));
  const totalResults = flatItems.length;

  // ──────────── Navigate to result ────────────
  const navigateTo = useCallback(
    (group: keyof SearchResults, item: any) => {
      setIsOpen(false);
      switch (group) {
        case "contacts":
          router.push(`/contacts`);
          break;
        case "messages":
          router.push(`/inbox`);
          break;
        case "campaigns":
          router.push(`/campaigns`);
          break;
        case "templates":
          router.push(`/templates`);
          break;
        case "users":
          router.push(`/team`);
          break;
      }
    },
    [router],
  );

  // ──────────── Keyboard navigation within results ────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
      } else if (e.key === "Enter" && flatItems[activeIndex]) {
        e.preventDefault();
        navigateTo(flatItems[activeIndex].group, flatItems[activeIndex].item);
      }
    },
    [activeIndex, flatItems, totalResults, navigateTo],
  );

  // ──────────── Scroll active item into view ────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ──────────── Render helpers ────────────
  let flatIdx = -1;

  function renderContact(c: ContactResult) {
    return (
      <div className="flex items-center gap-3">
        {c.avatarUrl ? (
          <Image src={c.avatarUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center text-xs font-bold text-blue-400">
            {contactDisplayName(c).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{contactDisplayName(c)}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
        </div>
      </div>
    );
  }

  function renderMessage(m: MessageResult) {
    const contactName = contactDisplayName(m.conversation.contact);
    return (
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{contactName}</p>
          <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap">
            {new Date(m.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
          {m.direction === "OUTBOUND" ? "You: " : ""}{m.content}
        </p>
      </div>
    );
  }

  function renderCampaign(c: CampaignResult) {
    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{c.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {c.sent} sent · {c.delivered} delivered
          </p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] || "bg-zinc-500/15 text-zinc-400"}`}>
          {c.status}
        </span>
      </div>
    );
  }

  function renderTemplate(t: TemplateResult) {
    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{t.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {t.category} · {t.language}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[t.status] || "bg-zinc-500/15 text-zinc-400"}`}>
          {t.status}
        </span>
      </div>
    );
  }

  function renderUser(u: UserResult) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-pink-500/15 flex items-center justify-center text-xs font-bold text-pink-400">
          {(u.name || u.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{u.name || "Unnamed"}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{u.email} · {u.role.replace("_", " ").toLowerCase()}</p>
        </div>
      </div>
    );
  }

  const renderItem = (group: keyof SearchResults, item: any) => {
    switch (group) {
      case "contacts": return renderContact(item);
      case "messages": return renderMessage(item);
      case "campaigns": return renderCampaign(item);
      case "templates": return renderTemplate(item);
      case "users": return renderUser(item);
    }
  };

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      {/* ───── Trigger: looks like the original search input ───── */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-[var(--accent)] px-3 py-1.5 rounded-full border border-[var(--border)] max-w-md w-full transition-all hover:border-[var(--primary)]/40 hover:shadow-sm group cursor-text"
      >
        <Search className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
        <span className="text-sm text-[var(--muted-foreground)] flex-1 text-left">Search contacts, messages…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* ───── Overlay ───── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Command palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                <Search className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search contacts, messages, campaigns…"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex rounded-md border border-[var(--border)] bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[60vh] overflow-y-auto overscroll-contain scroll-smooth">
                {/* Loading */}
                {isLoading && (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-[var(--accent)]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-32 rounded bg-[var(--accent)]" />
                          <div className="h-2.5 w-48 rounded bg-[var(--accent)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No query yet */}
                {!isLoading && !results && query.length < 2 && (
                  <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Start typing to search</p>
                    <p className="text-xs mt-1 opacity-60">Search across contacts, messages, campaigns & more</p>
                  </div>
                )}

                {/* No results */}
                {!isLoading && results && totalResults === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">No results found</p>
                    <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                  </div>
                )}

                {/* Grouped results */}
                {!isLoading && groups.length > 0 && (
                  <div className="py-2">
                    {groups.map((group, gi) => (
                      <Fragment key={group.key}>
                        {gi > 0 && <div className="mx-4 my-1 border-t border-[var(--border)]" />}
                        <div className={`flex items-center gap-2 px-4 pt-3 pb-1.5 ${group.color}`}>
                          {group.icon}
                          <span className="text-xs font-semibold uppercase tracking-wider">{group.label}</span>
                          <span className="ml-auto text-[10px] text-[var(--muted-foreground)] font-medium">{group.items.length} found</span>
                        </div>
                        {group.items.map((item: any) => {
                          flatIdx++;
                          const idx = flatIdx;
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={item.id}
                              data-index={idx}
                              onClick={() => navigateTo(group.key, item)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group/item ${
                                isActive
                                  ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                                  : "text-[var(--foreground)] hover:bg-[var(--accent)]/60"
                              }`}
                            >
                              <div className="flex-1 min-w-0">{renderItem(group.key, item)}</div>
                              <ArrowRight
                                className={`h-3.5 w-3.5 shrink-0 transition-all ${
                                  isActive ? "opacity-100 translate-x-0 text-[var(--primary)]" : "opacity-0 -translate-x-1"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </Fragment>
                    ))}
                    {/* flatIdx is used for assigning unique indices, reset for next render */}
                  </div>
                )}
              </div>

              {/* Footer */}
              {results && totalResults > 0 && (
                <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> to select</span>
                    <span className="flex items-center gap-1">↑↓ to navigate</span>
                    <span className="flex items-center gap-1">esc to close</span>
                  </div>
                  <span className="font-medium">{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

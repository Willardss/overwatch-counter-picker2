
import React, { useEffect, useMemo, useState } from "react";
import {
  Lock,
  LogOut,
  Save,
  Trash2,
  Search,
  Trophy,
  Shield,
  Swords,
  Heart,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Overwatch Counter Picker — runnable MVP
 * - Single hero counter
 * - Team analysis (up to 5)
 * - Match tracker + stats + SR trend
 * - Local “account” system (browser-only)
 *
 * IMPORTANT:
 * This project ships with a simplified hero roster + a rules-based counter engine.
 * You can expand HEROES + HERO_TAGS for higher fidelity.
 */

type Role = "Tank" | "Damage" | "Support";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type MatchOutcome = "Win" | "Loss" | "Draw";

type Hero = {
  id: string;
  name: string;
  role: Role;
  difficulty: Difficulty;
};

type MatchRecord = {
  id: string;
  dateISO: string;
  role: Role;
  heroPlayedId: string;
  map: string;
  outcome: MatchOutcome;
  isCompetitive: boolean;
  srChange: number;
  enemyTeamIds: string[];
  notes: string;
};

type Account = {
  id: string;
  email: string;
  passwordHash: string;
  createdISO: string;
};

type Session = {
  accountId: string;
  email: string;
};

const MAPS = [
  "Antarctic Peninsula",
  "Ilios",
  "King's Row",
  "Lijiang Tower",
  "Route 66",
  "Rialto",
  "Colosseo",
  "Eichenwalde",
];

const HEROES: Hero[] = [
  { id: "dva", name: "D.Va", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "doomfist", name: "Doomfist", role: "Tank" as Role, difficulty: "Advanced" as Difficulty },
  { id: "hazard", name: "Hazard", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "junkerqueen", name: "Junker Queen", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "mauga", name: "Mauga", role: "Tank" as Role, difficulty: "Beginner" as Difficulty },
  { id: "orisa", name: "Orisa", role: "Tank" as Role, difficulty: "Beginner" as Difficulty },
  { id: "ramattra", name: "Ramattra", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "reinhardt", name: "Reinhardt", role: "Tank" as Role, difficulty: "Beginner" as Difficulty },
  { id: "roadhog", name: "Roadhog", role: "Tank" as Role, difficulty: "Beginner" as Difficulty },
  { id: "sigma", name: "Sigma", role: "Tank" as Role, difficulty: "Advanced" as Difficulty },
  { id: "winston", name: "Winston", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "wreckingball", name: "Wrecking Ball", role: "Tank" as Role, difficulty: "Advanced" as Difficulty },
  { id: "zarya", name: "Zarya", role: "Tank" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "ashe", name: "Ashe", role: "Damage" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "bastion", name: "Bastion", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "cassidy", name: "Cassidy", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "echo", name: "Echo", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "freja", name: "Freja", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "genji", name: "Genji", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "hanzo", name: "Hanzo", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "junkrat", name: "Junkrat", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "mei", name: "Mei", role: "Damage" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "pharah", name: "Pharah", role: "Damage" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "reaper", name: "Reaper", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "sojourn", name: "Sojourn", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "soldier76", name: "Soldier: 76", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "sombra", name: "Sombra", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "symmetra", name: "Symmetra", role: "Damage" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "torbjorn", name: "Torbjörn", role: "Damage" as Role, difficulty: "Beginner" as Difficulty },
  { id: "tracer", name: "Tracer", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "venture", name: "Venture", role: "Damage" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "widowmaker", name: "Widowmaker", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "vendetta", name: "Vendetta", role: "Damage" as Role, difficulty: "Advanced" as Difficulty },
  { id: "ana", name: "Ana", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "baptiste", name: "Baptiste", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "brigitte", name: "Brigitte", role: "Support" as Role, difficulty: "Beginner" as Difficulty },
  { id: "illari", name: "Illari", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "juno", name: "Juno", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "kiriko", name: "Kiriko", role: "Support" as Role, difficulty: "Advanced" as Difficulty },
  { id: "lifeweaver", name: "Lifeweaver", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "lucio", name: "Lúcio", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
  { id: "mercy", name: "Mercy", role: "Support" as Role, difficulty: "Beginner" as Difficulty },
  { id: "moira", name: "Moira", role: "Support" as Role, difficulty: "Beginner" as Difficulty },
  { id: "wuyang", name: "Wuyang", role: "Support" as Role, difficulty: "Advanced" as Difficulty },
  { id: "zenyatta", name: "Zenyatta", role: "Support" as Role, difficulty: "Intermediate" as Difficulty },
];

// Tag pack for rule-based counters (expand per hero for better accuracy)
const HERO_TAGS: Record<string, string[]> = {
  dva: ["Dive", "Mobile", "Large", "Peel"],
  doomfist: ["Dive", "Disrupt", "Mobile", "CC", "Large"],
  hazard: ["Dive", "Disrupt", "Mobile", "Large"],
  junkerqueen: ["Brawl", "Sustain", "Large", "CC"],
  mauga: ["Brawl", "Sustain", "Large", "Tank-Buster"],
  orisa: ["Anchor", "Sustain", "Large", "CC"],
  ramattra: ["Brawl", "Poke", "Sustain", "Large", "CC"],
  reinhardt: ["Brawl", "Anchor", "Large", "CC"],
  roadhog: ["Pick", "Sustain", "Large", "CC"],
  sigma: ["Poke", "Anchor", "Large", "CC"],
  winston: ["Dive", "Disrupt", "Mobile", "Large"],
  wreckingball: ["Dive", "Disrupt", "Mobile", "Large", "CC"],
  zarya: ["Beam", "Anchor", "Large", "Sustain"],
  ashe: ["Hitscan", "Poke", "Off-Angle", "Burst"],
  bastion: ["Hitscan", "Tank-Buster", "Burst", "Large"],
  cassidy: ["Hitscan", "Peel", "CC", "Burst"],
  echo: ["Aerial", "Projectile", "Burst", "Dive"],
  freja: ["Projectile", "Burst", "Mobile", "Off-Angle"],
  genji: ["Flank", "Dive", "Projectile", "Mobile"],
  hanzo: ["Projectile", "Sniper", "Pick"],
  junkrat: ["Projectile", "Spam", "CC", "Burst"],
  mei: ["Brawl", "CC", "Sustain"],
  pharah: ["Aerial", "Projectile", "Spam"],
  reaper: ["Brawl", "Tank-Buster", "Burst"],
  sojourn: ["Hitscan", "Burst", "Mobile", "Off-Angle"],
  soldier76: ["Hitscan", "Poke", "Sustain"],
  sombra: ["Flank", "Dive", "Hitscan", "Utility", "CC"],
  symmetra: ["Beam", "Brawl", "Utility", "Spam"],
  torbjorn: ["Projectile", "Brawl", "Sustain", "Spam"],
  tracer: ["Flank", "Dive", "Mobile"],
  venture: ["Brawl", "Dive", "Mobile", "CC"],
  widowmaker: ["Sniper", "Hitscan", "Pick", "Off-Angle"],
  vendetta: ["Projectile", "Burst", "Flank", "Mobile"],
  ana: ["Anti-Heal", "Utility", "No Mobility", "CC"],
  baptiste: ["Hitscan", "Utility", "Burst", "Sustain"],
  brigitte: ["Peel", "CC", "Anti-Dive", "Brawl"],
  illari: ["Hitscan", "Poke", "Burst"],
  juno: ["Utility", "Mobile", "Sustain"],
  kiriko: ["Cleanse", "Mobile", "Utility", "Burst"],
  lifeweaver: ["Utility", "No Mobility", "Sustain"],
  lucio: ["Mobile", "Utility", "Peel", "CC"],
  mercy: ["Pocket", "Mobile", "Sustain"],
  moira: ["Sustain", "Mobile", "Brawl"],
  wuyang: ["Utility", "Mobile", "Burst", "Cleanse"],
  zenyatta: ["Pick", "No Mobility", "Utility", "Burst"],
};

// --- Counter engine (patch-agnostic fundamentals)
type Matchup = { counterId: string; rating: number; reasons: string[] };

const clamp = (n: number, min = 1, max = 5) => Math.max(min, Math.min(max, n));

const RULES: Array<{
  when: (enemy: string[], counter: string[]) => boolean;
  delta: number;
  reason: string;
}> = [
  { when: (e, c) => e.includes("Aerial") && c.includes("Hitscan"), delta: 2, reason: "Hitscan pressure limits aerial uptime." },
  { when: (e, c) => e.includes("Sniper") && (c.includes("Dive") || c.includes("Flank")), delta: 2, reason: "Dive/flank pressure forces snipers off angles." },
  { when: (e, c) => (e.includes("Flank") || e.includes("Dive")) && (c.includes("Peel") || c.includes("Anti-Dive")), delta: 2, reason: "Peel tools deny backline value." },
  { when: (e, c) => e.includes("Sustain") && c.includes("Anti-Heal"), delta: 2, reason: "Anti-heal breaks sustain windows." },
  { when: (e, c) => e.includes("Large") && (c.includes("Tank-Buster") || c.includes("Burst")), delta: 1, reason: "Burst/tank-buster pressure punishes large hitboxes." },
  { when: (e, c) => e.includes("No Mobility") && (c.includes("Dive") || c.includes("Flank")), delta: 2, reason: "Immobile targets are vulnerable to coordinated pressure." },
  { when: (e, c) => e.includes("Anti-Heal") && c.includes("Cleanse"), delta: 1, reason: "Cleanse reduces anti/CC impact windows." },
];

const OVERRIDES: Record<string, Record<string, { rating: number; reasons: string[] }>> = {
  roadhog: {
    ana: { rating: 5, reasons: ["Anti-heal deletes sustain; Sleep punishes hook/commit windows."] },
  },
  pharah: {
    soldier76: { rating: 4, reasons: ["Consistent hitscan pressure forces safer flight/landings."] },
    widowmaker: { rating: 4, reasons: ["Punishes predictable aerial lanes when sightlines are controlled."] },
  },
  widowmaker: {
    winston: { rating: 4, reasons: ["Dive contests high ground; bubble denies sightlines."] },
    tracer: { rating: 4, reasons: ["Forces reposition and punishes grapple windows."] },
  },
  winston: {
    brigitte: { rating: 4, reasons: ["Anti-dive peel denies backline value."] },
    reaper: { rating: 4, reasons: ["High close-range damage punishes dives when positioned well."] },
  },
};

function computeMatchup(enemyId: string, counterId: string): Matchup {
  const e = HERO_TAGS[enemyId] ?? [];
  const c = HERO_TAGS[counterId] ?? [];

  const o = OVERRIDES[enemyId]?.[counterId];
  if (o) return { counterId, rating: o.rating, reasons: o.reasons };

  let rating = 3;
  const reasons: string[] = [];

  for (const r of RULES) {
    if (r.when(e, c)) {
      rating += r.delta;
      reasons.push(r.reason);
    }
  }

  const counterHero = HEROES.find((h) => h.id === counterId);
  if (counterHero?.difficulty === "Advanced") rating -= 0.5;

  rating = clamp(Math.round(rating));
  if (!reasons.length) reasons.push("Playable matchup—depends on map, angles, and team comp.");
  return { counterId, rating, reasons: reasons.slice(0, 4) };
}

function getRoleHeroIds(role: Role): string[] {
  return HEROES.filter((h) => h.role === role).map((h) => h.id);
}

function getCountersForEnemy(enemyId: string, myRole: Role, limit = 8): Matchup[] {
  const candidates = getRoleHeroIds(myRole);
  return candidates
    .map((cid) => computeMatchup(enemyId, cid))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

function getCountersForTeam(enemyIds: string[], myRole: Role, limit = 8) {
  const candidates = getRoleHeroIds(myRole);
  const dedupEnemies = Array.from(new Set(enemyIds.filter(Boolean))).slice(0, 5);

  const results = candidates.map((counterId) => {
    const perEnemy = dedupEnemies.map((eid) => ({ enemyId: eid, ...computeMatchup(eid, counterId) }));
    const avg = perEnemy.reduce((s, m) => s + m.rating, 0) / Math.max(1, perEnemy.length);
    return { counterId, avgRating: Math.round(avg * 10) / 10, perEnemy };
  });

  return results.sort((a, b) => b.avgRating - a.avgRating).slice(0, limit);
}

// --- storage
const LS_KEYS = {
  accounts: "owcp_accounts_v1",
  session: "owcp_session_v1",
  matchesPrefix: "owcp_matches_",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveJSON(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}
function matchesKey(accountId: string) {
  return `${LS_KEYS.matchesPrefix}${accountId}_v1`;
}
async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function roleIcon(role: Role) {
  if (role === "Tank") return <Shield className="h-4 w-4" />;
  if (role === "Damage") return <Swords className="h-4 w-4" />;
  return <Heart className="h-4 w-4" />;
}

function pillClass(d: Difficulty) {
  if (d === "Beginner") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
  if (d === "Intermediate") return "bg-amber-500/20 text-amber-200 border-amber-500/30";
  return "bg-rose-500/20 text-rose-200 border-rose-500/30";
}

function stars(r: number) {
  const full = clamp(Math.round(r), 1, 5);
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "" : "opacity-30"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// --- UI helpers
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-zinc-900/40 ${className}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 pb-2">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-semibold">{children}</div>;
}
function CardDesc({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-zinc-300">{children}</div>;
}
function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 pt-2 ${className}`}>{children}</div>;
}
function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-white text-zinc-950 hover:bg-zinc-200"
      : variant === "outline"
      ? "border border-white/15 hover:bg-white/5"
      : variant === "danger"
      ? "bg-rose-600 hover:bg-rose-500"
      : "hover:bg-white/5";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      disabled={disabled}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-white/25"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-white/25"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-950">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-zinc-200">{children}</div>;
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-xl border px-2 py-0.5 text-xs ${className}`}>{children}</span>;
}

function Tabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 p-2">
      {[
        ["single", "Single Counter"],
        ["team", "Team Analysis"],
        ["tracker", "Game Tracker"],
        ["stats", "Stats"],
      ].map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`rounded-2xl px-3 py-2 text-xs sm:text-sm transition ${
            value === k ? "bg-white text-zinc-950" : "hover:bg-white/5"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function HeroSelect({
  value,
  onChange,
  roleFilter,
  placeholder,
  allowEmpty,
}: {
  value: string;
  onChange: (v: string) => void;
  roleFilter?: Role;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  const list = useMemo(() => {
    const heroes = roleFilter ? HEROES.filter((h) => h.role === roleFilter) : HEROES;
    return [...heroes].sort((a, b) => a.name.localeCompare(b.name));
  }, [roleFilter]);

  const opts = [
    ...(allowEmpty ? [{ value: "", label: placeholder ?? "—" }] : []),
    ...list.map((h) => ({ value: h.id, label: `${h.name} (${h.role})` })),
  ];
  return <Select value={value} onChange={onChange} options={opts} />;
}

export default function App() {
  // Session
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  // Auth
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const appLocked = !session;

  // Global filters
  const [preferredRole, setPreferredRole] = useState<Role>("Damage");
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [search, setSearch] = useState("");

  // Tabs
  const [tab, setTab] = useState("single");

  // Single counter
  const [singleEnemyId, setSingleEnemyId] = useState("reinhardt");

  // Team analysis
  const [teamEnemyIds, setTeamEnemyIds] = useState<string[]>(["reinhardt", "ana"]);

  // Tracker
  const [trackRole, setTrackRole] = useState<Role>("Damage");
  const [heroPlayedId, setHeroPlayedId] = useState("soldier76");
  const [mapName, setMapName] = useState(MAPS[0]);
  const [outcome, setOutcome] = useState<MatchOutcome>("Win");
  const [isCompetitive, setIsCompetitive] = useState(true);
  const [srChange, setSrChange] = useState(18);
  const [enemyTeamInput, setEnemyTeamInput] = useState<string[]>(["reinhardt", "ana"]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setAccounts(loadJSON<Account[]>(LS_KEYS.accounts, []));
    setSession(loadJSON<Session | null>(LS_KEYS.session, null));
  }, []);

  useEffect(() => {
    if (!session) {
      setMatches([]);
      return;
    }
    setMatches(loadJSON<MatchRecord[]>(matchesKey(session.accountId), []));
  }, [session?.accountId]);

  function saveMatches(next: MatchRecord[]) {
    if (!session) return;
    setMatches(next);
    saveJSON(matchesKey(session.accountId), next);
  }

  async function handleAuth() {
    setAuthError(null);
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword) return setAuthError("Enter email + password.");

    const hash = await sha256(`${email}::${authPassword}`);

    if (authMode === "signup") {
      if (accounts.some((a) => a.email === email)) return setAuthError("Account already exists.");
      const acct: Account = { id: uid("acct"), email, passwordHash: hash, createdISO: new Date().toISOString() };
      const next = [acct, ...accounts];
      setAccounts(next);
      saveJSON(LS_KEYS.accounts, next);
      const sess: Session = { accountId: acct.id, email: acct.email };
      setSession(sess);
      saveJSON(LS_KEYS.session, sess);
      setAuthEmail(""); setAuthPassword("");
      return;
    }

    const acct = accounts.find((a) => a.email === email);
    if (!acct) return setAuthError("No account found for that email.");
    if (acct.passwordHash !== hash) return setAuthError("Incorrect password.");

    const sess: Session = { accountId: acct.id, email: acct.email };
    setSession(sess);
    saveJSON(LS_KEYS.session, sess);
    setAuthEmail(""); setAuthPassword("");
  }

  function logout() {
    setSession(null);
    saveJSON(LS_KEYS.session, null);
  }

  // Recommendations
  const singleRecs = useMemo(() => {
    const recs = getCountersForEnemy(singleEnemyId, preferredRole, 8);
    const filtered = beginnerOnly ? recs.filter((r) => HEROES.find((h) => h.id === r.counterId)?.difficulty === "Beginner") : recs;
    return filtered;
  }, [singleEnemyId, preferredRole, beginnerOnly]);

  const teamRecs = useMemo(() => {
    const recs = getCountersForTeam(teamEnemyIds, preferredRole, 8);
    const filtered = beginnerOnly ? recs.filter((r) => HEROES.find((h) => h.id === r.counterId)?.difficulty === "Beginner") : recs;
    return filtered;
  }, [teamEnemyIds, preferredRole, beginnerOnly]);

  const filteredHeroLibrary = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = HEROES.filter((h) => {
      if (beginnerOnly && h.difficulty !== "Beginner") return false;
      if (!q) return true;
      return h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
    }).sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, beginnerOnly]);

  // Stats
  const summary = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter((m) => m.outcome === "Win").length;
    const losses = matches.filter((m) => m.outcome === "Loss").length;
    const draws = matches.filter((m) => m.outcome === "Draw").length;
    const winRate = total ? (wins / total) * 100 : 0;

    const comp = matches.filter((m) => m.isCompetitive);
    const srTrend = comp
      .slice()
      .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
      .reduce<{ date: string; cumulative: number }[]>((acc, m) => {
        const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
        acc.push({ date: formatDate(m.dateISO), cumulative: prev + (m.srChange || 0) });
        return acc;
      }, []);

    return { total, wins, losses, draws, winRate, srTrend };
  }, [matches]);

  function addMatch() {
    if (!session) return;
    const rec: MatchRecord = {
      id: uid("match"),
      dateISO: new Date().toISOString(),
      role: trackRole,
      heroPlayedId,
      map: mapName,
      outcome,
      isCompetitive,
      srChange: isCompetitive ? srChange : 0,
      enemyTeamIds: enemyTeamInput.slice(0, 5).filter(Boolean),
      notes: notes.trim(),
    };
    saveMatches([rec, ...matches]);
    setNotes("");
  }

  function deleteMatch(id: string) {
    saveMatches(matches.filter((m) => m.id !== id));
  }

  // --- render helpers
  const enemyHero = HEROES.find((h) => h.id === singleEnemyId);
  const teamEnemyHeroes = teamEnemyIds.map((id) => HEROES.find((h) => h.id === id)).filter(Boolean) as Hero[];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">Overwatch Counter Picker</div>
              <div className="text-sm text-zinc-300">Counters, team analysis, and match tracking.</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-zinc-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search heroes…"
                className="w-[220px] bg-transparent text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2">
              <span className="text-xs text-zinc-300">Role</span>
              <Select
                value={preferredRole}
                onChange={(v) => setPreferredRole(v as Role)}
                options={[
                  { value: "Tank", label: "Tank" },
                  { value: "Damage", label: "Damage" },
                  { value: "Support", label: "Support" },
                ]}
              />
            </div>

            <Btn variant={beginnerOnly ? "primary" : "outline"} onClick={() => setBeginnerOnly((p) => !p)}>
              Beginner {beginnerOnly ? "ON" : "OFF"}
            </Btn>

            {session ? (
              <>
                <Badge className="border-white/10 bg-white/5 text-zinc-200">{session.email}</Badge>
                <Btn variant="outline" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Log out
                </Btn>
              </>
            ) : (
              <Btn variant="primary" onClick={() => setTab("auth")}>
                <Lock className="h-4 w-4" /> Sign in
              </Btn>
            )}
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 space-y-4">
            {tab !== "auth" ? <Tabs value={tab} onChange={setTab} /> : null}

            {tab === "auth" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDesc>Local-only demo accounts (stored in your browser). For real auth, add Supabase/Firebase.</CardDesc>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex gap-2">
                    <Btn variant={authMode === "login" ? "primary" : "outline"} onClick={() => setAuthMode("login")}>Log in</Btn>
                    <Btn variant={authMode === "signup" ? "primary" : "outline"} onClick={() => setAuthMode("signup")}>Sign up</Btn>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input value={authEmail} onChange={setAuthEmail} placeholder="you@email.com" />
                    </div>
                    <div className="space-y-1">
                      <Label>Password</Label>
                      <Input type="password" value={authPassword} onChange={setAuthPassword} placeholder="••••••••" />
                    </div>
                  </div>
                  {authError ? <div className="text-sm text-rose-300">{authError}</div> : null}
                  <Btn onClick={handleAuth}><Lock className="h-4 w-4" /> {authMode === "login" ? "Log in" : "Create account"}</Btn>
                </CardBody>
              </Card>
            )}

            {tab === "single" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Single Hero Counter</CardTitle>
                    <CardDesc>Select an enemy hero, choose your role, and get counter recommendations.</CardDesc>
                  </CardHeader>
                  <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Enemy hero</Label>
                      <HeroSelect value={singleEnemyId} onChange={setSingleEnemyId} />
                    </div>
                    <div className="space-y-1">
                      <Label>Preferred role</Label>
                      <Select
                        value={preferredRole}
                        onChange={(v) => setPreferredRole(v as Role)}
                        options={[
                          { value: "Tank", label: "Tank" },
                          { value: "Damage", label: "Damage" },
                          { value: "Support", label: "Support" },
                        ]}
                      />
                    </div>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{enemyHero?.name ?? "Enemy"}</CardTitle>
                      <CardDesc>Role: {enemyHero?.role ?? "—"} • Difficulty: {enemyHero?.difficulty ?? "—"}</CardDesc>
                    </CardHeader>
                    <CardBody className="space-y-2 text-sm text-zinc-300">
                      <div className="flex flex-wrap gap-2">
                        {(HERO_TAGS[singleEnemyId] ?? []).map((t) => (
                          <Badge key={t} className="border-white/10 bg-white/5">{t}</Badge>
                        ))}
                      </div>
                      <div className="text-zinc-400 text-xs">
                        Tip: Expand tags for better matchup quality.
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended counters</CardTitle>
                      <CardDesc>Ratings are patch-agnostic fundamentals (1–5).</CardDesc>
                    </CardHeader>
                    <CardBody className="space-y-3">
                      {singleRecs.map((m) => {
                        const h = HEROES.find((x) => x.id === m.counterId);
                        if (!h) return null;
                        return (
                          <div key={m.counterId} className="rounded-2xl border border-white/10 p-3 bg-zinc-950/30">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{h.name}</span>
                                <Badge className={`border ${pillClass(h.difficulty)}`}>{h.difficulty}</Badge>
                                <Badge className="border-white/10 bg-white/5">{roleIcon(h.role)} {h.role}</Badge>
                              </div>
                              <div className="text-sm">{stars(m.rating)}</div>
                            </div>
                            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300 space-y-1">
                              {m.reasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        );
                      })}
                      {!singleRecs.length ? <div className="text-sm text-zinc-400">No recs found.</div> : null}
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {tab === "team" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle><span className="inline-flex items-center gap-2"><Users className="h-5 w-5" /> Team Counter Analysis</span></CardTitle>
                    <CardDesc>Select up to 5 enemy heroes. Get best counters for your role + matchup breakdown.</CardDesc>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <HeroSelect
                          key={idx}
                          value={teamEnemyIds[idx] ?? ""}
                          allowEmpty
                          placeholder={`Enemy slot ${idx + 1}`}
                          onChange={(id) => {
                            const next = [...teamEnemyIds];
                            next[idx] = id;
                            const dedup = next.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
                            setTeamEnemyIds(dedup);
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {teamEnemyHeroes.map((h) => (
                        <Badge key={h.id} className="border-white/10 bg-white/5">{h.name}</Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best counters</CardTitle>
                    <CardDesc>Average rating across selected enemies.</CardDesc>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {teamRecs.map((r) => {
                      const h = HEROES.find((x) => x.id === r.counterId);
                      if (!h) return null;
                      return (
                        <div key={r.counterId} className="rounded-2xl border border-white/10 p-3 bg-zinc-950/30">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{h.name}</span>
                              <Badge className={`border ${pillClass(h.difficulty)}`}>{h.difficulty}</Badge>
                              <Badge className="border-white/10 bg-white/5">{roleIcon(h.role)} {h.role}</Badge>
                            </div>
                            <div className="text-sm">Avg: {r.avgRating} {stars(r.avgRating)}</div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {r.perEnemy.map((m: any) => {
                              const e = HEROES.find((x) => x.id === m.enemyId);
                              return (
                                <div key={m.enemyId} className="rounded-xl border border-white/10 bg-white/5 p-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">{e?.name ?? m.enemyId}</div>
                                    <div className="text-xs">{stars(m.rating)}</div>
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-300">{m.reasons[0]}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {!teamRecs.length ? <div className="text-sm text-zinc-400">Add enemies to begin.</div> : null}
                  </CardBody>
                </Card>
              </div>
            )}

            {tab === "tracker" && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Tracker</CardTitle>
                  <CardDesc>
                    Log matches (hero/map/outcome/SR). {appLocked ? <span className="text-rose-300">Sign in to save.</span> : null}
                  </CardDesc>
                </CardHeader>
                <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Role</Label>
                        <Select
                          value={trackRole}
                          onChange={(v) => setTrackRole(v as Role)}
                          options={[
                            { value: "Tank", label: "Tank" },
                            { value: "Damage", label: "Damage" },
                            { value: "Support", label: "Support" },
                          ]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Hero played</Label>
                        <HeroSelect value={heroPlayedId} onChange={setHeroPlayedId} roleFilter={trackRole} />
                      </div>
                      <div className="space-y-1">
                        <Label>Map</Label>
                        <Select value={mapName} onChange={setMapName} options={MAPS.map((m) => ({ value: m, label: m }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Outcome</Label>
                        <Select
                          value={outcome}
                          onChange={(v) => setOutcome(v as MatchOutcome)}
                          options={[
                            { value: "Win", label: "Win" },
                            { value: "Loss", label: "Loss" },
                            { value: "Draw", label: "Draw" },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Competitive</div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={isCompetitive} onChange={(e) => setIsCompetitive(e.target.checked)} />
                          comp match
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>SR change</Label>
                          <Input
                            type="number"
                            value={String(srChange)}
                            disabled={!isCompetitive}
                            onChange={(v) => setSrChange(parseInt(v || "0", 10))}
                          />
                          <div className="text-xs text-zinc-400">Use negative numbers for SR loss.</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Enemy team (up to 5)</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <HeroSelect
                                key={idx}
                                value={enemyTeamInput[idx] ?? ""}
                                allowEmpty
                                placeholder={`Enemy slot ${idx + 1}`}
                                onChange={(id) => {
                                  const next = [...enemyTeamInput];
                                  next[idx] = id;
                                  const dedup = next.filter(Boolean).filter((x, i, a) => a.indexOf(x) === i);
                                  setEnemyTeamInput(dedup);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Notes</Label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What worked? What didn’t? Ults to track?"
                        className="w-full min-h-[110px] rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-white/25"
                      />
                    </div>

                    <Btn onClick={addMatch} disabled={appLocked} className="w-full">
                      <Save className="h-4 w-4" /> Save match
                    </Btn>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-zinc-300">{matches.length ? `${matches.length} matches saved` : "No matches yet."}</div>
                    <div className="space-y-2">
                      {matches.slice(0, 8).map((m) => {
                        const hero = HEROES.find((h) => h.id === m.heroPlayedId);
                        return (
                          <div key={m.id} className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="border-white/10 bg-white/5">{roleIcon(m.role)} {m.role}</Badge>
                                  <span className="font-semibold">{hero?.name ?? m.heroPlayedId}</span>
                                  <Badge className="border-white/10 bg-white/5">{m.outcome}</Badge>
                                </div>
                                <div className="text-xs text-zinc-400">
                                  {formatDate(m.dateISO)} • {m.map} • {m.isCompetitive ? `SR ${m.srChange >= 0 ? "+" : ""}${m.srChange}` : "Quick Play"}
                                </div>
                                {m.enemyTeamIds.length ? (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {m.enemyTeamIds.map((eid) => (
                                      <Badge key={eid} className="border-white/10 bg-white/5">{HEROES.find((h) => h.id === eid)?.name ?? eid}</Badge>
                                    ))}
                                  </div>
                                ) : null}
                                {m.notes ? <div className="text-sm text-zinc-300 mt-2">{m.notes}</div> : null}
                              </div>
                              <Btn variant="ghost" onClick={() => deleteMatch(m.id)} disabled={appLocked}>
                                <Trash2 className="h-4 w-4" />
                              </Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {tab === "stats" && (
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                  <CardDesc>Win rate + SR trend from your saved matches.</CardDesc>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                      <div className="text-xs text-zinc-400">Matches</div>
                      <div className="text-xl font-semibold">{summary.total}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                      <div className="text-xs text-zinc-400">Win rate</div>
                      <div className="text-xl font-semibold">{summary.winRate.toFixed(1)}%</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                      <div className="text-xs text-zinc-400">W / L / D</div>
                      <div className="text-xl font-semibold">{summary.wins} / {summary.losses} / {summary.draws}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                      <div className="text-xs text-zinc-400">Saved</div>
                      <div className="text-xl font-semibold">{appLocked ? "No" : "Yes"}</div>
                    </div>
                  </div>

                  <Card className="border-white/10 bg-zinc-950/30">
                    <CardHeader>
                      <CardTitle>SR Trend</CardTitle>
                      <CardDesc>Cumulative SR delta (competitive matches only).</CardDesc>
                    </CardHeader>
                    <CardBody className="h-[280px]">
                      {summary.srTrend.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={summary.srTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cumulative" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-zinc-400">Log competitive matches to see a trend line.</div>
                      )}
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Library</CardTitle>
                <CardDesc>Click to set Single enemy or toggle in Team.</CardDesc>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="max-h-[560px] overflow-auto pr-1 space-y-2">
                  {filteredHeroLibrary.map((h) => {
                    const inTeam = teamEnemyIds.includes(h.id);
                    return (
                      <div key={h.id} className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">{h.name}</span>
                              <Badge className="border-white/10 bg-white/5">{roleIcon(h.role)} {h.role}</Badge>
                              <Badge className={`border ${pillClass(h.difficulty)}`}>{h.difficulty}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {(HERO_TAGS[h.id] ?? []).slice(0, 4).map((t) => (
                                <Badge key={t} className="border-white/10 bg-white/5">{t}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Btn variant={singleEnemyId === h.id ? "primary" : "outline"} onClick={() => setSingleEnemyId(h.id)}>Single</Btn>
                            <Btn
                              variant={inTeam ? "primary" : "outline"}
                              onClick={() => {
                                setTeamEnemyIds((prev) => {
                                  const has = prev.includes(h.id);
                                  if (has) return prev.filter((x) => x !== h.id);
                                  if (prev.length >= 5) return prev;
                                  return [...prev, h.id];
                                });
                              }}
                            >
                              Team
                            </Btn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-zinc-400">
                  Next step: expand HEROES + HERO_TAGS to the full roster for truly comprehensive counters.
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>

        <footer className="mt-8 text-xs text-zinc-500">
          Built as a patch-agnostic MVP. Add full roster + tags for best results.
        </footer>
      </div>
    </div>
  );
}

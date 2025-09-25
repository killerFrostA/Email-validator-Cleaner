// Sidebar.jsx
import React from "react";
import {
  LayoutDashboard, Inbox, Settings, HelpCircle, LogOut,
  Package, ShoppingCart, FileText, Users, Search, ChevronDown,
} from "lucide-react";

/**
 * Props:
 *  - active: current route key (e.g., "dashboard", "orders")
 *  - onNavigate: (key) => void
 */
export default function Sidebar({ active = "inbox", onNavigate = () => {} }) {
  const Item = ({ icon: Icon, label, k, badge, subtle=false }) => (
    <button
      onClick={() => onNavigate(k)}
      className={[
        "group w-full flex items-center gap-3 px-3 py-2 rounded-xl transition",
        active === k
          ? "bg-white text-slate-900 shadow-sm"
          : subtle
          ? "text-slate-600 hover:bg-white/40"
          : "text-slate-700 hover:bg-white/60",
      ].join(" ")}
    >
      <Icon size={18} className={active === k ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"} />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {typeof badge !== "undefined" && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200">
          {badge}
        </span>
      )}
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="space-y-2">
      <div className="px-3 text-[11px] uppercase tracking-wider text-slate-600/80">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  return (
    <aside
      className="
        h-screen w-[260px] shrink-0
        bg-[#dfeaf4]  /* soft bluish background */
        border-r border-slate-200/70
        px-3 py-4
        flex flex-col gap-4
      "
    >
      {/* Brand / user card */}
      <div className="bg-white/70 rounded-2xl px-3 py-3 flex items-center gap-3 shadow-sm">
        <div className="size-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-900">EMAIL CLEANER</div>
          <div className="text-[11px] text-slate-600">Made by Mouelhi Amal</div>
        </div>
      </div>

      {/* Search (like the inspo bar) */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search…"
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/70 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-auto space-y-5">
        <Section title="Dashboard">
          <Item icon={LayoutDashboard} label="Overview" k="dashboard" />
          <Item icon={Inbox} label="Inbox Scanner" k="inbox" />
        </Section>

        <Section title="Operations">
          <Item icon={ShoppingCart} label="Bulk Analyze" k="bulk" />
          <Item icon={Package} label="Exports" k="exports" badge="CSV" />
          <Item icon={FileText} label="Reports" k="reports" />
          <Item icon={Users} label="Contacts" k="contacts" />
        </Section>

        <Section title="Filters">
          <Item icon={FileText} label="Valid" k="valid" badge="✔" subtle />
          <Item icon={FileText} label="Invalid" k="invalid" badge="!" subtle />
          <Item icon={FileText} label="Risky / Unknown" k="risky" subtle />
        </Section>
      </div>

      {/* Footer actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/60 text-slate-800 hover:bg-white">
          <span className="flex items-center gap-2 text-sm font-medium"><Settings size={18}/> Settings</span>
          <ChevronDown size={16} className="text-slate-600" />
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-white/60">
          <HelpCircle size={18}/> <span className="text-sm">Help</span>
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-white/60">
          <LogOut size={18}/> <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

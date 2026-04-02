import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, BellOff, CheckCheck, Trash2, Award,
  Target, TrendingUp, ShoppingBag, AlertTriangle,
  Globe, Loader2, RefreshCw
} from "lucide-react";
import axios from "axios";

function authHdr() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
}

function notifMeta(type) {
  switch ((type || "").toLowerCase()) {
    case "badge":       return { icon: <Award size={16} />,         bg: "bg-yellow-100",  text: "text-yellow-600"  };
    case "goal":        return { icon: <Target size={16} />,        bg: "bg-blue-100",    text: "text-blue-600"    };
    case "leaderboard": return { icon: <TrendingUp size={16} />,    bg: "bg-purple-100",  text: "text-purple-600"  };
    case "alert":       return { icon: <AlertTriangle size={16} />, bg: "bg-red-100",     text: "text-red-500"     };
    case "purchase":    return { icon: <ShoppingBag size={16} />,   bg: "bg-emerald-100", text: "text-emerald-600" };
    case "community":   return { icon: <Globe size={16} />,         bg: "bg-teal-100",    text: "text-teal-600"    };
    default:            return { icon: <Bell size={16} />,          bg: "bg-slate-100",   text: "text-slate-500"   };
  }
}

function relTime(str) {
  if (!str) return "";
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const FILTERS = [
  { key: "all",         label: "All"         },
  { key: "unread",      label: "Unread"      },
  { key: "badge",       label: "Badges"      },
  { key: "goal",        label: "Goals"       },
  { key: "purchase",    label: "Purchases"   },
  { key: "alert",       label: "Alerts"      },
  { key: "general",     label: "General"     },
];

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("all");

  const fetchNotifs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get("http://localhost:8080/api/notifications", authHdr());
      setNotifs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed to load notifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id) => {
    try { await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, authHdr()); } catch {}
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    try { await axios.patch("http://localhost:8080/api/notifications/read-all", {}, authHdr()); } catch {}
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  };

  const del = async (id, e) => {
    e.stopPropagation();
    try { await axios.delete(`http://localhost:8080/api/notifications/${id}`, authHdr()); } catch {}
    setNotifs(p => p.filter(n => n.id !== id));
  };

  const unread = notifs.filter(n => !n.read).length;

  const displayed = notifs.filter(n => {
    if (filter === "all")    return true;
    if (filter === "unread") return !n.read;
    return (n.type || "general").toLowerCase() === filter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNotifs}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
            >
              <CheckCheck size={13} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          ⚠️ {error}
          <button onClick={fetchNotifs} className="ml-2 underline font-bold">Retry</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
        {FILTERS.map(f => {
          const cnt = f.key === "all"
            ? notifs.length
            : f.key === "unread"
            ? unread
            : notifs.filter(n => (n.type || "general").toLowerCase() === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === f.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-400 border border-gray-100 hover:text-gray-600"
              }`}
            >
              {f.label}
              {cnt > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none ${
                  filter === f.key ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"
                }`}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
          <BellOff className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold text-sm">
            {filter === "unread" ? "No unread notifications" : "No notifications here"}
          </p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="mt-2 text-emerald-600 text-xs font-bold hover:underline">
              View all →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {displayed.map((n, i) => {
            const meta = notifMeta(n.type);
            return (
              <div
                key={n.id ?? i}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors ${
                  !n.read ? "bg-emerald-50/40 hover:bg-emerald-50" : "hover:bg-gray-50/50"
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-bold leading-snug ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                      {n.title ?? "Notification"}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                  )}
                </div>

                {/* Time + delete */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                    {relTime(n.createdAt)}
                  </span>
                  <button
                    onClick={e => del(n.id, e)}
                    className="p-1 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

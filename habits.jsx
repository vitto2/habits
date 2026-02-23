import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ─── DATA DEFINITIONS ────────────────────────────────────────────────────────

const BAD_HABITS = [
  { id: "porn", label: "Pornografia", icon: "🚫" },
  { id: "ifood", label: "iFood", icon: "🍔" },
  { id: "masturbation", label: "Masturbação", icon: "⚠️" },
  { id: "social", label: "Redes Sociais", icon: "📱" },
];

const DIET_MEALS = [
  { id: "breakfast", label: "Café da manhã", icon: "🌅" },
  { id: "lunch", label: "Almoço", icon: "🍽️" },
  { id: "snack", label: "Lanche", icon: "🥪" },
  { id: "dinner", label: "Janta", icon: "🌙" },
];

const WATER_COUNT = 8;
const POMODORO_COUNT = 6;

const GOOD_HABITS = [
  { id: "gym", label: "Academia", icon: "🏋️" },
  { id: "diet", label: "Dieta", icon: "🥗", type: "diet" },
  { id: "water", label: "Água", icon: "💧", type: "water" },
  { id: "minoxidil", label: "Minoxidil", icon: "💊" },
  { id: "creatine", label: "Creatina+Ω3", icon: "🧴" },
  { id: "study", label: "Estudo 3h", icon: "📚", type: "study" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
    m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return { main: `${d}d ${h}h`, sub: `${m}m ${sec}s`, days: d };
  if (h > 0) return { main: `${h}h ${m}m`, sub: `${sec}s`, days: 0 };
  return { main: `${m}m ${sec}s`, sub: "recém começando", days: 0 };
}

function getStreakColor(days) {
  if (days >= 30) return "#22c55e"; if (days >= 14) return "#86efac";
  if (days >= 7) return "#fbbf24"; if (days >= 3) return "#fb923c";
  return "#f87171";
}

const todayKey = () => new Date().toISOString().split("T")[0];

function scoreFromChecks(checks) {
  const completed = GOOD_HABITS.filter(h => checks[h.id]).length;
  return Math.round((completed / GOOD_HABITS.length) * 100);
}

function getGrade(avg) {
  if (avg >= 95) return { label: "S", color: "#a78bfa", glow: "rgba(167,139,250,0.4)" };
  if (avg >= 80) return { label: "A", color: "#22c55e", glow: "rgba(34,197,94,0.4)" };
  if (avg >= 65) return { label: "B", color: "#fbbf24", glow: "rgba(251,191,36,0.4)" };
  if (avg >= 45) return { label: "C", color: "#fb923c", glow: "rgba(251,146,60,0.4)" };
  return { label: "D", color: "#f87171", glow: "rgba(248,113,113,0.4)" };
}

function subDays(dateStr, n) {
  const d = new Date(dateStr); d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function heatColor(score) {
  if (score === null) return "rgba(255,255,255,0.04)";
  if (score === 0) return "rgba(255,255,255,0.06)";
  if (score < 40) return "rgba(248,113,113,0.25)";
  if (score < 65) return "rgba(251,191,36,0.3)";
  if (score < 85) return "rgba(34,197,94,0.3)";
  return "rgba(34,197,94,0.65)";
}

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

function ExpandableCard({ habit, done, expanded, onToggleExpand, children, pips, subtitle }) {
  return (
    <div style={{
      background: done ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${done ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 16, marginBottom: 10, overflow: "hidden", transition: "all 0.2s",
    }}>
      <div onClick={onToggleExpand} style={{ padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: done ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
          border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, transition: "all 0.2s",
        }}>{done ? "✓" : habit.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: done ? "#4ade80" : "#e2e8f0" }}>{habit.label}</div>
          <div style={{ fontSize: 11, color: done ? "#22c55e" : "#475569", marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>{pips}</div>
        <div style={{ fontSize: 12, color: "#475569", marginLeft: 4, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MiniProgress({ value, max, label, color = "#6366f1" }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${(value / max) * 100}%`,
          background: value === max ? "linear-gradient(90deg,#22c55e,#4ade80)" : `linear-gradient(90deg,${color},${color}99)`,
          transition: "width 0.3s ease",
        }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 10, color: "#475569", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color = "#6366f1", glow }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "16px 14px", flex: 1,
    }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 800, letterSpacing: -1, color,
        textShadow: glow ? `0 0 20px ${glow}` : "none",
      }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const grade = getGrade(score);
  return (
    <div style={{
      background: "#13131a", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{ color: grade.color, fontWeight: 700, fontSize: 16 }}>{score}%</div>
      <div style={{ color: "#475569", marginTop: 2 }}>Nota {grade.label}</div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("bad");
  const [relapses, setRelapses] = useState({});
  const [goodProgress, setGoodProgress] = useState({});
  const [history, setHistory] = useState({});
  const [now, setNow] = useState(Date.now());
  const [confirmReset, setConfirmReset] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [histRange, setHistRange] = useState("week"); // week | month | year

  // ── Load ──
  useEffect(() => {
    const load = async () => {
      try { const r = await window.storage.get("relapses"); if (r) setRelapses(JSON.parse(r.value)); } catch (_) {}
      try { const g = await window.storage.get("goodProgress"); if (g) setGoodProgress(JSON.parse(g.value)); } catch (_) {}
      try { const h = await window.storage.get("history"); if (h) setHistory(JSON.parse(h.value)); } catch (_) {}
      setLoaded(true);
    };
    load();
  }, []);

  // ── Tick ──
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Daily reset + save yesterday to history ──
  useEffect(() => {
    if (!loaded) return;
    const today = todayKey();
    if (goodProgress.date && goodProgress.date !== today) {
      // Save yesterday's final score to history before resetting
      const yScore = scoreFromChecks(goodProgress.checks || {});
      const yHabits = {};
      GOOD_HABITS.forEach(h => { yHabits[h.id] = !!(goodProgress.checks || {})[h.id]; });
      const newHistory = { ...history, [goodProgress.date]: { score: yScore, habits: yHabits } };
      setHistory(newHistory);
      window.storage.set("history", JSON.stringify(newHistory));
      // Reset today
      const reset = { date: today, checks: {} };
      setGoodProgress(reset);
      window.storage.set("goodProgress", JSON.stringify(reset));
    } else if (!goodProgress.date) {
      const init = { date: today, checks: {} };
      setGoodProgress(init);
      window.storage.set("goodProgress", JSON.stringify(init));
    }
  }, [loaded]);

  // ── Save progress + snapshot today in history ──
  const save = async (updated) => {
    setGoodProgress(updated);
    await window.storage.set("goodProgress", JSON.stringify(updated));
    // Also snapshot today
    const score = scoreFromChecks(updated.checks || {});
    const habits = {};
    GOOD_HABITS.forEach(h => { habits[h.id] = !!(updated.checks || {})[h.id]; });
    const today = todayKey();
    const newHistory = { ...history, [today]: { score, habits } };
    setHistory(newHistory);
    await window.storage.set("history", JSON.stringify(newHistory));
  };

  const toggleGood = (id) => {
    const checks = goodProgress.checks || {};
    save({ date: todayKey(), checks: { ...checks, [id]: !checks[id] } });
  };
  const togglePomodoro = (i) => {
    const checks = goodProgress.checks || {};
    const sessions = checks.study_sessions || Array(POMODORO_COUNT).fill(false);
    const updated = sessions.map((v, idx) => idx === i ? !v : v);
    save({ date: todayKey(), checks: { ...checks, study_sessions: updated, study: updated.every(Boolean) } });
  };
  const toggleMeal = (mealId) => {
    const checks = goodProgress.checks || {};
    const meals = checks.diet_meals || {};
    const updated = { ...meals, [mealId]: !meals[mealId] };
    save({ date: todayKey(), checks: { ...checks, diet_meals: updated, diet: DIET_MEALS.every(m => updated[m.id]) } });
  };
  const toggleWater = (i) => {
    const checks = goodProgress.checks || {};
    const glasses = checks.water_glasses || Array(WATER_COUNT).fill(false);
    const updated = glasses.map((v, idx) => idx === i ? !v : v);
    save({ date: todayKey(), checks: { ...checks, water_glasses: updated, water: updated.every(Boolean) } });
  };
  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const checks = goodProgress.checks || {};
  const completedCount = GOOD_HABITS.filter(h => checks[h.id]).length;
  const pomSessions = checks.study_sessions || Array(POMODORO_COUNT).fill(false);
  const pomDone = pomSessions.filter(Boolean).length;
  const dietMeals = checks.diet_meals || {};
  const mealsDone = DIET_MEALS.filter(m => dietMeals[m.id]).length;
  const waterGlasses = checks.water_glasses || Array(WATER_COUNT).fill(false);
  const waterDone = waterGlasses.filter(Boolean).length;

  // ── Analytics computations ──
  const analytics = useMemo(() => {
    const today = todayKey();
    const histEntries = Object.entries(history).sort(([a], [b]) => a > b ? 1 : -1);
    const scores = histEntries.map(([, v]) => v.score);
    const avgAll = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Streak
    let streak = 0, bestStreak = 0, tempStreak = 0;
    const sortedDays = histEntries.map(([k]) => k);
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const expectedDate = subDays(today, sortedDays.length - i);
      if (sortedDays[i] === expectedDate && history[sortedDays[i]].score >= 80) {
        streak++;
      } else break;
    }
    for (let i = 0; i < sortedDays.length; i++) {
      if (history[sortedDays[i]].score >= 80) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else tempStreak = 0;
    }
    const perfectDays = scores.filter(s => s === 100).length;
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      const entry = history[d];
      const dayName = new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" });
      return { day: dayName.replace(".", ""), score: entry ? entry.score : (d === today ? scoreFromChecks(checks) : 0), date: d };
    });
    const last30avg = (() => {
      const vals = Array.from({ length: 30 }, (_, i) => {
        const d = subDays(today, i);
        return d === today ? scoreFromChecks(checks) : (history[d]?.score ?? null);
      }).filter(v => v !== null);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    })();

    // Per-habit success rate (last 30 days)
    const habitStats = GOOD_HABITS.map(h => {
      let done = 0, total = 0;
      for (let i = 0; i < 30; i++) {
        const d = subDays(today, i);
        const entry = d === today
          ? { habits: Object.fromEntries(GOOD_HABITS.map(x => [x.id, !!checks[x.id]])) }
          : history[d];
        if (entry) { total++; if (entry.habits?.[h.id]) done++; }
      }
      return { id: h.id, label: h.label.replace(" 3h", "").replace("+Ω3", ""), icon: h.icon, rate: total ? Math.round((done / total) * 100) : 0 };
    });

    // Heatmap: last 12 weeks (84 days)
    const heatmap = Array.from({ length: 84 }, (_, i) => {
      const d = subDays(today, 83 - i);
      const s = d === today ? scoreFromChecks(checks) : (history[d]?.score ?? null);
      return { date: d, score: s };
    });

    return { avgAll, streak, bestStreak, perfectDays, last7, last30avg, habitStats, heatmap };
  }, [history, checks]);

  const todayScore = scoreFromChecks(checks);
  const todayGrade = getGrade(todayScore);
  const overallGrade = getGrade(analytics.avgAll);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0", maxWidth: 430, margin: "0 auto", position: "relative",
    }}>
      <div style={{
        position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto",
        background: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(34,197,94,0.06) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, padding: "28px 20px 0" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#6366f1", textTransform: "uppercase", marginBottom: 4 }}>MODO DISCIPLINA</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: -1, color: "#f8fafc", lineHeight: 1.1 }}>
          Tracker<br /><span style={{ color: "#6366f1" }}>Pessoal</span>
        </h1>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "8px 14px", fontSize: 13 }}>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>{completedCount}/{GOOD_HABITS.length}</span>
            <span style={{ color: "#64748b", marginLeft: 6 }}>hoje</span>
          </div>
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "8px 14px", fontSize: 13 }}>
            <span style={{ color: "#818cf8", fontWeight: 700 }}>🔥 {analytics.streak}d</span>
            <span style={{ color: "#64748b", marginLeft: 6 }}>streak</span>
          </div>
          <div style={{
            background: `rgba(${todayGrade.color === "#a78bfa" ? "167,139,250" : todayGrade.color === "#22c55e" ? "34,197,94" : "251,191,36"},0.1)`,
            border: `1px solid ${todayGrade.color}33`,
            borderRadius: 12, padding: "8px 14px", fontSize: 13,
          }}>
            <span style={{ color: todayGrade.color, fontWeight: 800 }}>{todayScore}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        position: "relative", zIndex: 1, margin: "20px 20px 0",
        background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4,
        display: "flex", gap: 2, border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { key: "bad", label: "🚫 Ruins" },
          { key: "good", label: "✅ Bons" },
          { key: "stats", label: "📊 Stats" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s",
            background: tab === t.key
              ? t.key === "bad" ? "rgba(239,68,68,0.15)" : t.key === "good" ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)"
              : "transparent",
            color: tab === t.key
              ? t.key === "bad" ? "#f87171" : t.key === "good" ? "#4ade80" : "#818cf8"
              : "#64748b",
            boxShadow: tab === t.key ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "16px 20px 120px" }}>

        {/* ════════ BAD HABITS ════════ */}
        {tab === "bad" && (
          <div>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 16, letterSpacing: 1 }}>TEMPO SEM RECAÍDA — toque para registrar falha</p>
            {BAD_HABITS.map(habit => {
              const ts = relapses[habit.id];
              const elapsed = ts ? formatElapsed(now - ts) : null;
              const color = elapsed ? getStreakColor(elapsed.days) : "#64748b";
              return (
                <div key={habit.id} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "18px 16px", marginBottom: 12, position: "relative", overflow: "hidden",
                }}>
                  {elapsed && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "16px 0 0 16px", background: color }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{habit.icon} {habit.label}</div>
                      {elapsed
                        ? <><div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: -0.5 }}>{elapsed.main}</div><div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{elapsed.sub}</div></>
                        : <div style={{ fontSize: 13, color: "#475569" }}>Marque o início agora</div>}
                    </div>
                    {!ts
                      ? <button onClick={async () => { const u = { ...relapses, [habit.id]: Date.now() }; setRelapses(u); await window.storage.set("relapses", JSON.stringify(u)); }} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", borderRadius: 10, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Iniciar</button>
                      : <button onClick={() => setConfirmReset(habit.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Recaí 😔</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════ GOOD HABITS ════════ */}
        {tab === "good" && (
          <div>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 16, letterSpacing: 1 }}>
              HOJE — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" }).toUpperCase()}
            </p>
            {GOOD_HABITS.map(habit => {
              const done = checks[habit.id] || false;

              if (habit.type === "diet") {
                return (
                  <ExpandableCard key={habit.id} habit={habit} done={done} expanded={expanded.diet} onToggleExpand={() => toggleExpand("diet")}
                    subtitle={mealsDone === 0 ? "Toque para ver refeições" : done ? "Todas refeições feitas ✓" : `${mealsDone}/${DIET_MEALS.length} refeições`}
                    pips={DIET_MEALS.map((m, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: dietMeals[m.id] ? "#f59e0b" : "rgba(255,255,255,0.1)" }} />)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {DIET_MEALS.map(meal => {
                        const mDone = dietMeals[meal.id] || false;
                        return (
                          <div key={meal.id} onClick={() => toggleMeal(meal.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 10, cursor: "pointer", background: mDone ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${mDone ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.05)"}`, transition: "all 0.15s" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: mDone ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)", border: `2px solid ${mDone ? "#f59e0b" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                              {mDone ? <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 800 }}>✓</span> : meal.icon}
                            </div>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: mDone ? "#fbbf24" : "#cbd5e1" }}>{meal.label}</span>
                            {mDone && <span style={{ fontSize: 11, color: "#f59e0b" }}>feito ✓</span>}
                          </div>
                        );
                      })}
                      <MiniProgress value={mealsDone} max={DIET_MEALS.length} label={`${mealsDone} / ${DIET_MEALS.length} refeições`} color="#f59e0b" />
                    </div>
                  </ExpandableCard>
                );
              }

              if (habit.type === "water") {
                return (
                  <ExpandableCard key={habit.id} habit={habit} done={done} expanded={expanded.water} onToggleExpand={() => toggleExpand("water")}
                    subtitle={waterDone === 0 ? "Meta: 4L (8× 500ml)" : done ? "4L atingidos hoje ✓" : `${(waterDone * 0.5).toFixed(1)}L / 4L`}
                    pips={waterGlasses.map((v, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: v ? "#38bdf8" : "rgba(255,255,255,0.1)" }} />)}>
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
                        {waterGlasses.map((v, i) => (
                          <div key={i} onClick={() => toggleWater(i)} style={{ borderRadius: 12, padding: "12px 6px", cursor: "pointer", textAlign: "center", background: v ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${v ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.15s" }}>
                            <div style={{ fontSize: 22 }}>{v ? "💧" : "🫙"}</div>
                            <div style={{ fontSize: 10, color: v ? "#38bdf8" : "#475569", marginTop: 4, fontWeight: 600 }}>500ml</div>
                            <div style={{ fontSize: 9, color: "#334155", marginTop: 1 }}>{(i + 1) * 500 >= 1000 ? `${((i + 1) * 0.5).toFixed(1)}L` : `${(i + 1) * 500}ml`}</div>
                          </div>
                        ))}
                      </div>
                      <MiniProgress value={waterDone} max={WATER_COUNT} label={`${(waterDone * 0.5).toFixed(1)}L / 4L`} color="#38bdf8" />
                      {waterDone > 0 && !done && <div style={{ textAlign: "center", fontSize: 11, color: "#38bdf8", marginTop: 8 }}>Faltam {((WATER_COUNT - waterDone) * 0.5).toFixed(1)}L 🎯</div>}
                      {done && <div style={{ textAlign: "center", fontSize: 12, color: "#22c55e", marginTop: 8, fontWeight: 600 }}>💧 Meta atingida!</div>}
                    </div>
                  </ExpandableCard>
                );
              }

              if (habit.type === "study") {
                return (
                  <ExpandableCard key={habit.id} habit={habit} done={done} expanded={expanded.study} onToggleExpand={() => toggleExpand("study")}
                    subtitle={pomDone === 0 ? "Toque para expandir sessões" : done ? "Concluído hoje ✓" : `${pomDone}/${POMODORO_COUNT} sessões — ${pomDone * 30}min`}
                    pips={pomSessions.map((v, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: v ? "#22c55e" : "rgba(255,255,255,0.1)" }} />)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {pomSessions.map((sDone, i) => (
                        <div key={i} onClick={() => togglePomodoro(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: sDone ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${sDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"}`, transition: "all 0.15s" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: sDone ? "#22c55e" : "rgba(255,255,255,0.05)", border: `2px solid ${sDone ? "#22c55e" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {sDone && <span style={{ fontSize: 11, color: "#0a0a0f", fontWeight: 800 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: sDone ? "#4ade80" : "#cbd5e1" }}>🍅 Sessão {i + 1}</span>
                            <span style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}>30 min</span>
                          </div>
                          <span style={{ fontSize: 11, color: sDone ? "#22c55e" : "#334155" }}>{(i + 1) * 30}min acum.</span>
                        </div>
                      ))}
                      <MiniProgress value={pomDone} max={POMODORO_COUNT} label={`${pomDone * 30} / 180 min`} color="#6366f1" />
                    </div>
                  </ExpandableCard>
                );
              }

              return (
                <div key={habit.id} onClick={() => toggleGood(habit.id)} style={{ background: done ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "16px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{done ? "✓" : habit.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: done ? "#4ade80" : "#e2e8f0" }}>{habit.label}</div>
                    <div style={{ fontSize: 11, color: done ? "#22c55e" : "#475569", marginTop: 2 }}>{done ? "Concluído hoje ✓" : "Toque para marcar"}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "#22c55e" : "rgba(255,255,255,0.05)", border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done && <span style={{ fontSize: 12, color: "#0a0a0f", fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
              );
            })}

            {/* Daily summary bar */}
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748b", letterSpacing: 1 }}>PROGRESSO DO DIA</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: completedCount === GOOD_HABITS.length ? "#22c55e" : "#e2e8f0" }}>{completedCount}/{GOOD_HABITS.length}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${(completedCount / GOOD_HABITS.length) * 100}%`, background: completedCount === GOOD_HABITS.length ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#6366f1,#818cf8)", transition: "width 0.4s ease" }} />
              </div>
              {completedCount === GOOD_HABITS.length && <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#4ade80", fontWeight: 600 }}>🔥 Dia perfeito! Orgulhe-se.</div>}
            </div>
          </div>
        )}

        {/* ════════ STATS ════════ */}
        {tab === "stats" && (
          <div>
            {/* Grade banner */}
            <div style={{
              background: `linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,0,0,0))`,
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "20px",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                background: `${overallGrade.color}18`,
                border: `2px solid ${overallGrade.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 900, color: overallGrade.color,
                boxShadow: `0 0 30px ${overallGrade.glow}`,
              }}>{overallGrade.label}</div>
              <div>
                <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 4 }}>DESEMPENHO GERAL</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                  <span style={{ color: overallGrade.color }}>{analytics.avgAll}%</span>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 400, marginLeft: 8 }}>média histórica</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {Object.keys(history).length} dias registrados
                </div>
              </div>
            </div>

            {/* Stat cards row 1 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <StatCard label="STREAK ATUAL" value={`${analytics.streak}d`} sub="dias seguidos ≥80%" color="#f59e0b" glow="rgba(251,191,36,0.3)" />
              <StatCard label="MELHOR STREAK" value={`${analytics.bestStreak}d`} sub="recorde pessoal" color="#818cf8" />
            </div>

            {/* Stat cards row 2 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <StatCard label="DIAS PERFEITOS" value={analytics.perfectDays} sub="100% completo" color="#22c55e" glow="rgba(34,197,94,0.3)" />
              <StatCard label="MÉDIA 30 DIAS" value={`${analytics.last30avg}%`} sub="último mês" color="#38bdf8" />
            </div>

            {/* Bar chart — last 7 days */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, marginBottom: 14 }}>ÚLTIMOS 7 DIAS</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={analytics.last7} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barCategoryGap="25%">
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10, fontFamily: "inherit" }} axisLine={false} tickLine={false} tickCount={3} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {analytics.last7.map((entry, i) => {
                      const g = getGrade(entry.score);
                      return <Cell key={i} fill={entry.score === 0 ? "rgba(255,255,255,0.06)" : g.color} opacity={entry.date === todayKey() ? 1 : 0.65} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1 }}>HEATMAP — 12 SEMANAS</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[null, 0, 40, 65, 85].map((s, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: heatColor(s === null ? null : s) }} />
                  ))}
                  <span style={{ fontSize: 9, color: "#334155", marginLeft: 2 }}>0→100%</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
                {Array.from({ length: 12 }, (_, week) => (
                  <div key={week} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {Array.from({ length: 7 }, (_, day) => {
                      const idx = week * 7 + day;
                      const cell = analytics.heatmap[idx];
                      const isToday = cell?.date === todayKey();
                      return (
                        <div key={day} style={{
                          width: "100%", aspectRatio: "1",
                          borderRadius: 3,
                          background: heatColor(cell?.score ?? null),
                          border: isToday ? "1px solid rgba(99,102,241,0.6)" : "none",
                          transition: "background 0.2s",
                        }} title={cell ? `${cell.date}: ${cell.score ?? "—"}%` : ""} />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "#334155" }}>
                <span>{analytics.heatmap[0]?.date?.slice(5) ?? ""}</span>
                <span>hoje</span>
              </div>
            </div>

            {/* Per-habit radar */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>CONSISTÊNCIA POR HÁBITO (30d)</div>
              <div style={{ fontSize: 10, color: "#334155", marginBottom: 12 }}>Taxa de conclusão nos últimos 30 dias</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={analytics.habitStats} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10, fontFamily: "inherit" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} dot={{ fill: "#818cf8", r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-habit bars */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, marginBottom: 14 }}>RANKING DE CONSISTÊNCIA</div>
              {[...analytics.habitStats].sort((a, b) => b.rate - a.rate).map((h, i) => {
                const g = getGrade(h.rate);
                return (
                  <div key={h.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>{h.icon} {h.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{h.rate}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${h.rate}%`, borderRadius: 99, background: g.color, opacity: 0.8, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Milestones */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px" }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, marginBottom: 14 }}>🏆 MARCOS ATINGIDOS</div>
              {[
                { label: "Primeira semana perfeita", done: analytics.bestStreak >= 7, icon: "🌟" },
                { label: "2 semanas seguidas", done: analytics.bestStreak >= 14, icon: "🔥" },
                { label: "1 mês seguido", done: analytics.bestStreak >= 30, icon: "💎" },
                { label: "10 dias perfeitos", done: analytics.perfectDays >= 10, icon: "⚡" },
                { label: "30 dias registrados", done: Object.keys(history).length >= 30, icon: "📅" },
                { label: "Média histórica ≥ 80%", done: analytics.avgAll >= 80, icon: "🎯" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ fontSize: 18 }}>{m.icon}</div>
                  <div style={{ flex: 1, fontSize: 13, color: m.done ? "#e2e8f0" : "#475569" }}>{m.label}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    background: m.done ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                    color: m.done ? "#4ade80" : "#334155",
                    border: `1px solid ${m.done ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`,
                  }}>{m.done ? "✓ feito" : "pendente"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmReset && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, maxWidth: 430, margin: "0 auto", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)" }} onClick={() => setConfirmReset(null)}>
          <div style={{ width: "100%", background: "#13131a", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>😔</div>
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Registrar recaída?</div>
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 }}>
              Isso vai zerar o contador de <span style={{ color: "#f87171" }}>{BAD_HABITS.find(h => h.id === confirmReset)?.label}</span>. Seja honesto consigo mesmo.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmReset(null)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancelar</button>
              <button onClick={async () => { const u = { ...relapses, [confirmReset]: Date.now() }; setRelapses(u); await window.storage.set("relapses", JSON.stringify(u)); setConfirmReset(null); }} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, border: "1px solid rgba(239,68,68,0.3)" }}>Sim, recaí</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
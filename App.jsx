import { useState, useEffect, useRef } from "react";

const FIXED_TASKS = [
  {
    id: "agua", icon: "💧", label: "Beber água", desc: "1 copo cheio, agora", xp: 30,
    aprendizado: "Hidratação melhora foco, humor e energia. Seu cérebro funciona melhor com água — isso é ciência.",
  },
  {
    id: "trocar", icon: "👕", label: "Trocar de roupa", desc: "Sai do modo escola", xp: 40,
    aprendizado: "Trocar de roupa é um ritual de transição. Você está treinando seu cérebro a separar 'modo escola' de 'modo casa'.",
  },
  {
    id: "esticar", icon: "🧘", label: "5 min parado", desc: "Senta, fecha os olhos", xp: 50,
    aprendizado: "Parar sem estímulo é uma habilidade rara. Você está praticando presença — algo que a maioria das pessoas perdeu.",
  },
];

const VARIABLE_TASKS = [
  {
    id: "v1", icon: "📖", label: "Ler 10 páginas", desc: "Qualquer livro que tiver",
    aprendizado: "Leitura constrói vocabulário, concentração e empatia. 10 páginas por dia = 12 livros por ano.",
  },
  {
    id: "v2", icon: "✏️", label: "Escrever 3 linhas", desc: "O que você pensou hoje",
    aprendizado: "Escrever organiza o pensamento. Você está desenvolvendo clareza mental e autoconhecimento.",
  },
  {
    id: "v3", icon: "🎸", label: "Tocar instrumento", desc: "Só 10 minutos",
    aprendizado: "Música treina coordenação, memória e disciplina ao mesmo tempo. 10 minutos todo dia supera 2h uma vez por semana.",
  },
  {
    id: "v4", icon: "🧹", label: "Arrumar um canto", desc: "Mesa, cama, o que tiver",
    aprendizado: "Ambiente organizado = mente organizada. Você está praticando controle do seu espaço e, por consequência, do seu estado mental.",
  },
  {
    id: "v5", icon: "📱", label: "Ligar pra alguém", desc: "Familiar ou amigo",
    aprendizado: "Conexão humana real é um dos fatores mais importantes pra saúde mental. Você está investindo nas relações que importam.",
  },
  {
    id: "v6", icon: "🎨", label: "Desenhar qualquer coisa", desc: "Sem julgamento",
    aprendizado: "Desenhar ativa o lado criativo do cérebro e treina observação. O resultado não importa — o processo sim.",
  },
  {
    id: "v7", icon: "🌿", label: "Cuidar de planta", desc: "Regar, limpar folha",
    aprendizado: "Cuidar de algo vivo desenvolve responsabilidade e atenção. É uma pausa contemplativa no meio do caos.",
  },
  {
    id: "v8", icon: "🍳", label: "Preparar um lanche", desc: "Com calma, sem pressa",
    aprendizado: "Cozinhar é uma habilidade de vida fundamental. Fazer seu próprio lanche é autonomia — e você está treinando isso.",
  },
];

const MOTIVACOES = [
  "Você não precisa de força de vontade infinita. Só precisa aparecer amanhã.",
  "O streak não é sobre perfeição. É sobre não desistir.",
  "Cada dia que você volta é uma prova de que você é diferente de quem era antes.",
  "A versão de você daqui a 30 dias vai agradecer por hoje.",
  "Consistência bate talento. Sempre. Continue aparecendo.",
  "Você já venceu o momento mais difícil: chegou em casa e não perdeu o controle.",
  "Hábitos não se constroem em dias épicos. Se constroem em dias normais como esse.",
];

function loadState() {
  try {
    const raw = localStorage.getItem("homemode_state");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem("homemode_state", JSON.stringify(state)); } catch {}
}

function getLevelInfo(xp) {
  const levels = [
    { level: 1, name: "Deitado", min: 0, max: 200 },
    { level: 2, name: "Acordando", min: 200, max: 500 },
    { level: 3, name: "De pé", min: 500, max: 1000 },
    { level: 4, name: "Em movimento", min: 1000, max: 2000 },
    { level: 5, name: "No ritmo", min: 2000, max: 3500 },
    { level: 6, name: "Constante", min: 3500, max: 6000 },
    { level: 7, name: "Imparável", min: 6000, max: 10000 },
  ];
  return levels.find((l) => xp >= l.min && xp < l.max) || levels[levels.length - 1];
}

function getRandomVariable() {
  return VARIABLE_TASKS[Math.floor(Math.random() * VARIABLE_TASKS.length)];
}

function getRandomMotivacao() {
  return MOTIVACOES[Math.floor(Math.random() * MOTIVACOES.length)];
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function scheduleNotification(timeStr) {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready.then((reg) => {
    if (reg.active) {
      reg.active.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        time: timeStr,
        label: "Você chegou em casa. Não perde o controle agora. 20 minutos. Bora. 🚀",
      });
    }
  });
}

async function requestNotificationPermission(timeStr) {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") {
    scheduleNotification(timeStr);
    return "granted";
  }
  const result = await Notification.requestPermission();
  if (result === "granted") scheduleNotification(timeStr);
  return result;
}

function Timer({ running, onComplete }) {
  const [seconds, setSeconds] = useState(20 * 60);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { clearInterval(ref.current); onComplete(); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  const pct = ((20 * 60 - seconds) / (20 * 60)) * 100;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: "3.5rem", fontWeight: 700,
        color: seconds < 300 ? "#ff4444" : "#e8ff5a", letterSpacing: "0.1em", lineHeight: 1,
      }}>{m}:{s}</div>
      <div style={{ marginTop: "12px", height: "4px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #e8ff5a, #7fff6e)",
          transition: "width 1s linear", borderRadius: "2px",
        }} />
      </div>
      <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "6px", fontFamily: "monospace" }}>
        {Math.round(pct)}% do bloco de 20 min
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [completed, setCompleted] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showXP, setShowXP] = useState(null);
  const [copied, setCopied] = useState(false);
  const [variableTask] = useState(getRandomVariable());
  const [motivacao] = useState(getRandomMotivacao());
  const [arrivalTime, setArrivalTime] = useState(() => localStorage.getItem("homemode_time") || "18:00");
  const [editingTime, setEditingTime] = useState(false);
  const [notifStatus, setNotifStatus] = useState(Notification?.permission || "unsupported");
  const [globalState, setGlobalState] = useState(() => loadState() || { xp: 0, streak: 0, lastDay: null });

  const allTasks = [...FIXED_TASKS, { ...variableTask, xp: 70, variable: true }];
  const completedTasks = allTasks.filter((t) => completed.includes(t.id));

  useEffect(() => {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap";
    document.head.appendChild(font);
  }, []);

  useEffect(() => {
    if (notifStatus === "granted") scheduleNotification(arrivalTime);
  }, []);

  function handleTimeChange(val) {
    setArrivalTime(val);
    localStorage.setItem("homemode_time", val);
    if (notifStatus === "granted") scheduleNotification(val);
  }

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission(arrivalTime);
    setNotifStatus(result);
  }

  function startMission() {
    const today = todayKey();
    let newState = { ...globalState };
    if (newState.lastDay !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split("T")[0];
      if (newState.lastDay !== yKey) newState.streak = 0;
    }
    setGlobalState(newState);
    setScreen("mission");
    setTimerRunning(true);
  }

  function completeTask(task) {
    if (completed.includes(task.id)) return;
    const newCompleted = [...completed, task.id];
    setCompleted(newCompleted);
    setShowXP({ id: task.id, amount: task.xp });
    setTimeout(() => setShowXP(null), 1500);
    const today = todayKey();
    const newState = {
      xp: globalState.xp + task.xp,
      streak: globalState.lastDay === today ? globalState.streak : globalState.streak + 1,
      lastDay: today,
    };
    setGlobalState(newState);
    saveState(newState);
  }

  function endMission() {
    setTimerRunning(false);
    setScreen("done");
  }

  function buildRelatorio() {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const lines = [
      `📋 RELATÓRIO HOMEMODE — ${hoje}`,
      `Streak atual: 🔥 ${globalState.streak} dias`,
      `Nível: ${getLevelInfo(globalState.xp).level} — ${getLevelInfo(globalState.xp).name}`,
      "",
      `✅ TAREFAS CONCLUÍDAS (${completedTasks.length}/${allTasks.length}):`,
      "",
    ];
    completedTasks.forEach((t) => {
      lines.push(`${t.icon} ${t.label}`);
      lines.push(`→ ${t.aprendizado}`);
      lines.push("");
    });
    if (completedTasks.length === 0) {
      lines.push("Nenhuma tarefa concluída hoje.");
      lines.push("");
    }
    lines.push(`💬 MOTIVAÇÃO DO DIA:`);
    lines.push(`"${motivacao}"`);
    return lines.join("\n");
  }

  function copiarRelatorio() {
    const texto = buildRelatorio();
    navigator.clipboard.writeText(texto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const levelInfo = getLevelInfo(globalState.xp);
  const xpInLevel = globalState.xp - levelInfo.min;
  const xpForLevel = levelInfo.max - levelInfo.min;
  const levelPct = Math.min(100, (xpInLevel / xpForLevel) * 100);

  const S = {
    app: {
      minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0",
      fontFamily: "'Space Mono', monospace", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "20px", position: "relative", overflow: "hidden",
    },
    card: {
      background: "#111", border: "1px solid #222", borderRadius: "16px",
      padding: "32px", maxWidth: "420px", width: "100%", position: "relative", zIndex: 1,
    },
    label: { fontSize: "0.65rem", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" },
    bigTitle: {
      fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem",
      letterSpacing: "0.05em", lineHeight: 1, color: "#e8ff5a", margin: "0 0 4px 0",
    },
    btn: {
      background: "#e8ff5a", color: "#0a0a0a", border: "none", borderRadius: "10px",
      padding: "16px 32px", fontSize: "1rem", fontWeight: 700,
      fontFamily: "'Space Mono', monospace", cursor: "pointer", width: "100%",
      letterSpacing: "0.05em",
    },
    btnGhost: {
      background: "transparent", color: "#e8ff5a", border: "1px solid #333",
      borderRadius: "10px", padding: "14px 20px", fontSize: "0.85rem", fontWeight: 700,
      fontFamily: "'Space Mono', monospace", cursor: "pointer", width: "100%",
      letterSpacing: "0.05em",
    },
    btnNotif: {
      background: "transparent", color: "#e8ff5a", border: "1px solid #e8ff5a",
      borderRadius: "10px", padding: "12px 20px", fontSize: "0.8rem", fontWeight: 700,
      fontFamily: "'Space Mono', monospace", cursor: "pointer", width: "100%",
      letterSpacing: "0.05em",
    },
    taskCard: (done) => ({
      background: done ? "#1a2a0a" : "#161616",
      border: `1px solid ${done ? "#4a7a1a" : "#2a2a2a"}`,
      borderRadius: "12px", padding: "16px",
      cursor: done ? "default" : "pointer", transition: "all 0.2s",
      position: "relative", overflow: "hidden",
    }),
  };

  return (
    <div style={S.app}>
      <style>{`
        @keyframes popUp {
          0%{opacity:0;transform:translateX(-50%) translateY(0)}
          20%{opacity:1;transform:translateX(-50%) translateY(-20px)}
          80%{opacity:1;transform:translateX(-50%) translateY(-30px)}
          100%{opacity:0;transform:translateX(-50%) translateY(-50px)}
        }
        .th:hover{border-color:#e8ff5a!important;background:#1e1e10!important}
      `}</style>

      {showXP && (
        <div style={{
          position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
          background: "#e8ff5a", color: "#0a0a0a", padding: "8px 20px",
          borderRadius: "999px", fontWeight: 700, fontSize: "1.2rem",
          fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em",
          zIndex: 999, animation: "popUp 1.5s ease forwards", pointerEvents: "none",
        }}>+{showXP.amount} XP</div>
      )}

      {screen === "home" && (
        <div style={S.card}>
          <div style={S.label}>modo missão</div>
          <h1 style={S.bigTitle}>HOME<br />MODE</h1>
          <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "28px", lineHeight: 1.6 }}>
            Você chegou. Não perde o controle agora.<br />20 minutos. Uma tarefa. Isso basta.
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, background: "#161616", borderRadius: "10px", padding: "12px", border: "1px solid #222" }}>
              <div style={S.label}>streak</div>
              <div style={{ fontSize: "1.8rem", fontFamily: "'Bebas Neue'", color: "#ff9f3f", marginTop: "2px" }}>🔥 {globalState.streak}</div>
            </div>
            <div style={{ flex: 1, background: "#161616", borderRadius: "10px", padding: "12px", border: "1px solid #222" }}>
              <div style={S.label}>nível</div>
              <div style={{ fontSize: "1.1rem", fontFamily: "'Bebas Neue'", color: "#e8ff5a", marginTop: "2px" }}>{levelInfo.level} — {levelInfo.name}</div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={S.label}>xp total: {globalState.xp}</span>
              <span style={S.label}>{xpInLevel}/{xpForLevel}</span>
            </div>
            <div style={{ height: "6px", background: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${levelPct}%`, background: "linear-gradient(90deg, #e8ff5a, #7fff6e)", borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px", background: "#161616", borderRadius: "10px", padding: "14px", border: "1px solid #222" }}>
            <div style={S.label}>horário de chegada em casa</div>
            {editingTime ? (
              <input type="time" value={arrivalTime} onChange={(e) => handleTimeChange(e.target.value)} onBlur={() => setEditingTime(false)} autoFocus
                style={{ background: "transparent", border: "none", color: "#e8ff5a", fontSize: "1.5rem", fontFamily: "'Space Mono', monospace", fontWeight: 700, outline: "none", width: "100%", marginTop: "4px" }} />
            ) : (
              <div onClick={() => setEditingTime(true)} style={{ fontSize: "1.5rem", fontFamily: "'Bebas Neue'", color: "#e8ff5a", cursor: "pointer", marginTop: "4px" }}>
                {arrivalTime} <span style={{ fontSize: "0.7rem", color: "#555" }}>✏️ editar</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            {notifStatus === "granted" ? (
              <div style={{ background: "#0a1f0a", border: "1px solid #2a5a2a", borderRadius: "10px", padding: "12px 14px", fontSize: "0.75rem", color: "#7fff6e", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔔</span><span>Notificação ativada para <strong>{arrivalTime}</strong> todo dia</span>
              </div>
            ) : notifStatus === "denied" ? (
              <div style={{ background: "#1f0a0a", border: "1px solid #5a2a2a", borderRadius: "10px", padding: "12px 14px", fontSize: "0.75rem", color: "#ff8888" }}>
                ⚠️ Notificações bloqueadas. Vai em Configurações do navegador e libera pra esse site.
              </div>
            ) : notifStatus === "unsupported" ? (
              <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px 14px", fontSize: "0.75rem", color: "#555" }}>
                📵 Instale como app no celular pra ativar notificações
              </div>
            ) : (
              <button style={S.btnNotif} onClick={handleEnableNotifications}>🔔 Ativar notificação diária</button>
            )}
          </div>

          <button style={S.btn} onClick={startMission}>INICIAR MISSÃO →</button>
        </div>
      )}

      {screen === "mission" && (
        <div style={S.card}>
          <div style={{ marginBottom: "28px" }}>
            <div style={S.label}>tempo do bloco</div>
            <div style={{ marginTop: "12px" }}><Timer running={timerRunning} onComplete={endMission} /></div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={S.label}>suas tarefas</div>
              <div style={{ fontSize: "0.7rem", color: "#555" }}>{completed.length}/{allTasks.length} feitas</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allTasks.map((task) => {
                const done = completed.includes(task.id);
                return (
                  <div key={task.id} style={S.taskCard(done)} className={done ? "" : "th"} onClick={() => !done && completeTask(task)}>
                    {task.variable && (
                      <div style={{ position: "absolute", top: "8px", right: "10px", fontSize: "0.55rem", color: "#e8ff5a", letterSpacing: "0.15em", background: "#1a1a00", padding: "2px 6px", borderRadius: "4px" }}>VARIÁVEL</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.6rem" }}>{task.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: done ? "#7fff6e" : "#e0e0e0", textDecoration: done ? "line-through" : "none" }}>{task.label}</div>
                        <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "2px" }}>{task.desc}</div>
                      </div>
                      <div style={{ fontSize: "0.8rem", fontFamily: "'Bebas Neue'", color: done ? "#7fff6e" : "#444", minWidth: "50px", textAlign: "right" }}>{done ? "✓ FEITO" : `+${task.xp}xp`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {completed.length >= 1 && (
            <button style={{ ...S.btn, marginTop: "20px" }} onClick={endMission}>ENCERRAR BLOCO ✓</button>
          )}
        </div>
      )}

      {screen === "done" && (
        <div style={S.card}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "8px" }}>
              {completedTasks.length === allTasks.length ? "🏆" : completedTasks.length >= 2 ? "💪" : completedTasks.length === 1 ? "✅" : "😴"}
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#e8ff5a", margin: "0 0 4px" }}>
              {completedTasks.length === 0 ? "Amanhã você tenta" : "Missão cumprida"}
            </h2>
            <p style={{ color: "#555", fontSize: "0.8rem" }}>
              {completedTasks.length === 0 ? "Não quebrou o automático hoje. Tudo bem. Volta amanhã." : `Você fez ${completedTasks.length} de ${allTasks.length} tarefas hoje.`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div style={{ flex: 1, background: "#161616", borderRadius: "10px", padding: "14px", border: "1px solid #222", textAlign: "center" }}>
              <div style={S.label}>xp ganho</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.8rem", color: "#e8ff5a" }}>+{completedTasks.reduce((acc, t) => acc + t.xp, 0)}</div>
            </div>
            <div style={{ flex: 1, background: "#161616", borderRadius: "10px", padding: "14px", border: "1px solid #222", textAlign: "center" }}>
              <div style={S.label}>streak</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.8rem", color: "#ff9f3f" }}>🔥 {globalState.streak}</div>
            </div>
          </div>

          <div style={{ background: "#0d1a0d", border: "1px solid #2a4a2a", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
            <div style={{ ...S.label, marginBottom: "6px" }}>motivação do dia</div>
            <p style={{ fontSize: "0.8rem", color: "#aaa", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>"{motivacao}"</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            {allTasks.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>
                <span style={{ fontSize: "0.9rem" }}>{task.icon}</span>
                <span style={{ flex: 1, fontSize: "0.8rem", color: completed.includes(task.id) ? "#7fff6e" : "#444", textDecoration: completed.includes(task.id) ? "none" : "line-through" }}>{task.label}</span>
                <span style={{ fontSize: "0.75rem", color: completed.includes(task.id) ? "#7fff6e" : "#333" }}>{completed.includes(task.id) ? "✓" : "—"}</span>
              </div>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <button style={{ ...S.btnGhost, marginBottom: "12px" }} onClick={copiarRelatorio}>
              {copied ? "✓ COPIADO!" : "📋 COPIAR RELATÓRIO"}
            </button>
          )}

          <button style={S.btn} onClick={() => { setScreen("home"); setCompleted([]); setTimerRunning(false); }}>
            VOLTAR AO INÍCIO
          </button>
        </div>
      )}
    </div>
  );
}

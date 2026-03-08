import { useEffect, useRef, useState, useCallback } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
:root{--c:#00b4ff;--p:#a855f7;--g:#00ff88;--bg:#0a0e27;--r:#ff003c}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Share Tech Mono',monospace;overflow-x:hidden;background:var(--bg);color:#fff;min-height:100vh;cursor:none}

/* cursor */
.cur-dot{position:fixed;width:8px;height:8px;background:var(--c);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);box-shadow:0 0 12px var(--c),0 0 24px var(--c)}
.cur-ring{position:fixed;width:30px;height:30px;border:1.5px solid rgba(0,180,255,.55);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%)}
.cur-trail{position:fixed;border-radius:50%;pointer-events:none;z-index:9997;transform:translate(-50%,-50%);animation:trailFade .55s ease forwards}
@keyframes trailFade{0%{opacity:.8;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0)}}

/* scanlines */
.scanlines{position:fixed;inset:0;z-index:3;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px);animation:scanScroll 10s linear infinite}
@keyframes scanScroll{to{background-position:0 100px}}

#matrix-canvas{position:fixed;inset:0;z-index:0;opacity:.07}
.hex-grid{position:fixed;inset:0;opacity:.04;z-index:1;background-image:linear-gradient(30deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(150deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(30deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(150deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c));background-size:80px 140px;background-position:0 0,0 0,40px 70px,40px 70px}

/* navbar */
.navbar{position:sticky;top:0;z-index:100;background:rgba(10,14,39,.95);border-bottom:2px solid var(--c);backdrop-filter:blur(10px);padding:15px 0;animation:slideDown .6s ease both}
@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
.nav-container{max-width:1400px;margin:0 auto;padding:0 30px;display:flex;justify-content:space-between;align-items:center}
.nav-logo{font-family:'Orbitron',monospace;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:6px;position:relative}
.nav-logo::after{content:'ACM';position:absolute;left:0;top:0;font-family:'Orbitron',monospace;font-size:1.8rem;font-weight:900;letter-spacing:6px;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:blur(6px);opacity:.5;animation:logoFlicker 6s infinite}
@keyframes logoFlicker{0%,93%,100%{opacity:0}94%,99%{opacity:.6}}
.nav-menu{display:flex;gap:30px;list-style:none}
.nav-item a{color:#7da3ff;text-decoration:none;font-size:.85rem;transition:all .3s;padding:8px 15px;border-radius:4px;display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace}
.nav-item a:hover,.nav-item a.active{color:var(--c);background:rgba(0,180,255,.1);text-shadow:0 0 10px var(--c)}
.nav-profile{display:flex;align-items:center;gap:12px;cursor:none;padding:8px 15px;border-radius:6px;transition:all .3s;border:1px solid transparent}
.nav-profile:hover{background:rgba(0,180,255,.1);border-color:var(--c);box-shadow:0 0 15px rgba(0,180,255,.2)}
.nav-avatar{width:35px;height:35px;border-radius:50%;border:2px solid var(--c);background:linear-gradient(135deg,var(--c),var(--p));display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:'Orbitron',monospace;font-size:.8rem;animation:avatarPulse 3s ease infinite}
@keyframes avatarPulse{0%,100%{box-shadow:0 0 8px var(--c)}50%{box-shadow:0 0 20px var(--c),0 0 40px rgba(0,180,255,.3)}}
.nav-username{font-size:.9rem;color:var(--c)}
.nav-status{font-size:.7rem;color:var(--g)}

/* container */
.container{position:relative;z-index:2;max-width:1400px;margin:0 auto;padding:30px;padding-bottom:80px}

/* welcome */
.welcome-banner{background:rgba(10,14,39,.9);border:2px solid transparent;background-image:linear-gradient(rgba(10,14,39,.9),rgba(10,14,39,.9)),linear-gradient(135deg,var(--c),var(--p),var(--g));background-origin:border-box;background-clip:padding-box,border-box;border-radius:12px;padding:30px;margin-bottom:30px;position:relative;overflow:hidden;animation:fadeUp .7s ease .2s both}
@keyframes fadeUp{from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)}}
.welcome-banner::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--c),var(--p),transparent);animation:scan 3s linear infinite}
@keyframes scan{to{left:100%}}
.welcome-banner::after{content:'';position:absolute;top:10px;right:10px;width:50px;height:50px;border-top:2px solid var(--c);border-right:2px solid var(--c);opacity:.35}
.corner-bl{position:absolute;bottom:10px;left:10px;width:50px;height:50px;border-bottom:2px solid var(--p);border-left:2px solid var(--p);opacity:.35}
.welcome-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.welcome-text h1{font-family:'Orbitron',monospace;font-size:2rem;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;display:inline-block;cursor:none}
.welcome-text h1:hover{animation:glitch .4s steps(2) infinite}
@keyframes glitch{0%{text-shadow:-2px 0 var(--r),2px 0 var(--c);clip-path:inset(20% 0 60% 0)}25%{text-shadow:2px 0 var(--r),-2px 0 var(--c);clip-path:inset(60% 0 20% 0)}50%{text-shadow:-2px 0 var(--p),2px 0 var(--g);clip-path:inset(40% 0 40% 0)}75%{text-shadow:2px 0 var(--p),-2px 0 var(--g);clip-path:inset(80% 0 5% 0)}100%{text-shadow:none;clip-path:none}}
.welcome-text p{color:#7da3ff;font-size:.95rem;letter-spacing:1px}
.welcome-stats{display:flex;gap:30px}
.welcome-stat{text-align:center;padding:10px 15px;border-radius:8px;transition:background .3s}
.welcome-stat:hover{background:rgba(0,180,255,.06)}
.welcome-stat-number{font-family:'Orbitron',monospace;font-size:2rem;font-weight:700;color:var(--c);text-shadow:0 0 20px rgba(0,180,255,.5)}
.welcome-stat-label{font-size:.75rem;color:#7da3ff;text-transform:uppercase;letter-spacing:2px;margin-top:4px}

/* dashboard grid */
.dashboard-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:30px;margin-bottom:80px}

/* cards */
.card{background:rgba(10,14,39,.85);border:1px solid rgba(0,180,255,.25);border-radius:12px;padding:25px;position:relative;overflow:hidden;transition:border-color .3s,box-shadow .3s;transform-style:preserve-3d;will-change:transform;opacity:0;animation:fadeUp .6s ease forwards}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--c),var(--p),var(--g))}
.card::after{content:'';position:absolute;inset:0;border-radius:12px;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(0,180,255,.06),transparent 60%);pointer-events:none;opacity:0;transition:opacity .3s}
.card:hover::after{opacity:1}
.card:hover{border-color:rgba(0,180,255,.55);box-shadow:0 12px 45px rgba(0,180,255,.18)}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.card-title{font-family:'Orbitron',monospace;font-size:1rem;color:var(--c);display:flex;align-items:center;gap:10px;letter-spacing:2px}
.card-icon{font-size:1.3rem}

/* activity */
.activity-item{padding:18px;border-left:3px solid var(--c);margin-bottom:15px;background:rgba(0,20,40,.35);border-radius:4px;transition:all .3s;opacity:0;animation:slideInLeft .5s ease forwards}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-15px)}to{opacity:1;transform:translateX(0)}}
.activity-item:hover{background:rgba(0,40,80,.55);transform:translateX(6px);box-shadow:-4px 0 15px rgba(0,180,255,.15)}
.activity-header{display:flex;justify-content:space-between;margin-bottom:8px}
.activity-title{color:var(--c);font-weight:bold;font-size:.9rem}
.activity-time{color:var(--g);font-size:.8rem;letter-spacing:1px}

/* events */
.event-card{padding:20px;background:rgba(0,20,40,.4);border:1px solid rgba(0,180,255,.25);border-radius:8px;margin-bottom:15px;transition:all .3s;position:relative;overflow:hidden;opacity:0;animation:fadeUp .5s ease forwards}
.event-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--c),var(--p),var(--g));animation:borderFlow 3s linear infinite}
@keyframes borderFlow{0%{background-position:0 0}100%{background-position:0 100%}}
.event-card:hover{border-color:var(--c);background:rgba(0,40,80,.65);transform:translateX(5px);box-shadow:6px 0 20px rgba(0,180,255,.12)}
.event-date{display:inline-block;padding:4px 10px;background:rgba(0,180,255,.15);border:1px solid var(--c);border-radius:4px;color:var(--c);font-size:.75rem;margin-bottom:10px;letter-spacing:1px}
.event-title{color:var(--c);font-size:1rem;font-weight:bold;margin-bottom:8px;font-family:'Orbitron',monospace;font-size:.95rem}
.event-location{color:var(--p);font-size:.82rem;margin-bottom:10px}
.event-action{margin-top:12px;padding:8px 18px;background:linear-gradient(135deg,var(--c),#0066ff);border:none;border-radius:4px;color:#fff;font-size:.82rem;cursor:none;transition:all .3s;font-family:'Share Tech Mono',monospace;letter-spacing:1px;position:relative;overflow:hidden}
.event-action::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:rgba(255,255,255,.2);border-radius:50%;transform:translate(-50%,-50%);transition:width .35s,height .35s}
.event-action:hover::after{width:200px;height:200px}
.event-action:hover{box-shadow:0 0 20px rgba(0,180,255,.55);transform:translateY(-2px)}

/* progress */
.progress-bar{width:100%;height:8px;background:rgba(0,40,80,.5);border-radius:4px;overflow:hidden;margin-top:10px}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--c),var(--p));border-radius:4px;width:0;transition:width 1.3s cubic-bezier(.23,1,.32,1);position:relative}
.progress-fill::after{content:'';position:absolute;right:0;top:0;width:8px;height:100%;background:#fff;box-shadow:0 0 10px var(--c);border-radius:0 4px 4px 0;opacity:.85}

/* status bar */
.status-bar{position:fixed;bottom:0;left:0;width:100%;background:rgba(0,10,30,.97);border-top:1px solid rgba(0,180,255,.4);padding:10px 20px;display:flex;justify-content:space-between;font-size:.7rem;color:#7da3ff;z-index:99;backdrop-filter:blur(10px);letter-spacing:1px}
.status-item{display:flex;align-items:center;gap:6px}
.status-indicator{width:8px;height:8px;background:#0f0;border-radius:50%;animation:blink 1.5s ease-in-out infinite;box-shadow:0 0 10px #0f0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

/* ticker */
.ticker-wrap{overflow:hidden;width:160px;white-space:nowrap}
.ticker{display:inline-block;animation:ticker 12s linear infinite;color:var(--c)}
@keyframes ticker{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}

@media(max-width:768px){.nav-menu{display:none}.welcome-stats{width:100%;justify-content:space-around}.dashboard-grid{grid-template-columns:1fr}.cur-dot,.cur-ring{display:none}body{cursor:auto}.event-action,.nav-profile{cursor:pointer}}
`;

const EVENTS = [
  { date:"FEB 18, 6:00 PM", title:"System Design Mock Interviews", loc:"Seminar Hall A", btn:"Register" },
  { date:"FEB 21-23", title:"CodeCraft 2026 Hackathon", loc:"Main Auditorium", btn:"View Details" },
];
const PROJECTS = [
  { title:"AI Chatbot Assistant", pct:75 },
  { title:"E-Commerce Platform", pct:45 },
];
const ACTIVITY = [
  { title:"Registered for Hackathon", time:"2h ago" },
  { title:"Achievement Unlocked", time:"1d ago" },
  { title:"Workshop Completed", time:"3d ago" },
];
const NAV = [["📊","Dashboard",true],["📅","Events"],["🏆","Competitions"],["📚","Resources"],["💬","Community"]];
const WELCOME_STATS = [[2450,"Points"],[28,"Events"],[12,"Rank"]];

function useCountUp(target, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s; const dur = 1600;
      const step = (ts) => { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); setN(Math.floor((1 - Math.pow(1 - p, 4)) * target)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return n;
}

function SkillBar({ pct, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return <div className="progress-bar"><div className="progress-fill" style={{ width:`${w}%` }} /></div>;
}

function TiltCard({ children, style }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5) * 2, y = ((e.clientY - r.top) / r.height - .5) * 2;
    el.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateZ(6px)`;
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ""; }, []);
  return <div ref={ref} className="card" style={style} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

export default function ACMDashboard() {
  const canvasRef = useRef(null), dotRef = useRef(null), ringRef = useRef(null);
  const mouse = useRef({ x:0, y:0 }), ring = useRef({ x:0, y:0 });
  const [time, setTime] = useState("");
  const pts = useCountUp(2450, 400), evts = useCountUp(28, 550), rank = useCountUp(12, 700);

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS;
    document.head.appendChild(s); return () => document.head.removeChild(s);
  }, []);

  // Matrix
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%アイウエオカキクケコ";
    let drops = Array.from({ length: Math.floor(c.width / 14) }, () => Math.random() * -100);
    const draw = () => {
      ctx.fillStyle = "rgba(10,14,39,.05)"; ctx.fillRect(0, 0, c.width, c.height);
      drops.forEach((d, i) => {
        ctx.fillStyle = `hsl(${Math.random() > .95 ? 280 : 200},100%,60%)`;
        ctx.font = "14px monospace";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, d * 14);
        if (d * 14 > c.height && Math.random() > .975) drops[i] = 0;
        drops[i]++;
      });
    };
    const iv = setInterval(draw, 50);
    return () => { clearInterval(iv); window.removeEventListener("resize", resize); };
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12:false, hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, []);

  // Cursor
  useEffect(() => {
    const dot = dotRef.current, ringEl = ringRef.current; if (!dot || !ringEl) return;
    let tc = 0;
    const onMove = (e) => {
      mouse.current = { x:e.clientX, y:e.clientY };
      dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
      if (tc < 14) {
        const t = document.createElement("div"); t.className = "cur-trail";
        const hue = (Date.now() / 18) % 360; const sz = (2 + Math.random() * 4) + "px";
        Object.assign(t.style, { left:e.clientX+"px", top:e.clientY+"px", background:`hsl(${hue},100%,60%)`, width:sz, height:sz, boxShadow:`0 0 8px hsl(${hue},100%,60%)` });
        document.body.appendChild(t); tc++;
        setTimeout(() => { t.remove(); tc = Math.max(0, tc-1); }, 550);
      }
    };
    const anim = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * .14;
      ring.current.y += (mouse.current.y - ring.current.y) * .14;
      ringEl.style.left = ring.current.x + "px"; ringEl.style.top = ring.current.y + "px";
      requestAnimationFrame(anim);
    };
    const raf = requestAnimationFrame(anim);
    document.addEventListener("mousemove", onMove);
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const counts = [pts, evts, rank];

  return (
    <>
      <div ref={dotRef} className="cur-dot" />
      <div ref={ringRef} className="cur-ring" />
      <canvas id="matrix-canvas" ref={canvasRef} />
      <div className="hex-grid" />
      <div className="scanlines" />

      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">ACM</div>
          <ul className="nav-menu">
            {NAV.map(([icon,label,active]) =>
              <li className="nav-item" key={label}><a href="#" className={active?"active":""}>{icon} {label}</a></li>
            )}
          </ul>
          <div className="nav-profile">
            <div className="nav-avatar">JD</div>
            <div>
              <div className="nav-username">John Doe</div>
              <div className="nav-status">● Online</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="welcome-banner">
          <div className="corner-bl" />
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>Welcome back, John</h1>
              <p>&gt; Here's what's happening with your ACM membership today</p>
            </div>
            <div className="welcome-stats">
              {WELCOME_STATS.map(([val, label], i) => (
                <div className="welcome-stat" key={label}>
                  <div className="welcome-stat-number">{counts[i].toLocaleString()}</div>
                  <div className="welcome-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Events */}
          <TiltCard style={{ animationDelay:"0.15s" }}>
            <div className="card-header"><div className="card-title"><span className="card-icon">📅</span>Upcoming Events</div></div>
            {EVENTS.map((e, i) => (
              <div className="event-card" key={e.title} style={{ animationDelay:`${0.3 + i * 0.15}s` }}>
                <div className="event-date">{e.date}</div>
                <div className="event-title">{e.title}</div>
                <div className="event-location">📍 {e.loc}</div>
                <button className="event-action">{e.btn}</button>
              </div>
            ))}
          </TiltCard>

          {/* Projects */}
          <TiltCard style={{ animationDelay:"0.3s" }}>
            <div className="card-header"><div className="card-title"><span className="card-icon">💻</span>Active Projects</div></div>
            {PROJECTS.map((p, i) => (
              <div className="activity-item" key={p.title} style={{ animationDelay:`${0.45 + i * 0.15}s` }}>
                <div className="activity-header">
                  <div className="activity-title">{p.title}</div>
                  <div className="activity-time">{p.pct}%</div>
                </div>
                <SkillBar pct={p.pct} delay={600 + i * 200} />
              </div>
            ))}
          </TiltCard>

          {/* Activity */}
          <TiltCard style={{ animationDelay:"0.45s" }}>
            <div className="card-header"><div className="card-title"><span className="card-icon">📈</span>Recent Activity</div></div>
            {ACTIVITY.map((a, i) => (
              <div className="activity-item" key={a.title} style={{ animationDelay:`${0.6 + i * 0.12}s` }}>
                <div className="activity-header">
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </TiltCard>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item"><span className="status-indicator" /><span>SYSTEM ONLINE</span></div>
        <div className="status-item"><span>LOGGED IN AS: JOHN DOE</span></div>
        <div className="status-item">
          <div className="ticker-wrap"><span className="ticker">◈ ACM-2024-1337 &nbsp;◈ RANK #12 &nbsp;◈ 2,450 PTS &nbsp;◈ 28 EVENTS &nbsp;◈ MEMBER SINCE FEB 2024 &nbsp;</span></div>
        </div>
        <div className="status-item"><span>TIME: {time}</span></div>
      </div>
    </>
  );
}

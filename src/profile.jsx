import { useEffect, useRef, useState, useCallback } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
:root{--c:#00b4ff;--p:#a855f7;--g:#00ff88;--bg:#0a0e27}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Share Tech Mono',monospace;overflow-x:hidden;background:var(--bg);color:#fff;min-height:100vh;cursor:none}
.cursor-dot{position:fixed;width:8px;height:8px;background:var(--c);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);box-shadow:0 0 12px var(--c),0 0 24px var(--c)}
.cursor-ring{position:fixed;width:32px;height:32px;border:1.5px solid rgba(0,180,255,.6);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%)}
.cursor-trail{position:fixed;border-radius:50%;pointer-events:none;z-index:9997;transform:translate(-50%,-50%);animation:trailFade .6s ease forwards}
@keyframes trailFade{0%{opacity:.8;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0)}}
.scanlines{position:fixed;inset:0;z-index:3;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);animation:scanMove 8s linear infinite}
@keyframes scanMove{to{background-position:0 100px}}
#matrix-canvas{position:fixed;inset:0;z-index:0;opacity:.07}
.hex-grid{position:fixed;inset:0;opacity:.04;z-index:1;background-image:linear-gradient(30deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(150deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(30deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c)),linear-gradient(150deg,var(--c) 12%,transparent 12.5%,transparent 87%,var(--c) 87.5%,var(--c));background-size:80px 140px;background-position:0 0,0 0,40px 70px,40px 70px}
.navbar{position:sticky;top:0;z-index:100;background:rgba(10,14,39,.95);border-bottom:2px solid var(--c);backdrop-filter:blur(10px);padding:15px 0;animation:slideDown .6s ease}
@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
.nav-container{max-width:1400px;margin:0 auto;padding:0 30px;display:flex;justify-content:space-between;align-items:center}
.nav-logo{font-family:'Orbitron',monospace;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:6px;position:relative}
.nav-logo::after{content:'ACM';position:absolute;left:0;top:0;font-family:'Orbitron',monospace;font-size:1.8rem;font-weight:900;letter-spacing:6px;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:logoFlicker 5s infinite;filter:blur(6px);opacity:.5}
@keyframes logoFlicker{0%,94%,100%{opacity:0}95%,99%{opacity:.6}}
.nav-menu{display:flex;gap:30px;list-style:none}
.nav-item a{color:#7da3ff;text-decoration:none;font-size:.85rem;transition:all .3s;padding:8px 15px;border-radius:4px;display:flex;align-items:center;gap:8px;font-family:'Share Tech Mono',monospace}
.nav-item a:hover,.nav-item a.active{color:var(--c);background:rgba(0,180,255,.1);text-shadow:0 0 10px var(--c)}
.nav-back{display:flex;align-items:center;gap:8px;color:#7da3ff;padding:8px 15px;border:1px solid rgba(0,180,255,.3);border-radius:4px;transition:all .3s;font-family:'Share Tech Mono',monospace;cursor:none;background:none;font-size:.85rem}
.nav-back:hover{color:var(--c);border-color:var(--c);background:rgba(0,180,255,.1);box-shadow:0 0 15px rgba(0,180,255,.3)}
.container{position:relative;z-index:2;max-width:1400px;margin:0 auto;padding:30px;padding-bottom:80px}
.profile-header{background:rgba(10,14,39,.9);border:2px solid transparent;background-image:linear-gradient(rgba(10,14,39,.9),rgba(10,14,39,.9)),linear-gradient(135deg,var(--c),var(--p),var(--g));background-origin:border-box;background-clip:padding-box,border-box;border-radius:12px;padding:40px;margin-bottom:30px;position:relative;overflow:hidden;animation:fadeSlideUp .8s ease .1s both}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.profile-header::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:2px;background:linear-gradient(90deg,transparent,var(--c),var(--p),transparent);animation:scan 3s linear infinite}
@keyframes scan{to{left:100%}}
.profile-header::after{content:'';position:absolute;top:10px;right:10px;width:60px;height:60px;border-top:2px solid var(--c);border-right:2px solid var(--c);opacity:.4}
.corner-bl{position:absolute;bottom:10px;left:10px;width:60px;height:60px;border-bottom:2px solid var(--p);border-left:2px solid var(--p);opacity:.4}
.profile-top{display:flex;gap:30px;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap}
.profile-avatar-section{position:relative}
.avatar-orbit{position:absolute;inset:-25px;border-radius:50%;border:1px dashed rgba(0,180,255,.2);animation:orbitSpin 20s linear infinite}
.avatar-orbit-2{position:absolute;inset:-45px;border-radius:50%;border:1px dashed rgba(168,85,247,.15);animation:orbitSpin 35s linear infinite reverse}
.orbit-dot{position:absolute;width:8px;height:8px;background:var(--c);border-radius:50%;box-shadow:0 0 10px var(--c);top:-4px;left:50%;transform:translateX(-50%)}
.orbit-dot-2{background:var(--p);box-shadow:0 0 10px var(--p);top:50%;left:-4px;transform:translateY(-50%)}
.orbit-dot-3{position:absolute;width:5px;height:5px;background:var(--g);border-radius:50%;box-shadow:0 0 8px var(--g);top:30%;right:-3px}
@keyframes orbitSpin{to{transform:rotate(360deg)}}
.profile-avatar{width:150px;height:150px;border-radius:50%;border:4px solid var(--c);background:linear-gradient(135deg,var(--c),var(--p));display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:3rem;font-weight:900;box-shadow:0 0 40px rgba(0,180,255,.4),inset 0 0 40px rgba(0,0,0,.3);position:relative;z-index:1;transition:box-shadow .3s}
.profile-avatar:hover{box-shadow:0 0 70px rgba(0,180,255,.7),inset 0 0 40px rgba(0,0,0,.3)}
.profile-avatar::after{content:'';position:absolute;inset:-8px;border-radius:50%;padding:4px;background:conic-gradient(var(--c),var(--p),var(--g),var(--c));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:rotate 3s linear infinite}
@keyframes rotate{to{transform:rotate(360deg)}}
.profile-status{position:absolute;bottom:10px;right:10px;width:25px;height:25px;background:var(--g);border:3px solid var(--bg);border-radius:50%;animation:statusPulse 2s ease infinite;z-index:2}
@keyframes statusPulse{0%,100%{box-shadow:0 0 15px var(--g);transform:scale(1)}50%{box-shadow:0 0 30px var(--g),0 0 60px rgba(0,255,136,.3);transform:scale(1.15)}}
.profile-info{flex:1;min-width:300px}
.profile-name{font-family:'Orbitron',monospace;font-size:2.5rem;font-weight:900;background:linear-gradient(135deg,var(--c),var(--p));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;display:inline-block}
.profile-name:hover{animation:glitch .4s steps(2) infinite}
@keyframes glitch{0%{text-shadow:-2px 0 #ff003c,2px 0 var(--c);clip-path:inset(20% 0 60% 0)}25%{text-shadow:2px 0 #ff003c,-2px 0 var(--c);clip-path:inset(60% 0 20% 0)}50%{text-shadow:-2px 0 var(--p),2px 0 var(--g);clip-path:inset(40% 0 40% 0)}75%{text-shadow:2px 0 var(--p),-2px 0 var(--g);clip-path:inset(80% 0 5% 0)}100%{text-shadow:none;clip-path:none}}
.profile-title{color:#7da3ff;font-size:1rem;margin-bottom:15px;letter-spacing:2px}
.profile-meta{display:flex;gap:25px;margin-bottom:20px;flex-wrap:wrap}
.profile-meta-item{display:flex;align-items:center;gap:8px;color:#7da3ff;font-size:.85rem;transition:color .2s}
.profile-meta-item:hover{color:var(--c)}
.profile-meta-icon{color:var(--c)}
.profile-bio{color:#7da3ff;line-height:1.8;margin-bottom:20px;max-width:600px;min-height:80px}
.bio-cursor{display:inline-block;width:2px;height:1em;background:var(--c);margin-left:2px;animation:cursorBlink .8s step-end infinite;vertical-align:middle}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
.profile-actions{display:flex;gap:15px;flex-wrap:wrap}
.btn{padding:12px 25px;border-radius:6px;font-size:.85rem;cursor:none;transition:all .3s;border:none;font-weight:bold;text-transform:uppercase;letter-spacing:2px;font-family:'Share Tech Mono',monospace;position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:rgba(255,255,255,.15);border-radius:50%;transform:translate(-50%,-50%);transition:width .4s,height .4s}
.btn:hover::after{width:200px;height:200px}
.btn-primary{background:linear-gradient(135deg,var(--c),#0066ff);color:#fff;box-shadow:0 4px 15px rgba(0,100,255,.3)}
.btn-primary:hover{box-shadow:0 0 30px rgba(0,180,255,.6);transform:translateY(-2px)}
.btn-secondary{background:rgba(0,40,80,.6);border:1px solid var(--c);color:var(--c)}
.btn-secondary:hover{background:rgba(0,60,120,.8);transform:translateY(-2px);box-shadow:0 0 20px rgba(0,180,255,.3)}
.profile-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;padding-top:20px;border-top:1px solid rgba(0,180,255,.3)}
.profile-stat{text-align:center;padding:10px;border-radius:8px;transition:all .3s}
.profile-stat:hover{background:rgba(0,180,255,.05)}
.profile-stat-number{font-family:'Orbitron',monospace;font-size:2rem;font-weight:700;color:var(--c);text-shadow:0 0 20px rgba(0,180,255,.5)}
.profile-stat-label{color:#7da3ff;font-size:.8rem;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.content-grid{display:grid;grid-template-columns:2fr 1fr;gap:25px;margin-bottom:30px}
.card{background:rgba(10,14,39,.85);border:1px solid rgba(0,180,255,.25);border-radius:12px;padding:25px;position:relative;overflow:hidden;transition:border-color .3s,box-shadow .3s;transform-style:preserve-3d;will-change:transform}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--c),var(--p),var(--g))}
.card::after{content:'';position:absolute;inset:0;border-radius:12px;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(0,180,255,.06),transparent 60%);pointer-events:none;opacity:0;transition:opacity .3s}
.card:hover::after{opacity:1}
.card:hover{border-color:rgba(0,180,255,.5);box-shadow:0 10px 40px rgba(0,180,255,.15)}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.card-title{font-family:'Orbitron',monospace;font-size:1rem;color:var(--c);display:flex;align-items:center;gap:10px;letter-spacing:2px}
.card-icon{font-size:1.3rem}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:15px}
.skill-item{background:rgba(0,20,40,.6);border:1px solid rgba(0,180,255,.2);border-radius:8px;padding:15px;text-align:center;transition:all .3s;cursor:none;opacity:0;animation:skillAppear .5s ease forwards}
@keyframes skillAppear{from{opacity:0;transform:scale(.8) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.skill-item:hover{border-color:var(--c);background:rgba(0,40,80,.8);transform:translateY(-4px) scale(1.03);box-shadow:0 8px 25px rgba(0,180,255,.3)}
.skill-icon{font-size:2rem;margin-bottom:8px}
.skill-name{color:#7da3ff;font-size:.85rem;margin-bottom:10px}
.progress-bar{width:100%;height:6px;background:rgba(0,40,80,.5);border-radius:3px;overflow:hidden;margin-top:8px}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--c),var(--p));border-radius:3px;width:0;transition:width 1.2s cubic-bezier(.23,1,.32,1);position:relative}
.progress-fill::after{content:'';position:absolute;right:0;top:0;width:6px;height:100%;background:#fff;box-shadow:0 0 8px var(--c);border-radius:0 3px 3px 0;opacity:.8}
.badges-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}
.badge-flip{height:110px;perspective:600px}
.badge-inner{position:relative;width:100%;height:100%;transition:transform .6s cubic-bezier(.23,1,.32,1);transform-style:preserve-3d;cursor:none}
.badge-flip:hover .badge-inner{transform:rotateY(180deg)}
.badge-front,.badge-back{position:absolute;inset:0;backface-visibility:hidden;background:rgba(0,20,40,.6);border:1px solid rgba(168,85,247,.3);border-radius:8px;padding:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.badge-back{transform:rotateY(180deg);background:rgba(168,85,247,.15);border-color:var(--p)}
.badge-icon{font-size:2.5rem;margin-bottom:6px}
.badge-name{color:var(--p);font-size:.8rem;font-weight:bold;letter-spacing:1px}
.badge-desc{color:#ccc;font-size:.75rem;line-height:1.4}
.timeline{position:relative;padding-left:30px}
.timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--c),var(--p),var(--g))}
.timeline-item{position:relative;margin-bottom:20px;padding:15px;background:rgba(0,20,40,.4);border-radius:8px;border:1px solid rgba(0,180,255,.15);transition:all .3s;opacity:0;animation:timelineIn .5s ease forwards}
@keyframes timelineIn{from{opacity:0;transform:translateX(-15px)}to{opacity:1;transform:translateX(0)}}
.timeline-item:hover{background:rgba(0,40,80,.6);border-color:var(--c);transform:translateX(6px);box-shadow:-4px 0 20px rgba(0,180,255,.2)}
.timeline-dot{position:absolute;left:-23px;top:18px;width:12px;height:12px;background:var(--c);border-radius:50%;border:2px solid var(--bg);animation:dotPulse 2s ease-in-out infinite}
@keyframes dotPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,180,255,.6)}50%{box-shadow:0 0 0 8px rgba(0,180,255,0)}}
.timeline-date{color:var(--g);font-size:.75rem;margin-bottom:6px;letter-spacing:1px}
.timeline-title{color:var(--c);font-size:.95rem;font-weight:bold}
.info-list{display:flex;flex-direction:column;gap:12px}
.info-item{display:flex;align-items:center;gap:15px;padding:13px;background:rgba(0,20,40,.4);border-radius:6px;border-left:3px solid var(--c);transition:all .3s}
.info-item:hover{background:rgba(0,40,80,.6);transform:translateX(5px)}
.info-icon{font-size:1.4rem;color:var(--c)}
.info-content{flex:1}
.info-label{color:#7da3ff;font-size:.75rem;text-transform:uppercase;letter-spacing:2px;margin-bottom:3px}
.info-value{color:#fff;font-size:.9rem}
.social-links{display:flex;gap:15px;flex-wrap:wrap}
.social-link{width:50px;height:50px;border-radius:50%;border:1px solid rgba(0,180,255,.3);display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:1.5rem;transition:all .3s;cursor:none;position:relative}
.social-link::before{content:'';position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(var(--c),var(--p),var(--g),var(--c));z-index:-1;opacity:0;transition:opacity .3s;animation:rotate 3s linear infinite}
.social-link:hover::before{opacity:1}
.social-link:hover{border-color:transparent;background:rgba(0,40,80,.8);transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,180,255,.4)}
.status-bar{position:fixed;bottom:0;left:0;width:100%;background:rgba(0,10,30,.97);border-top:1px solid rgba(0,180,255,.4);padding:10px 20px;display:flex;justify-content:space-between;font-size:.7rem;color:#7da3ff;z-index:99;backdrop-filter:blur(10px);letter-spacing:1px}
.status-item{display:flex;align-items:center;gap:6px}
.status-indicator{width:8px;height:8px;background:#0f0;border-radius:50%;animation:blink 1.5s ease-in-out infinite;box-shadow:0 0 10px #0f0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.card-anim{opacity:0;animation:fadeSlideUp .6s ease forwards}
@media(max-width:1024px){.content-grid{grid-template-columns:1fr}}
@media(max-width:768px){.nav-menu{display:none}.profile-top{flex-direction:column;align-items:center;text-align:center}.profile-info{min-width:100%}.profile-actions{justify-content:center}.skills-grid{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}.cursor-dot,.cursor-ring{display:none}body{cursor:auto}.btn,.nav-back,.social-link,.badge-flip,.skill-item{cursor:pointer}}
`;

const BIO = "Passionate developer with a keen interest in AI/ML and Web Development. Love building innovative solutions and participating in hackathons. Always eager to learn new technologies and collaborate on exciting projects.";
const SKILLS = [
  { icon:"🐍", name:"Python", pct:90 }, { icon:"⚛️", name:"React", pct:85 },
  { icon:"🟢", name:"Node.js", pct:75 }, { icon:"🗄️", name:"MongoDB", pct:70 },
  { icon:"🤖", name:"ML/AI", pct:65 }, { icon:"🐳", name:"Docker", pct:50 },
];
const TIMELINE = [
  { date:"2 hours ago", title:"Registered for CodeCraft 2026" },
  { date:"1 day ago", title:"Unlocked Achievement: Event Enthusiast" },
  { date:"3 days ago", title:"Completed Web3 Workshop" },
  { date:"1 week ago", title:"New Connection Added" },
];
const BADGES = [
  { icon:"🎯", name:"Event Master", desc:"Attended 25+ events" },
  { icon:"💻", name:"Code Ninja", desc:"Top hackathon finisher" },
  { icon:"🌟", name:"Rising Star", desc:"Fastest rank climber" },
  { icon:"🤝", name:"Team Player", desc:"150+ connections made" },
];
const STATS = [
  { value:2450, label:"Total Points" }, { value:28, label:"Events Attended" },
  { value:156, label:"Connections" }, { value:12, label:"Rank" }, { value:5, label:"Projects" },
];
const CONTACT = [
  { icon:"📧", label:"Email", value:"john.doe@acm.org" },
  { icon:"📱", label:"Phone", value:"+91 98765 43210" },
  { icon:"🌐", label:"Website", value:"johndoe.dev" },
];
const SOCIALS = [{ icon:"🐙", title:"GitHub" }, { icon:"💼", title:"LinkedIn" }, { icon:"🐦", title:"Twitter" }, { icon:"💬", title:"Discord" }];
const META = [["📍","Delhi, India"], ["🎓","Computer Science, 3rd Year"], ["📅","Joined Feb 2024"]];

function useCountUp(target, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s; const dur = 1800;
      const step = (ts) => { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); setN(Math.floor((1 - Math.pow(1 - p, 4)) * target)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return n;
}

function StatItem({ value, label, delay }) {
  const n = useCountUp(value, delay);
  return (
    <div className="profile-stat">
      <div className="profile-stat-number">{n.toLocaleString()}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}

function SkillBar({ pct, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 300); return () => clearTimeout(t); }, [pct, delay]);
  return <div className="progress-bar"><div className="progress-fill" style={{ width:`${w}%` }} /></div>;
}

function TiltCard({ children, className = "", style = {} }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateZ(4px)`;
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ""; }, []);
  return <div ref={ref} className={`card ${className}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

function Typewriter({ text, speed = 28 }) {
  const [out, setOut] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => { setOut(text.slice(0, ++i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
      return () => clearInterval(iv);
    }, 800);
    return () => clearTimeout(t);
  }, [text, speed]);
  return <p className="profile-bio">{out}{!done && <span className="bio-cursor" />}</p>;
}

export default function ACMProfile() {
  const canvasRef = useRef(null), dotRef = useRef(null), ringRef = useRef(null);
  const mouse = useRef({ x:0, y:0 }), ring = useRef({ x:0, y:0 });
  const [time, setTime] = useState("");

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS;
    document.head.appendChild(s); return () => document.head.removeChild(s);
  }, []);

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

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12:false, hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const dot = dotRef.current, ringEl = ringRef.current; if (!dot || !ringEl) return;
    let tc = 0;
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
      if (tc < 12) {
        const t = document.createElement("div"); t.className = "cursor-trail";
        const hue = (Date.now() / 20) % 360; const sz = (3 + Math.random() * 3) + "px";
        Object.assign(t.style, { left:e.clientX+"px", top:e.clientY+"px", background:`hsl(${hue},100%,60%)`, width:sz, height:sz, boxShadow:`0 0 8px hsl(${hue},100%,60%)` });
        document.body.appendChild(t); tc++;
        setTimeout(() => { t.remove(); tc = Math.max(0, tc - 1); }, 600);
      }
    };
    const anim = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      ringEl.style.left = ring.current.x + "px"; ringEl.style.top = ring.current.y + "px";
      requestAnimationFrame(anim);
    };
    const raf = requestAnimationFrame(anim);
    document.addEventListener("mousemove", onMove);
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <canvas id="matrix-canvas" ref={canvasRef} />
      <div className="hex-grid" /><div className="scanlines" />

      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">ACM</div>
          <ul className="nav-menu">
            {[["📊","Dashboard"],["📅","Events"],["🏆","Competitions"],["👤","Profile"]].map(([icon,label]) =>
              <li className="nav-item" key={label}><a href="#" className={label==="Profile"?"active":""}>{icon} {label}</a></li>
            )}
          </ul>
          <button className="nav-back">← Back to Dashboard</button>
        </div>
      </nav>

      <div className="container">
        <div className="profile-header">
          <div className="corner-bl" />
          <div className="profile-top">
            <div className="profile-avatar-section">
              <div className="avatar-orbit-2"><div className="orbit-dot-3" /></div>
              <div className="avatar-orbit"><div className="orbit-dot" /><div className="orbit-dot orbit-dot-2" /></div>
              <div className="profile-avatar">JD</div>
              <div className="profile-status" />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">John Doe</h1>
              <div className="profile-title">[ Full Stack Developer | ACM Member ]</div>
              <div className="profile-meta">
                {META.map(([icon,text]) => <div className="profile-meta-item" key={text}><span className="profile-meta-icon">{icon}</span><span>{text}</span></div>)}
              </div>
              <Typewriter text={BIO} />
              <div className="profile-actions">
                <button className="btn btn-primary">✏️ Edit Profile</button>
                <button className="btn btn-secondary">⚙️ Settings</button>
                <button className="btn btn-secondary">📤 Share</button>
              </div>
            </div>
          </div>
          <div className="profile-stats">
            {STATS.map((s,i) => <StatItem key={s.label} {...s} delay={i*120} />)}
          </div>
        </div>

        <div className="content-grid">
          <div style={{display:"flex",flexDirection:"column",gap:"25px"}}>
            <TiltCard className="card-anim" style={{animationDelay:"0.2s"}}>
              <div className="card-header"><div className="card-title"><span className="card-icon">💻</span>Technical Skills</div></div>
              <div className="skills-grid">
                {SKILLS.map((s,i) => (
                  <div className="skill-item" key={s.name} style={{animationDelay:`${0.3+i*.1}s`}}>
                    <div className="skill-icon">{s.icon}</div>
                    <div className="skill-name">{s.name}</div>
                    <SkillBar pct={s.pct} delay={400+i*120} />
                  </div>
                ))}
              </div>
            </TiltCard>

            <TiltCard className="card-anim" style={{animationDelay:"0.4s"}}>
              <div className="card-header"><div className="card-title"><span className="card-icon">📈</span>Recent Activity</div></div>
              <div className="timeline">
                {TIMELINE.map((item,i) => (
                  <div className="timeline-item" key={i} style={{animationDelay:`${0.5+i*.12}s`}}>
                    <div className="timeline-dot" style={{animationDelay:`${i*.4}s`}} />
                    <div className="timeline-date">&gt; {item.date}</div>
                    <div className="timeline-title">{item.title}</div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:"25px"}}>
            <TiltCard className="card-anim" style={{animationDelay:"0.3s"}}>
              <div className="card-header"><div className="card-title"><span className="card-icon">📞</span>Contact</div></div>
              <div className="info-list">
                {CONTACT.map(({icon,label,value}) => (
                  <div className="info-item" key={label}>
                    <div className="info-icon">{icon}</div>
                    <div className="info-content"><div className="info-label">{label}</div><div className="info-value">{value}</div></div>
                  </div>
                ))}
              </div>
            </TiltCard>

            <TiltCard className="card-anim" style={{animationDelay:"0.45s"}}>
              <div className="card-header"><div className="card-title"><span className="card-icon">🔗</span>Social Links</div></div>
              <div className="social-links">
                {SOCIALS.map(({icon,title}) => <a href="#" className="social-link" title={title} key={title}>{icon}</a>)}
              </div>
            </TiltCard>

            <TiltCard className="card-anim" style={{animationDelay:"0.6s"}}>
              <div className="card-header"><div className="card-title"><span className="card-icon">🏆</span>Achievements</div></div>
              <div className="badges-grid">
                {BADGES.map((b) => (
                  <div className="badge-flip" key={b.name}>
                    <div className="badge-inner">
                      <div className="badge-front"><div className="badge-icon">{b.icon}</div><div className="badge-name">{b.name}</div></div>
                      <div className="badge-back"><div className="badge-icon">{b.icon}</div><div className="badge-desc">{b.desc}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item"><span className="status-indicator" /><span>SYSTEM ONLINE</span></div>
        <div className="status-item"><span>VIEWING PROFILE: JOHN DOE</span></div>
        <div className="status-item"><span>MEMBER ID: ACM-2024-1337</span></div>
        <div className="status-item"><span>TIME: {time}</span></div>
      </div>
    </>
  );
}

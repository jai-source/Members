import { useState, useEffect, useRef, useCallback } from "react";

function useConfetti() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const fire = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ["#00b4ff","#a855f7","#00ff88","#ff0080","#ffdd00","#ffffff"];
    for (let i = 0; i < 200; i++) particles.current.push({ x: Math.random()*canvas.width, y:-10, vx:(Math.random()-0.5)*6, vy:Math.random()*4+2, color:colors[Math.floor(Math.random()*colors.length)], size:Math.random()*8+3, rotation:Math.random()*360, rotationSpeed:(Math.random()-0.5)*10, opacity:1 });
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.current = particles.current.filter(p=>p.opacity>0);
      particles.current.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.rotation+=p.rotationSpeed; p.opacity-=0.012; ctx.save(); ctx.globalAlpha=Math.max(0,p.opacity); ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180); ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore(); });
      if (particles.current.length>0) requestAnimationFrame(draw);
    };
    draw();
  }, []);
  return { canvasRef, fire };
}

function useTypewriter(texts, speed=80, pause=1800) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx]; let timeout;
    if (!deleting && charIdx < current.length) timeout = setTimeout(() => setCharIdx(c=>c+1), speed);
    else if (!deleting && charIdx === current.length) timeout = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0) timeout = setTimeout(() => setCharIdx(c=>c-1), speed/2);
    else { setDeleting(false); setIdx(i=>(i+1)%texts.length); }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);
  return displayed;
}

function useCountdown(targetDate) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff<=0) return setT({expired:true});
      setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    calc(); const iv = setInterval(calc,1000); return () => clearInterval(iv);
  }, [targetDate]);
  return t;
}

function getPWStrength(pw) {
  if (!pw) return { score:0, label:"", color:"" };
  let s=0;
  if (pw.length>=8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [{label:"WEAK",color:"#ff0080"},{label:"FAIR",color:"#ffaa00"},{label:"GOOD",color:"#00b4ff"},{label:"STRONG",color:"#00ff88"},{label:"UNBREAKABLE",color:"#a855f7"}][Math.min(s,4)];
}

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = (((e.clientY-r.top)/r.height)-0.5)*-16;
    const ry = (((e.clientX-r.left)/r.width)-0.5)*16;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    el.style.boxShadow = `0 20px 40px rgba(0,180,255,0.4),${-ry}px ${rx}px 20px rgba(168,85,247,0.3)`;
  };
  const onLeave = () => { const el=ref.current; if (!el) return; el.style.transform=""; el.style.boxShadow=""; };
  return <div ref={ref} className={className} style={{transition:"transform 0.12s ease,box-shadow 0.12s ease"}} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }), {threshold:0.1});
    document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
    return () => obs.disconnect();
  });
}

function EventItem({ ev, idx }) {
  const cd = useCountdown(ev.date);
  const [rsvpd, setRsvpd] = useState(false);
  const ac = ["#00b4ff","#a855f7","#00ff88","#ff0080","#ffaa00"][idx%5];
  return (
    <div className="timeline-item">
      <div className="tl-dot" style={{background:ac,boxShadow:`0 0 15px ${ac}`}}/>
      <div className="event-date">📆 {ev.display}</div>
      <div className="event-title" style={{color:ac}}>{ev.title}</div>
      <div className="event-location">📍 {ev.loc}</div>
      <div className="event-desc">{ev.desc}</div>
      {cd.expired ? <div style={{color:"#ff0080",fontSize:"0.85rem"}}>⚠ EVENT HAS PASSED</div> : (<>
        <div style={{color:"#7da3ff",fontSize:"0.75rem",marginBottom:6,letterSpacing:1,marginTop:10}}>⏳ STARTS IN:</div>
        <div className="countdown">
          {[["d","DAYS"],["h","HRS"],["m","MIN"],["s","SEC"]].map(([k,l]) => (
            <div className="countdown-unit" key={k} style={{borderColor:ac+"66"}}>
              <div className="countdown-num" style={{color:ac}}>{String(cd[k]??0).padStart(2,"0")}</div>
              <div className="countdown-label">{l}</div>
            </div>
          ))}
        </div>
      </>)}
      <div style={{marginTop:12}}>
        <button className={`rsvp-btn${rsvpd?" rsvpd":""}`} style={rsvpd?{}:{borderColor:ac+"88",color:ac}} onClick={()=>setRsvpd(r=>!r)}>
          {rsvpd?"✓ REGISTERED":"► REGISTER NOW"}
        </button>
      </div>
    </div>
  );
}

const NEWS = [
  {cat:"TECH TALK",time:"2 hours ago",title:"Google Engineer to Present at Tech Talk Series",desc:"Join us this Friday for an exclusive session on Large Language Models and their applications in production systems. Register now for limited seats!"},
  {cat:"HACKATHON",time:"1 day ago",title:"Hackathon Registration Now Open",desc:'ACM presents "CodeCraft 2026" - a 48-hour hackathon with ₹2L in prizes. Team registrations close on Feb 20th. Build innovative solutions and compete with the best!'},
  {cat:"STUDY GROUP",time:"3 days ago",title:"New AI/ML Study Group Launched",desc:"Interested in deep learning and neural networks? Our new study group meets every Tuesday at 6 PM. All skill levels welcome - from beginners to advanced practitioners."},
  {cat:"COMPETITION",time:"1 week ago",title:"ICPC Regional Results Announced",desc:"Congratulations to our ACM-ICPC teams! Team AlgoKnights secured 3rd place regionally and advances to the World Finals in Egypt. Amazing performance!"},
];

const EVENTS = [
  {date:"2026-04-14T17:00:00",display:"April 14, 2026 | 5:00 PM - 7:00 PM",title:"Web3 & Blockchain Workshop",loc:"Computer Science Lab 3",desc:"Learn the fundamentals of blockchain technology, smart contracts, and decentralized applications. Hands-on session with Ethereum and Solidity."},
  {date:"2026-04-18T18:00:00",display:"April 18, 2026 | 6:00 PM - 8:00 PM",title:"System Design Mock Interviews",loc:"Seminar Hall A",desc:"Practice system design interviews with seniors from FAANG companies. Get real-time feedback and improve your problem-solving approach."},
  {date:"2026-05-01T09:00:00",display:"May 1-3, 2026 | All Day",title:"CodeCraft 2026 Hackathon",loc:"Main Auditorium Complex",desc:"48-hour innovation marathon! Build amazing projects, win prizes, network with sponsors, and showcase your skills. Food, swag, and fun guaranteed!"},
  {date:"2026-05-10T16:00:00",display:"May 10, 2026 | 4:00 PM - 6:00 PM",title:"Open Source Contribution Workshop",loc:"Virtual (Zoom)",desc:"Learn how to contribute to open source projects. We'll cover Git workflow, finding good first issues, and making your first PR to real projects."},
  {date:"2026-05-20T17:30:00",display:"May 20, 2026 | 5:30 PM - 7:30 PM",title:"Career Panel: Breaking into Tech",loc:"Conference Hall",desc:"Hear from alumni working at Google, Microsoft, Amazon, and top startups. Q&A session, resume tips, and networking opportunity."},
];

const FEATURES = [
  {icon:"💻",title:"Technical Workshops",desc:"Access exclusive coding bootcamps, hackathons, and hands-on technical sessions led by industry experts."},
  {icon:"🌐",title:"Global Network",desc:"Connect with over 100,000+ computing professionals and students from around the world."},
  {icon:"📚",title:"Research Papers",desc:"Full access to ACM Digital Library with thousands of peer-reviewed research publications."},
  {icon:"🏆",title:"Competitions",desc:"Participate in ICPC, hackathons, and coding competitions with prizes and recognition."},
  {icon:"🎓",title:"Career Resources",desc:"Resume reviews, mock interviews, and direct connections to top tech recruiters."},
  {icon:"⚡",title:"Special Interest Groups",desc:"Join SIGs focused on AI, cybersecurity, web dev, mobile apps, and more specialized topics."},
];

const STATS = [{num:"500+",label:"Active Members"},{num:"50+",label:"Events This Year"},{num:"25+",label:"Industry Partners"},{num:"15+",label:"Ongoing Projects"}];
const LINKS = [{icon:"📖",lbl:"Resources"},{icon:"💬",lbl:"Discord"},{icon:"📧",lbl:"Contact"},{icon:"🎯",lbl:"Projects"},{icon:"👥",lbl:"Team"},{icon:"📸",lbl:"Gallery"}];
const TICKER_MSGS = ["🔥 CodeCraft 2026 registrations open — ₹2L in prizes","⚡ Google Tech Talk this Friday 5PM — limited seats","🏆 Team AlgoKnights advances to ICPC World Finals","🤖 New AI/ML Study Group every Tuesday 6PM","🌐 Web3 Workshop — April 14 — CS Lab 3","📢 New members get 20% off ACM Digital Library access"];
const BOOT_LINES = ["INITIALIZING SYSTEM...","LOADING ACM PROTOCOLS...","ESTABLISHING SECURE TUNNEL...","DECRYPTING MEMBER DATABASE...","SYSTEM READY ✓"];

export default function ACMSociety() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [currentTime, setCurrentTime] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [btnText, setBtnText] = useState("Initialize Login");
  const [btnStyle, setBtnStyle] = useState({});
  const [loginBoxStyle, setLoginBoxStyle] = useState({});
  const [uStatus, setUStatus] = useState({});
  const [pStatus, setPStatus] = useState({});
  const [booting, setBooting] = useState(true);
  const [bootStage, setBootStage] = useState(0);
  const [lightMode, setLightMode] = useState(false);
  const [newsFilter, setNewsFilter] = useState("ALL");
  const [memberCount, setMemberCount] = useState(312);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { canvasRef: confettiCanvas, fire: fireConfetti } = useConfetti();
  const typeText = useTypewriter(["► MEMBER ACCESS PORTAL","► SECURE LOGIN SYSTEM","► WELCOME BACK, CODER","► ACM AUTH v4.2"]);
  const pwStrength = getPWStrength(password);
  useScrollReveal();

  useEffect(() => { let i=0; const iv=setInterval(()=>{ setBootStage(i++); if(i>=5){clearInterval(iv);setTimeout(()=>setBooting(false),700);} },500); return ()=>clearInterval(iv); }, []);

  useEffect(() => {
    if (booting) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>/\\|";
    let drops = Array.from({length:Math.floor(canvas.width/14)},()=>Math.random()*-100);
    const colors = ["#00b4ff","#a855f7","#00ff88"];
    const draw = () => {
      ctx.fillStyle="rgba(10,14,39,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
      drops.forEach((d,i) => { ctx.fillStyle=colors[Math.floor(Math.random()*3)]; ctx.font="14px monospace"; ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,d*14); if(d*14>canvas.height&&Math.random()>0.975)drops[i]=0; drops[i]++; });
    };
    const iv = setInterval(draw,50);
    window.addEventListener("resize",resize);
    return () => { clearInterval(iv); window.removeEventListener("resize",resize); };
  }, [booting]);

  useEffect(() => { if (booting) return; const onMove=e=>{ const c=cursorRef.current; if(c){c.style.left=e.clientX+"px";c.style.top=e.clientY+"px";} }; window.addEventListener("mousemove",onMove); return ()=>window.removeEventListener("mousemove",onMove); }, [booting]);
  useEffect(() => { const u=()=>setCurrentTime("TIME: "+new Date().toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})); u(); const iv=setInterval(u,1000); return ()=>clearInterval(iv); }, []);
  useEffect(() => { const iv=setInterval(()=>setMemberCount(c=>Math.max(300,c+Math.floor(Math.random()*3)-1)),4000); return ()=>clearInterval(iv); }, []);
  useEffect(() => { const h=e=>{ if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();setSearchOpen(true);} if(e.key==="Escape")setSearchOpen(false); }; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); }, []);

  const handleInput = (val,setter,setStatus) => { setter(val); if(val.length>0){setStatus({background:"#00b4ff",boxShadow:"0 0 10px #00b4ff"});setTimeout(()=>setStatus({background:"#00ff88",boxShadow:"0 0 10px #00ff88"}),100);}else setStatus({background:"rgba(125,163,255,0.3)"}); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnText("INITIALIZING..."); setBtnStyle({background:"linear-gradient(135deg,#0066ff,#00b4ff)"});
    setTimeout(()=>{ setBtnText("VERIFYING CREDENTIALS..."); setBtnStyle({background:"linear-gradient(135deg,#a855f7,#00b4ff)"});
      setTimeout(()=>{ setBtnText("ESTABLISHING SECURE CONNECTION...");
        setTimeout(()=>{ setBtnText(`WELCOME ${username.toUpperCase()} ✓`); setBtnStyle({background:"linear-gradient(135deg,#00ff88,#00cc66)"}); setLoginBoxStyle({boxShadow:"0 0 60px rgba(0,255,136,0.6),0 0 120px rgba(0,255,136,0.3)"}); fireConfetti();
          setTimeout(()=>{ alert("🚀 Access Granted! Redirecting to ACM Member Dashboard..."); setBtnText("Initialize Login"); setBtnStyle({}); setLoginBoxStyle({}); },1500);
        },800);
      },1000);
    },800);
  };

  const filtered = newsFilter==="ALL" ? NEWS : NEWS.filter(n=>n.cat===newsFilter);
  const lm = lightMode;

  if (booting) return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",color:"#00ff88",padding:40}}>
      <div style={{fontSize:"1.8rem",color:"#00b4ff",marginBottom:8,letterSpacing:6}}>ACM SOCIETY</div>
      <div style={{color:"#7da3ff",fontSize:"0.8rem",letterSpacing:3,marginBottom:30}}>SECURE MEMBER PORTAL</div>
      <div style={{width:420,maxWidth:"90vw"}}>
        {BOOT_LINES.slice(0,bootStage+1).map((line,i)=>(
          <div key={i} style={{marginBottom:10,opacity:i<bootStage?0.4:1,display:"flex",alignItems:"center",gap:12}}>
            <span style={{color:i<bootStage?"#00ff88":"#00b4ff"}}>{i<bootStage?"✓":"►"}</span>
            <span style={{color:i===4?"#00ff88":"#7da3ff",fontSize:"0.9rem"}}>{line}</span>
          </div>
        ))}
        <div style={{marginTop:20,height:3,background:"rgba(0,180,255,0.2)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#00b4ff,#a855f7,#00ff88)",width:`${((bootStage+1)/BOOT_LINES.length)*100}%`,transition:"width 0.4s ease"}}/>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{cursor:none!important;font-family:'Courier New',monospace;overflow-x:hidden;background:${lm?"#f0f4ff":"#0a0e27"};color:${lm?"#0a0e27":"#fff"};min-height:100vh;transition:background 0.4s,color 0.4s;}
        *{cursor:none!important;}
        #matrix-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;opacity:${lm?"0.03":"0.15"};pointer-events:none;}
        #confetti-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;pointer-events:none;}
        #custom-cursor{position:fixed;width:20px;height:20px;border:2px solid #00b4ff;border-radius:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:none;box-shadow:0 0 10px #00b4ff,0 0 20px rgba(0,180,255,0.4);}
        #custom-cursor::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;background:#00b4ff;border-radius:50%;box-shadow:0 0 6px #00b4ff;}
        .hex-grid{position:fixed;top:0;left:0;width:100%;height:100%;opacity:${lm?"0.03":"0.08"};z-index:1;pointer-events:none;background-image:linear-gradient(30deg,#00b4ff 12%,transparent 12.5%,transparent 87%,#00b4ff 87.5%),linear-gradient(150deg,#00b4ff 12%,transparent 12.5%,transparent 87%,#00b4ff 87.5%),linear-gradient(30deg,#00b4ff 12%,transparent 12.5%,transparent 87%,#00b4ff 87.5%),linear-gradient(150deg,#00b4ff 12%,transparent 12.5%,transparent 87%,#00b4ff 87.5%);background-size:80px 140px;background-position:0 0,0 0,40px 70px,40px 70px;}
        .circuit-bg{position:fixed;top:0;left:0;width:100%;height:100%;opacity:${lm?"0.04":"0.12"};z-index:1;pointer-events:none;}
        .ticker-wrap{position:relative;z-index:10;width:100%;background:rgba(0,20,40,0.95);border-bottom:1px solid rgba(0,180,255,0.4);padding:8px 0;overflow:hidden;}
        .ticker-label{position:absolute;left:0;top:0;height:100%;background:linear-gradient(135deg,#00b4ff,#a855f7);padding:0 16px;display:flex;align-items:center;font-size:0.7rem;font-weight:bold;letter-spacing:2px;z-index:2;}
        .ticker-track{display:flex;animation:ticker 35s linear infinite;white-space:nowrap;padding-left:110px;}
        .ticker-item{color:#7da3ff;font-size:0.75rem;padding:0 40px;letter-spacing:1px;}
        .ticker-item em{color:#00ff88;font-style:normal;}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .search-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;backdrop-filter:blur(10px);}
        .search-box{width:100%;max-width:600px;background:rgba(10,14,39,0.97);border:2px solid #00b4ff;border-radius:12px;padding:24px;box-shadow:0 0 50px rgba(0,180,255,0.4);}
        .search-input{width:100%;background:none;border:none;outline:none;color:#fff;font-size:1.3rem;font-family:'Courier New',monospace;padding:10px 0;border-bottom:1px solid rgba(0,180,255,0.3);}
        .search-result{padding:12px;margin-top:8px;background:rgba(0,30,60,0.4);border-radius:6px;border-left:2px solid transparent;transition:all 0.2s;}
        .search-result:hover{background:rgba(0,60,120,0.6);border-left-color:#00b4ff;}
        .ctrl-wrap{position:fixed;top:14px;right:14px;z-index:100;display:flex;gap:8px;}
        .ctrl-btn{background:rgba(0,20,40,0.85);border:1px solid rgba(0,180,255,0.4);border-radius:20px;padding:7px 14px;font-size:0.75rem;font-family:'Courier New',monospace;cursor:none;transition:all 0.3s;letter-spacing:1px;color:#7da3ff;backdrop-filter:blur(8px);}
        .ctrl-btn:hover{background:rgba(0,40,80,0.9);box-shadow:0 0 14px rgba(0,180,255,0.3);color:#00b4ff;}
        .container{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:0 20px 80px;gap:40px;}
        .login-box{background:${lm?"rgba(240,244,255,0.95)":"rgba(10,14,39,0.9)"};border:2px solid transparent;background-image:${lm?"linear-gradient(rgba(240,244,255,0.95),rgba(240,244,255,0.95)),linear-gradient(135deg,#00b4ff,#a855f7,#00ff88,#00b4ff)":"linear-gradient(rgba(10,14,39,0.9),rgba(10,14,39,0.9)),linear-gradient(135deg,#00b4ff,#a855f7,#00ff88,#00b4ff)"};background-origin:border-box;background-clip:padding-box,border-box;border-radius:12px;padding:50px 40px;width:100%;max-width:480px;box-shadow:0 0 40px rgba(0,180,255,0.3),0 0 80px rgba(168,85,247,0.2),inset 0 0 30px rgba(0,180,255,0.05);backdrop-filter:blur(10px);position:relative;overflow:hidden;margin-top:20px;}
        .login-box::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:2px;background:linear-gradient(90deg,transparent,#00b4ff,#a855f7,transparent);animation:scan 4s linear infinite;}
        .login-box::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 0%,rgba(168,85,247,0.1),transparent 50%);pointer-events:none;}
        @keyframes scan{0%{left:-100%}100%{left:100%}}
        .corner{position:absolute;width:25px;height:25px;border:2px solid;transition:all 0.3s;}
        .corner::after{content:'';position:absolute;width:6px;height:6px;border-radius:50%;}
        .c-tl{top:10px;left:10px;border-right:none;border-bottom:none;border-color:#00b4ff;}.c-tl::after{top:-3px;left:-3px;background:#00b4ff;box-shadow:0 0 10px #00b4ff;}
        .c-tr{top:10px;right:10px;border-left:none;border-bottom:none;border-color:#a855f7;}.c-tr::after{top:-3px;right:-3px;background:#a855f7;box-shadow:0 0 10px #a855f7;}
        .c-bl{bottom:10px;left:10px;border-right:none;border-top:none;border-color:#00ff88;}.c-bl::after{bottom:-3px;left:-3px;background:#00ff88;box-shadow:0 0 10px #00ff88;}
        .c-br{bottom:10px;right:10px;border-left:none;border-top:none;border-color:#ff0080;}.c-br::after{bottom:-3px;right:-3px;background:#ff0080;box-shadow:0 0 10px #ff0080;}
        .login-box:hover .corner{width:30px;height:30px;}
        .header{text-align:center;margin-bottom:35px;}
        .logo-img{max-width:200px;height:auto;margin-bottom:15px;filter:drop-shadow(0 0 20px rgba(0,180,255,0.6));animation:glowPulse 3s ease-in-out infinite;}
        @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 20px rgba(0,180,255,0.6))}50%{filter:drop-shadow(0 0 30px rgba(168,85,247,0.8))}}
        .subtitle{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.85rem;letter-spacing:2px;text-transform:uppercase;}
        .access-text{color:#00b4ff;font-size:1rem;margin-top:15px;font-weight:bold;min-height:1.5em;animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .cursor-blink{display:inline-block;width:8px;height:16px;background:#00ff88;margin-left:4px;animation:cb 1s step-end infinite;vertical-align:middle;}
        @keyframes cb{0%,50%{opacity:1}51%,100%{opacity:0}}
        .live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);border-radius:20px;padding:4px 12px;font-size:0.75rem;color:#00ff88;margin-top:10px;}
        .live-dot{width:6px;height:6px;background:#00ff88;border-radius:50%;animation:ld 1.2s ease-in-out infinite;box-shadow:0 0 8px #00ff88;}
        @keyframes ld{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}}
        .sys-info{background:rgba(0,20,40,0.6);border:1px solid rgba(0,180,255,0.3);border-radius:4px;padding:10px;margin-top:20px;font-size:0.75rem;color:#00ff88;text-align:left;}
        .sys-row{display:flex;justify-content:space-between;margin:3px 0;opacity:0;animation:fl 0.5s ease forwards;}
        .sys-row:nth-child(1){animation-delay:0.1s}.sys-row:nth-child(2){animation-delay:0.2s}.sys-row:nth-child(3){animation-delay:0.3s}
        @keyframes fl{to{opacity:1}}
        .sys-k{color:${lm?"#3a4a8a":"#7da3ff"};}
        .load-bar{width:100%;height:3px;background:rgba(0,40,80,0.5);border-radius:2px;overflow:hidden;margin-top:15px;}
        .load-fill{height:100%;background:linear-gradient(90deg,#00b4ff,#a855f7,#00ff88);animation:lp 2s ease-in-out infinite;}
        @keyframes lp{0%{width:0%;transform:translateX(0)}50%{width:100%;transform:translateX(0)}100%{width:100%;transform:translateX(100%)}}
        .fg{margin-bottom:25px;}
        .flabel{display:flex;align-items:center;gap:8px;color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.85rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;}
        .fdot{width:8px;height:8px;background:#00b4ff;border-radius:50%;box-shadow:0 0 10px #00b4ff;animation:dp 2s ease-in-out infinite;flex-shrink:0;}
        @keyframes dp{0%,100%{box-shadow:0 0 10px #00b4ff}50%{box-shadow:0 0 20px #00b4ff,0 0 30px #00b4ff}}
        .iwrap{position:relative;}
        .finput{width:100%;padding:15px 40px 15px 45px;background:${lm?"rgba(200,220,255,0.4)":"rgba(0,30,60,0.4)"};border:1px solid rgba(0,180,255,0.5);border-radius:6px;color:${lm?"#0a0e27":"#fff"};font-size:1rem;font-family:'Courier New',monospace;transition:all 0.3s;}
        .finput:focus{outline:none;border-color:#00e0ff;box-shadow:0 0 20px rgba(0,180,255,0.5),inset 0 0 10px rgba(0,180,255,0.1);}
        .finput::placeholder{color:rgba(125,163,255,0.5);}
        .ficon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#00b4ff;font-size:1.1rem;}
        .fstatus{position:absolute;right:15px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;transition:all 0.3s;}
        .pw-wrap{margin-top:7px;}.pw-track{height:3px;background:rgba(0,40,80,0.4);border-radius:2px;overflow:hidden;margin-bottom:4px;}.pw-fill{height:100%;border-radius:2px;transition:width 0.3s,background 0.3s;}.pw-lbl{font-size:0.7rem;letter-spacing:1px;}
        .btn-login{width:100%;padding:15px;background:linear-gradient(135deg,#00b4ff,#a855f7,#0066ff);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:1.1rem;font-weight:bold;text-transform:uppercase;letter-spacing:2px;cursor:none;transition:all 0.3s;position:relative;overflow:hidden;font-family:'Courier New',monospace;}
        .btn-login::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s;}
        .btn-login:hover::before{left:100%}.btn-login:hover{box-shadow:0 0 30px rgba(0,180,255,0.6),0 0 60px rgba(168,85,247,0.4);transform:translateY(-2px)}.btn-login:active{transform:translateY(0)}
        .sec-panel{display:flex;justify-content:space-between;margin-top:20px;padding:12px;background:rgba(0,20,40,0.4);border:1px solid rgba(0,180,255,0.2);border-radius:4px;font-size:0.75rem;}
        .sec-item{display:flex;align-items:center;gap:6px;color:${lm?"#3a4a8a":"#7da3ff"};}
        .sec-ok{color:#00ff88;}
        .nav-links{display:flex;justify-content:space-between;margin-top:25px;font-size:0.85rem;}
        .nav-links a{color:${lm?"#3a4a8a":"#7da3ff"};text-decoration:none;transition:color 0.3s;position:relative;}
        .nav-links a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1px;background:#00b4ff;transition:width 0.3s;}
        .nav-links a:hover{color:#00b4ff}.nav-links a:hover::after{width:100%}
        .rem-row{display:flex;align-items:center;margin-bottom:25px;}
        .rem-row input{width:auto;margin-right:10px;accent-color:#00b4ff;}
        .rem-row label{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.85rem;}
        .content-section{width:100%;max-width:1200px;margin:20px 0;}
        .section-header{font-size:1.5rem;color:#00b4ff;margin-bottom:20px;text-align:center;letter-spacing:3px;text-transform:uppercase;position:relative;padding-bottom:10px;}
        .section-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100px;height:2px;background:linear-gradient(90deg,transparent,#00b4ff,transparent);}
        .section-header:hover{animation:glitch 0.4s ease;}
        @keyframes glitch{0%{text-shadow:none}20%{text-shadow:-2px 0 #ff0080,2px 0 #00ff88;transform:translate(-1px,0)}40%{text-shadow:2px 0 #ff0080,-2px 0 #00ff88;transform:translate(1px,0)}60%{text-shadow:-1px 0 #a855f7;transform:translate(-1px,0)}80%{text-shadow:1px 0 #00b4ff;transform:translate(0)}100%{text-shadow:none;transform:translate(0)}}
        .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:30px;}
        .feature-card{background:${lm?"rgba(255,255,255,0.7)":"rgba(10,14,39,0.7)"};border:1px solid rgba(0,180,255,0.3);border-radius:8px;padding:25px;position:relative;overflow:hidden;}
        .feature-card::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,180,255,0.08),transparent);transition:left 0.5s;}
        .feature-card:hover::before{left:100%}
        .feature-card::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;transition:width 0.4s ease;}
        .feature-card:hover::after{width:100%}
        .feature-card:nth-child(1)::after{background:linear-gradient(90deg,#00b4ff,#a855f7)}.feature-card:nth-child(2)::after{background:linear-gradient(90deg,#a855f7,#00ff88)}.feature-card:nth-child(3)::after{background:linear-gradient(90deg,#00ff88,#ff0080)}.feature-card:nth-child(4)::after{background:linear-gradient(90deg,#ff0080,#ffaa00)}.feature-card:nth-child(5)::after{background:linear-gradient(90deg,#ffaa00,#00b4ff)}.feature-card:nth-child(6)::after{background:linear-gradient(90deg,#00b4ff,#00ff88)}
        .feature-icon{font-size:2.5rem;margin-bottom:15px;background:linear-gradient(135deg,#00b4ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .feature-title{font-size:1.1rem;color:#00b4ff;margin-bottom:10px;font-weight:bold;}
        .feature-desc{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.9rem;line-height:1.6;}
        .stats-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:30px;}
        .stat-box{background:${lm?"rgba(200,220,255,0.5)":"rgba(0,20,40,0.6)"};border:1px solid rgba(0,180,255,0.4);border-radius:8px;padding:20px;text-align:center;position:relative;overflow:hidden;transition:all 0.3s;}
        .stat-box::after{content:'';position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#00b4ff,#a855f7,#00ff88);}
        .stat-box:hover{transform:translateY(-5px)}
        .stat-number{font-size:2.5rem;font-weight:bold;background:linear-gradient(135deg,#00b4ff,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;}
        .stat-label{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.9rem;text-transform:uppercase;letter-spacing:1px;}
        .news-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px;}
        .nf-btn{background:rgba(0,20,40,0.5);border:1px solid rgba(0,180,255,0.3);border-radius:20px;padding:6px 16px;color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.75rem;font-family:'Courier New',monospace;cursor:none;transition:all 0.3s;letter-spacing:1px;}
        .nf-btn.active,.nf-btn:hover{background:rgba(0,80,160,0.5);border-color:#00b4ff;color:#00b4ff;box-shadow:0 0 10px rgba(0,180,255,0.2);}
        .news-item{background:${lm?"rgba(255,255,255,0.7)":"rgba(10,14,39,0.7)"};border-left:3px solid #00b4ff;padding:20px;margin-bottom:15px;border-radius:4px;transition:all 0.3s;}
        .news-item:hover{border-left-color:#a855f7;transform:translateX(5px)}
        .news-cat{display:inline-block;background:rgba(0,180,255,0.1);border:1px solid rgba(0,180,255,0.3);border-radius:4px;padding:2px 8px;font-size:0.7rem;color:#00b4ff;letter-spacing:1px;margin-bottom:8px;}
        .news-date{color:#00ff88;font-size:0.8rem;margin-bottom:8px}.news-title{color:#00b4ff;font-size:1.1rem;margin-bottom:8px;font-weight:bold}.news-desc{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.9rem;line-height:1.5;}
        .timeline{margin-top:30px;position:relative;padding-left:40px;}
        .timeline::before{content:'';position:absolute;left:15px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#00b4ff,#a855f7,#00ff88,#ff0080,#ffaa00);}
        .timeline-item{position:relative;margin-bottom:30px;padding:20px;background:${lm?"rgba(255,255,255,0.7)":"rgba(10,14,39,0.7)"};border-radius:8px;border:1px solid rgba(0,180,255,0.3);transition:all 0.3s;}
        .timeline-item:hover{transform:translateX(4px);box-shadow:0 4px 20px rgba(0,0,0,0.3)}
        .tl-dot{position:absolute;left:-33px;top:25px;width:12px;height:12px;border-radius:50%;border:2px solid ${lm?"#f0f4ff":"#0a0e27"};}
        .event-date{color:#00ff88;font-size:0.85rem;margin-bottom:8px}.event-title{font-size:1.1rem;margin-bottom:8px;font-weight:bold}.event-location{color:#a855f7;font-size:0.85rem;margin-bottom:10px}.event-desc{color:${lm?"#3a4a8a":"#7da3ff"};font-size:0.9rem;line-height:1.5;}
        .countdown{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
        .countdown-unit{background:rgba(0,20,55,0.6);border:1px solid;border-radius:6px;padding:8px 12px;text-align:center;min-width:55px;}
        .countdown-num{font-size:1.4rem;font-weight:bold;line-height:1}.countdown-label{font-size:0.6rem;color:#7da3ff;letter-spacing:1px;margin-top:3px;}
        .rsvp-btn{background:transparent;border:1px solid;border-radius:6px;padding:8px 20px;font-size:0.8rem;font-family:'Courier New',monospace;cursor:none;transition:all 0.3s;letter-spacing:1px;}
        .rsvp-btn:hover{opacity:0.8;transform:translateY(-2px)}.rsvp-btn.rsvpd{background:rgba(0,255,136,0.1)!important;border-color:rgba(0,255,136,0.4)!important;color:#00ff88!important;}
        .quick-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:30px;}
        .q-link{background:${lm?"rgba(200,220,255,0.4)":"rgba(0,20,40,0.6)"};border:1px solid rgba(0,180,255,0.3);border-radius:6px;padding:15px;text-align:center;color:${lm?"#3a4a8a":"#7da3ff"};transition:all 0.3s;font-size:0.9rem;cursor:none;font-family:'Courier New',monospace;}
        .q-link:hover{border-color:#00b4ff;color:#00b4ff;transform:translateY(-3px);box-shadow:0 5px 20px rgba(0,180,255,0.3)}
        .q-icon{font-size:1.5rem;margin-bottom:8px;display:block;}
        .status-bar{position:fixed;bottom:0;left:0;width:100%;background:rgba(0,20,40,0.95);border-top:1px solid #00b4ff;padding:10px 20px;display:flex;justify-content:space-between;font-size:0.7rem;color:#7da3ff;z-index:3;backdrop-filter:blur(10px);font-family:'Courier New',monospace;flex-wrap:wrap;gap:6px;align-items:center;}
        .s-item{display:flex;align-items:center;gap:6px;}
        .s-dot{width:8px;height:8px;border-radius:50%;animation:sdot 1.5s ease-in-out infinite;}
        .s-dot.g{background:#00ff00;box-shadow:0 0 8px #00ff00}.s-dot.p{background:#a855f7;box-shadow:0 0 8px #a855f7;animation-delay:0.3s}.s-dot.c{background:#00b4ff;box-shadow:0 0 8px #00b4ff;animation-delay:0.6s}
        @keyframes sdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
        .mbar{width:60px;height:4px;background:rgba(0,60,120,0.5);border-radius:2px;overflow:hidden;margin-left:5px;}
        .mbar-fill{height:100%;background:linear-gradient(90deg,#00ff88,#00b4ff);animation:mb 3s ease-in-out infinite;}
        @keyframes mb{0%,100%{width:75%}50%{width:90%}}
        .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .revealed{opacity:1;transform:translateY(0);}
        @media(max-width:600px){.login-box{padding:35px 20px}.ctrl-wrap{top:10px;right:10px}.status-bar{flex-wrap:wrap;gap:6px;padding:8px 12px}.countdown-unit{min-width:46px;padding:6px 8px}.countdown-num{font-size:1.1rem}}
      `}</style>

      <canvas ref={canvasRef} id="matrix-canvas"/>
      <canvas ref={confettiCanvas} id="confetti-canvas"/>
      <div ref={cursorRef} id="custom-cursor"/>
      <div className="hex-grid"/>

      <svg className="circuit-bg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
            <path d="M10 10L60 10L60 60L110 60" stroke="#00b4ff" strokeWidth="1.5" fill="none"/>
            <path d="M150 10L200 10L200 80L250 80" stroke="#00b4ff" strokeWidth="1.5" fill="none"/>
            <path d="M10 150L80 150L80 200L140 200" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
            <path d="M180 120L240 120L240 180L290 180" stroke="#a855f7" strokeWidth="1.5" fill="none"/>
            <path d="M50 250L100 250L100 290" stroke="#00ff88" strokeWidth="1.5" fill="none"/>
            <path d="M200 230L260 230L260 270" stroke="#00ff88" strokeWidth="1.5" fill="none"/>
            <circle cx="60" cy="10" r="4" fill="#00b4ff" opacity="0.8"/><circle cx="60" cy="60" r="4" fill="#00b4ff" opacity="0.8"/>
            <circle cx="200" cy="10" r="4" fill="#00b4ff" opacity="0.8"/><circle cx="80" cy="150" r="4" fill="#a855f7" opacity="0.8"/>
            <circle cx="240" cy="120" r="4" fill="#a855f7" opacity="0.8"/><circle cx="100" cy="250" r="4" fill="#00ff88" opacity="0.8"/>
            <rect x="108" y="58" width="6" height="6" fill="#00b4ff" opacity="0.6"/><rect x="138" y="198" width="6" height="6" fill="#a855f7" opacity="0.6"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)"/>
      </svg>

      <div className="ctrl-wrap">
        <button className="ctrl-btn" onClick={()=>setSearchOpen(true)}>⌕ SEARCH <span style={{color:"#00ff88",fontSize:"0.65rem"}}>[/]</span></button>
        <button className="ctrl-btn" onClick={()=>setLightMode(l=>!l)}>{lightMode?"◐ DARK":"◑ LIGHT"}</button>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={()=>setSearchOpen(false)}>
          <div className="search-box" onClick={e=>e.stopPropagation()}>
            <div style={{color:"#00b4ff",fontSize:"0.75rem",marginBottom:10,letterSpacing:2}}>⌕ SEARCH ACM DATABASE</div>
            <input className="search-input" placeholder="Search events, news, workshops..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} autoFocus/>
            <div style={{color:"#7da3ff",fontSize:"0.72rem",marginTop:8}}>ESC to close · / to reopen</div>
            {searchQuery && (() => {
              const all = [...NEWS,...EVENTS.map(e=>({...e,cat:"EVENT"}))];
              const res = all.filter(x=>x.title.toLowerCase().includes(searchQuery.toLowerCase())||x.desc.toLowerCase().includes(searchQuery.toLowerCase()));
              return res.length>0 ? res.map((item,i)=>(
                <div className="search-result" key={i}>
                  <div style={{color:"#00ff88",fontSize:"0.7rem",marginBottom:3}}>{item.cat}</div>
                  <div style={{color:"#00b4ff",fontSize:"0.9rem",fontWeight:"bold"}}>{item.title}</div>
                  <div style={{color:"#7da3ff",fontSize:"0.78rem",marginTop:3}}>{item.desc.slice(0,90)}...</div>
                </div>
              )) : <div style={{color:"#7da3ff",textAlign:"center",padding:18}}>No results for "{searchQuery}"</div>;
            })()}
          </div>
        </div>
      )}

      <div className="ticker-wrap">
        <div className="ticker-label">📡 LIVE</div>
        <div className="ticker-track">
          {[...Array(2)].flatMap(()=>TICKER_MSGS.map((msg,i)=><div key={i} className="ticker-item"><em>◆</em> {msg} &nbsp;&nbsp;</div>))}
        </div>
      </div>

      <div className="container">
        <div className="login-box" style={loginBoxStyle}>
          <div className="corner c-tl"/><div className="corner c-tr"/>
          <div className="corner c-bl"/><div className="corner c-br"/>
          <div className="header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Association_for_Computing_Machinery_%28ACM%29_logo.svg/2560px-Association_for_Computing_Machinery_%28ACM%29_logo.svg.png" alt="ACM Logo" className="logo-img"/>
            <div className="subtitle">Association for Computing Machinery</div>
            <div className="access-text">{typeText}<span className="cursor-blink"/></div>
            <div className="live-badge"><span className="live-dot"/><span style={{color:"#00ff88"}}>{memberCount}</span>&nbsp;members online</div>
            <div className="sys-info">
              <div className="sys-row"><span className="sys-k">SYSTEM:</span><span>ACM-AUTH-v4.2</span></div>
              <div className="sys-row"><span className="sys-k">ENCRYPTION:</span><span>AES-256 ACTIVE</span></div>
              <div className="sys-row"><span className="sys-k">PROTOCOL:</span><span>TLS 1.3 SECURE</span></div>
            </div>
            <div className="load-bar"><div className="load-fill"/></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="fg">
              <div className="flabel"><span className="fdot"/>User ID</div>
              <div className="iwrap">
                <span className="ficon">▶</span>
                <input className="finput" type="text" placeholder="Enter member ID" value={username} onChange={e=>handleInput(e.target.value,setUsername,setUStatus)} required/>
                <div className="fstatus" style={uStatus}/>
              </div>
            </div>
            <div className="fg">
              <div className="flabel"><span className="fdot"/>Access Code</div>
              <div className="iwrap">
                <span className="ficon">⬢</span>
                <input className="finput" type="password" placeholder="Enter access code" value={password} onChange={e=>handleInput(e.target.value,setPassword,setPStatus)} required/>
                <div className="fstatus" style={pStatus}/>
              </div>
              {password && <div className="pw-wrap"><div className="pw-track"><div className="pw-fill" style={{width:`${(pwStrength.score/4)*100}%`,background:pwStrength.color}}/></div><div className="pw-lbl" style={{color:pwStrength.color}}>STRENGTH: {pwStrength.label}</div></div>}
            </div>
            <div className="rem-row"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><label>Remember this device</label></div>
            <button type="submit" className="btn-login" style={btnStyle}>{btnText}</button>
            <div className="sec-panel">
              <div className="sec-item"><span className="sec-ok">✓</span> SSL Verified</div>
              <div className="sec-item"><span className="sec-ok">✓</span> 2FA Ready</div>
              <div className="sec-item"><span className="sec-ok">✓</span> Encrypted</div>
            </div>
            <div className="nav-links"><a href="#">Forgot Access Code?</a><a href="#">Request Access</a></div>
          </form>
        </div>

        <section className="content-section reveal">
          <h2 className="section-header">🚀 Member Benefits</h2>
          <div className="features-grid">
            {FEATURES.map((f,i)=>(
              <TiltCard className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </TiltCard>
            ))}
          </div>
        </section>

        <section className="content-section reveal">
          <h2 className="section-header">📊 Society Stats</h2>
          <div className="stats-container">
            {STATS.map((s,i)=>(
              <div className="stat-box" key={i}>
                <div className="stat-number">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section reveal">
          <h2 className="section-header">📰 Latest Updates</h2>
          <div className="news-filters">
            {["ALL","TECH TALK","HACKATHON","STUDY GROUP","COMPETITION"].map(f=>(
              <button key={f} className={`nf-btn${newsFilter===f?" active":""}`} onClick={()=>setNewsFilter(f)}>{f}</button>
            ))}
          </div>
          <div>
            {filtered.length===0 ? <div style={{color:"#7da3ff",textAlign:"center",padding:30}}>No items in this category.</div>
              : filtered.map((n,i)=>(
                <div className="news-item" key={i}>
                  <div className="news-cat">{n.cat}</div>
                  <div className="news-date">⏰ {n.time}</div>
                  <div className="news-title">{n.title}</div>
                  <div className="news-desc">{n.desc}</div>
                </div>
              ))}
          </div>
        </section>

        <section className="content-section reveal">
          <h2 className="section-header">📅 Upcoming Events</h2>
          <div className="timeline">
            {EVENTS.map((ev,i)=><EventItem key={i} ev={ev} idx={i}/>)}
          </div>
        </section>

        <section className="content-section reveal">
          <h2 className="section-header">🔗 Quick Access</h2>
          <div className="quick-links">
            {LINKS.map((l,i)=>(
              <div className="q-link" key={i}><span className="q-icon">{l.icon}</span>{l.lbl}</div>
            ))}
          </div>
        </section>
      </div>

      <div className="status-bar">
        <div className="s-item"><span className="s-dot g"/><span>SYSTEM ONLINE</span></div>
        <div className="s-item"><span className="s-dot p"/><span>AUTH: READY</span></div>
        <div className="s-item"><span>CPU</span><div className="mbar"><div className="mbar-fill"/></div></div>
        <div className="s-item"><span className="s-dot c"/><span>NET: STABLE</span></div>
        <div className="s-item"><span style={{color:"#00ff88"}}>◉</span><span>{memberCount} ONLINE</span></div>
        <div className="s-item"><span>{currentTime}</span></div>
      </div>
    </>
  );
}

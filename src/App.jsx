import { useState, useEffect, useRef, useCallback } from "react";

const ALL_NAMES = [
  "آدم","أحمد","أسوة","أسلم","ألما","أيوب","أروى",
  "بيرم","حلمي","دخيل","رتاج","قصي",
  "محمد ياسين","مرام","ميرال","محمد توفيق","محمد عزيز","هدير","يوسف"
];
const SECRET_PICKS = ["محمد ياسين","مرام","ميرال","محمد عزيز","أحمد","آدم","أسوة","هديل"];
const COLORS = ["#FF3CAC","#F9C74F","#43E97B","#4CC9F0","#FF6B35","#C77DFF","#FF4D6D","#00F5D4"];
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MODES = [
  { id: "wheel", label: "العجلة",   emoji: "🎡" },
  { id: "slot",  label: "السحب",    emoji: "🎰" },
  { id: "cards", label: "البطاقات", emoji: "🃏" },
];

const THEMES = [
  { id: "carnival", label: "كرنفال", emoji: "🎪", bg: "#0D0D1A", accent: "#FF3CAC", card: "#1C1C35" },
  { id: "ocean",    label: "المحيط", emoji: "🌊", bg: "#020B18", accent: "#4CC9F0", card: "#051628" },
  { id: "jungle",   label: "الغابة", emoji: "🌴", bg: "#071A0E", accent: "#43E97B", card: "#0D2415" },
  { id: "sunset",   label: "الغروب", emoji: "🌅", bg: "#1A080D", accent: "#FF6B35", card: "#2A100A" },
  { id: "galaxy",   label: "المجرة", emoji: "🌌", bg: "#050510", accent: "#C77DFF", card: "#0D0B20" },
];

function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) return;
    setPieces(Array.from({ length: 55 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.random() * 10,
      delay: Math.random() * 0.6,
      dur: 1.4 + Math.random() * 1,
      shape: Math.random() > 0.5 ? "50%" : "2px",
      drift: (Math.random() - 0.5) * 160,
      rot: Math.random() * 360,
    })));
    const t = setTimeout(() => setPieces([]), 3200);
    return () => clearTimeout(t);
  }, [active]);
  return <>
    {pieces.map(p => (
      <div key={p.id} style={{
        position:"fixed", left:`${p.x}%`, top:"-20px",
        width: p.shape==="50%" ? p.size : p.size*0.55, height: p.size,
        borderRadius: p.shape, background: p.color,
        pointerEvents:"none", zIndex:9999,
        "--drift":`${p.drift}px`,
        animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        transform:`rotate(${p.rot}deg)`,
      }}/>
    ))}
  </>;
}

function WinnerOverlay({ name, accent, onClose }) {
  if (!name) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.88)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      cursor:"pointer",
      animation:"overlayIn 0.35s ease both",
    }}>
      <div style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", gap:24,
        animation:"winnerPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <div style={{
          fontSize:"clamp(4rem,18vw,10rem)",
          lineHeight:1, fontWeight:900,
          fontFamily:"Cairo,sans-serif",
          color:"white",
          textShadow:`0 0 80px ${accent}, 0 0 160px ${accent}88, 0 8px 0 ${accent}44`,
          textAlign:"center",
          padding:"0 20px",
          animation:"namePulse 1.2s ease-in-out infinite",
        }}>{name}</div>
        <div style={{ fontSize:"clamp(1.6rem,5vw,3rem)", display:"flex", gap:12 }}>
          {["🏆","🌟","🎉","🌟","🏆"].map((e,i)=>(
            <span key={i} style={{
              display:"inline-block",
              animation:`trophyBounce ${0.6+i*0.1}s ${i*0.1}s ease-in-out infinite`,
            }}>{e}</span>
          ))}
        </div>
        
      </div>
    </div>
  );
}

function WheelMode({ onResult, accent, cardBg }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const N = ALL_NAMES.length;
  const sliceAngle = (2 * Math.PI) / N;

  const draw = useCallback((angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 8;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.shadowColor = accent + "99"; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = cardBg; ctx.fill();
    ctx.restore();
    for (let i = 0; i < N; i++) {
      const start = angle + i * sliceAngle, end = start + sliceAngle;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length] + "dd"; ctx.fill();
      ctx.strokeStyle = cardBg; ctx.lineWidth = 2; ctx.stroke();
      const mid = start + sliceAngle / 2;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.font = `bold ${N > 14 ? 11 : 13}px Cairo,sans-serif`;
      ctx.fillStyle = "white";
      ctx.shadowColor = "#00000088"; ctx.shadowBlur = 4;
      ctx.fillText(ALL_NAMES[i], r - 10, 4);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI*2);
    ctx.fillStyle = cardBg; ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "white"; ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🎯", cx, cy);
  }, [N, sliceAngle, accent, cardBg]);

  useEffect(() => { draw(angleRef.current); }, [draw]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const finalName = pickRandom(SECRET_PICKS);
    const finalIdx = ALL_NAMES.indexOf(finalName);
    const targetAngle = -(finalIdx * sliceAngle + sliceAngle / 2);
    const currentMod = ((angleRef.current % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const targetMod  = ((targetAngle   % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    let delta = targetMod - currentMod;
    if (delta > 0) delta -= 2*Math.PI;
    const extraSpins = -(5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const totalDelta = delta + extraSpins;
    const duration = 4000 + Math.random() * 1000;
    const startAngle = angleRef.current;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      angleRef.current = startAngle + totalDelta * ease;
      draw(angleRef.current);
      if (t < 1) { rafRef.current = requestAnimationFrame(animate); }
      else {
        angleRef.current = startAngle + totalDelta;
        draw(angleRef.current);
        setSpinning(false); onResult(finalName);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <div style={{position:"relative", display:"inline-block"}}>
        <div style={{
          position:"absolute", top:"50%", right:-20,
          transform:"translateY(-50%)",
          width:0, height:0,
          borderTop:"15px solid transparent",
          borderBottom:"15px solid transparent",
          borderRight:`28px solid ${accent}`,
          filter:`drop-shadow(0 0 8px ${accent})`,
          zIndex:10,
        }}/>
        <canvas ref={canvasRef} width={280} height={280}
          style={{borderRadius:"50%", display:"block"}}/>
      </div>
      <button onClick={spin} disabled={spinning} style={{
        background:`linear-gradient(135deg,${accent},${COLORS[3]})`,
        border:"none", borderRadius:60, padding:"14px 48px",
        fontSize:"1.3rem", fontWeight:900, color:"white",
        fontFamily:"Cairo,sans-serif", cursor:spinning?"not-allowed":"pointer",
        boxShadow:`0 6px 0 ${accent}66,0 8px 30px ${accent}88`,
        transform:spinning?"translateY(3px)":"none",
        transition:"all 0.15s", opacity:spinning?0.7:1,
      }}>{spinning ? "⏳ تدور..." : "🎡 أدر العجلة!"}</button>
    </div>
  );
}

function SlotMode({ onResult, accent, cardBg }) {
  const [cols, setCols] = useState([0,0,0]);
  const [spinning, setSpinning] = useState(false);
  const timers = useRef([]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const finalName = pickRandom(SECRET_PICKS);
    timers.current.forEach(clearInterval);
    timers.current = [0,1,2].map(ci =>
      setInterval(() => {
        setCols(prev => { const n=[...prev]; n[ci]=Math.floor(Math.random()*ALL_NAMES.length); return n; });
      }, 60)
    );
    [900,1300,1700].forEach((delay, ci) => {
      setTimeout(() => {
        clearInterval(timers.current[ci]);
        if (ci === 2) {
          const idx = ALL_NAMES.indexOf(finalName);
          setCols(prev => { const n=[...prev]; n[2]=idx; return n; });
          setSpinning(false); onResult(finalName);
        }
      }, delay);
    });
  };
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{
        background:cardBg, border:`3px solid ${accent}`, borderRadius:24,
        padding:"28px 24px 20px", boxShadow:`0 0 40px ${accent}44`,
        display:"flex", flexDirection:"column", alignItems:"center", gap:16,
      }}>
        <div style={{fontSize:"0.75rem",letterSpacing:4,color:accent,fontWeight:800,marginBottom:4}}>
          🎰 سلوت الأسماء
        </div>
        <div style={{display:"flex",gap:10}}>
          {cols.map((idx,ci) => (
            <div key={ci} style={{
              width:80,height:80,borderRadius:12,background:"#00000055",
              border:`2px solid ${COLORS[ci*2%COLORS.length]}66`,
              display:"flex",alignItems:"center",justifyContent:"center",
              overflow:"hidden",position:"relative",
            }}>
              <div style={{
                color:"white",fontWeight:900,fontSize:"0.85rem",
                fontFamily:"Cairo,sans-serif",textAlign:"center",padding:"0 4px",
                animation:spinning&&ci<2?"slotSpin 0.06s linear infinite":"none",
                textShadow:`0 0 12px ${COLORS[ci*2%COLORS.length]}`,
              }}>{ALL_NAMES[idx]}</div>
              <div style={{
                position:"absolute",inset:0,
                backgroundImage:"repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
                pointerEvents:"none",
              }}/>
            </div>
          ))}
        </div>
        <button onClick={spin} disabled={spinning} style={{
          background:`linear-gradient(135deg,#FF6B35,${accent})`,
          border:"none",borderRadius:50,padding:"12px 40px",
          fontSize:"1.15rem",fontWeight:900,color:"white",
          fontFamily:"Cairo,sans-serif",cursor:spinning?"not-allowed":"pointer",
          boxShadow:`0 5px 0 #00000055,0 6px 20px ${accent}66`,
          transition:"all 0.1s",opacity:spinning?0.7:1,
          transform:spinning?"translateY(3px)":"none",
        }}>{spinning ? "⏳" : "🎰 اسحب!"}</button>
      </div>
    </div>
  );
}

function CardsMode({ onResult, accent, cardBg }) {
  const [cards, setCards] = useState(() =>
    ALL_NAMES.map((n,i) => ({name:n,flipped:false,id:i,color:COLORS[i%COLORS.length]}))
  );
  const [rolling, setRolling] = useState(false);

  const shuffle = () => {
    if (rolling) return;
    setRolling(true);
    setCards(prev => prev.map(c => ({...c,flipped:false})));
    const final = pickRandom(SECRET_PICKS);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i > 14) {
        clearInterval(interval);
        const idx = ALL_NAMES.indexOf(final);
        setTimeout(() => {
          setCards(prev => prev.map((c,ci) => ({...c,flipped:ci===idx})));
          setRolling(false); onResult(final);
        }, 300);
      }
    }, 120);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,maxWidth:340}}>
        {cards.map(c => (
          <div key={c.id} style={{width:60,height:80,borderRadius:10,perspective:600}}>
            <div style={{
              width:"100%",height:"100%",position:"relative",
              transformStyle:"preserve-3d",
              transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              transform:c.flipped?"rotateY(180deg)":"rotateY(0deg)",
            }}>
              <div style={{
                position:"absolute",inset:0,borderRadius:10,
                background:`linear-gradient(135deg,${accent}33,${cardBg})`,
                border:`2px solid ${accent}44`,backfaceVisibility:"hidden",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",
              }}>🎴</div>
              <div style={{
                position:"absolute",inset:0,borderRadius:10,
                background:`linear-gradient(135deg,${c.color},${COLORS[(c.id+3)%COLORS.length]})`,
                border:`2px solid ${c.color}`,backfaceVisibility:"hidden",
                transform:"rotateY(180deg)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexDirection:"column",padding:4,
                boxShadow:`0 0 20px ${c.color}99`,
              }}>
                <div style={{fontSize:"1rem",marginBottom:2}}>⭐</div>
                <div style={{
                  color:"white",fontWeight:900,fontSize:"0.72rem",
                  fontFamily:"Cairo,sans-serif",textAlign:"center",
                  textShadow:"0 1px 4px #00000077",
                }}>{c.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={shuffle} disabled={rolling} style={{
        background:`linear-gradient(135deg,${accent},#F9C74F)`,
        border:"none",borderRadius:50,padding:"14px 44px",
        fontSize:"1.2rem",fontWeight:900,color:"white",
        fontFamily:"Cairo,sans-serif",cursor:rolling?"not-allowed":"pointer",
        boxShadow:`0 5px 0 ${accent}66,0 8px 30px ${accent}66`,
        opacity:rolling?0.7:1,transition:"all 0.15s",
      }}>{rolling ? "⏳ يختار..." : "🃏 اقلب البطاقات!"}</button>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("wheel");
  const [themeId, setThemeId] = useState("carnival");
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modeKey, setModeKey] = useState(0);
  const theme = THEMES.find(t => t.id === themeId);

  const handleResult = (name) => {
    setResult(name);
    setShowConfetti(true);
    setShowOverlay(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  const switchMode  = (m) => { setMode(m);    setResult(null); setModeKey(k=>k+1); };
  const switchTheme = (t) => { setThemeId(t); setResult(null); setModeKey(k=>k+1); };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:theme.bg, fontFamily:"Cairo,Tajawal,sans-serif",
      direction:"rtl", position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes confettiFall{
          0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:1;}
          100%{transform:translateY(110vh) rotate(720deg) translateX(var(--drift));opacity:0;}
        }
        @keyframes overlayIn{ from{opacity:0;} to{opacity:1;} }
        @keyframes winnerPop{
          0%{transform:scale(0.3) rotate(-8deg);opacity:0;}
          60%{transform:scale(1.08) rotate(2deg);}
          80%{transform:scale(0.96) rotate(-1deg);}
          100%{transform:scale(1) rotate(0deg);opacity:1;}
        }
        @keyframes namePulse{
          0%,100%{transform:scale(1);} 50%{transform:scale(1.04);}
        }
        @keyframes trophyBounce{
          0%,100%{transform:translateY(0) rotate(-5deg) scale(1);}
          40%{transform:translateY(-14px) rotate(5deg) scale(1.15);}
        }
        @keyframes slotSpin{
          0%{transform:translateY(-4px);} 50%{transform:translateY(4px);} 100%{transform:translateY(-4px);}
        }
        @keyframes fadeSlide{
          from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);}
        }
        .sidebar-btn{
          display:flex;align-items:center;gap:10px;
          padding:11px 14px;border-radius:14px;border:2px solid transparent;
          cursor:pointer;width:100%;
          font-family:Cairo,sans-serif;font-size:0.9rem;font-weight:700;
          transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);text-align:right;
        }
        .sidebar-btn:hover{transform:scale(1.04) translateX(-3px);}
        .mode-area{animation:fadeSlide 0.4s ease both;}
      `}</style>

      <Confetti active={showConfetti}/>
      {showOverlay && (
        <WinnerOverlay name={result} accent={theme.accent} onClose={() => setShowOverlay(false)}/>
      )}

      {/* Sidebar */}
      <div style={{
        width:sidebarOpen?180:0, minWidth:sidebarOpen?180:0,
        transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden",
        background:`${theme.card}ee`, borderLeft:`2px solid ${theme.accent}33`,
        backdropFilter:"blur(20px)",
        display:"flex", flexDirection:"column",
        padding:sidebarOpen?"20px 12px":0, gap:6, flexShrink:0,
        position:"relative", zIndex:20,
      }}>
        <div style={{fontSize:"0.68rem",letterSpacing:3,color:`${theme.accent}99`,fontWeight:800,marginBottom:4,paddingRight:4,whiteSpace:"nowrap"}}>🎮 الأنماط</div>
        {MODES.map(m => (
          <button key={m.id} className="sidebar-btn" onClick={() => switchMode(m.id)} style={{
            background:mode===m.id?`${theme.accent}22`:"transparent",
            borderColor:mode===m.id?theme.accent:"transparent",
            color:mode===m.id?theme.accent:"#ffffff77",
            boxShadow:mode===m.id?`0 0 16px ${theme.accent}44`:"none",
          }}>
            <span style={{fontSize:"1.2rem"}}>{m.emoji}</span>
            <span style={{whiteSpace:"nowrap"}}>{m.label}</span>
          </button>
        ))}
        <div style={{height:1,background:`${theme.accent}22`,margin:"12px 4px"}}/>
        <div style={{fontSize:"0.68rem",letterSpacing:3,color:`${theme.accent}99`,fontWeight:800,marginBottom:4,paddingRight:4,whiteSpace:"nowrap"}}>🎨 الثيمات</div>
        {THEMES.map(t => (
          <button key={t.id} className="sidebar-btn" onClick={() => switchTheme(t.id)} style={{
            background:themeId===t.id?`${t.accent}22`:"transparent",
            borderColor:themeId===t.id?t.accent:"transparent",
            color:themeId===t.id?t.accent:"#ffffff66",
            boxShadow:themeId===t.id?`0 0 16px ${t.accent}44`:"none",
          }}>
            <span style={{fontSize:"1.2rem"}}>{t.emoji}</span>
            <span style={{whiteSpace:"nowrap"}}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"24px 16px", position:"relative", overflow:"hidden",
      }}>
        <button onClick={() => setSidebarOpen(o=>!o)} style={{
          position:"absolute", top:16, right:16,
          background:`${theme.accent}22`, border:`2px solid ${theme.accent}55`,
          borderRadius:12, width:42, height:42,
          color:theme.accent, fontSize:"1.1rem", cursor:"pointer", zIndex:30,
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
        }}>{sidebarOpen ? "◀" : "▶"}</button>

        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{
            fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:900, color:"white",
            textShadow:`0 0 40px ${theme.accent}cc,0 4px 0 #00000099`,
          }}>🎪 اختيار التلميذ</div>
          <div style={{fontSize:"0.85rem",color:`${theme.accent}99`,letterSpacing:2,marginTop:4,fontWeight:600}}>
            {MODES.find(m=>m.id===mode)?.emoji} {MODES.find(m=>m.id===mode)?.label}
            {" · "}
            {THEMES.find(t=>t.id===themeId)?.emoji} {THEMES.find(t=>t.id===themeId)?.label}
          </div>
        </div>

        <div className="mode-area" key={`${mode}-${themeId}-${modeKey}`}>
          {mode==="wheel" && <WheelMode onResult={handleResult} accent={theme.accent} cardBg={theme.card}/>}
          {mode==="slot"  && <SlotMode  onResult={handleResult} accent={theme.accent} cardBg={theme.card}/>}
          {mode==="cards" && <CardsMode onResult={handleResult} accent={theme.accent} cardBg={theme.card}/>}
        </div>

        {result && !showOverlay && (
          <div style={{
            marginTop:24, display:"flex", flexWrap:"wrap",
            justifyContent:"center", gap:7, maxWidth:580,
            animation:"fadeSlide 0.5s ease both",
          }}>
            {ALL_NAMES.map((name,i) => {
              const isChosen = result===name;
              const color = COLORS[i%COLORS.length];
              return (
                <div key={i} style={{
                  borderRadius:40, padding:"6px 14px",
                  fontSize:"0.82rem", fontWeight:isChosen?900:500,
                  fontFamily:"Cairo,sans-serif",
                  background:isChosen?`linear-gradient(135deg,${color},${COLORS[(i+3)%COLORS.length]})`:"rgba(255,255,255,0.07)",
                  border:`2px solid ${isChosen?color:"rgba(255,255,255,0.1)"}`,
                  color:isChosen?"white":"rgba(255,255,255,0.55)",
                  transform:isChosen?"scale(1.18)":"scale(1)",
                  boxShadow:isChosen?`0 4px 20px ${color}88`:"none",
                  transition:"all 0.3s",
                }}>
                  {isChosen && "⭐ "}{name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
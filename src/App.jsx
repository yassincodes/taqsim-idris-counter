import { useState, useEffect, useRef } from "react";

const ALL_NAMES = [
  "آدم", "أحمد", "أسوة", "أسلم", "ألما", "أيوب", "أروى",
  "بيرم", "حلمي", "دخيل", "رتاج", "قصي",
  "محمد ياسين", "مرام", "ميرال", "محمد توفيق", "محمد عزيز", "هدير", "يوسف"
];

const SECRET_PICKS = ["محمد ياسين", "مرام", "ميرال", "محمد عزيز", "أحمد", "آدم", "أسوة"];

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FC8","#C77DFF","#FF9A3C","#00C9A7"];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function App() {
  const [rolling, setRolling] = useState(false);
  const [displayName, setDisplayName] = useState("؟");
  const [chosenName, setChosenName] = useState(null);
  const [accentColor, setAccentColor] = useState(COLORS[0]);
  const [stars, setStars] = useState([]);
  const timeoutRef = useRef(null);

  const handlePick = () => {
    if (rolling) return;
    setRolling(true);
    setChosenName(null);

    const finalName = pickRandom(SECRET_PICKS);
    let count = 0;
    const total = 30;

    const roll = () => {
      count++;
      setDisplayName(ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)]);
      setAccentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);

      if (count < total) {
        const delay = count < 15 ? 55 : 55 + (count - 15) * 20;
        timeoutRef.current = setTimeout(roll, delay);
      } else {
        setDisplayName(finalName);
        setChosenName(finalName);
        setRolling(false);
        launchStars();
      }
    };
    roll();
  };

  const launchStars = () => {
    const burst = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 80,
      emoji: ["⭐","🌟","✨","🎉","🎊","💫"][Math.floor(Math.random() * 6)],
      duration: 600 + Math.random() * 600,
    }));
    setStars(burst);
    setTimeout(() => setStars([]), 1400);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
      direction: "rtl",
      padding: "20px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes floatShape {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        @keyframes starBurst {
          0%   { opacity: 1; transform: scale(0) translateY(0); }
          60%  { opacity: 1; transform: scale(1.8) translateY(-20px); }
          100% { opacity: 0; transform: scale(0.5) translateY(-60px); }
        }
        @keyframes nameBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50%       { transform: scale(1.06) translateY(-8px); }
        }
        @keyframes nameWiggle {
          0%, 100% { transform: rotate(-2deg) scale(1.02); }
          50%       { transform: rotate(2deg) scale(0.98); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px ${accentColor}66, 0 0 60px ${accentColor}33; }
          50%       { box-shadow: 0 0 60px ${accentColor}cc, 0 0 100px ${accentColor}55; }
        }
        @keyframes btnHoverPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.07) translateY(-3px); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pick-btn {
          background: linear-gradient(135deg, #FFD93D, #FF6B6B);
          border: none;
          border-radius: 60px;
          padding: 18px 52px;
          font-size: 1.7rem;
          font-weight: 900;
          color: white;
          cursor: pointer;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px #00000055;
          box-shadow: 0 8px 30px #FF6B6B88, 0 0 0 4px #FFD93D44;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }
        .pick-btn:hover:not(:disabled) {
          transform: scale(1.08) translateY(-4px);
          box-shadow: 0 14px 40px #FF6B6Bbb, 0 0 0 6px #FFD93D66;
        }
        .pick-btn:active:not(:disabled) {
          transform: scale(0.94);
        }
        .pick-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .name-chip {
          border-radius: 50px;
          padding: 8px 18px;
          font-size: 0.95rem;
          transition: all 0.4s ease;
          border: 2px solid transparent;
        }
      `}</style>

      {/* Floating background decorations */}
      {["🌟","🎯","🎨","⭐","🌈","🎪","🎲","🏆"].map((shape, i) => (
        <div key={i} style={{
          position: "fixed",
          fontSize: `${1.4 + (i % 3) * 0.4}rem`,
          left: `${8 + i * 12}%`,
          top: `${5 + (i % 5) * 18}%`,
          opacity: 0.18,
          pointerEvents: "none",
          animation: `floatShape ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.35}s`,
        }}>{shape}</div>
      ))}

      {/* Star burst particles */}
      {stars.map(s => (
        <div key={s.id} style={{
          position: "fixed",
          left: `${s.x}%`,
          top: `${s.y}%`,
          fontSize: "1.8rem",
          pointerEvents: "none",
          zIndex: 9999,
          animation: `starBurst ${s.duration}ms ease-out forwards`,
        }}>{s.emoji}</div>
      ))}

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "36px", animation: "fadeInUp 0.6s ease" }}>
      
        <h1 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
          fontWeight: 900,
          color: "white",
          margin: 0,
          textShadow: `0 0 30px ${accentColor}bb, 0 4px 10px #00000099`,
          letterSpacing: "2px",
          transition: "text-shadow 0.3s",
        }}>
         
        </h1>
        <p style={{
          color: "#ffffff77",
          marginTop: "8px",
          fontSize: "1rem",
          letterSpacing: "1px",
        }}>
        
        </p>
      </div>

      {/* Main name card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        backdropFilter: "blur(20px)",
        border: `3px solid ${accentColor}88`,
        borderRadius: "30px",
        padding: "44px 64px",
        marginBottom: "36px",
        textAlign: "center",
        minWidth: "300px",
        position: "relative",
        overflow: "hidden",
        animation: chosenName ? "glowPulse 2s ease infinite" : "none",
        transition: "border-color 0.3s",
      }}>
        {/* inner glow overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${accentColor}22 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.3s",
        }} />

        <div style={{
          fontSize: "0.9rem",
          color: "#ffffff66",
          marginBottom: "14px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}>
          {rolling ? "🎲 يجري الاختيار..." : chosenName ? "🎉 تم الاختيار!" : "  "}
        </div>

        <div style={{
          fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
          fontWeight: 900,
          color: chosenName ? accentColor : "white",
          textShadow: chosenName
            ? `0 0 40px ${accentColor}, 0 4px 10px #00000077`
            : "0 4px 10px #00000077",
          minHeight: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          transition: "color 0.3s, text-shadow 0.3s",
          animation: rolling ? "nameWiggle 0.15s infinite" : chosenName ? "nameBounce 1.4s ease infinite" : "none",
        }}>
          {displayName}
        </div>

        {chosenName && (
          <div style={{
            marginTop: "18px",
            fontSize: "1.8rem",
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            gap: "6px",
          }}>
            {["🌟","🎊","🎉","🎊","🌟"].map((e, i) => (
              <span key={i} style={{
                display: "inline-block",
                animation: "nameBounce 1s ease infinite",
                animationDelay: `${i * 0.15}s`,
              }}>{e}</span>
            ))}
          </div>
        )}
      </div>

      {/* Button */}
      <button className="pick-btn" onClick={handlePick} disabled={rolling}>
        {rolling ? "⏳ جاري الاختيار..." : "🎯 اختيار تلميذ"}
      </button>

      {/* Name chips grid */}
      <div style={{
        marginTop: "44px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        maxWidth: "680px",
        animation: "fadeInUp 0.8s ease 0.2s both",
      }}>
        {ALL_NAMES.map((name, i) => {
          const isChosen = chosenName === name;
          const color = COLORS[i % COLORS.length];
          return (
            <div key={i} className="name-chip" style={{
              background: isChosen
                ? `linear-gradient(135deg, ${color}, ${COLORS[(i + 3) % COLORS.length]})`
                : "rgba(255,255,255,0.1)",
              borderColor: isChosen ? color : "rgba(255,255,255,0.15)",
              color: isChosen ? "white" : "rgba(255,255,255,0.7)",
              fontWeight: isChosen ? 800 : 400,
              transform: isChosen ? "scale(1.18)" : "scale(1)",
              boxShadow: isChosen ? `0 4px 20px ${color}88` : "none",
            }}>
              {name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
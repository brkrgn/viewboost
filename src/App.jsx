import { useState, useEffect, useRef } from "react";

// ── Paddle Config ─────────────────────────────────────────────────────────────
const PADDLE_CLIENT_TOKEN = "live_0d2c3a9bad0fd59ffbf68ab6a2f";
const PADDLE_PRICES = {
  daily:  "pri_01kw6jzqzfdht8s6cwkkr036t9",  // $0.99 Günlük Boost
  weekly: "pri_01kw6k23w2dqhkzy32k3sma0am",  // $2.99 Haftalık Pro
};

function initPaddle() {
  if (window.Paddle) {
    window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
  }
}

function openPaddleCheckout(priceId, onSuccess) {
  if (!window.Paddle) { alert("Ödeme sistemi yükleniyor, lütfen tekrar deneyin."); return; }
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    settings: { theme: "dark", locale: "tr" },
    eventCallback: (event) => {
      if (event.name === "checkout.completed") { onSuccess(); }
    },
  });
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  id: "u1", name: "Ahmet Yılmaz",
  avatar: "https://i.pravatar.cc/80?img=11",
  channel: "@ahmetyilmaz",
  points: 340, totalEarned: 920,
  isPro: false, videosWatched: 0,
};

const MOCK_VIDEOS = [
  { id:"v1", title:"React ile Modern Web Uygulamaları", channel:"TechTR", avatar:"https://i.pravatar.cc/40?img=3", thumbnail:"https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", pointsForWatch:5, pointsForLike:10, pointsForSub:20, pointsForComment:15 },
  { id:"v2", title:"Türkiye'nin En Güzel Manzaraları 4K", channel:"GezginTV", avatar:"https://i.pravatar.cc/40?img=7", thumbnail:"https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg", pointsForWatch:5, pointsForLike:10, pointsForSub:20, pointsForComment:15 },
  { id:"v3", title:"Python ile Yapay Zeka - Başlangıç", channel:"KodlamaOkulu", avatar:"https://i.pravatar.cc/40?img=15", thumbnail:"https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg", pointsForWatch:5, pointsForLike:10, pointsForSub:20, pointsForComment:15 },
  { id:"v4", title:"Evde Kolay Kahvaltı Tarifleri", channel:"MutfakHobi", avatar:"https://i.pravatar.cc/40?img=22", thumbnail:"https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg", pointsForWatch:5, pointsForLike:10, pointsForSub:20, pointsForComment:15 },
  { id:"v5", title:"Drone ile İstanbul Üzerinde Uçuş", channel:"AerialTR", avatar:"https://i.pravatar.cc/40?img=33", thumbnail:"https://img.youtube.com/vi/ysz5S6PUM-U/maxresdefault.jpg", pointsForWatch:5, pointsForLike:10, pointsForSub:20, pointsForComment:15 },
];

function fmt(n){ return n>=1000?(n/1000).toFixed(1)+"K":n; }

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size=20, color="currentColor", fill="none", sw=2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const I = {
  play:   "M5 3l14 9-14 9V3z",
  heart:  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  bell:   "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  chat:   "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  coin:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  skip:   "M5 4l10 8-10 8V4zm11 0h2v16h-2V4z",
  home:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2z",
  check:  "M20 6L9 17l-5-5",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  lock:   "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  zap:    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  crown:  "M2 20h20 M5 20V10l7-7 7 7v10",
  x:      "M18 6L6 18M6 6l12 12",
};

// ── Paywall Screen ───────────────────────────────────────────────────────────
function PaywallScreen({ onUpgrade, onClose, videosWatched, paymentLoading }) {
  const OFFER_SECONDS = 10 * 60; // 10 dakika
  const [secs, setSecs] = useState(OFFER_SECONDS);
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s-1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
  }, [secs]);

  const mm = String(Math.floor(secs/60)).padStart(2,"0");
  const ss = String(secs%60).padStart(2,"0");
  const urgent = secs < 60;

  const plans = [
    {
      id: "daily",
      label: "Günlük Boost",
      originalPrice: "$1.99",
      price: "$0.99",
      discount: "%50 İNDİRİM",
      desc: "Bugün sınırsız + 2× puan",
      color: "#4361ee",
      highlight: false,
    },
    {
      id: "weekly",
      label: "Haftalık Pro ⚡",
      originalPrice: "$5.99",
      price: "$2.99",
      discount: "%50 İNDİRİM",
      desc: "7 gün sınırsız + öncelikli sıra + 3× puan",
      color: "#ff6b35",
      highlight: true,
    },
  ];

  return (
    <div style={pw.overlay}>
      <div style={pw.sheet}>
        {/* Close */}
        <button style={pw.closeBtn} onClick={onClose}>
          <Icon d={I.x} size={18} color="#888"/>
        </button>

        {/* Header */}
        <div style={pw.headerBand}>
          <div style={pw.crownWrap}>👑</div>
          <div style={pw.headerLabel}>ÖZEL TEKLİF</div>
          <h2 style={pw.headerTitle}>Sadece Sana Özel</h2>
          <p style={pw.headerSub}>
            {videosWatched} video izledin — artık pro kullanıcı olmaya hazırsın!
          </p>
        </div>

        {/* Countdown */}
        <div style={{ ...pw.countdownBox, borderColor: urgent ? "#ff4466" : "#ffd700", background: urgent ? "#ff446611" : "#ffd70011" }}>
          <div style={pw.countdownLabel}>🔥 Bu fiyat sadece</div>
          <div style={{ ...pw.countdownTimer, color: urgent ? "#ff4466" : "#ffd700", transform: pulse ? "scale(1.08)" : "scale(1)", transition: "transform .15s" }}>
            {mm}:{ss}
          </div>
          <div style={{ ...pw.countdownLabel, color: urgent ? "#ff4466" : "#888" }}>
            {urgent ? "⚠️ Son dakika!" : "kaldı"}
          </div>
        </div>

        {/* Plans */}
        <div style={pw.plansWrap}>
          {plans.map(p => (
            <div key={p.id}
              style={{ ...pw.planCard, ...(selectedPlan===p.id ? { ...pw.planSelected, borderColor: p.color } : {}), ...(p.highlight ? pw.planHighlight : {}) }}
              onClick={() => setSelectedPlan(p.id)}>
              {p.highlight && <div style={{ ...pw.popularBadge, background: p.color }}>EN POPÜLER</div>}
              <div style={pw.planTop}>
                <div>
                  <div style={{ ...pw.planName, color: p.highlight ? p.color : "#fff" }}>{p.label}</div>
                  <div style={pw.planDesc}>{p.desc}</div>
                </div>
                <div style={pw.planPriceCol}>
                  <div style={pw.originalPrice}>{p.originalPrice}</div>
                  <div style={{ ...pw.salePrice, color: p.color }}>{p.price}</div>
                  <div style={{ ...pw.discountTag, background: p.color }}>{p.discount}</div>
                </div>
              </div>
              <div style={pw.radioRow}>
                <div style={{ ...pw.radio, borderColor: p.color, background: selectedPlan===p.id ? p.color : "transparent" }}/>
                <span style={pw.radioLabel}>{selectedPlan===p.id ? "✓ Seçildi" : "Seç"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div style={pw.benefitsBox}>
          {[
            "✅ Sınırsız video izleme",
            "✅ 2× - 3× puan çarpanı",
            "✅ Videolarına öncelikli sıra",
            "✅ Reklamlara atla özelliği",
          ].map((b,i) => <div key={i} style={pw.benefitItem}>{b}</div>)}
        </div>

        {/* CTA */}
        <button style={{ ...pw.ctaBtn, background: plans.find(p=>p.id===selectedPlan)?.color || "#4361ee", opacity: paymentLoading ? 0.7 : 1 }}
          onClick={() => !paymentLoading && onUpgrade(selectedPlan)}
          disabled={paymentLoading}>
          {paymentLoading
            ? <span style={s.spinner}/>
            : <><Icon d={I.zap} size={20} color="#fff" fill="#fff"/>
              {selectedPlan==="daily" ? "$0.99 ile Bugün Başla" : "$2.99 ile Haftalık Pro'ya Geç"}</>
          }
        </button>

        <p style={pw.terms}>İstediğin zaman iptal edebilirsin · Güvenli ödeme</p>
      </div>
    </div>
  );
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ progress, size=56, stroke=5, color="#4361ee" }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, offset=circ*(1-progress);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff22" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{transition:"stroke-dashoffset .3s linear"}} strokeLinecap="round"/>
    </svg>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ video, onComplete, onSkip, isPro }) {
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [liked, setLiked] = useState(false);
  const [subbed, setSubbed] = useState(false);
  const [commented, setCommented] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [earned, setEarned] = useState([]);
  const [imgErr, setImgErr] = useState(false);
  const timerRef = useRef(null);
  const REQUIRED = 30;
  const multiplier = isPro ? 2 : 1;

  const startWatch = () => {
    setPhase("watching"); setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if(e+1>=REQUIRED){ clearInterval(timerRef.current); setPhase("actions");
          setEarned(prev=>[...prev,{label:`+${video.pointsForWatch*multiplier} İzleme`,pts:video.pointsForWatch*multiplier}]);
          return REQUIRED; }
        return e+1;
      });
    },1000);
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const handleLike = ()=>{ if(liked)return; setLiked(true); setEarned(p=>[...p,{label:`+${video.pointsForLike*multiplier} Beğeni`,pts:video.pointsForLike*multiplier}]); };
  const handleSub  = ()=>{ if(subbed)return; setSubbed(true); setEarned(p=>[...p,{label:`+${video.pointsForSub*multiplier} Abone`,pts:video.pointsForSub*multiplier}]); };
  const handleComment = ()=>{ if(commented||!commentText.trim())return; setCommented(true); setShowComment(false); setEarned(p=>[...p,{label:`+${video.pointsForComment*multiplier} Yorum`,pts:video.pointsForComment*multiplier}]); };
  const totalPts = earned.reduce((a,b)=>a+b.pts,0);
  const handleFinish = ()=>{ setPhase("done"); onComplete(totalPts); };

  const thumb = imgErr ? `https://picsum.photos/seed/${video.id}/640/360` : video.thumbnail;

  return (
    <div style={s.card}>
      {isPro && <div style={s.proBanner}>⚡ PRO — {multiplier}× Puan Aktif</div>}
      <div style={s.thumbWrap}>
        <img src={thumb} alt={video.title} style={s.thumb} onError={()=>setImgErr(true)}/>
        {phase==="idle" && (
          <div style={s.thumbOverlay}>
            <button style={s.bigPlay} onClick={startWatch}><Icon d={I.play} size={36} color="#fff" fill="#fff"/></button>
            <div style={s.watchHint}>30 saniye izle → Puan Kazan{isPro?" (2×)":""}</div>
          </div>
        )}
        {phase==="watching" && (
          <div style={s.thumbOverlay}>
            <div style={{position:"relative"}}>
              <ProgressRing progress={elapsed/REQUIRED} size={72} stroke={6} color={isPro?"#ff6b35":"#4361ee"}/>
              <div style={s.timerNum}>{REQUIRED-elapsed}</div>
            </div>
            <div style={s.watchHint}>İzleniyor…</div>
          </div>
        )}
        {phase==="done" && (
          <div style={{...s.thumbOverlay,background:"rgba(0,0,0,.7)"}}>
            <div style={s.doneIcon}>✓</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:18}}>Tamamlandı!</div>
          </div>
        )}
      </div>

      <div style={s.cardBody}>
        <div style={s.channelRow}>
          <img src={video.avatar} alt="" style={s.chanAvatar}/>
          <div>
            <div style={s.vidTitle}>{video.title}</div>
            <div style={s.chanName}>{video.channel}</div>
          </div>
        </div>

        {earned.length>0 && (
          <div style={s.earnedRow}>
            {earned.map((e,i)=><span key={i} style={{...s.badge, background: isPro?"#ff6b3522":"#4361ee22", color: isPro?"#ff6b35":"#4361ee", border:`1px solid ${isPro?"#ff6b3544":"#4361ee44"}`}}>{e.label}</span>)}
          </div>
        )}

        {phase==="actions" && (
          <div style={s.actionGrid}>
            <button style={{...s.actBtn, background:liked?"#ff4466":"#ff446622", color:liked?"#fff":"#ff4466", border:"1.5px solid #ff4466"}} onClick={handleLike}>
              <Icon d={I.heart} size={18} color={liked?"#fff":"#ff4466"} fill={liked?"#fff":"none"}/> {liked?"Beğenildi":"Beğen"}
            </button>
            <button style={{...s.actBtn, background:subbed?"#ffa500":"#ffa50022", color:subbed?"#fff":"#ffa500", border:"1.5px solid #ffa500"}} onClick={handleSub}>
              <Icon d={I.bell} size={18} color={subbed?"#fff":"#ffa500"}/> {subbed?"Abone":"Abone"}
            </button>
            <button style={{...s.actBtn, background:commented?"#00c9a7":"#00c9a722", color:commented?"#fff":"#00c9a7", border:"1.5px solid #00c9a7"}} onClick={()=>!commented&&setShowComment(x=>!x)}>
              <Icon d={I.chat} size={18} color={commented?"#fff":"#00c9a7"}/> {commented?"Yorumlandı":"Yorum"}
            </button>
          </div>
        )}

        {showComment && (
          <div style={s.commentBox}>
            <input style={s.commentInput} placeholder="Yorumunuzu yazın…" value={commentText}
              onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleComment()}/>
            <button style={s.commentSend} onClick={handleComment}>Gönder</button>
          </div>
        )}

        <div style={s.cardFooter}>
          {phase==="actions" ? (
            <button style={{...s.finishBtn, background: isPro?"linear-gradient(135deg,#ff6b35,#f72585)":"linear-gradient(135deg,#4361ee,#00c9a7)"}} onClick={handleFinish}>
              Tamamla → <strong>+{totalPts} Puan{isPro?" ⚡":""}</strong>
            </button>
          ) : phase==="idle"||phase==="watching" ? (
            <button style={s.skipBtn} onClick={onSkip}><Icon d={I.skip} size={16} color="#888"/> Atla</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function PointToast({ msg, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,2200);return()=>clearTimeout(t);},[]);
  return <div style={s.toast}><Icon d={I.star} size={18} color="#ffd700" fill="#ffd700"/> {msg}</div>;
}

// ── Milestone Banner ──────────────────────────────────────────────────────────
function MilestoneBanner({ count, onUpgrade }) {
  return (
    <div style={mb.wrap}>
      <div style={mb.inner}>
        <div style={mb.emoji}>🎯</div>
        <div>
          <div style={mb.title}>{count}. videoyu tamamladın!</div>
          <div style={mb.sub}>Pro ile <strong style={{color:"#ff6b35"}}>2× puan</strong> kazan →</div>
        </div>
        <button style={mb.btn} onClick={onUpgrade}>Pro Ol</button>
      </div>
    </div>
  );
}

// ── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab({ user, setUser, onShowPaywall }) {
  const queue = [...MOCK_VIDEOS];
  const [current, setCurrent] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [sessionPts, setSessionPts] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [showMilestone, setShowMilestone] = useState(false);

  const video = queue[current % queue.length];
  const addToast = msg => setToasts(t=>[...t,{id:Date.now(),msg}]);

  const next = (dir) => {
    setSwipeDir(dir);
    setTimeout(()=>{ setSwipeDir(null); setCurrent(c=>c+1); },350);
  };

  const handleComplete = pts => {
    if(pts>0){
      setUser(u=>({...u, points:u.points+pts, videosWatched:u.videosWatched+1}));
      setSessionPts(p=>p+pts);
      addToast(`+${pts} puan kazandın! 🎉`);
      const newCount = user.videosWatched + 1;
      // Milestone her 5 videoda, ücretsiz kullanıcı için paywall
      if(!user.isPro && newCount % 5 === 0){
        setTimeout(()=>{ setShowMilestone(true); }, 800);
      }
    }
    setTimeout(()=>next("left"),600);
  };

  const handleSkip = () => {
    // Ücretsiz kullanıcı 5. videodan sonra paywall — ama skip'te sadece uyar
    if(!user.isPro && user.videosWatched >= 5 && (current+1) % 5 === 0){
      onShowPaywall();
    }
    next("right");
  };

  const swipeStyle = swipeDir==="left"
    ? {transform:"translateX(-120%) rotate(-15deg)",opacity:0,transition:"all .35s ease"}
    : swipeDir==="right"
    ? {transform:"translateX(120%) rotate(15deg)",opacity:0,transition:"all .35s ease"}
    : {transform:"translateX(0)",opacity:1,transition:"all .3s ease"};

  // Progress to next paywall
  const watched = user.videosWatched;
  const nextMilestone = user.isPro ? Infinity : Math.ceil((watched+1)/5)*5;
  const progressToPaywall = user.isPro ? 1 : (watched % 5) / 5;

  return (
    <div style={s.feedWrap}>
      {/* Stats */}
      <div style={s.statsBar}>
        <div style={s.statItem}>
          <Icon d={I.coin} size={18} color="#ffd700" fill="#ffd700"/>
          <span style={s.statNum}>{user.points}</span>
          <span style={s.statLbl}>Puan</span>
        </div>
        {user.isPro ? (
          <div style={s.proBadge}>⚡ PRO AKTİF</div>
        ) : (
          <div style={s.freeProgress}>
            <div style={s.freeProgressLabel}>
              <Icon d={I.lock} size={12} color="#888"/>
              <span>{5 - (watched%5 || 5)} video kaldı</span>
            </div>
            <div style={s.progressBar}>
              <div style={{...s.progressFill, width:`${progressToPaywall*100}%`}}/>
            </div>
          </div>
        )}
        <div style={s.statItem}>
          <Icon d={I.trophy} size={18} color={user.isPro?"#ff6b35":"#4361ee"}/>
          <span style={{...s.statNum, color:user.isPro?"#ff6b35":"#fff"}}>+{sessionPts}</span>
        </div>
      </div>

      {/* Pro upgrade nudge — non-pro only */}
      {!user.isPro && (
        <button style={s.proNudge} onClick={onShowPaywall}>
          <Icon d={I.zap} size={15} color="#ff6b35" fill="#ff6b35"/>
          <span>Pro ol → 2× puan kazan · <strong style={{color:"#ff6b35"}}>$0.99'dan başlıyor</strong></span>
          <span style={s.nudgeArrow}>›</span>
        </button>
      )}

      {/* Milestone */}
      {showMilestone && !user.isPro && (
        <MilestoneBanner count={user.videosWatched} onUpgrade={()=>{ setShowMilestone(false); onShowPaywall(); }}/>
      )}

      {/* Card */}
      <div style={{...s.cardWrap,...swipeStyle}}>
        <VideoCard key={video.id+current} video={video} onComplete={handleComplete} onSkip={handleSkip} isPro={user.isPro}/>
      </div>

      {/* Toasts */}
      <div style={s.toastArea}>
        {toasts.map(t=><PointToast key={t.id} msg={t.msg} onDone={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))}/>)}
      </div>
    </div>
  );
}

// ── Submit Tab ────────────────────────────────────────────────────────────────
function SubmitTab({ user, setUser, onShowPaywall }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(50);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const PLANS = [
    { pts:50,  label:"Başlangıç", views:"~10 izlenme" },
    { pts:100, label:"Standart",  views:"~25 izlenme" },
    { pts:200, label:"Premium",   views:"~60 izlenme" },
  ];

  const handleSubmit = () => {
    if(!url.trim()){ setError("YouTube URL giriniz."); return; }
    if(!title.trim()){ setError("Video başlığı giriniz."); return; }
    if(user.points < cost){ setError("Yeterli puanın yok!"); return; }
    setError(""); setUser(u=>({...u,points:u.points-cost})); setSuccess(true);
    setUrl(""); setTitle(""); setTimeout(()=>setSuccess(false),3500);
  };

  return (
    <div style={s.submitWrap}>
      {/* Pro upsell inside submit */}
      {!user.isPro && (
        <div style={sub.upsellCard}>
          <div style={sub.upsellLeft}>
            <div style={sub.upsellTitle}>🚀 Pro ile Videonu Öne Çıkar</div>
            <div style={sub.upsellSub}>Öncelikli sıraya gir · 3× daha fazla izlenme</div>
          </div>
          <button style={sub.upsellBtn} onClick={onShowPaywall}>Pro Ol</button>
        </div>
      )}

      <div style={s.submitCard}>
        <h2 style={s.submitTitle}>Videomu Tanıt</h2>
        <div style={s.pointsBadge}>
          <Icon d={I.coin} size={20} color="#ffd700" fill="#ffd700"/>
          <span>{user.points} puan mevcut</span>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>YouTube Video URL</label>
          <input style={s.input} placeholder="https://youtube.com/watch?v=..." value={url} onChange={e=>setUrl(e.target.value)}/>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Video Başlığı</label>
          <input style={s.input} placeholder="Videonuzun başlığı..." value={title} onChange={e=>setTitle(e.target.value)}/>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Plan Seçin</label>
          <div style={s.planGrid}>
            {PLANS.map(p=>(
              <div key={p.pts} style={{...s.planCard,...(cost===p.pts?s.planActive:{})}} onClick={()=>setCost(p.pts)}>
                <div style={s.planLabel}>{p.label}</div>
                <div style={s.planPts}>{p.pts} Puan</div>
                <div style={s.planViews}>{p.views}</div>
              </div>
            ))}
          </div>
        </div>

        {error && <div style={s.errorMsg}>{error}</div>}
        {success && <div style={s.successMsg}><Icon d={I.check} size={18} color="#00c9a7"/> Videon sıraya alındı! 🎉</div>}

        <button style={{...s.submitBtn,opacity:user.points<cost?.5:1}} onClick={handleSubmit}>
          <Icon d={I.upload} size={18} color="#fff"/> {cost} Puan ile Gönder
        </button>
      </div>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, onLogout, onShowPaywall }) {
  const stats = [
    {label:"Mevcut Puan",    value:user.points,              color:"#4361ee"},
    {label:"Toplam Kazanılan",value:user.totalEarned+user.points,color:"#00c9a7"},
    {label:"İzlenen Video",  value:user.videosWatched||0,    color:"#ffa500"},
    {label:"Tanıtılan Video",value:3,                        color:"#ff4466"},
  ];
  return (
    <div style={s.profileWrap}>
      <div style={s.profileHeader}>
        <div style={{position:"relative",display:"inline-block"}}>
          <img src={user.avatar} alt="" style={{...s.profAvatar, borderColor:user.isPro?"#ff6b35":"#4361ee"}}/>
          {user.isPro && <div style={pr.proCrown}>👑</div>}
        </div>
        <div style={s.profName}>{user.name}</div>
        <div style={s.profChannel}>{user.channel}</div>
        {user.isPro && <div style={pr.proTag}>⚡ PRO ÜYE</div>}
      </div>

      <div style={s.statsGrid}>
        {stats.map((st,i)=>(
          <div key={i} style={{...s.statCard, borderTop:`3px solid ${st.color}`}}>
            <div style={{...s.statVal,color:st.color}}>{fmt(st.value)}</div>
            <div style={s.statName}>{st.label}</div>
          </div>
        ))}
      </div>

      {!user.isPro ? (
        <div style={pr.upgradeCard} onClick={onShowPaywall}>
          <div style={pr.upgradeLeft}>
            <div style={pr.upgradeTitle}>👑 Pro'ya Yükselt</div>
            <div style={pr.upgradeSub}>$0.99'dan başlayan fiyatlarla · %50 indirim aktif</div>
          </div>
          <div style={pr.upgradeArrow}>›</div>
        </div>
      ) : (
        <div style={pr.proActiveCard}>
          <div style={{fontSize:28}}>⚡</div>
          <div>
            <div style={pr.proActiveTitle}>Pro Üyelik Aktif</div>
            <div style={pr.proActiveSub}>2× puan · Öncelikli sıra · Sınırsız izleme</div>
          </div>
        </div>
      )}

      <div style={s.rankCard}>
        <Icon d={I.trophy} size={24} color="#ffd700"/>
        <div>
          <div style={s.rankTitle}>Altın Kullanıcı</div>
          <div style={s.rankSub}>Sonraki seviye: 500 puan</div>
        </div>
      </div>

      <button style={s.logoutBtn} onClick={onLogout}>
        <Icon d={I.logout} size={18} color="#ff4466"/> Çıkış Yap
      </button>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const handle = ()=>{ setLoading(true); setTimeout(()=>{ setLoading(false); onLogin(MOCK_USER); },1800); };
  return (
    <div style={s.loginBg}>
      <div style={s.loginCard}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
          </div>
          <span style={s.logoText}>ViewBoost</span>
        </div>
        <h1 style={s.loginTitle}>İzle, Kazan, Büyü</h1>
        <p style={s.loginSub}>Videoları izleyerek puan kazan,<br/>kendi kanalını büyüt.</p>
        <div style={s.featureList}>
          {[
            {icon:I.heart,color:"#ff4466",label:"Beğeni = +10 Puan"},
            {icon:I.bell, color:"#ffa500",label:"Abone = +20 Puan"},
            {icon:I.chat, color:"#00c9a7",label:"Yorum = +15 Puan"},
            {icon:I.play, color:"#4361ee",label:"30sn İzle = +5 Puan"},
          ].map((f,i)=>(
            <div key={i} style={s.featureItem}>
              <div style={{...s.featureIcon,background:f.color+"22",color:f.color}}><Icon d={f.icon} size={18} color={f.color}/></div>
              <span style={s.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
        <button style={{...s.ytBtn,opacity:loading?.7:1}} onClick={handle} disabled={loading}>
          {loading ? <span style={s.spinner}/> : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
          )}
          YouTube ile Giriş Yap
        </button>
        <p style={s.disclaimer}>Demo modunda çalışmaktadır.</p>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16}}>
          <a href="/terms" style={{color:"#555",fontSize:11,textDecoration:"none"}}>Kullanım Şartları</a>
          <a href="/privacy" style={{color:"#555",fontSize:11,textDecoration:"none"}}>Gizlilik</a>
          <a href="/refund" style={{color:"#555",fontSize:11,textDecoration:"none"}}>İade Politikası</a>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
// ── Static Pages ──────────────────────────────────────────────────────────────
function TermsPage() {
  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#0f0f0f",color:"#ccc",maxWidth:700,margin:"0 auto",padding:"40px 20px",lineHeight:1.8,minHeight:"100vh"}}>
      <a href="/" style={{color:"#4361ee",fontSize:14}}>← Ana Sayfa</a>
      <h1 style={{color:"#fff",fontSize:28,margin:"20px 0 8px"}}>Kullanım Şartları</h1>
      <p>Son güncelleme: Haziran 2026</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>1. Kabul</h2>
      <p>ViewBoost'u kullanarak bu şartları kabul etmiş sayılırsınız.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>2. Hizmet</h2>
      <p>ViewBoost, kullanıcıların YouTube videolarını izleyerek puan kazandığı ve bu puanları kendi videolarını tanıtmak için kullandığı bir platformdur.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>3. Ödemeler</h2>
      <p>Pro üyelik ödemeleri Paddle aracılığıyla güvenli şekilde işlenir. Fiyatlar USD cinsindendir.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>4. Yasaklı Kullanım</h2>
      <p>Bot kullanımı ve sahte etkileşim yasaktır.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>5. İletişim</h2>
      <p>support@viewboost.app</p>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#0f0f0f",color:"#ccc",maxWidth:700,margin:"0 auto",padding:"40px 20px",lineHeight:1.8,minHeight:"100vh"}}>
      <a href="/" style={{color:"#4361ee",fontSize:14}}>← Ana Sayfa</a>
      <h1 style={{color:"#fff",fontSize:28,margin:"20px 0 8px"}}>Gizlilik Politikası</h1>
      <p>Son güncelleme: Haziran 2026</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>1. Topladığımız Bilgiler</h2>
      <p>YouTube hesap bilgileri, kullanım verileri ve ödeme bilgileri (Paddle tarafından işlenir).</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>2. Kullanım</h2>
      <p>Bilgileriniz yalnızca hizmetin sunulması amacıyla kullanılır, üçüncü taraflarla paylaşılmaz.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>3. Güvenlik</h2>
      <p>Ödemeler Paddle'ın güvenli altyapısı üzerinden işlenir.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>4. İletişim</h2>
      <p>support@viewboost.app</p>
    </div>
  );
}

function RefundPage() {
  return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#0f0f0f",color:"#ccc",maxWidth:700,margin:"0 auto",padding:"40px 20px",lineHeight:1.8,minHeight:"100vh"}}>
      <a href="/" style={{color:"#4361ee",fontSize:14}}>← Ana Sayfa</a>
      <h1 style={{color:"#fff",fontSize:28,margin:"20px 0 8px"}}>İade Politikası</h1>
      <p>Son güncelleme: Haziran 2026</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>1. İade Süresi</h2>
      <p>Satın alma tarihinden itibaren 7 gün içinde iade talep edebilirsiniz.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>2. İade Süreci</h2>
      <p>support@viewboost.app adresine yazın, 3-5 iş günü içinde işleme alınır.</p>
      <h2 style={{color:"#fff",fontSize:18,marginTop:32}}>3. İade Yöntemi</h2>
      <p>İadeler orijinal ödeme yönteminize yapılır.</p>
    </div>
  );
}

export default function App() {
  // Simple client-side routing for policy pages
  const path = window.location.pathname;
  if (path === "/terms") return <TermsPage />;
  if (path === "/privacy") return <PrivacyPage />;
  if (path === "/refund") return <RefundPage />;

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("feed");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => { initPaddle(); }, []);

  if(!user) return <LoginScreen onLogin={setUser}/>;

  const tabs = [
    {id:"feed",   label:"Keşfet", icon:I.home},
    {id:"submit", label:"Tanıt",  icon:I.upload},
    {id:"profile",label:"Profil", icon:I.trophy},
  ];

  const handleUpgrade = (plan) => {
    const priceId = PADDLE_PRICES[plan];
    setPaymentLoading(true);
    openPaddleCheckout(priceId, () => {
      setShowPaywall(false);
      setPaymentLoading(false);
      setUser(u => ({ ...u, isPro: true }));
    });
    setTimeout(() => setPaymentLoading(false), 3000);
  };

  return (
    <div style={s.app}>
      {showPaywall && (
        <PaywallScreen
          videosWatched={user.videosWatched}
          onUpgrade={handleUpgrade}
          onClose={()=>setShowPaywall(false)}
          paymentLoading={paymentLoading}
        />
      )}

      <div style={s.topBar}>
        <div style={s.logoSmall}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff0000">
            <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
          <span style={s.topBarTitle}>ViewBoost</span>
          {user.isPro && <span style={s.topProTag}>PRO</span>}
        </div>
        <div style={s.topPoints}>
          <Icon d={I.coin} size={16} color="#ffd700" fill="#ffd700"/>
          <span style={{color:"#ffd700",fontWeight:700}}>{user.points}</span>
        </div>
      </div>

      <div style={s.content}>
        {tab==="feed"    && <FeedTab    user={user} setUser={setUser} onShowPaywall={()=>setShowPaywall(true)}/>}
        {tab==="submit"  && <SubmitTab  user={user} setUser={setUser} onShowPaywall={()=>setShowPaywall(true)}/>}
        {tab==="profile" && <ProfileTab user={user} onLogout={()=>setUser(null)} onShowPaywall={()=>setShowPaywall(true)}/>}
      </div>

      <div style={s.navBar}>
        {tabs.map(t=>(
          <button key={t.id} style={s.navBtn} onClick={()=>setTab(t.id)}>
            <Icon d={t.icon} size={22} color={tab===t.id?"#4361ee":"#888"}/>
            <span style={{fontSize:11,color:tab===t.id?"#4361ee":"#888",fontWeight:tab===t.id?700:400}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  app:{fontFamily:"'Inter',sans-serif",background:"#0f0f0f",minHeight:"100vh",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",position:"relative",color:"#fff"},
  topBar:{background:"#141414",borderBottom:"1px solid #222",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50},
  logoSmall:{display:"flex",alignItems:"center",gap:8},
  topBarTitle:{fontWeight:800,fontSize:18,letterSpacing:-.5},
  topProTag:{background:"linear-gradient(90deg,#ff6b35,#f72585)",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800,letterSpacing:1},
  topPoints:{display:"flex",alignItems:"center",gap:5,background:"#1e1e1e",padding:"5px 12px",borderRadius:20},
  content:{flex:1,overflowY:"auto",paddingBottom:80},
  navBar:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#141414",borderTop:"1px solid #222",display:"flex",zIndex:50},
  navBtn:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0",background:"none",border:"none",cursor:"pointer"},

  loginBg:{minHeight:"100vh",background:"linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20},
  loginCard:{background:"#141414",borderRadius:24,padding:"36px 28px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px #0008"},
  logoRow:{display:"flex",alignItems:"center",gap:10,marginBottom:24,justifyContent:"center"},
  logoIcon:{background:"#ff0000",borderRadius:12,padding:8,display:"flex"},
  logoText:{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:-1},
  loginTitle:{textAlign:"center",fontSize:26,fontWeight:800,margin:"0 0 8px",color:"#fff"},
  loginSub:{textAlign:"center",color:"#888",margin:"0 0 24px",lineHeight:1.6},
  featureList:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28},
  featureItem:{display:"flex",alignItems:"center",gap:8,background:"#1e1e1e",borderRadius:12,padding:"10px 12px"},
  featureIcon:{borderRadius:8,padding:6,display:"flex"},
  featureLabel:{fontSize:13,fontWeight:600,color:"#ddd"},
  ytBtn:{width:"100%",background:"#ff0000",color:"#fff",border:"none",borderRadius:14,padding:"14px 0",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10},
  disclaimer:{textAlign:"center",color:"#555",fontSize:11,marginTop:16},
  spinner:{width:20,height:20,border:"3px solid #fff4",borderTop:"3px solid #fff",borderRadius:"50%",display:"inline-block"},

  feedWrap:{padding:"12px 16px"},
  statsBar:{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1a1a1a",borderRadius:14,padding:"10px 16px",marginBottom:10},
  statItem:{display:"flex",alignItems:"center",gap:5},
  statNum:{fontWeight:800,fontSize:17,color:"#fff"},
  statLbl:{fontSize:11,color:"#666",marginLeft:2},
  proBadge:{background:"linear-gradient(90deg,#ff6b35,#f72585)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:800,letterSpacing:.5},
  freeProgress:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1,maxWidth:120,margin:"0 8px"},
  freeProgressLabel:{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#888"},
  progressBar:{width:"100%",height:4,background:"#333",borderRadius:99},
  progressFill:{height:"100%",background:"#4361ee",borderRadius:99,transition:"width .4s"},
  proNudge:{width:"100%",background:"#ff6b3511",border:"1px solid #ff6b3533",borderRadius:12,padding:"8px 12px",color:"#ccc",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:10,textAlign:"left"},
  nudgeArrow:{marginLeft:"auto",color:"#ff6b35",fontSize:18,fontWeight:700},
  cardWrap:{transition:"all .3s ease"},

  card:{background:"#1a1a1a",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 24px #0006"},
  proBanner:{background:"linear-gradient(90deg,#ff6b35,#f72585)",padding:"5px 14px",fontSize:12,fontWeight:700,letterSpacing:.5},
  thumbWrap:{position:"relative",aspectRatio:"16/9",background:"#000",overflow:"hidden"},
  thumb:{width:"100%",height:"100%",objectFit:"cover"},
  thumbOverlay:{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12},
  bigPlay:{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:72,height:72,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},
  watchHint:{color:"#ddd",fontSize:14,fontWeight:500},
  timerNum:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff"},
  doneIcon:{fontSize:40,color:"#00c9a7"},
  cardBody:{padding:"14px 16px"},
  channelRow:{display:"flex",alignItems:"center",gap:10,marginBottom:10},
  chanAvatar:{width:36,height:36,borderRadius:"50%",objectFit:"cover"},
  vidTitle:{fontWeight:700,fontSize:14,color:"#fff",lineHeight:1.3},
  chanName:{fontSize:12,color:"#888",marginTop:2},
  earnedRow:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10},
  badge:{fontSize:12,fontWeight:700,padding:"3px 9px",borderRadius:20},
  actionGrid:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10},
  actBtn:{borderRadius:10,padding:"8px 4px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4},
  commentBox:{display:"flex",gap:8,marginBottom:10},
  commentInput:{flex:1,background:"#262626",border:"1px solid #333",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:13,outline:"none"},
  commentSend:{background:"#00c9a7",border:"none",borderRadius:10,color:"#fff",fontWeight:700,padding:"0 14px",cursor:"pointer",fontSize:13},
  cardFooter:{display:"flex",justifyContent:"flex-end"},
  finishBtn:{border:"none",borderRadius:10,color:"#fff",padding:"10px 18px",fontWeight:700,fontSize:14,cursor:"pointer"},
  skipBtn:{background:"none",border:"1px solid #333",borderRadius:10,color:"#888",padding:"8px 14px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5},

  toastArea:{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:200,display:"flex",flexDirection:"column",gap:6,alignItems:"center"},
  toast:{background:"#1e1e1e",border:"1px solid #333",borderRadius:30,padding:"8px 18px",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 16px #0008"},

  submitWrap:{padding:"16px"},
  submitCard:{background:"#1a1a1a",borderRadius:20,padding:"20px 18px",marginBottom:14},
  submitTitle:{fontSize:22,fontWeight:800,margin:"0 0 12px"},
  pointsBadge:{display:"flex",alignItems:"center",gap:6,background:"#ffd70022",color:"#ffd700",padding:"6px 14px",borderRadius:20,fontWeight:700,fontSize:15,width:"fit-content",marginBottom:18},
  formGroup:{marginBottom:16},
  label:{display:"block",color:"#888",fontSize:13,marginBottom:6,fontWeight:600},
  input:{width:"100%",background:"#262626",border:"1px solid #333",borderRadius:12,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"},
  planGrid:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8},
  planCard:{background:"#262626",border:"1.5px solid #333",borderRadius:12,padding:"12px 8px",textAlign:"center",cursor:"pointer"},
  planActive:{border:"1.5px solid #4361ee",background:"#4361ee22"},
  planLabel:{fontSize:13,fontWeight:700,color:"#ddd"},
  planPts:{fontSize:16,fontWeight:800,color:"#4361ee",margin:"4px 0"},
  planViews:{fontSize:11,color:"#888"},
  errorMsg:{color:"#ff4466",fontSize:13,marginBottom:12,background:"#ff446622",borderRadius:10,padding:"8px 12px"},
  successMsg:{color:"#00c9a7",fontSize:14,fontWeight:600,marginBottom:12,background:"#00c9a722",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8},
  submitBtn:{width:"100%",background:"linear-gradient(135deg,#4361ee,#7209b7)",border:"none",borderRadius:14,padding:"14px 0",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8},

  profileWrap:{padding:"20px 16px"},
  profileHeader:{textAlign:"center",marginBottom:24},
  profAvatar:{width:80,height:80,borderRadius:"50%",border:"3px solid #4361ee",marginBottom:10},
  profName:{fontSize:22,fontWeight:800},
  profChannel:{color:"#888",fontSize:14},
  statsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16},
  statCard:{background:"#1a1a1a",borderRadius:14,padding:"16px 14px"},
  statVal:{fontSize:26,fontWeight:900},
  statName:{fontSize:12,color:"#888",marginTop:4},
  rankCard:{background:"linear-gradient(135deg,#1a1a1a,#1e1a0a)",border:"1px solid #ffd70033",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,marginBottom:16},
  rankTitle:{fontWeight:700,fontSize:16,color:"#ffd700"},
  rankSub:{fontSize:13,color:"#888"},
  logoutBtn:{width:"100%",background:"#ff446622",border:"1.5px solid #ff4466",borderRadius:14,padding:"13px 0",color:"#ff4466",fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8},
  empty:{textAlign:"center",color:"#555",padding:40},
};

// Paywall styles
const pw = {
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"},
  sheet:{background:"#141414",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px",position:"relative"},
  closeBtn:{position:"absolute",top:16,right:16,background:"#262626",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},
  headerBand:{textAlign:"center",marginBottom:20},
  crownWrap:{fontSize:40,marginBottom:8},
  headerLabel:{fontSize:11,fontWeight:800,letterSpacing:2,color:"#ff6b35",marginBottom:6},
  headerTitle:{fontSize:24,fontWeight:900,margin:"0 0 6px",color:"#fff"},
  headerSub:{fontSize:14,color:"#888",margin:0},
  countdownBox:{border:"2px solid",borderRadius:16,padding:"14px 20px",textAlign:"center",marginBottom:20},
  countdownLabel:{fontSize:13,color:"#888",fontWeight:600},
  countdownTimer:{fontSize:42,fontWeight:900,letterSpacing:2,lineHeight:1.1,margin:"4px 0"},
  plansWrap:{display:"flex",flexDirection:"column",gap:10,marginBottom:18},
  planCard:{background:"#1e1e1e",border:"2px solid #333",borderRadius:16,padding:"14px 16px",cursor:"pointer",position:"relative",transition:"all .2s"},
  planSelected:{border:"2px solid",background:"#1e1e1e"},
  planHighlight:{background:"#1a1510"},
  popularBadge:{position:"absolute",top:-10,right:12,fontSize:10,fontWeight:800,letterSpacing:1,color:"#fff",padding:"3px 10px",borderRadius:20},
  planTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10},
  planName:{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4},
  planDesc:{fontSize:12,color:"#888"},
  planPriceCol:{textAlign:"right"},
  originalPrice:{fontSize:13,color:"#666",textDecoration:"line-through"},
  salePrice:{fontSize:24,fontWeight:900},
  discountTag:{fontSize:10,fontWeight:800,color:"#fff",padding:"2px 8px",borderRadius:20,marginTop:4,display:"inline-block"},
  radioRow:{display:"flex",alignItems:"center",gap:8},
  radio:{width:16,height:16,borderRadius:"50%",border:"2px solid",transition:"all .2s"},
  radioLabel:{fontSize:13,color:"#888",fontWeight:600},
  benefitsBox:{background:"#1a1a1a",borderRadius:14,padding:"14px 16px",marginBottom:18},
  benefitItem:{fontSize:14,color:"#ccc",padding:"5px 0",fontWeight:500},
  ctaBtn:{width:"100%",border:"none",borderRadius:16,padding:"16px 0",color:"#fff",fontWeight:800,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12},
  terms:{textAlign:"center",fontSize:12,color:"#555",margin:0},
};

// Milestone banner styles
const mb = {
  wrap:{background:"linear-gradient(135deg,#1a1510,#1e1a0a)",border:"1px solid #ff6b3544",borderRadius:14,marginBottom:10,overflow:"hidden"},
  inner:{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"},
  emoji:{fontSize:24},
  title:{fontWeight:700,fontSize:14,color:"#fff"},
  sub:{fontSize:12,color:"#888"},
  btn:{marginLeft:"auto",background:"linear-gradient(90deg,#ff6b35,#f72585)",border:"none",borderRadius:20,color:"#fff",fontWeight:700,fontSize:13,padding:"7px 16px",cursor:"pointer",whiteSpace:"nowrap"},
};

// Profile extra styles
const pr = {
  proCrown:{position:"absolute",bottom:-2,right:-2,fontSize:18},
  proTag:{display:"inline-block",background:"linear-gradient(90deg,#ff6b35,#f72585)",borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:800,marginTop:6},
  upgradeCard:{background:"linear-gradient(135deg,#1a1a1a,#1e1510)",border:"1px solid #ff6b3544",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",cursor:"pointer",marginBottom:14},
  upgradeLeft:{flex:1},
  upgradeTitle:{fontWeight:700,fontSize:16,color:"#fff",marginBottom:4},
  upgradeSub:{fontSize:13,color:"#ff6b35"},
  upgradeArrow:{fontSize:24,color:"#ff6b35",fontWeight:700},
  proActiveCard:{background:"linear-gradient(135deg,#1a1a1a,#1a1510)",border:"1px solid #ff6b3566",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,marginBottom:14},
  proActiveTitle:{fontWeight:700,fontSize:16,color:"#ff6b35"},
  proActiveSub:{fontSize:13,color:"#888",marginTop:3},
};

// Submit extra
const sub = {
  upsellCard:{background:"linear-gradient(135deg,#1a1510,#1a1a1a)",border:"1px solid #ff6b3544",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",marginBottom:12,gap:12},
  upsellLeft:{flex:1},
  upsellTitle:{fontWeight:700,fontSize:14,color:"#fff",marginBottom:3},
  upsellSub:{fontSize:12,color:"#888"},
  upsellBtn:{background:"linear-gradient(90deg,#ff6b35,#f72585)",border:"none",borderRadius:20,color:"#fff",fontWeight:700,fontSize:13,padding:"8px 16px",cursor:"pointer",whiteSpace:"nowrap"},
};

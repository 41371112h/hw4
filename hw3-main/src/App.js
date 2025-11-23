import AIGuide from "./AItest";
import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://hw4-1-yxqp.onrender.com";

let visitSent = false;

export default function App() {

  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [stats, setStats] = useState(null);
  const [timeInfo, setTimeInfo] = useState(null);

  const periodLabel =
    timeInfo?.period === "morning"
      ? "早上"
      : timeInfo?.period === "afternoon"
      ? "下午"
      : timeInfo?.period === "evening"
      ? "晚上"
      : "";
 
    // ===== 新增：向後端 API 發 request =====
  useEffect(() => {
    
    // 抓隨機座右銘
    fetch(`${API_BASE}/api/quote`)
      .then(res => res.json())
      .then(data => {
        setQuote(data.quote);
        setAuthor(data.author);
      });

    // 上報訪客造訪
    if (!visitSent) {
      fetch(`${API_BASE}/api/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "/home" })
      });
      visitSent = true;
    }

    // 抓訪客統計
    fetch(`${API_BASE}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data));

    // 取得目前時間與時段
    fetch(`${API_BASE}/api/timezone`)
      .then((res) => res.json())
      .then((data) => {
        setTimeInfo(data);
      });
  }, []);

  useEffect(() => {
    // ========= 進場動畫 =========
    const sections = document.querySelectorAll("section");
    const io1 = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.2 }
    );
    sections.forEach((s) => io1.observe(s));

    // ========= Tabs：特質 / 技能 =========
    const tabs = document.querySelectorAll(".tabbar .chip");
    const panels = document.querySelectorAll(".panel");
    const activateTab = (btn) => {
      tabs.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const target = btn.getAttribute("data-target");
      panels.forEach((p) => (p.hidden = "#" + p.id !== target));
      document.querySelectorAll(target + " .bar").forEach((b) => {
        b.style.width = "0";
        requestAnimationFrame(() => {
          setTimeout(() => {
            b.style.width = b.dataset.progress + "%";
          }, 80);
        });
      });
    };
    const tabHandlers = [];
    tabs.forEach((btn) => {
      const h = () => activateTab(btn);
      btn.addEventListener("click", h);
      tabHandlers.push([btn, h]);
    });

    // ========= 進度條動畫（首次進入視窗） =========
    const bars = document.querySelectorAll(".bar");
    const io2 = new IntersectionObserver(
      (es) => {
        es.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.width = el.dataset.progress + "%";
            io2.unobserve(el);
          }
        });
      },
      { threshold: 0.35 }
    );
    bars.forEach((b) => io2.observe(b));

    // ========= 生活碎片水平捲動 =========
    const gallery = document.getElementById("gallery");
    const prev = document.querySelector(".gprev");
    const next = document.querySelector(".gnext");
    const amount = () => Math.min((gallery?.clientWidth || 0) * 0.9, 640);
    const onPrev = () =>
      gallery?.scrollBy({ left: -amount(), behavior: "smooth" });
    const onNext = () =>
      gallery?.scrollBy({ left: amount(), behavior: "smooth" });
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);

    // ========= 主題切換（含記憶 & 系統偏好） =========
    const key = "pref-theme";
    const root = document.documentElement;
    const saved = localStorage.getItem(key);
    if (saved) root.dataset.theme = saved;
    else if (window.matchMedia &&
             window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.dataset.theme = "dark";
    } else {
      root.dataset.theme = "light";
    }
    const themeBtn = document.getElementById("themeToggle");
    const onToggleTheme = () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem(key, next);
    };
    themeBtn?.addEventListener("click", onToggleTheme);

    // ========= 燈箱功能 =========
    const lb = document.getElementById("lightbox");
    const imgEl = lb?.querySelector("img");
    const closeBtn = lb?.querySelector(".lb-close");
    const openLightbox = (src, alt) => {
      if (!lb || !imgEl) return;
      imgEl.src = src;
      imgEl.alt = alt || "放大圖片";
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      if (!lb || !imgEl) return;
      lb.hidden = true;
      imgEl.src = "";
      document.body.style.overflow = "";
    };
    const clickables = document.querySelectorAll(
      ".gallery img, .act .photo, .hero-bg"
    );
    const onImgClick = (el) => () => openLightbox(el.currentSrc || el.src, el.alt);
    const imgHandlers = [];
    clickables.forEach((el) => {
      const h = onImgClick(el);
      el.addEventListener("click", h);
      imgHandlers.push([el, h]);
    });
    const onLbClick = (e) => {
      if (e.target === lb) closeLightbox();
    };
    const onEsc = (e) => {
      if (!lb?.hidden && e.key === "Escape") closeLightbox();
    };
    closeBtn?.addEventListener("click", closeLightbox);
    lb?.addEventListener("click", onLbClick);
    window.addEventListener("keydown", onEsc);

    // ========= 回到頂部按鈕 =========
    const backTop = document.getElementById("backTop");
    const toggleBackTop = () => {
      if (backTop) backTop.style.display = window.scrollY > 600 ? "block" : "none";
    };
    window.addEventListener("scroll", toggleBackTop, { passive: true });
    toggleBackTop();
    const onBackTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    backTop?.addEventListener("click", onBackTop);

    // ========= Sticky header 遮擋修正 =========
    document.querySelectorAll("section[id]").forEach((sec) => {
      sec.style.scrollMarginTop = "90px";
    });

    // ========= 導覽目前所在位置高亮 =========
    const links = document.querySelectorAll('nav a[data-link]');
    const sectionsMap = {};
    links.forEach((a) => {
      const id = a.getAttribute("data-link");
      const el = id ? document.getElementById(id) : null;
      if (id && el) sectionsMap[id] = el;
    });
    const io3 = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = document.querySelector(`nav a[data-link="${id}"]`);
          if (link) link.setAttribute("aria-current", entry.isIntersecting ? "true" : "false");
        });
      },
      { rootMargin: "-60% 0px -35% 0px", threshold: 0 }
    );
    Object.values(sectionsMap).forEach((sec) => io3.observe(sec));

    // ========= 頁面滾動進度條 =========
    const bar = document.getElementById("scrollbar");
    const onScroll = () => {
      const sc =
        document.documentElement.scrollTop || document.body.scrollTop;
      const h =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (bar) bar.style.width = (sc / h) * 100 + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ======== 清理（避免 StrictMode 下重複綁定）========
    return () => {
      io1.disconnect();
      io2.disconnect();
      io3.disconnect();

      tabHandlers.forEach(([el, h]) => el.removeEventListener("click", h));
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);

      themeBtn?.removeEventListener("click", onToggleTheme);

      imgHandlers.forEach(([el, h]) => el.removeEventListener("click", h));
      closeBtn?.removeEventListener("click", closeLightbox);
      lb?.removeEventListener("click", onLbClick);
      window.removeEventListener("keydown", onEsc);

      window.removeEventListener("scroll", toggleBackTop);
      backTop?.removeEventListener("click", onBackTop);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div className="scrollbar" id="scrollbar"></div>

      <header>
        <div className="inner">
          <div className="logo">My Portfolio</div>

          <nav aria-label="主要導覽">
            <ul>
              <li><a href="#home" data-link="home">主頁</a></li>
              <li><a href="#about" data-link="about">關於我</a></li>
              <li><a href="#advantages" data-link="advantages">個人優勢</a></li>
              <li><a href="#activities" data-link="activities">活動經驗</a></li>
              <li><a href="#life" data-link="life">生活碎片</a></li>
              <li><a href="#contact" data-link="contact">聯絡資訊</a></li>
            </ul>
          </nav>

          <div className="ig-wrap">
            <a
              className="ig-link"
              href="https://www.instagram.com/_xinyuuu._?igsh=bW8yNnFmYnN6N2Ew&utm_source=qr"
              target="_blank"
              rel="noopener"
              aria-label="前往 Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18 6.25z"/>
              </svg>
            </a>
            <button id="themeToggle" className="icon-btn" aria-label="切換主題" title="切換深色/淺色">🌓</button>
          </div>
        </div>
      </header>

      {/* 主頁 */}
      <section id="home">
        <span className="eyebrow">你好，我是</span>
        <h1>蔡欣育</h1>
        <p className="subtitle">來自國立臺灣師範大學的學生，喜歡記錄、體驗生活</p>

        <div className="hero-wrap">
          <div className="hero-frame">
            <img
              className="hero-bg"
              src="/img/S__48668684.jpg"
              alt="主頁背景圖"
              loading="lazy"
              decoding="async"
            />
          </div>
          <img
            className="hero-person"
            src="/img/IMG_9581.PNG"
            alt="蔡欣育人物照"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* === 座右銘 & 訪客統計 卡片 === */}
      <section id="quoteStatsCard" className="info-card">
        <h2>每日一句 & 訪客統計</h2>

        <div className="info-content">
          <div className="quote-box">
            <h3>今日座右銘</h3>
            <p className="quote">“ {quote} ”</p>
            <p className="author">— {author}</p>
          </div>

          <div className="stats-box">
            <h3>訪客統計</h3>

            {timeInfo && (
              <p className="time-line">
                現在時間：<b>{timeInfo.now}</b>
                {periodLabel && <>（{periodLabel}）</>}
              </p>
            )}

            {stats ? (
              <ul>
                <li>總造訪次數：<b>{stats.totalVisits}</b></li>
                <li>不同訪客數：<b>{stats.uniqueVisitors}</b></li>
                <li>最近造訪：<b>{new Date(stats.lastVisitAt).toLocaleString()}</b></li>
              </ul>
            ) : (
              <p>載入中...</p>
            )}
          </div>
        </div>
      </section>


      {/* 關於我：左基本資料 / 右 特質⟷技能 進度條 */}
      <section id="about" aria-labelledby="about-title">
        <h2 id="about-title">關於我</h2>
        <div className="about-grid">
          <div className="tile">
            <div className="about-list">
              <div className="about-item"><h3>姓名</h3><p>蔡欣育</p></div>
              <div className="about-item"><h3>學校</h3><p>國立臺灣師範大學</p></div>
              <div className="about-item"><h3>科系</h3><p>科技應用與人力資源發展</p></div>
              <div className="about-item"><h3>個性</h3><p>隨和好相處</p></div>
              <div className="about-item"><h3>興趣</h3><p>跳舞、聽音樂、看劇</p></div>
              <div className="about-item"><h3>MBTI</h3><p>ENFP</p></div>
            </div>
          </div>

          <div className="tile">
            <div className="tabbar" role="tablist" aria-label="特質與技能切換">
              <button className="chip active" data-target="#traitsPanel" role="tab" aria-selected="true" aria-controls="traitsPanel">個人特質</button>
              <button className="chip" data-target="#skillsPanel" role="tab" aria-selected="false" aria-controls="skillsPanel">技能</button>
            </div>

            <div id="traitsPanel" className="panel" role="tabpanel">
              <div className="progress-item"><div className="progress-label"><span>隨和</span><span className="pct">90%</span></div><div className="progress"><div className="bar" data-progress="90"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>熱心</span><span className="pct">85%</span></div><div className="progress"><div className="bar" data-progress="85"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>好奇心</span><span className="pct">80%</span></div><div className="progress"><div className="bar" data-progress="80"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>完美主義</span><span className="pct">70%</span></div><div className="progress"><div className="bar" data-progress="70"></div></div></div>
              <p className="note">以上為自評，會隨經驗持續調整。</p>
            </div>

            <div id="skillsPanel" className="panel" role="tabpanel" hidden>
              <div className="progress-item"><div className="progress-label"><span>簡報力</span><span className="pct">85%</span></div><div className="progress"><div className="bar" data-progress="85"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>Canva</span><span className="pct">90%</span></div><div className="progress"><div className="bar" data-progress="90"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>Excel</span><span className="pct">88%</span></div><div className="progress"><div className="bar" data-progress="88"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>Python</span><span className="pct">60%</span></div><div className="progress"><div className="bar" data-progress="60"></div></div></div>
              <div className="progress-item"><div className="progress-label"><span>團隊溝通</span><span className="pct">80%</span></div><div className="progress"><div className="bar" data-progress="80"></div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 個人優勢 */}
      <section id="advantages" aria-labelledby="adv-title">
        <h2 id="adv-title">個人優勢</h2>
        <div className="adv-grid">
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.75a10.25 10.25 0 1 0 10.25 10.25A10.25 10.25 0 0 0 12 1.75zm0 18.5a8.25 8.25 0 1 1 8.25-8.25 8.25 8.25 0 0 1-8.25 8.25Zm.75-12.5h-1.5v5.25l4.5 2.7.75-1.26-3.75-2.19Z"/></svg>
            <div className="title">時間管理</div>
            <p className="desc">妥善分配讀書、活動與休閒時間，能在期限前完成任務。</p>
          </div>
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM6 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5Zm12 0a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5Z"/></svg>
            <div className="title">團隊合作</div>
            <p className="desc">擅長分工協調與傾聽，多次在表演與競賽中擔任溝通調停的角色。</p>
          </div>
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 7-4 1-1 4-7-7 5-5Zm-8 19h16v-2H4v2Z"/></svg>
            <div className="title">勇於嘗試</div>
            <p className="desc">遇到新機會會先嘗試看看，從實作中快速學習修正。</p>
          </div>
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2a8 8 0 1 0 5.29 13.94l4.39 4.39 1.41-1.41-4.39-4.39A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1-6 6 6 6 0 0 1 6-6Z"/></svg>
            <div className="title">抱持好奇心</div>
            <p className="desc">面對不懂的事喜歡追根究柢，主動查資料或請教他人。</p>
          </div>
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.35-7-10.25A4.75 4.75 0 0 1 12 7a4.75 4.75 0 0 1 7 3.75C19 16.65 12 21 12 21Z"/></svg>
            <div className="title">熱心負責</div>
            <p className="desc">時常幫助需要幫助的人，對交付的任務負責到底。</p>
          </div>
          <div className="adv">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16v-2l-6-6-3 3-2-2-5 5v2zm10-12V4h-2v4H8l4 4 4-4h-2z"/></svg>
            <div className="title">永不放棄</div>
            <p className="desc">遇到困難時先拆解目標、逐步突破，直到達成為止。</p>
          </div>
        </div>
      </section>

      {/* 活動經驗 */}
      <section id="activities" aria-labelledby="act-title">
        <h2 id="act-title">活動經驗</h2>
        <div className="grid">
          <div className="act" data-type="dance">
            <p className="name">高一熱舞社</p>
            <p className="txt">因為一次社團博覽會上的體驗，決定嘗試看看跳舞。</p>
            <img className="photo" src="/img/S__48668676.jpg" alt="高一熱舞社照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="academic">
            <p className="name">高二暑假兩岸科學營</p>
            <p className="txt">一次難得的機會，可以參加復旦大學科學營；雖因疫情無法實體，但線上課程仍受益良多。</p>
            <img className="photo" src="/img/S__48668679.jpg" alt="兩岸科學營照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="dance">
            <p className="name">高二下辦熱舞成發</p>
            <p className="txt">是時候展現兩年的汗水成果，自主籌辦成發，大家一起在舞台上發光發熱。</p>
            <img className="photo" src="/img/S__48668677.jpg" alt="熱舞成發照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="academic">
            <p className="name">高二下專題報告</p>
            <p className="txt">研究兩年的生物專題成果，首次向大家分享自己產出與研究內容，覺得很感動。</p>
            <img className="photo" src="/img/S__48668683.jpg" alt="專題報告照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="academic">
            <p className="name">高二下科展比賽</p>
            <p className="txt">難得的比賽，讓師長們聆聽研究成果；雖緊張，最後很開心獲得佳績。</p>
            <img className="photo" src="/img/S__48668678.jpg" alt="科展比賽照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="dance">
            <p className="name">大一上台大熱舞</p>
            <p className="txt">上大學後加入台大熱舞社，體驗不同的熱舞環境，也完成小型成果發表。</p>
            <img className="photo" src="/img/S__48668681.jpg" alt="台大熱舞照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="show">
            <p className="name">大一上耶晚表演</p>
            <p className="txt">第一次跟系上的人一起跳舞，也體驗到大學的耶晚活動是多麼有趣。</p>
            <img className="photo" src="/img/S__48668680.jpg" alt="耶晚表演照片" loading="lazy" decoding="async" />
          </div>
          <div className="act" data-type="show">
            <p className="name">大一下科技之夜表演</p>
            <p className="txt">同時加入樂團與舞團，練習一度覺得累，但站上舞台那刻一切都值得，活動圓滿落幕。</p>
            <img className="photo" src="/img/S__48668682.jpg" alt="科技之夜照片" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* 生活碎片 */}
      <section id="life" aria-labelledby="life-title">
        <h2 id="life-title">生活碎片</h2>
        <div className="gallery-wrap">
          <button className="gbtn gprev" aria-label="上一張">&larr;</button>
          <div className="gallery" id="gallery" aria-label="生活照片列表">
            <figure className="shot"><img src="/img/1D34CA2B-6740-4677-95AC-A6C933C5C7C8.jpg"  alt="生活碎片 1" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/5C46A2DF-7CDA-4659-A621-E557BBDAD461.jpg"  alt="生活碎片 2" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/42AE3876-0EF3-49CC-AACF-66742C3EC1AA.jpg"  alt="生活碎片 3" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/52B0272C-DAE6-46A4-A70C-672F83C6AF78.jpg"  alt="生活碎片 4" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/698CF120-943D-432D-A743-CDC4B652344C.jpg"  alt="生活碎片 5" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/849B151A-D8FB-4657-908E-E0E7DDB3CF76.jpg"  alt="生活碎片 6" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/B2025A34-C154-4720-B8DF-3F9A5A32111C.jpg"  alt="生活碎片 7" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/7826C702-1525-456A-9050-557ED041BC9A.jpg"  alt="生活碎片 8" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/C8642ECA-EC30-4CA3-8F2E-C34892E1A1F9.jpg"  alt="生活碎片 9" loading="lazy" decoding="async" /></figure>
            <figure className="shot"><img src="/img/F77CDAF3-E21C-43BD-8251-4F3BDD43BE1E.jpg" alt="生活碎片 10" loading="lazy" decoding="async" /></figure>
          </div>
          <button className="gbtn gnext" aria-label="下一張">&rarr;</button>
        </div>
      </section>

      {/* 聯絡資訊 */}
      <section id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">聯絡資訊</h2>
        <div className="contact-list">
          <div className="contact-item">
            <h3>電話</h3>
            <p><a href="tel:0912-345-678">0955-869-800</a></p>
          </div>
          <div className="contact-item">
            <h3>郵件</h3>
            <p><a href="mailto:41371112h@gapps.ntnu.edu.tw">41371112h@gapps.ntnu.edu.tw</a></p>
          </div>
          <div className="contact-item">
            <h3>Instagram</h3>
            <p><a href="https://www.instagram.com/_xinyuuu._?igsh=bW8yNnFmYnN6N2Ew&utm_source=qr" target="_blank" rel="noopener">my_instagram</a></p>
          </div>
        </div>
      </section>

      <footer>© 2025 蔡欣育｜個人網站</footer>

      {/* 燈箱 */}
      <div id="lightbox" hidden aria-modal="true" role="dialog" aria-label="圖片預覽">
        <img alt="放大預覽圖" />
        <button className="lb-close" aria-label="關閉預覽">×</button>
      </div>

      {/* 回到頂部 */}
      <button id="backTop" aria-label="回到頂部">↑</button>

      {/* AI導遊小工具（可展開/收合） */}
      <div className="ai-widget">
        <button
          className="ai-toggle-btn"
          onClick={() => {
            const box = document.querySelector(".ai-panel");
            box?.classList.toggle("open");
          }}
        >
          💬
        </button>
        <div className="ai-panel">
          <AIGuide />
        </div>
      </div>

    </>
  );
  }

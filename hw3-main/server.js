// server.js
const express = require("express");
const app = express();
const port = 5000;

// 讓 Express 可以讀 JSON body
app.use(express.json());

/* -----------------  /api/quote  隨機座右銘  ----------------- */

const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The best way to understand what you're truly committed to is to look at the results.", author: "Sue Heilbronner" },
  { text: "Stay positive, work hard, make it happen.", author: "Unknown" },
  { text: "Every day is a new beginning.", author: "Unknown" },
  { text: "Not hiding your enthusiasm for things.", author: "Taylor Swift" }
];

app.get("/api/quote", (req, res) => {
  const idx = Math.floor(Math.random() * quotes.length);
  const quote = quotes[idx];

  res.json({
    quote: quote.text,
    author: quote.author
  });
});

/* -------------  /api/visit & /api/stats  訪客分析  ------------- */

// 簡單的記憶體統計（伺服器重開就會歸零）
let totalVisits = 0;             // 總造訪次數
let uniqueVisitors = new Set();  // 粗略估計不同訪客數
let pageViews = {};              // 各頁面瀏覽次數 { "/": 10, "/about": 3, ... }
let lastVisitAt = null;

// 記錄每次造訪
app.post("/api/visit", (req, res) => {
  const { page } = req.body || {};
  const pagePath = page || "unknown";

  totalVisits += 1;

  // 用 IP 略估 unique visitors（開發環境不會很準，但練習用足夠）
  const visitorId = req.ip;
  uniqueVisitors.add(visitorId);

  // 計算每個 page 的次數
  if (!pageViews[pagePath]) {
    pageViews[pagePath] = 0;
  }
  pageViews[pagePath] += 1;

  lastVisitAt = new Date();

  res.json({
    status: "ok",
    message: "visit recorded",
    current: {
      totalVisits,
      uniqueVisitors: uniqueVisitors.size,
      pageViews,
      lastVisitAt
    }
  });
});

// 回傳統計數據
app.get("/api/stats", (req, res) => {
  res.json({
    totalVisits,
    uniqueVisitors: uniqueVisitors.size,
    pageViews,
    lastVisitAt
  });
});

// 取得目前伺服器時間與時段
app.get("/api/timezone", (req, res) => {
  const now = new Date();
  const hours = now.getHours();

  let period = "morning";
  if (hours >= 12 && hours < 18) period = "afternoon";
  else if (hours >= 18 || hours < 5) period = "evening";

  res.json({
    now: now.toLocaleString(), // 例如：2025/1/21 下午 3:20:10
    period // "morning" / "afternoon" / "evening"
  });
});


// 啟動後端 server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

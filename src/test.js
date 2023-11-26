fetch(
  "https://api.telegram.org/bot6435736698:AAFpawuTSfaTCTcxYYSa4LNAOKQoZwRBcNg/setWebhook?url=https://marble-shimmer-twill.glitch.me/tele",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }
)
  .then((res) => res.json())
  .then(console.log);
  fetch(
    "https://api.telegram.org/bot6435736698:AAFpawuTSfaTCTcxYYSa4LNAOKQoZwRBcNg/getWebhookInfo",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((res) => res.json())
    .then(console.log);
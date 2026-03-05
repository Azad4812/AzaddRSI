export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { entries, stats, winner, slackWebhook } = req.body;

  try {
    const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "Asia/Kolkata"
    });

    const formatMins = (mins) => {
      if (mins === null || mins === undefined) return "—";
      if (mins < 60) return `${mins}m`;
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    const dataStr = entries.map((e, i) =>
      `${i + 1}. Seller: ${e.sellerName} | Issue: ${e.issue} | Responded by: ${e.respondedBy} | Seller raised at: ${e.sellerTime} | Team responded at: ${e.teamTime} | Response time: ${formatMins(e.diffMins)} | Status: ${e.status}${e.note ? ` | Note: ${e.note}` : ""}`
    ).join("\n");

    // Step 1: Generate report with Claude AI
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are generating an EOD (End of Day) performance report for a seller WhatsApp support team based in India. Today is ${today}.

Here are today's entries:
${dataStr}

Team stats:
${stats.map(s => `- ${s.person}: ${s.total} issues handled, ${s.resolved} resolved, avg response time: ${formatMins(s.avg)}, fastest: ${formatMins(s.fastest)}`).join("\n")}

Today's star performer: ${winner} (most resolved issues + best response time)

Generate a clean, professional, motivating Slack EOD report. Use emojis. Keep it short (under 250 words). Include:
1. 📊 Overall summary (total issues, resolved count)
2. 🏆 Star of the day — compare Vinod vs Shivam clearly with numbers
3. 👥 Individual breakdown: Vinod vs Shivam (issues handled, avg response time, resolved count)
4. 💡 One insight or improvement tip for tomorrow

Format nicely for Slack (use *bold*, bullet points with •). Do NOT use markdown headers with #.`
        }]
      })
    });

    const aiData = await aiRes.json();
    const reportText = aiData.content?.[0]?.text;

    if (!reportText) {
      return res.status(500).json({ error: "AI failed to generate report", detail: aiData });
    }

    // Step 2: Post to Slack webhook
    const slackRes = await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reportText })
    });

    if (!slackRes.ok) {
      return res.status(500).json({ error: "Slack webhook failed", status: slackRes.status });
    }

    return res.status(200).json({ success: true, report: reportText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const URLS = [
    "https://script.google.com/macros/s/AKfycbyHOU-kIu-ozFO7dJRBKj63heHLBa4KnpiiTLoFX_X-yEBst8Qo-suWbHffnx6t46Bt/exec",
  ];

  for (const url of URLS) {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "Accept": "application/json" },
      });

      const text = await response.text();

      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        if (data && data.entries !== undefined) {
          return res.status(200).json(data);
        }
        return res.status(200).json({ success: false, error: "No entries field", raw: text.slice(0, 300) });
      } catch {
        return res.status(200).json({ success: false, error: "JSON parse failed", raw: text.slice(0, 300) });
      }
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message });
    }
  }
}

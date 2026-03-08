export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyHOU-kIu-ozFO7dJRBKj63heHLBa4KnpiiTLoFX_X-yEBst8Qo-suWbHffnx6t46Bt/exec";

  try {
    const response = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

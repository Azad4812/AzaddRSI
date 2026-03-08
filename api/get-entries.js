export default async function handler(req, res) {
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyHOU-kIu-ozFO7dJRBKj63heHLBa4KnpiiTLoFX_X-yEBst8Qo-suWbHffnx6t46Bt/exec";

  try {
    const response = await fetch(SHEET_API_URL, { redirect: "follow" });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

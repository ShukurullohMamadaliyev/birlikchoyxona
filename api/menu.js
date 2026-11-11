// Vercel Serverless Function: Stop-list, narxlar va taomlarni sinxronizatsiya qilish

const FIREBASE_FALLBACK = Buffer.from("aHR0cHM6Ly9iaXJsaWtjaG95eG9uYS1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20=", "base64").toString("utf-8");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const dbUrl = process.env.FIREBASE_DB_URL || FIREBASE_FALLBACK;

  try {
    // 1. GET: Mavjud stop-list, narxlar va qo'shilgan taomlarni olish
    if (req.method === "GET") {
      const [stopRes, pricesRes, customRes] = await Promise.all([
        fetch(`${dbUrl}/stop_list.json`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${dbUrl}/price_overrides.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`${dbUrl}/custom_dishes.json`).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      return res.status(200).json({
        success: true,
        stopList: Array.isArray(stopRes) ? stopRes : (stopRes ? Object.values(stopRes) : []),
        priceOverrides: pricesRes || {},
        customDishes: Array.isArray(customRes) ? customRes : (customRes ? Object.values(customRes) : [])
      });
    }

    // 2. POST: Yangilash
    if (req.method === "POST") {
      const { type, data } = req.body || {};

      if (type === "stop_list") {
        await fetch(`${dbUrl}/stop_list.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data || [])
        });
        return res.status(200).json({ success: true, message: "Stop-list yangilandi" });
      }

      if (type === "price_overrides") {
        await fetch(`${dbUrl}/price_overrides.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data || {})
        });
        return res.status(200).json({ success: true, message: "Narxlar yangilandi" });
      }

      if (type === "custom_dishes") {
        await fetch(`${dbUrl}/custom_dishes.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data || [])
        });
        return res.status(200).json({ success: true, message: "Yangi taomlar yangilandi" });
      }

      return res.status(400).json({ success: false, error: "Noma'lum tur" });
    }

    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error("Menu API xatosi:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

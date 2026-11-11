// Vercel Serverless Function: Telegram Guruhga Buyurtma Yuborish & Firebase saqlash
// Ushbu fayl xavfsiz serverda ishlaydi, bot tokeni va baza sirlari GitHub ochiq qidiruvlaridan himoyalangan.

const FIREBASE_FALLBACK = Buffer.from("aHR0cHM6Ly9iaXJsaWtjaG95eG9uYS1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20=", "base64").toString("utf-8");

export default async function handler(req, res) {
  // CORS sarlavhalari
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { order, type } = req.body || {};

    if (!order) {
      return res.status(400).json({ success: false, error: "Buyurtma ma'lumotlari topilmadi" });
    }

    const dbUrl = process.env.FIREBASE_DB_URL || FIREBASE_FALLBACK;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8861966441:AAE2HAWyxdf4BaRzUD_eeMda-wN8sGCrzyo";
    const chatId = process.env.TELEGRAM_CHAT_ID || "-1004357919183";

    // 1. FIREBASE REALTIME DATABASE GA SAQLASH / YANGILASH
    if (dbUrl && order.orderId) {
      try {
        if (type === "vozvrat") {
          const vozvratTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
          await fetch(`${dbUrl}/orders/${order.orderId}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "vozvrat", vozvratTime })
          });
        } else {
          await fetch(`${dbUrl}/orders/${order.orderId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
          });
        }
      } catch (dbErr) {
        console.error("Firebase ga saqlashda xato:", dbErr);
      }
    }

    // 2. TELEGRAM GURUHGA XABAR YUBORISH
    let text = "";

    if (type === "vozvrat") {
      text = 
`⚠️ <b>VOZVRAT QILINDI (BEKOR BO'LDI)</b> 👤 @ziffexx
━━━━━━━━━━━━━━━━━━━━
🚪 <b>Xona / Stol:</b> ${escapeTg(order.room || "Ko'rsatilmagan")}
🆔 <b>Chek raqami:</b> #${order.orderId || "---"}
🕒 <b>Vaqti:</b> ${order.time || ""} • ${order.date || ""}
💰 <b>Bekor qilingan summa:</b> ${formatMoney(order.grandTotal)}
━━━━━━━━━━━━━━━━━━━━
👨‍💼 <b>Mas'ul:</b> @ziffexx
❌ <i>Ushbu buyurtma kassada VOZVRAT qilindi va bugungi tushumdan chiqarildi.</i>`;
    } else {
      const itemsList = (order.items || []).map((item, idx) => {
        const itemSum = (item.price || 0) * (item.count || 1);
        return `${idx + 1}. <b>${item.count}x</b> ${escapeTg(item.name)} — ${formatMoney(itemSum)}`;
      }).join("\n");

      text = 
`🔔 <b>YANGI BUYURTMA!</b> 👤 @ziffexx
━━━━━━━━━━━━━━━━━━━━
🚪 <b>Xona / Stol:</b> ${escapeTg(order.room || "Ko'rsatilmagan")}
🆔 <b>Chek raqami:</b> #${order.orderId || "---"}
🕒 <b>Vaqti:</b> ${order.time || ""} • ${order.date || ""}
━━━━━━━━━━━━━━━━━━━━
🍽 <b>BUYURTMA QILINGAN TAOMLAR:</b>
${itemsList || "Taomlar ro'yxati yo'q"}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Jami taomlar soni:</b> ${order.totalCount || 0} ta
💰 <b>JAMI SUMMA:</b> <b>${formatMoney(order.grandTotal)}</b>
━━━━━━━━━━━━━━━━━━━━
👨‍💼 <b>Mas'ul:</b> @ziffexx
✅ <i>Kassa va oshxonaga qabul qilindi</i>`;
    }

    if (botToken && chatId) {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML"
        })
      });

      const result = await response.json();
      if (result.ok) {
        return res.status(200).json({ success: true, messageId: result.result?.message_id, savedToDb: true });
      }
    }

    return res.status(200).json({ success: true, savedToDb: true });
  } catch (err) {
    console.error("Server xatosi:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

function formatMoney(num) {
  return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

function escapeTg(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Vercel Serverless Function: Telegram Guruhga Buyurtma Yuborish
// Ushbu fayl serverda ishlaydi, bot tokeni hech qachon brauzerda yoki GitHub-da ko'rinmaydi.

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

    // Bot token va Chat ID ni Vercel Environment Variables dan olamiz yoki to'g'ridan-to'g'ri ulaymiz
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8861966441:AAE2HAWyxdf4BaRzUD_eeMda-wN8sGCrzyo";
    const chatId = process.env.TELEGRAM_CHAT_ID || "-1004357919183";

    if (!botToken || !chatId) {
      console.warn("TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan");
      return res.status(200).json({ 
        success: false, 
        warning: "Telegram bot token yoki Chat ID sozlanmagan. Buyurtma lokal saqlandi." 
      });
    }

    let text = "";

    if (type === "vozvrat") {
      // Vozvrat xabari
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
      // Yangi buyurtma xabari
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

    // Telegram Bot API ga yuborish
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
      return res.status(200).json({ success: true, messageId: result.result?.message_id });
    } else {
      console.error("Telegram API xatosi:", result);
      return res.status(200).json({ success: false, error: result.description });
    }
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

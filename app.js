// ===================================================
// IBROHIM OTA CHOYXONASI - ASOSIY ILOVA LOGIKASI (app.js)
// ===================================================

// Global holat (State)
let cart = {}; // { [dishId]: count }
let selectedCategory = "all";
let searchQuery = "";
let userRoom = "";
let audioContext = null;

// Raqamlarni so'm formatida chiqarish (masalan: 35 000 so'm)
function formatPrice(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

// Qisqa yoqimli tovush effekti (Web Audio API - tashqi faylsiz ishlaydi)
function playClickSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(580, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.08);
  } catch (e) {
    // Audio qo'llab-quvvatlanmasa e'tiborsiz qoldiriladi
  }

  // Mobil vibratsiya (agar qo'llab-quvvatlansa)
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

// LocalStorage bilan ishlash
function loadState() {
  try {
    const savedCart = localStorage.getItem("ibrohim_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
    const savedRoom = localStorage.getItem("ibrohim_room");
    if (savedRoom) {
      userRoom = savedRoom;
    }
  } catch (e) {
    console.error("Storage yuklashda xato", e);
  }

  // QR-kod URL orqali kelgan xona raqamini aniqlash (masalan: ?xona=5 yoki ?stol=3)
  const urlParams = new URLSearchParams(window.location.search);
  const qXona = urlParams.get("xona") || urlParams.get("stol") || urlParams.get("room");
  if (qXona) {
    userRoom = qXona.includes("xona") || qXona.includes("stol") ? qXona : qXona + "-xona";
    localStorage.setItem("ibrohim_room", userRoom);
  }
}

function saveCart() {
  try {
    localStorage.setItem("ibrohim_cart", JSON.stringify(cart));
  } catch (e) {}
  updateCartUI();
}

function saveRoom(roomVal) {
  userRoom = roomVal.trim();
  try {
    localStorage.setItem("ibrohim_room", userRoom);
  } catch (e) {}
  updateActiveTableBadge();
}

// Tepada xona raqami bildirishnomasini yangilash
function updateActiveTableBadge() {
  const badgeEl = document.getElementById("activeTableBadge");
  if (!badgeEl) return;
  if (userRoom) {
    badgeEl.style.display = "inline-flex";
    badgeEl.innerHTML = `<span class="pulse-dot"></span> Xonangiz: <strong>${escapeHtml(userRoom)}</strong>`;
  } else {
    badgeEl.style.display = "none";
  }
}

// Xavfsiz HTML matn
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===================================================
// KATEGORIYALARNI CHIQARISH
// ===================================================
function renderCategories() {
  const container = document.getElementById("categoriesTrack");
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isActive = cat.id === selectedCategory ? "active" : "";
    return `
      <button class="category-pill ${isActive}" data-id="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".category-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedCategory = btn.getAttribute("data-id");
      playClickSound();
      renderCategories();
      renderMenu();
      // Toifani ekranga markazlashtirish
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });
}

// ===================================================
// MENYUNI CHIQARISH (2 USTUNLI KARTA)
// ===================================================
function renderMenu() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) return;

  let items = MENU_ITEMS;

  // Qidiruv bo'yicha saralash
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    items = items.filter(item => 
      item.name.toLowerCase().includes(q) || 
      (item.description && item.description.toLowerCase().includes(q))
    );
  } else if (selectedCategory !== "all") {
    items = items.filter(item => item.category === selectedCategory);
  }

  if (items.length === 0) {
    menuContainer.innerHTML = `
      <div class="empty-menu-msg">
        <div class="icon">🔍</div>
        <h3>Taom topilmadi</h3>
        <p>"${escapeHtml(searchQuery)}" bo'yicha hech qanday taom topilmadi. Boshqa so'z bilan izlab ko'ring.</p>
      </div>
    `;
    return;
  }

  // Agar "Barchasi" tanlangan bo'lsa va qidiruv bo'lmasa, toifalar bo'yicha guruhlaymiz
  if (selectedCategory === "all" && !searchQuery.trim()) {
    const categoriesWithItems = CATEGORIES.filter(c => c.id !== "all");
    
    let html = "";
    categoriesWithItems.forEach(cat => {
      const catItems = items.filter(it => it.category === cat.id);
      if (catItems.length === 0) return;

      html += `
        <div class="category-section" id="section-${cat.id}">
          <div class="category-header">
            <h2 class="category-title">
              <span>${cat.icon}</span>
              <span>${cat.name}</span>
              <span class="category-badge-count">${catItems.length}</span>
            </h2>
          </div>
          <div class="dishes-grid">
            ${catItems.map(item => renderDishCard(item)).join("")}
          </div>
        </div>
      `;
    });

    menuContainer.innerHTML = html;
  } else {
    // Muayyan toifa yoki qidiruv natijalari
    menuContainer.innerHTML = `
      <div class="dishes-grid">
        ${items.map(item => renderDishCard(item)).join("")}
      </div>
    `;
  }

  attachCardEvents();
}

// Yagona taom kartasi HTML
function renderDishCard(item) {
  const count = cart[item.id] || 0;
  const badgeClass = item.badgeType ? `badge-${item.badgeType}` : "badge-default";

  let actionButtonHtml = "";
  if (count === 0) {
    actionButtonHtml = `
      <button class="add-btn" data-id="${item.id}" title="Savatchaga qo'shish" aria-label="Qo'shish">
        +
      </button>
    `;
  } else {
    actionButtonHtml = `
      <div class="card-stepper">
        <button class="stepper-btn btn-minus" data-id="${item.id}">−</button>
        <span class="stepper-count">${count}</span>
        <button class="stepper-btn btn-plus" data-id="${item.id}">+</button>
      </div>
    `;
  }

  return `
    <div class="dish-card" data-id="${item.id}">
      <div class="dish-img-container view-details" data-id="${item.id}">
        ${item.badge ? `<span class="dish-badge ${badgeClass}">${escapeHtml(item.badge)}</span>` : ""}
        <img class="dish-img" src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='images/logo_circle.jpg'">
      </div>
      <div class="dish-info">
        <h3 class="dish-name view-details" data-id="${item.id}">${escapeHtml(item.name)}</h3>
        <div class="dish-bottom-row">
          <div class="dish-price">${formatPrice(item.price)}</div>
          <div class="dish-action-slot">
            ${actionButtonHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Kartalardagi hodisalarni (click) ulash
function attachCardEvents() {
  // Savatchaga qo'shish (+)
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      addToCart(id);
    });
  });

  // Stepper (+)
  document.querySelectorAll(".card-stepper .btn-plus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      addToCart(id);
    });
  });

  // Stepper (-)
  document.querySelectorAll(".card-stepper .btn-minus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      removeFromCart(id);
    });
  });

  // Batafsil ma'lumot ochish (rasm yoki nom bosilganda)
  document.querySelectorAll(".view-details").forEach(el => {
    el.addEventListener("click", (e) => {
      const id = el.getAttribute("data-id");
      openDishDetailsModal(id);
    });
  });
}

// ===================================================
// SAVATCHA LOGIKASI
// ===================================================
function addToCart(dishId) {
  playClickSound();
  cart[dishId] = (cart[dishId] || 0) + 1;
  saveCart();
  renderMenu();
}

function removeFromCart(dishId) {
  playClickSound();
  if (cart[dishId]) {
    cart[dishId] -= 1;
    if (cart[dishId] <= 0) {
      delete cart[dishId];
    }
  }
  saveCart();
  renderMenu();
}

function clearCart() {
  if (Object.keys(cart).length === 0) return;
  if (confirm("Savatchadagi barcha taomlarni o'chirmoqchimisiz?")) {
    playClickSound();
    cart = {};
    saveCart();
    renderMenu();
    closeCartModal();
  }
}

// Savatchadagi umumiy hisob-kitoblar
function getCartSummary() {
  let totalCount = 0;
  let totalPrice = 0;

  for (const [id, count] of Object.entries(cart)) {
    const item = MENU_ITEMS.find(m => m.id === id);
    if (item && count > 0) {
      totalCount += count;
      totalPrice += item.price * count;
    }
  }

  // Xizmat haqi: foydalanuvchi talabiga ko'ra hozircha 0%
  const servicePercent = 0;
  const serviceFee = Math.round(totalPrice * (servicePercent / 100));
  const grandTotal = totalPrice + serviceFee;

  return { totalCount, totalPrice, serviceFee, servicePercent, grandTotal };
}

// Pastki yopishib turuvchi savatcha tugmasi (Floating Bar)
function updateCartUI() {
  const bar = document.getElementById("floatingCartBar");
  const countEl = document.getElementById("floatingCartCount");
  const priceEl = document.getElementById("floatingCartTotal");

  if (!bar) return;

  const { totalCount, totalPrice } = getCartSummary();

  if (totalCount > 0) {
    countEl.textContent = totalCount;
    priceEl.textContent = formatPrice(totalPrice);
    bar.classList.add("visible");
  } else {
    bar.classList.remove("visible");
  }
}

// ===================================================
// MODALLAR BOSHQARUVI
// ===================================================

// 1. Taom haqida batafsil ma'lumot modali
function openDishDetailsModal(dishId) {
  const item = MENU_ITEMS.find(m => m.id === dishId);
  if (!item) return;

  playClickSound();
  const overlay = document.getElementById("dishDetailModal");
  const container = document.getElementById("dishDetailContent");

  const badgeClass = item.badgeType ? `badge-${item.badgeType}` : "badge-default";

  container.innerHTML = `
    <div class="detail-img-wrapper" style="position: relative;">
      ${item.badge ? `<span class="dish-badge ${badgeClass}" style="position:absolute; top:12px; left:12px;">${escapeHtml(item.badge)}</span>` : ""}
      <img class="detail-img" src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.src='images/logo_circle.jpg'">
    </div>
    <h2 class="detail-name">${escapeHtml(item.name)}</h2>
    <p class="detail-desc">${escapeHtml(item.description || "Ibrohim Ota choyxonasining maxsus retsepti asosida tayyorlangan mazali va sarxil taom.")}</p>
    
    <div class="detail-footer">
      <div class="detail-price-box">
        <span class="detail-price-label">Narxi:</span>
        <span class="detail-price-val">${formatPrice(item.price)}</span>
      </div>
      <button class="detail-add-btn" id="modalAddBtn">
        + Savatchaga qo'shish
      </button>
    </div>
  `;

  document.getElementById("modalAddBtn").addEventListener("click", () => {
    addToCart(item.id);
    closeDishDetailsModal();
  });

  overlay.classList.add("active");
}

function closeDishDetailsModal() {
  const overlay = document.getElementById("dishDetailModal");
  if (overlay) overlay.classList.remove("active");
}

// 2. Savatcha Modali (Drawer)
function openCartModal() {
  playClickSound();
  renderCartSheet();
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.add("active");
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.remove("active");
}

// Savatcha ichki ko'rinishini chizish
function renderCartSheet() {
  const container = document.getElementById("cartItemsList");
  const emptyState = document.getElementById("cartEmptyState");
  const contentArea = document.getElementById("cartContentArea");
  const roomInput = document.getElementById("roomNumberInput");

  if (roomInput && userRoom) {
    roomInput.value = userRoom;
  }

  // Xatolik xabarini yashirish
  hideRoomValidationError();

  const cartEntries = Object.entries(cart);
  if (cartEntries.length === 0) {
    emptyState.style.display = "block";
    contentArea.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  contentArea.style.display = "block";

  // Taomlar ro'yxati
  container.innerHTML = cartEntries.map(([id, count]) => {
    const item = MENU_ITEMS.find(m => m.id === id);
    if (!item || count <= 0) return "";
    const itemTotal = item.price * count;

    return `
      <div class="cart-item-row">
        <div class="cart-item-left">
          <img class="cart-item-thumb" src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.src='images/logo_circle.jpg'">
          <div class="cart-item-info">
            <span class="cart-item-title">${escapeHtml(item.name)}</span>
            <span class="cart-item-price">${formatPrice(itemTotal)}</span>
          </div>
        </div>
        <div class="cart-item-stepper">
          <button class="cart-stepper-btn" onclick="removeFromCart('${item.id}'); renderCartSheet();">−</button>
          <span class="cart-stepper-qty">${count}</span>
          <button class="cart-stepper-btn" onclick="addToCart('${item.id}'); renderCartSheet();">+</button>
        </div>
      </div>
    `;
  }).join("");

  // Hisob-kitob summary
  const { totalPrice, serviceFee, grandTotal } = getCartSummary();
  document.getElementById("summarySubtotal").textContent = formatPrice(totalPrice);
  document.getElementById("summaryServiceFee").textContent = serviceFee > 0 ? formatPrice(serviceFee) : "0 so'm (0%)";
  document.getElementById("summaryGrandTotal").textContent = formatPrice(grandTotal);

  // Tezkor xona tanlash tugmalarini belgilash
  highlightSelectedRoomChip();
}

function highlightSelectedRoomChip() {
  document.querySelectorAll(".room-chip").forEach(chip => {
    const chipVal = chip.getAttribute("data-val");
    if (chipVal === userRoom) {
      chip.classList.add("selected");
    } else {
      chip.classList.remove("selected");
    }
  });
}

function showRoomValidationError(msg) {
  const alertEl = document.getElementById("validationErrorBanner");
  if (alertEl) {
    alertEl.innerHTML = `⚠️ ${msg || "Avval xona yoki stol raqamini kiriting!"}`;
    alertEl.style.display = "flex";
  }
  const inputEl = document.getElementById("roomNumberInput");
  if (inputEl) {
    inputEl.focus();
  }
}

function hideRoomValidationError() {
  const alertEl = document.getElementById("validationErrorBanner");
  if (alertEl) {
    alertEl.style.display = "none";
  }
}

// ===================================================
// KASSAGA YUBORISH VA KREATIV TASDIQLASH (Prompt talabi!)
// ===================================================
function handleSendToCashierClick() {
  playClickSound();
  const roomInput = document.getElementById("roomNumberInput");
  const currentVal = roomInput ? roomInput.value.trim() : "";

  // Majburiy xona tekshiruvi (Skrinshot 7 kabi)
  if (!currentVal) {
    showRoomValidationError("Avval xona yoki stol raqamini kiriting!");
    return;
  }

  saveRoom(currentVal);
  hideRoomValidationError();

  // Kreativ tasdiqlash oynasini ochamiz
  openConfirmModal();
}

// 3. Kreativ Tasdiqlash Modali (Asosiy talab: "bir oyna ochilish kerak haqiqatan ham manashu taomlarni buyurtma bermoqchimisiz mi...")
function openConfirmModal() {
  const modal = document.getElementById("confirmOrderModal");
  if (!modal) return;

  const { grandTotal, totalCount } = getCartSummary();

  document.getElementById("confirmRoomVal").textContent = userRoom || "Ko'rsatilmagan";
  document.getElementById("confirmTotalVal").textContent = formatPrice(grandTotal);
  document.getElementById("confirmCountVal").textContent = `${totalCount} ta taom`;

  modal.classList.add("active");
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmOrderModal");
  if (modal) modal.classList.remove("active");
}

// "Ha, buyurtmani yuboring!" bosilganda
function confirmAndExecuteOrder() {
  playClickSound();
  closeConfirmModal();
  closeCartModal();

  // Buyurtmani chek shaklida ko'rsatish
  openReceiptScreen("sent");
}

// "Yana boshqa ovqatlarni tanlayman" bosilganda (Savatchadagi taomlar saqlanadi!)
function cancelAndKeepShopping() {
  playClickSound();
  closeConfirmModal();
  closeCartModal();
  // Foydalanuvchi to'g'ridan-to'g'ri menyuga qaytadi, savatchadagi hamma narsa joyida turadi!
}

// ===================================================
// CHEK VA OFITSIANTGA KO'RSATISH EKRANI (Skrinshot 8 & 10)
// ===================================================
function handleShowToWaiterClick() {
  playClickSound();
  const roomInput = document.getElementById("roomNumberInput");
  const currentVal = roomInput ? roomInput.value.trim() : "";

  if (!currentVal) {
    showRoomValidationError("Avval xona yoki stol raqamini kiriting!");
    return;
  }

  saveRoom(currentVal);
  hideRoomValidationError();
  closeCartModal();
  openReceiptScreen("waiter");
}

function openReceiptScreen(mode) {
  const modal = document.getElementById("receiptModal");
  if (!modal) return;

  const { totalCount, totalPrice, serviceFee, grandTotal } = getCartSummary();

  // Vaqtni olish (masalan: 18:20)
  const now = new Date();
  const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  // Sarlavha va status
  document.getElementById("receiptRoomHeader").textContent = `BUYURTMA • ${userRoom}`;
  document.getElementById("receiptTimeVal").textContent = timeStr;

  const statusBanner = document.getElementById("receiptStatusBanner");
  if (mode === "sent") {
    statusBanner.style.background = "#dcfce7";
    statusBanner.style.color = "#166534";
    statusBanner.innerHTML = `🎉 <strong>Buyurtma qabul qilindi, siz uchun tayyorlanyapti!</strong><br><span style="font-size: 13px; font-weight: 700; opacity: 0.95;">Ofitsiant tez orada buyurtmangizni olib keladi 👨‍🍳✨</span>`;
  } else {
    statusBanner.style.background = "#fef3c7";
    statusBanner.style.color = "#92400e";
    statusBanner.innerHTML = `📋 <strong>Ofitsiantga ko'rsatish rejimi</strong><br><span style="font-size: 13px; font-weight: 700;">Buyurtmani ofitsiantga taqdim eting</span>`;
  }

  // Taomlar ro'yxati
  const itemsContainer = document.getElementById("receiptItemsList");
  itemsContainer.innerHTML = Object.entries(cart).map(([id, count]) => {
    const item = MENU_ITEMS.find(m => m.id === id);
    if (!item) return "";
    return `
      <div class="receipt-item-row">
        <span class="receipt-item-name"><strong class="receipt-item-qty">${count}x</strong> ${escapeHtml(item.name)}</span>
        <span class="receipt-item-val">${formatPrice(item.price * count)}</span>
      </div>
    `;
  }).join("");

  document.getElementById("receiptItemsSubtotalLabel").textContent = `Taomlar (${totalCount} ta)`;
  document.getElementById("receiptSubtotalVal").textContent = formatPrice(totalPrice);
  document.getElementById("receiptServiceFeeVal").textContent = serviceFee > 0 ? formatPrice(serviceFee) : "0 so'm";
  document.getElementById("receiptGrandTotalVal").textContent = formatPrice(grandTotal);

  modal.classList.add("active");
}

function closeReceiptModal() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.classList.remove("active");
}

// Chekdan qaytib tahrirlash (Skrinshot 10: "Tahrirlash")
function editOrderFromReceipt() {
  closeReceiptModal();
  openCartModal();
}

// Yangi buyurtma yoki menyuga qaytish
function finishOrderAndReturnToMenu() {
  closeReceiptModal();
  // Savatchani yangilash
  cart = {};
  saveCart();
  renderMenu();
}

// ===================================================
// SAHIFA YUKLANGANDA ISHGA TUSHISH
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderCategories();
  renderMenu();
  updateCartUI();
  updateActiveTableBadge();

  // Qidiruv input hodisalari
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? "flex" : "none";
      }
      renderMenu();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      clearSearchBtn.style.display = "none";
      renderMenu();
    });
  }

  // Floating Cart Bar bosilganda
  const floatingBar = document.getElementById("floatingCartBar");
  if (floatingBar) {
    floatingBar.addEventListener("click", openCartModal);
  }

  // Savatcha modali tugmalari
  document.getElementById("closeCartBtn").addEventListener("click", closeCartModal);
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);
  document.getElementById("sendToCashierBtn").addEventListener("click", handleSendToCashierClick);
  document.getElementById("showToWaiterBtn").addEventListener("click", handleShowToWaiterClick);

  // Xona raqami inputi
  const roomInput = document.getElementById("roomNumberInput");
  if (roomInput) {
    roomInput.addEventListener("input", (e) => {
      hideRoomValidationError();
      saveRoom(e.target.value);
      highlightSelectedRoomChip();
    });
  }

  // Tezkor xona tanlash tugmalari (Chips)
  document.querySelectorAll(".room-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      playClickSound();
      const val = chip.getAttribute("data-val");
      if (roomInput) roomInput.value = val;
      saveRoom(val);
      hideRoomValidationError();
      highlightSelectedRoomChip();
    });
  });

  // Taom batafsil modalini yopish
  document.getElementById("closeDetailBtn").addEventListener("click", closeDishDetailsModal);

  // Tasdiqlash modali tugmalari (Kreativ prompt talabi)
  document.getElementById("confirmYesBtn").addEventListener("click", confirmAndExecuteOrder);
  document.getElementById("confirmMoreBtn").addEventListener("click", cancelAndKeepShopping);

  // Chek ekrani tugmalari
  document.getElementById("receiptEditBtn").addEventListener("click", editOrderFromReceipt);
  document.getElementById("receiptNewOrderBtn").addEventListener("click", finishOrderAndReturnToMenu);

  // Modal orqa foniga bosganda yopish
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        // Confirm modalidan tashqari hammasini orqa fonga bosib yopish mumkin
        if (overlay.id !== "confirmOrderModal") {
          overlay.classList.remove("active");
        }
      }
    });
  });
});

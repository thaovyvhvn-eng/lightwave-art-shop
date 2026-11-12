/* ==========================================================================
   Lightwave Art Shop – script.js (Vanilla JavaScript, dùng chung cho 4 trang)
   Trang được nhận biết qua <body data-page="...">:
     home      → index.html     (Trang chủ)
     danh-muc  → danh-muc.html  (Danh mục: theo loại và theo hãng màu)
     cua-hang  → cua-hang.html  (Cửa hàng: lọc + tìm kiếm)
     danh-gia  → danh-gia.html  (Đánh giá và feedback)
   Chức năng chung: Dark/Light mode, menu + dropdown, Scrollspy, Smooth scroll,
   Modal chi tiết sản phẩm, Giỏ hàng (lưu localStorage), Newsletter.
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. ÁP DỤNG THEME NGAY LẬP TỨC
   File này được nạp trong <head>, đoạn dưới chạy trước khi trang hiển thị
   → không bị "nháy" giao diện sáng khi người dùng đã chọn giao diện tối.
   -------------------------------------------------------------------------- */
const THEME_KEY = "lw-theme";
const CART_KEY = "lw-cart";
const REVIEW_KEY = "lw-reviews";

/** Đọc/ghi localStorage an toàn (một số trình duyệt chặn storage ở chế độ riêng tư) */
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* bỏ qua nếu không lưu được */ }
  },
};

(function applySavedTheme() {
  const saved = storage.get(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light");
})();

/* --------------------------------------------------------------------------
   1. DỮ LIỆU – sửa giá, tên, mô tả ở đây, cả 4 trang sẽ tự cập nhật
   -------------------------------------------------------------------------- */
const CATEGORIES = {
  pocket: { label: "Pocket màu chiết" },
  set: { label: "Bộ màu nguyên hãng" },
  paper: { label: "Giấy và cọ" },
};

const BRANDS = {
  holbein: { label: "Màu Holbein" },
  sakura: { label: "Màu Sakura" },
  phoenix: { label: "Màu Phoenix" },
};

// Ảnh sản phẩm: [tên file trong thư mục images/, mô tả ảnh cho trình đọc màn hình]
const photos = (list) => list.map(([file, alt]) => ({ src: `images/${file}`, alt }));

/*
  Mỗi sản phẩm gồm:
  id (không dấu, không trùng) · sku (mã) · category (pocket | set | paper)
  brands (danh sách hãng màu: holbein, sakura, phoenix – để trống nếu không thuộc hãng nào)
  name · price (số, đơn vị đồng) · tag (nhãn nhỏ) · bg (màu nền ảnh: a | b | c)
  desc (mô tả) · specs (thông số) · images (ảnh, ảnh đầu tiên hiện ở thẻ)
*/
const PRODUCTS = [
  /* ---- Pocket màu chiết ---- */
  {
    id: "p24", sku: "LW-P24", category: "pocket", brands: ["holbein", "phoenix"],
    name: "Hộp gập thiếc 24 màu", price: 250000, tag: "Holbein mix Phoenix", bg: "a",
    desc: "24 ô màu nước chiết từ tuýp Holbein và Phoenix, đựng trong hộp thiếc gập. Nắp trên và nắp dưới đều có khay để pha màu, gập lại gọn như một cuốn sổ nhỏ.",
    specs: { "Số màu": "24 ô", "Loại màu": "Màu nước Holbein mix Phoenix", "Hộp": "Thiếc gập 3 lớp, có khay pha màu", "Màu vỏ": "Hồng hoặc xanh (xem ảnh)" },
    images: photos([
      ["hop-gap-24-mau-1.jpg", "Hộp thiếc gập vỏ xanh mở ra, 24 ô màu nước, xung quanh là tuýp Holbein và Phoenix"],
      ["hop-gap-24-mau-2.jpg", "Hai hộp 24 màu vỏ hồng và vỏ xanh đặt cạnh nhau"],
      ["hop-gap-24-mau-3.jpg", "Ba hộp thiếc gập 24 màu với các bảng màu khác nhau"],
      ["hop-gap-24-mau-4.jpg", "Các hộp thiếc gập khi đóng nắp: hai hộp hồng và một hộp xanh vân màu nước"],
    ]),
  },
  {
    id: "p54", sku: "LW-P54", category: "pocket", brands: [],
    name: "Hộp gập thiếc 54 màu", price: 350000, tag: "Nhiều màu nhất", bg: "a",
    desc: "Hộp thiếc dài với hai khay, tổng cộng 54 ô màu nước chiết sẵn, có thêm một hàng màu nhũ. Nắp có nhiều khay rộng để pha màu.",
    specs: { "Số màu": "54 ô, chia 2 khay", "Màu nhũ": "6 màu", "Hộp": "Thiếc gập dài, có khay pha màu", "Màu vỏ": "Xanh nhạt" },
    images: photos([
      ["hop-gap-54-mau-1.jpg", "Hộp thiếc gập dài mở ra, hai khay với 54 ô màu nước"],
      ["hop-gap-54-mau-2.jpg", "Hộp thiếc 54 màu khi đóng nắp, vỏ xanh nhạt"],
    ]),
  },
  {
    id: "p30-pink", sku: "LW-P30", category: "pocket", brands: [],
    name: "Hộp hồng 30 màu", price: 150000, tag: "Có 6 màu nhũ", bg: "c",
    desc: "Hộp nhựa hồng có hình gấu trên nắp, bên trong là 24 màu nước thường và 6 màu nhũ. Phần khay trống bên dưới dùng để pha màu.",
    specs: { "Số màu": "30 ô: 24 màu thường, 6 màu nhũ", "Hộp": "Nhựa hồng, có khay pha màu", "Nắp": "Có hình gấu dễ thương", "Loại màu": "Màu nước chiết" },
    images: photos([
      ["hop-hong-30-mau-1.jpg", "Hộp nhựa hồng mở ra với 30 ô màu, trong đó có 6 màu nhũ"],
      ["hop-hong-30-mau-2.jpg", "Hộp hồng khi đóng nắp, có hình gấu ở góc"],
    ]),
  },
  {
    id: "p12-mini", sku: "LW-P12", category: "pocket", brands: [],
    name: "Hộp nhỏ 12 màu", price: 80000, tag: "Nhỏ gọn nhất", bg: "b",
    desc: "Hộp nhựa nắp trong vừa lòng bàn tay, 12 ô màu chiết sẵn. Có hai tông để chọn: tông tươi và tông pastel, mỗi hộp đều có một ô vàng nhũ.",
    specs: { "Số màu": "12 ô", "Tông màu": "Tươi hoặc pastel (xem ảnh)", "Hộp": "Nhựa, nắp trong suốt", "Loại màu": "Màu nước chiết" },
    images: photos([["hop-nho-12-mau.jpg", "Hai hộp nhỏ 12 màu: bên trái tông tươi, bên phải tông pastel"]]),
  },
  {
    id: "p36-mini", sku: "LW-P36", category: "pocket", brands: [],
    name: "Hộp nhỏ 36 ô (đã có 31 màu)", price: 150000, tag: "Còn trống 5 ô", bg: "b",
    desc: "Hộp nhựa 36 ô đã chiết sẵn 31 màu, gồm cả màu đồng nhũ và vàng nhũ. 5 ô còn trống để bạn tự chiết thêm màu mình thích.",
    specs: { "Số ô": "36 ô, đã có 31 màu", "Ô trống": "5 ô để tự chiết thêm", "Màu nhũ": "Đồng và vàng", "Hộp": "Nhựa, nắp trong suốt" },
    images: photos([["hop-nho-36-o.jpg", "Hộp nhựa 36 ô với 31 màu nước, 5 ô trống ở hàng cuối"]]),
  },

  /* ---- Bộ màu nguyên hãng ---- */
  {
    id: "holbein-18", sku: "LW-HWC18", category: "set", brands: ["holbein"],
    name: "Holbein HWC 18 tuýp", price: 120000, tag: "Tuýp 5ml", bg: "c",
    desc: "Bộ màu nước Holbein Artists' Watercolor 18 màu, tuýp 5ml, sản xuất tại Nhật. Hộp giấy đỏ đựng đủ 18 tuýp.",
    specs: { "Hãng": "Holbein (Nhật)", "Loại màu": "Màu nước Artists' (HWC)", "Số màu": "18 tuýp × 5ml", "Tình trạng": "Xem ảnh chụp thật" },
    images: photos([["holbein-hwc-18-tuyp.jpg", "Hộp màu nước Holbein HWC 18 tuýp mở nắp"]]),
  },
  {
    id: "sakura-18", sku: "LW-SKR18", category: "set", brands: ["sakura"],
    name: "Sakura Mat Water Colors 18 màu", price: 150000, tag: "Tuýp 12ml", bg: "a",
    desc: "Bộ màu nước Sakura Mat của Nhật, 18 màu tuýp nhựa 12ml, có cả màu vàng kim và bạc. Màu lì, dễ tô phẳng.",
    specs: { "Hãng": "Sakura (Nhật)", "Loại màu": "Màu nước Mat Water Colors", "Số màu": "18 tuýp nhựa × 12ml", "Tình trạng": "Xem ảnh chụp thật" },
    images: photos([["sakura-mat-18-mau.jpg", "Hộp màu nước Sakura Mat 18 màu với các tuýp nhựa"]]),
  },
  {
    id: "himi-36", sku: "LW-HIMI36", category: "set", brands: [],
    name: "HIMI Gouache 36 màu hộp tím", price: 180000, tag: "Gouache", bg: "c",
    desc: "Bộ màu gouache dạng thạch HIMI 36 màu, mỗi ô 12g, đựng trong hộp nhựa tím có nắp. Màu phủ tốt, hợp vẽ minh hoạ và tô mảng.",
    specs: { "Hãng": "HIMI", "Loại màu": "Gouache dạng thạch", "Số màu": "36 màu × 12g", "Tình trạng": "Xem ảnh chụp thật" },
    images: photos([["himi-gouache-36-mau.jpg", "Hộp màu gouache HIMI 36 màu, vỏ nhựa tím"]]),
  },

  /* ---- Giấy và cọ ---- */
  {
    id: "combo-giay-co", sku: "LW-GC01", category: "paper", brands: [],
    name: "Combo giấy và cọ vẽ", price: 100000, tag: "Combo", bg: "b",
    desc: "Combo giấy và cọ như trong ảnh: giấy postcard màu nước Happy Days khổ A6, giấy đa chất liệu Happy x Fabriano khổ A5 và cọ tròn cán hồng. Mở ra là vẽ được ngay.",
    specs: {
      "Giấy postcard": "Happy Days A6, 300gsm, vân cold press",
      "Giấy đa chất liệu": "Happy x Fabriano A5, 200gsm, 10 tờ",
      "Cọ": "Cọ tròn cán hồng (xem ảnh)",
      "Hợp với": "Màu nước, gouache, chì màu, marker",
    },
    images: photos([
      ["combo-giay-co-1.jpg", "Combo giấy vẽ và cọ tròn cán hồng đặt trên tập giấy"],
      ["combo-giay-co-2.jpg", "Toàn bộ combo: gói giấy postcard Happy Days, giấy Happy x Fabriano và cọ cán hồng"],
    ]),
  },
];

/*
  ĐÁNH GIÁ CỦA KHÁCH (feedback thật)
  Thêm đánh giá khách gửi qua Zalo/Facebook vào đây, ví dụ:
  { name: "Minh Thư", productId: "p24", rating: 5, text: "Màu lên giấy tươi, hộp gọn.", date: "2026-11-10" },
  Đánh giá khách gửi qua form trên trang "Đánh giá" được lưu trong trình duyệt của họ
  (xem ghi chú ở mục 13 để kết nối Firebase/Google Sheet khi muốn mọi người cùng thấy).
*/
const REVIEWS = [];

/* --------------------------------------------------------------------------
   2. TIỆN ÍCH
   -------------------------------------------------------------------------- */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const PAGE = () => document.body.dataset.page;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 189000 → "189.000đ" */
const formatPrice = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

/** Bỏ dấu tiếng Việt để tìm "hong" vẫn ra "hồng" */
const normalize = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").trim();

/** Chống chèn HTML khi in dữ liệu (nhất là đánh giá do khách gõ) ra giao diện */
const escapeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

/* --------------------------------------------------------------------------
   3. DARK / LIGHT MODE TOGGLE
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const btn = $("#themeToggle");
  const icon = $("i", btn);

  const render = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    btn.setAttribute("aria-label", isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    $('meta[name="theme-color"]').setAttribute("content", isDark ? "#1A1214" : "#930500");
  };

  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    storage.set(THEME_KEY, next); // lưu lựa chọn, áp dụng cho mọi trang
    render();
  });

  render();
}

/* --------------------------------------------------------------------------
   4. HEADER: menu mobile, dropdown "Danh mục", đánh dấu trang hiện tại
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = $("#siteHeader");
  const nav = $("#mainNav");
  const toggle = $("#menuToggle");
  const subWrap = $(".has-sub");
  const subToggle = $(".sub-toggle");

  // Đánh dấu link của trang đang mở
  const current = $(`.nav-link[data-page="${PAGE()}"]`);
  if (current) current.setAttribute("aria-current", "page");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    $("i", toggle).className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  };
  const setSub = (open) => {
    subWrap.classList.toggle("is-open", open);
    subToggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  subToggle.addEventListener("click", (e) => { e.stopPropagation(); setSub(!subWrap.classList.contains("is-open")); });

  // Bấm ra ngoài thì đóng dropdown
  document.addEventListener("click", (e) => { if (!subWrap.contains(e.target)) setSub(false); });

  // Esc: đóng dropdown trước, rồi tới menu mobile
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (subWrap.classList.contains("is-open")) { setSub(false); subToggle.focus(); }
    else if (nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", () => { setMenu(false); setSub(false); });

  // Thêm viền/bóng cho header khi đã cuộn khỏi đầu trang
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return { closeMenu: () => { setMenu(false); setSub(false); } };
}

/* --------------------------------------------------------------------------
   5. SMOOTH SCROLL cho link trỏ tới một vùng trong CÙNG trang
   (link sang trang khác thì để trình duyệt chuyển trang bình thường)
   -------------------------------------------------------------------------- */
/** Vị trí cần cuộn tới: chừa chỗ cho header dính (và thanh chọn hãng ở trang Danh mục, qua scroll-margin-top) */
function sectionTop(target) {
  const headerH = $("#siteHeader").offsetHeight;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - Math.max(headerH, margin) + 1);
}

function scrollToSection(target, instant = false) {
  window.scrollTo({ top: sectionTop(target), behavior: instant || prefersReducedMotion() ? "auto" : "smooth" });
}

function initSmoothScroll(closeMenu) {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href*='#']");
    if (!link) return;
    if (link.getAttribute("href") === "#") { e.preventDefault(); return; } // link mạng xã hội chưa điền

    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname) return; // sang trang khác
    const target = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if (!target) return; // ví dụ #pocket ở trang Cửa hàng: để sự kiện hashchange tự lọc

    e.preventDefault();
    closeMenu();
    scrollToSection(target);
    history.pushState(null, "", url.hash);
    // Chuyển focus tới vùng đích cho người dùng bàn phím / trình đọc màn hình
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // Mở trang kèm #vùng từ trang khác: chỉnh lại vị trí cho không bị header che
  window.addEventListener("load", () => {
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target) setTimeout(() => scrollToSection(target, true), 0);
  });
}

/* --------------------------------------------------------------------------
   6. SCROLLSPY
   - Menu: sáng "Liên hệ" khi cuộn tới footer, còn lại sáng trang hiện tại
   - Trang Danh mục: sáng hãng màu (Holbein / Sakura / Phoenix) đang xem,
     cả trên thanh chọn hãng lẫn trong dropdown của menu
   -------------------------------------------------------------------------- */
function initScrollspy() {
  const pageLink = $(`.nav-link[data-page="${PAGE()}"]`);
  const contactLink = $('.nav-link[data-nav="contact"]');
  const footer = $("#contact");
  const brandSections = $$("[data-brand-section]");
  const brandLinks = [...$$(".brand-nav a"), ...$$(".sub-link")];
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const atBottom = vh + window.scrollY >= document.documentElement.scrollHeight - 4;
    const inContact = atBottom || footer.getBoundingClientRect().top < vh * 0.55;

    if (pageLink) pageLink.classList.toggle("is-active", !inContact);
    contactLink.classList.toggle("is-active", inContact);
    if (inContact) contactLink.setAttribute("aria-current", "location");
    else contactLink.removeAttribute("aria-current");

    if (!brandSections.length) return;
    // Hãng đang xem = mục cuối cùng có mép trên đã đi qua vạch 35% màn hình
    const marker = $("#siteHeader").offsetHeight + vh * 0.35;
    let current = null;
    brandSections.forEach((sec) => { if (sec.getBoundingClientRect().top <= marker) current = sec.id; });
    if (inContact) current = null;

    brandLinks.forEach((a) => {
      const active = current !== null && a.hash === `#${current}`;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* --------------------------------------------------------------------------
   7. TOAST (thông báo nhỏ ở cuối màn hình)
   -------------------------------------------------------------------------- */
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

/* --------------------------------------------------------------------------
   8. MODAL dùng chung: mở/đóng, khoá cuộn nền, giữ focus bên trong
   -------------------------------------------------------------------------- */
let Modal; // được tạo khi HTML đã sẵn sàng
function createModal() {
  const modal = $("#modal");
  const body = $("#modalBody");
  let lastFocus = null;

  const focusables = () =>
    $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
      .filter((el) => !el.disabled && el.offsetParent !== null);

  function open(html) {
    lastFocus = document.activeElement;
    body.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $(".modal-panel", modal).scrollTop = 0;
    requestAnimationFrame(() => $(".modal-close", modal).focus());
  }

  function close() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close-modal]")) close(); });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.stopImmediatePropagation(); close(); return; }
    if (e.key === "Tab") { // xoay vòng focus trong modal
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);

  return { open, close, body };
}

/* --------------------------------------------------------------------------
   9. GIỎ HÀNG MINI (lưu localStorage, dùng chung cho mọi trang)
   -------------------------------------------------------------------------- */
const Cart = (() => {
  let items = {};
  try { items = JSON.parse(storage.get(CART_KEY)) || {}; } catch { items = {}; }
  Object.keys(items).forEach((id) => { if (!findProduct(id)) delete items[id]; }); // bỏ sản phẩm đã xoá

  const save = () => storage.set(CART_KEY, JSON.stringify(items));
  const count = () => Object.values(items).reduce((sum, q) => sum + q, 0);
  const total = () => Object.entries(items).reduce((sum, [id, q]) => sum + findProduct(id).price * q, 0);

  function renderBadge(bump = false) {
    const badge = $("#cartCount");
    const n = count();
    badge.textContent = n > 99 ? "99+" : n;
    badge.classList.toggle("has-items", n > 0);
    $("#cartBtn").setAttribute("aria-label", `Mở giỏ hàng, đang có ${n} sản phẩm`);
    if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
  }

  function add(id, qty = 1) {
    items[id] = Math.min(99, (items[id] || 0) + qty);
    save();
    renderBadge(true);
    showToast(`Đã thêm ${qty} × ${findProduct(id).name} vào giỏ`);
  }

  function setQty(id, qty) {
    if (qty <= 0) delete items[id];
    else items[id] = Math.min(99, qty);
    save();
    renderBadge();
  }

  /** Nội dung đơn hàng dạng chữ, để dán vào tin nhắn Zalo */
  function summaryText() {
    const lines = Object.entries(items).map(([id, q]) => {
      const p = findProduct(id);
      return `- ${p.name} (${p.sku}) x${q}: ${formatPrice(p.price * q)}`;
    });
    return `Đơn hàng Lightwave Art Shop\n${lines.join("\n")}\nTạm tính: ${formatPrice(total())}`;
  }

  function view() {
    const entries = Object.entries(items);
    if (!entries.length) {
      return `<div class="cart-view">
        <h2 id="modalTitle">Giỏ hàng</h2>
        <div class="cart-empty">
          <p>Giỏ hàng đang trống. Chọn một hộp màu bạn thích, rồi bấm “Thêm vào giỏ”.</p>
          <a class="btn btn-primary" href="cua-hang.html">Vào cửa hàng</a>
        </div>
      </div>`;
    }
    const rows = entries.map(([id, q]) => {
      const p = findProduct(id);
      return `<li class="cart-item">
        <img class="cart-thumb" src="${p.images[0].src}" alt="">
        <span class="cart-item-name">${escapeHTML(p.name)}<small>${formatPrice(p.price)} / sản phẩm</small></span>
        <span class="qty" role="group" aria-label="Số lượng ${escapeHTML(p.name)}">
          <button type="button" data-cart-step="-1" data-id="${id}" aria-label="Giảm một">−</button>
          <output aria-live="polite">${q}</output>
          <button type="button" data-cart-step="1" data-id="${id}" aria-label="Tăng một">+</button>
        </span>
        <span class="cart-item-price">${formatPrice(p.price * q)}</span>
      </li>`;
    }).join("");
    return `<div class="cart-view">
      <h2 id="modalTitle">Giỏ hàng</h2>
      <ul class="cart-items">${rows}</ul>
      <p class="cart-total"><span>Tạm tính</span><strong>${formatPrice(total())}</strong></p>
      <p class="cart-note">Phí giao hàng được báo khi xác nhận đơn. Bấm nút bên dưới để sao chép đơn và nhắn cho shop qua Zalo.</p>
      <div class="cart-actions">
        <button class="btn btn-primary btn-lg" type="button" data-action="checkout">Sao chép đơn và mở Zalo</button>
        <button class="btn btn-ghost btn-lg" type="button" data-close-modal>Mua thêm</button>
      </div>
    </div>`;
  }

  return { add, setQty, view, summaryText, renderBadge, get: (id) => items[id] || 0 };
})();

/* --------------------------------------------------------------------------
   10. THẺ SẢN PHẨM + MODAL CHI TIẾT (dùng ở Trang chủ, Danh mục, Cửa hàng)
   -------------------------------------------------------------------------- */
function cardHTML(p, i = 0) {
  const img = p.images[0];
  return `<article class="product-card" style="animation-delay:${Math.min(i, 8) * 30}ms">
    <div class="card-art art-bg-${p.bg} has-photo">
      <img class="photo" src="${img.src}" alt="${escapeHTML(img.alt)}" loading="lazy" decoding="async">
    </div>
    <div class="card-body">
      <p class="card-meta"><span>${p.sku}</span>${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}</p>
      <h3 class="card-title"><button class="card-link" type="button" data-product="${p.id}">${escapeHTML(p.name)}</button></h3>
      <div class="card-foot">
        <span class="card-price">${formatPrice(p.price)}</span>
        <button class="quick-add" type="button" data-quick-add="${p.id}" aria-label="Thêm ${escapeHTML(p.name)} vào giỏ">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </article>`;
}

const renderGrid = (el, list) => { el.innerHTML = list.map(cardHTML).join(""); };

let currentProduct = null; // sản phẩm đang mở trong modal (để đổi ảnh)

/** Khung ảnh lớn + hàng ảnh nhỏ (nếu có nhiều ảnh) */
function galleryHTML(p) {
  const imgs = p.images;
  const thumbs = imgs.length > 1
    ? `<div class="gallery-thumbs" role="group" aria-label="Chọn ảnh sản phẩm">${imgs.map((im, i) => `
        <button class="thumb" type="button" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="Xem ảnh ${i + 1} trên ${imgs.length}">
          <img src="${im.src}" alt="" loading="lazy">
        </button>`).join("")}</div>`
    : "";
  return `<div class="modal-art modal-gallery art-bg-${p.bg}">
    <img class="gallery-main" id="galleryMain" src="${imgs[0].src}" alt="${escapeHTML(imgs[0].alt)}">
    ${thumbs}
  </div>`;
}

function productModalHTML(p) {
  currentProduct = p;
  const specs = Object.entries(p.specs)
    .map(([k, v]) => `<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join("");
  const brands = p.brands.length
    ? `<p class="brand-tags">${p.brands.map((b) => `<a class="brand-tag" href="danh-muc.html#${b}">${BRANDS[b].label}</a>`).join("")}</p>`
    : "";
  return `
    ${galleryHTML(p)}
    <div class="modal-info">
      <p class="modal-cat">${CATEGORIES[p.category].label}, mã ${p.sku}</p>
      <h2 id="modalTitle">${escapeHTML(p.name)}</h2>
      <p class="modal-price">${formatPrice(p.price)}</p>
      ${brands}
      <p class="modal-desc">${escapeHTML(p.desc)}</p>
      <dl class="spec-list">${specs}</dl>
      <div class="buy-row">
        <span class="qty" role="group" aria-label="Chọn số lượng">
          <button type="button" data-qty-step="-1" aria-label="Giảm số lượng">−</button>
          <output id="qtyValue" aria-live="polite">1</output>
          <button type="button" data-qty-step="1" aria-label="Tăng số lượng">+</button>
        </span>
        <button class="btn btn-primary" type="button" data-action="add" data-id="${p.id}">Thêm vào giỏ</button>
      </div>
    </div>`;
}

/** Bấm thẻ sản phẩm (ở bất kỳ trang nào) → mở modal; bấm "+" → thêm nhanh vào giỏ */
function initProductClicks() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#modal")) return;
    const quick = e.target.closest("[data-quick-add]");
    if (quick) { Cart.add(quick.dataset.quickAdd); return; }
    const open = e.target.closest("[data-product]");
    if (open) Modal.open(productModalHTML(findProduct(open.dataset.product)));
    const zoom = e.target.closest("[data-zoom]");
    if (zoom) {
      currentProduct = null;
      Modal.open(`<figure class="zoom-view">
        <img src="${zoom.dataset.zoom}" alt="${escapeHTML(zoom.dataset.alt)}">
        <figcaption id="modalTitle">${escapeHTML(zoom.dataset.alt)}</figcaption>
      </figure>`);
    }
  });
}

/** Các nút bên trong modal (đổi ảnh, số lượng, thêm giỏ, thanh toán) */
function initModalActions() {
  Modal.body.addEventListener("click", async (e) => {
    const thumb = e.target.closest("[data-thumb]");
    if (thumb && currentProduct) {
      const img = currentProduct.images[Number(thumb.dataset.thumb)];
      const main = $("#galleryMain");
      main.src = img.src;
      main.alt = img.alt;
      $$("[data-thumb]", Modal.body).forEach((t) => t.setAttribute("aria-pressed", String(t === thumb)));
      return;
    }

    const step = e.target.closest("[data-qty-step]");
    if (step) {
      const out = $("#qtyValue");
      out.textContent = Math.min(99, Math.max(1, Number(out.textContent) + Number(step.dataset.qtyStep)));
      return;
    }

    const cartStep = e.target.closest("[data-cart-step]");
    if (cartStep) {
      const { id } = cartStep.dataset;
      Cart.setQty(id, Cart.get(id) + Number(cartStep.dataset.cartStep));
      Modal.body.innerHTML = Cart.view();
      const again = $(`[data-cart-step="${cartStep.dataset.cartStep}"][data-id="${id}"]`, Modal.body);
      (again || $(".modal-close")).focus();
      return;
    }

    const action = e.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "add") {
      Cart.add(action.dataset.id, Number($("#qtyValue").textContent));
      Modal.close();
    }
    if (action.dataset.action === "checkout") {
      try {
        await navigator.clipboard.writeText(Cart.summaryText());
        showToast("Đã sao chép đơn hàng. Dán vào khung chat Zalo để gửi cho shop.");
      } catch {
        showToast("Không sao chép tự động được. Hãy chụp màn hình giỏ hàng để gửi shop.");
      }
      window.open("https://zalo.me/0773076302", "_blank", "noopener");
    }
  });

  $("#cartBtn").addEventListener("click", () => Modal.open(Cart.view()));
}

/* --------------------------------------------------------------------------
   11. ĐÁNH GIÁ: đọc dữ liệu + vẽ thẻ đánh giá (dùng ở Trang chủ và trang Đánh giá)
   -------------------------------------------------------------------------- */
function loadReviews() {
  let saved = [];
  try { saved = JSON.parse(storage.get(REVIEW_KEY)) || []; } catch { saved = []; }
  return [...saved, ...REVIEWS];
}

function ratingStats(list) {
  const counts = [0, 0, 0, 0, 0, 0]; // counts[1..5]
  list.forEach((r) => { counts[r.rating] += 1; });
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return { avg, counts, total: list.length };
}

const formatRating = (n) => n.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function starsHTML(rating) {
  const full = Math.round(rating);
  return `<span class="stars" role="img" aria-label="${formatRating(rating)} trên 5 sao">${"★".repeat(full)}<span class="stars-off">${"★".repeat(5 - full)}</span></span>`;
}

function reviewCardHTML(r) {
  const p = r.productId && findProduct(r.productId);
  const date = new Date(r.date).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  return `<figure class="review-card">
    <div class="review-top">${starsHTML(r.rating)}<time datetime="${escapeHTML(r.date)}">${date}</time></div>
    <blockquote><p>${escapeHTML(r.text)}</p></blockquote>
    <figcaption>
      <span class="review-avatar" aria-hidden="true">${escapeHTML(r.name.trim().charAt(0).toUpperCase())}</span>
      <span><strong>${escapeHTML(r.name)}</strong>${p ? `<button class="review-product" type="button" data-product="${p.id}">Đã mua: ${escapeHTML(p.name)}</button>` : ""}</span>
    </figcaption>
  </figure>`;
}

/* --------------------------------------------------------------------------
   12. TỪNG TRANG
   -------------------------------------------------------------------------- */

/** Số liệu tự tính từ dữ liệu thật (không cần sửa tay) */
function fillStats() {
  const reviews = loadReviews();
  const { avg, total } = ratingStats(reviews);
  $$('[data-stat="count"]').forEach((el) => { el.textContent = PRODUCTS.length; });
  $$('[data-stat="min-price"]').forEach((el) => { el.textContent = formatPrice(Math.min(...PRODUCTS.map((p) => p.price))); });
  $$('[data-stat="rating"]').forEach((el) => {
    el.innerHTML = total ? `${formatRating(avg)}<span>/5</span>` : "Mới mở";
  });
  $$("[data-count-for]").forEach((el) => {
    const n = PRODUCTS.filter((p) => p.category === el.dataset.countFor).length;
    el.textContent = `Xem ${n} sản phẩm`;
  });
}

/* ---- Trang chủ ---- */
function initHome() {
  $$("[data-featured]").forEach((grid) => {
    const list = grid.dataset.featured.split(",").map(findProduct).filter(Boolean);
    renderGrid(grid, list);
  });

  const box = $("#homeReviews");
  const latest = loadReviews().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  box.innerHTML = latest.length
    ? latest.map(reviewCardHTML).join("")
    : `<div class="empty-state review-empty">
        <p class="empty-title">Shop vừa mở, chưa có đánh giá nào</p>
        <p>Bạn đã nhận hàng từ Lightwave? Viết vài dòng để người mua sau có thêm thông tin nhé.</p>
      </div>`;
}

/* ---- Danh mục: sản phẩm theo từng hãng ---- */
function initCatalog() {
  $$("[data-brand-grid]").forEach((grid) => {
    renderGrid(grid, PRODUCTS.filter((p) => p.brands.includes(grid.dataset.brandGrid)));
  });
}

/* ---- Cửa hàng: lọc theo loại, theo hãng, tìm kiếm, sắp xếp ---- */
function initShop() {
  const state = { category: "all", brand: "all", query: "", sort: "featured" };
  const grid = $("#productGrid");
  const empty = $("#emptyState");
  const counter = $("#resultCount");
  const search = $("#searchInput");
  const sort = $("#sortSelect");
  const brandSelect = $("#brandSelect");
  const chips = $$(".filter-chip");

  // Chuỗi tìm kiếm đã bỏ dấu cho từng sản phẩm (tính sẵn một lần)
  const index = new Map(PRODUCTS.map((p) => [
    p.id,
    normalize([p.name, p.sku, p.desc, p.tag || "", CATEGORIES[p.category].label,
      ...p.brands.map((b) => BRANDS[b].label), ...Object.values(p.specs)].join(" ")),
  ]));

  function render() {
    // Mỗi từ khoá đều phải xuất hiện (thứ tự bất kỳ)
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    let list = PRODUCTS.filter((p) =>
      (state.category === "all" || p.category === state.category) &&
      (state.brand === "all" || p.brands.includes(state.brand)) &&
      terms.every((t) => index.get(p.id).includes(t)));

    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

    renderGrid(grid, list);
    empty.hidden = list.length > 0;
    if (!list.length) {
      $("#emptyTitle").textContent = state.query
        ? `Chưa có sản phẩm khớp với “${state.query.trim()}”`
        : "Chưa có sản phẩm nào trong bộ lọc này";
    }
    const parts = [];
    if (state.category !== "all") parts.push(CATEGORIES[state.category].label);
    if (state.brand !== "all") parts.push(BRANDS[state.brand].label);
    counter.textContent = `Đang hiện ${list.length} trên ${PRODUCTS.length} sản phẩm${parts.length ? `, lọc theo ${parts.join(" và ")}` : ""}`;
  }

  function syncControls() {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === state.category)));
    brandSelect.value = state.brand;
  }

  /** Đọc bộ lọc từ địa chỉ trang, ví dụ cua-hang.html#pocket hoặc cua-hang.html#holbein */
  function applyHash() {
    const key = decodeURIComponent(location.hash.slice(1));
    if (CATEGORIES[key]) { state.category = key; state.brand = "all"; }
    else if (BRANDS[key]) { state.brand = key; state.category = "all"; }
    else return false;
    syncControls();
    render();
    return true;
  }

  chips.forEach((chip) => chip.addEventListener("click", () => { state.category = chip.dataset.filter; syncControls(); render(); }));
  brandSelect.addEventListener("change", () => { state.brand = brandSelect.value; render(); });
  search.addEventListener("input", () => { state.query = search.value; render(); });
  sort.addEventListener("change", () => { state.sort = sort.value; render(); });
  $("#resetFilters").addEventListener("click", () => {
    Object.assign(state, { category: "all", brand: "all", query: "" });
    search.value = "";
    syncControls();
    render();
    search.focus();
  });
  window.addEventListener("hashchange", () => { if (applyHash()) scrollToSection($(".shop-toolbar")); });

  if (!applyHash()) render();
}

/* ---- Trang Đánh giá: tổng quan, danh sách, lọc theo sao, form gửi ---- */
function initReviewsPage() {
  const summary = $("#reviewSummary");
  const list = $("#reviewList");
  const counter = $("#reviewCount");
  const sortSelect = $("#reviewSort");
  const state = { star: 0, sort: "new" }; // star = 0 nghĩa là mọi mức sao

  function renderSummary(all) {
    const { avg, counts, total } = ratingStats(all);
    if (!total) {
      summary.innerHTML = `<p class="summary-score">–</p>
        <p class="summary-note">Chưa có đánh giá nào. Đánh giá đầu tiên sẽ hiện ở đây.</p>
        <a class="btn btn-primary" href="#viet-danh-gia">Viết đánh giá đầu tiên</a>`;
      return;
    }
    const bars = [5, 4, 3, 2, 1].map((s) => {
      const pct = Math.round((counts[s] / total) * 100);
      return `<button class="bar-row" type="button" data-star-filter="${s}" aria-pressed="${state.star === s}" ${counts[s] ? "" : "disabled"}>
        <span class="bar-label">${s} sao</span>
        <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
        <span class="bar-count">${counts[s]}</span>
      </button>`;
    }).join("");
    summary.innerHTML = `
      <p class="summary-score">${formatRating(avg)}<span>/5</span></p>
      ${starsHTML(avg)}
      <p class="summary-note">Dựa trên ${total} đánh giá</p>
      <div class="bars" role="group" aria-label="Lọc theo số sao">${bars}</div>
      ${state.star ? `<button class="btn btn-ghost btn-sm" type="button" data-star-filter="0">Xem mọi mức sao</button>` : ""}`;
  }

  function render() {
    const all = loadReviews();
    renderSummary(all);
    let shown = state.star ? all.filter((r) => r.rating === state.star) : [...all];
    if (state.sort === "new") shown.sort((a, b) => b.date.localeCompare(a.date));
    if (state.sort === "high") shown.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
    if (state.sort === "low") shown.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));

    counter.textContent = all.length
      ? `Đang hiện ${shown.length} đánh giá${state.star ? ` ${state.star} sao` : ""}`
      : "";
    list.innerHTML = shown.length
      ? shown.map(reviewCardHTML).join("")
      : `<div class="empty-state review-empty">
          <p class="empty-title">Chưa có đánh giá nào</p>
          <p>Bạn đã mua hàng ở Lightwave? Hãy là người đầu tiên chia sẻ cảm nhận.</p>
        </div>`;
  }

  summary.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-star-filter]");
    if (!btn) return;
    const s = Number(btn.dataset.starFilter);
    state.star = state.star === s ? 0 : s; // bấm lại lần nữa để bỏ lọc
    render();
  });
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });

  initReviewForm(render);
  render();
}

/* --------------------------------------------------------------------------
   13. FORM GỬI ĐÁNH GIÁ
   Hiện tại đánh giá được lưu trong trình duyệt của người gửi (localStorage).
   TODO: khi muốn mọi khách cùng thấy đánh giá, gửi object "review" bên dưới
   lên Firebase Firestore / Google Sheet, rồi đọc danh sách từ đó trong loadReviews().
   -------------------------------------------------------------------------- */
function initReviewForm(onSaved) {
  const form = $("#reviewForm");
  const nameInput = $("#reviewName");
  const productSelect = $("#reviewProduct");
  const text = $("#reviewText");
  const caption = $("#starCaption");
  const charCount = $("#reviewTextCount");
  const labels = { 1: "Không hài lòng", 2: "Chưa hài lòng", 3: "Bình thường", 4: "Hài lòng", 5: "Rất hài lòng" };

  productSelect.innerHTML = `<option value="">Chọn sản phẩm (không bắt buộc)</option>` +
    PRODUCTS.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("");

  const setError = (id, msg) => {
    const el = $(`#${id}`);
    el.textContent = msg;
    const field = el.closest(".field");
    const input = field && $("input:not([type=radio]), textarea", field);
    if (input) {
      if (msg) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  };

  form.addEventListener("change", (e) => {
    if (e.target.name === "rating") {
      caption.textContent = `${e.target.value} sao: ${labels[e.target.value]}`;
      setError("reviewRatingErr", "");
    }
  });
  text.addEventListener("input", () => {
    charCount.textContent = `${text.value.length}/600`;
    if (text.value.trim().length >= 10) setError("reviewTextErr", "");
  });
  nameInput.addEventListener("input", () => { if (nameInput.value.trim()) setError("reviewNameErr", ""); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const rating = Number(($('input[name="rating"]:checked', form) || {}).value || 0);
    const body = text.value.trim();
    let firstInvalid = null;

    if (!name) { setError("reviewNameErr", "Nhập tên để shop biết ai đã gửi đánh giá."); firstInvalid = firstInvalid || nameInput; }
    if (!rating) { setError("reviewRatingErr", "Chọn từ 1 đến 5 sao."); firstInvalid = firstInvalid || $("#star5"); }
    if (body.length < 10) { setError("reviewTextErr", "Viết ít nhất 10 ký tự để người mua sau hiểu rõ hơn."); firstInvalid = firstInvalid || text; }
    if (firstInvalid) { firstInvalid.focus(); return; }

    const review = { name, productId: productSelect.value, rating, text: body, date: new Date().toISOString().slice(0, 10) };
    let saved = [];
    try { saved = JSON.parse(storage.get(REVIEW_KEY)) || []; } catch { saved = []; }
    saved.unshift(review);
    storage.set(REVIEW_KEY, JSON.stringify(saved));

    form.reset();
    caption.textContent = "Chưa chọn";
    charCount.textContent = "0/600";
    onSaved();
    showToast("Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ!");
    scrollToSection($("#reviewListTitle"));
  });
}

/* --------------------------------------------------------------------------
   14. NEWSLETTER: kiểm tra email và báo kết quả
   TODO: gửi email lên Google Form / Firebase / Mailchimp ở chỗ đánh dấu bên dưới
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = $("#newsletterForm");
  const input = $("#newsletterEmail");
  const msg = $("#newsletterMsg");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setMessage = (text, type) => { msg.textContent = text; msg.className = `form-msg is-${type}`; };

  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true" && emailPattern.test(input.value.trim())) {
      input.removeAttribute("aria-invalid");
      setMessage("", "idle");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !emailPattern.test(email)) {
      input.setAttribute("aria-invalid", "true");
      setMessage(email ? "Email chưa đúng định dạng, ví dụ: ten.ban@gmail.com" : "Nhập email để nhận thư màu mới.", "error");
      input.focus();
      return;
    }
    // TODO: gửi email lên máy chủ tại đây
    input.removeAttribute("aria-invalid");
    setMessage(`Đã đăng ký! Thư màu mới sẽ gửi tới ${email} vào đầu mỗi tháng.`, "success");
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   15. KHỞI CHẠY khi HTML đã sẵn sàng
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  Modal = createModal();
  initThemeToggle();
  const { closeMenu } = initHeader();
  initSmoothScroll(closeMenu);
  initProductClicks();
  initModalActions();
  initNewsletter();
  Cart.renderBadge();
  fillStats();

  const page = PAGE();
  if (page === "home") initHome();
  if (page === "danh-muc") initCatalog();
  if (page === "cua-hang") initShop();
  if (page === "danh-gia") initReviewsPage();

  initScrollspy(); // chạy sau cùng, khi nội dung trang đã được vẽ
  $("#year").textContent = new Date().getFullYear();
});

const products = [
  {id:1,n:"Running Shoe",c:"Shoes",p:1499,e:"👟",d:"Lightweight, cushioned shoe made for daily runs."},
  {id:2,n:"Trail Boot",c:"Shoes",p:2799,e:"🥾",d:"Grippy waterproof boot for hikes and rough paths."},
  {id:3,n:"Daily Backpack",c:"Bags",p:1899,e:"🎒",d:"25L backpack with a padded laptop sleeve."},
  {id:4,n:"Tote Bag",c:"Bags",p:799,e:"👜",d:"Roomy canvas tote for books, groceries and more."},
  {id:5,n:"Sports Watch",c:"Accessories",p:3299,e:"⌚",d:"Tracks steps, heart rate and sleep. 7-day battery."},
  {id:6,n:"Sunglasses",c:"Accessories",p:999,e:"🕶️",d:"UV400 protection with a lightweight frame."},
  {id:7,n:"Baseball Cap",c:"Accessories",p:449,e:"🧢",d:"Adjustable cotton cap in a classic fit."},
  {id:8,n:"Wireless Headphones",c:"Electronics",p:2499,e:"🎧",d:"Over-ear sound with 30 hours of playtime."},
  {id:9,n:"Cotton T-Shirt",c:"Clothing",p:599,e:"👕",d:"Soft, breathable everyday tee."},
  {id:10,n:"Winter Jacket",c:"Clothing",p:3499,e:"🧥",d:"Warm padded jacket for cold weather."},
  {id:11,n:"Sport Socks (3 pairs)",c:"Clothing",p:349,e:"🧦",d:"Cushioned, sweat-wicking socks."},
  {id:12,n:"Smart Speaker",c:"Electronics",p:1799,e:"🔊",d:"Compact speaker with deep bass and Bluetooth."}
];
const cats = ["Shoes","Bags","Accessories","Electronics","Clothing"];

const $ = q => document.querySelector(q);
const app = $("#app");
const rs = n => "Rs. " + n.toLocaleString("en-IN");
const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const find = id => products.find(p => p.id === Number(id));
const go = h => { location.hash = h; };

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.className = "show";
  setTimeout(() => t.className = "", 1800);
}
function updateCartCount() {
  $("#cartCount").textContent = get("cart", []).reduce((s, c) => s + c.qty, 0);
  const u = get("user", null);
  $("#authLink").textContent = u ? "Logout (" + u.name.split(" ")[0] + ")" : "Login";
  $("#authLink").href = u ? "#logout" : "#login";
}
function addToCart(id) {
  let cart = get("cart", []);
  const item = cart.find(p => p.id === id);
  if (item) item.qty += 1; else cart.push({ id: id, qty: 1 });
  set("cart", cart);
  updateCartCount();
  toast(find(id).n + " added to cart");
}
function getTotal() {
  return get("cart", []).reduce((sum, c) => sum + find(c.id).price * c.qty, 0);
}
products.forEach(p => p.price = p.p);

const card = p => `<div class="product-card"><a class="pic" href="#product/${p.id}">${p.e}</a>
<h3>${p.n}</h3><p class="price">${rs(p.p)}</p><button onclick="addToCart(${p.id})">Add to Cart</button></div>`;

const pages = {
  home() {
    return `<section class="hero"><div><h1>Everything for the way you move</h1>
<p>Shoes, bags, gadgets and clothing at honest prices. Free delivery on orders above Rs. 999.</p>
<a class="btn" href="#products">Shop now</a></div><div class="big">👟🎒</div></section>
<h2>Shop by category</h2><div class="cats">${cats.map(c => `<a href="#products/${c}">${c}</a>`).join("")}</div>
<h2>Featured products</h2><div class="product-grid">${products.slice(0, 4).map(card).join("")}</div>
<h2>Special offer</h2><p>Use code <b>STRIDE10</b> at checkout for 10% off your first order (demo).</p>`;
  },
  products(cat) {
    return `<h1>Products</h1><div class="filters">
<input id="q" placeholder="Search products..." oninput="filt()" aria-label="Search">
<select id="cat" onchange="filt()" aria-label="Category"><option value="">All categories</option>${cats.map(c => `<option ${c === cat ? "selected" : ""}>${c}</option>`).join("")}</select>
<select id="pr" onchange="filt()" aria-label="Price"><option value="">Any price</option><option value="500">Under Rs. 500</option><option value="1500">Under Rs. 1,500</option><option value="3000">Under Rs. 3,000</option></select></div>
<div class="product-grid" id="grid"></div>`;
  },
  product(id) {
    const p = find(id);
    if (!p) return "<p>Product not found.</p>";
    return `<div class="detail"><div class="pic">${p.e}</div><div><h1>${p.n}</h1>
<p class="price" style="font-size:1.5rem">${rs(p.p)}</p><p>${p.d}</p><p style="margin:10px 0;color:var(--muted)">Category: ${p.c} | In stock</p>
<button onclick="addToCart(${p.id})">Add to Cart</button> <button class="sec" onclick="go('cart')">View Cart</button></div></div>`;
  },
  cart() {
    const cart = get("cart", []);
    if (!cart.length) return `<h1>Shopping Cart</h1><p>Your cart is empty.</p><br><a class="btn" href="#products">Browse products</a>`;
    return `<h1>Shopping Cart</h1><div style="overflow-x:auto"><table class="tbl"><tr><th>Item</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
${cart.map(c => { const p = find(c.id); return `<tr><td>${p.e} ${p.n}</td><td>${rs(p.p)}</td>
<td class="qty"><button class="sec" onclick="chg(${p.id},-1)">-</button>${c.qty}<button class="sec" onclick="chg(${p.id},1)">+</button></td>
<td>${rs(p.p * c.qty)}</td><td><button class="del" onclick="rem(${p.id})">Remove</button></td></tr>`; }).join("")}</table></div>
<div class="total">Total: ${rs(getTotal())}</div><div style="text-align:right"><button onclick="go('checkout')">Proceed to Checkout</button></div>`;
  },
  checkout() {
    if (!get("user", null)) { toast("Please login to checkout"); go("login"); return ""; }
    if (!get("cart", []).length) { go("cart"); return ""; }
    const a = get("addr", {});
    return `<div class="box"><h1>Checkout</h1><p>Order total: <b>${rs(getTotal())}</b></p>
<label>Full name</label><input id="an" value="${a.name || ""}">
<label>Phone</label><input id="ap" value="${a.phone || ""}" inputmode="numeric">
<label>Delivery address</label><textarea id="aa" rows="3">${a.addr || ""}</textarea>
<label>City / PIN code</label><input id="ac" value="${a.city || ""}">
<div class="err" id="err"></div><button onclick="saveAddr()">Continue to Payment</button></div>`;
  },
  payment() {
    if (!get("addr", null) || !get("cart", []).length) { go("cart"); return ""; }
    return `<div class="box"><h1>Payment</h1><p>Amount to pay: <b>${rs(getTotal())}</b></p>
<label class="opt"><input type="radio" name="pm" value="UPI" checked> UPI</label>
<label class="opt"><input type="radio" name="pm" value="Card"> Debit / Credit Card</label>
<label class="opt"><input type="radio" name="pm" value="Cash on Delivery"> Cash on Delivery</label>
<p style="font-size:.85rem;color:var(--muted);margin-top:10px">Demo site: no real payment is taken.</p><button onclick="pay()">Pay Now</button></div>`;
  },
  confirm() {
    const o = get("orders", [])[0];
    if (!o) return "<p>No recent order.</p>";
    return `<div class="box ok"><div class="tick">✅</div><h1>Order Confirmed</h1><p>Thank you! Your order <b>${o.id}</b> has been placed.</p>
<p style="margin:10px 0">${o.items.map(i => i.n + " x " + i.qty).join(", ")}</p><p>Total paid: <b>${rs(o.total)}</b> (${o.method})</p>
<p>Delivering to: ${o.addr.name}, ${o.addr.addr}, ${o.addr.city}</p><a class="btn" style="margin-top:16px" href="#orders">View Order History</a></div>`;
  },
  orders() {
    const u = get("user", null);
    if (!u) { toast("Please login first"); go("login"); return ""; }
    const os = get("orders", []);
    return `<h1>My Profile</h1><div class="order"><b>${u.name}</b><br>${u.email}</div><h2>Order History</h2>
${os.length ? os.map(o => `<div class="order"><b>${o.id}</b> - ${o.date}<br>${o.items.map(i => i.n + " x " + i.qty).join(", ")}<br>Total: <b>${rs(o.total)}</b> | ${o.method}</div>`).join("") : "<p>No orders yet.</p>"}`;
  },
  register() {
    return `<div class="box"><h1>Create account</h1><label>Full name</label><input id="rn">
<label>Email</label><input id="re" type="email"><label>Password (6+ characters)</label><input id="rp" type="password">
<div class="err" id="err"></div><button onclick="reg()">Register</button><p style="margin-top:12px">Already registered? <a href="#login">Login</a></p></div>`;
  },
  login() {
    return `<div class="box"><h1>Login</h1><form id="loginForm"><label>Email</label><input id="email" type="text">
<label>Password</label><input id="password" type="password"><div class="err" id="err"></div><button type="submit">Login</button></form>
<p style="margin-top:12px">New here? <a href="#register">Create an account</a></p></div>`;
  },
  contact() {
    return `<h1>About Us</h1><p style="max-width:640px">Stride is a small online store selling shoes, bags, gadgets and clothing. We ship across India and replace any damaged item within 7 days.</p>
<h2>Contact Us</h2><div class="box" style="margin:0"><label>Name</label><input id="cn"><label>Email</label><input id="ce"><label>Message</label><textarea id="cm" rows="4"></textarea>
<div class="err" id="err"></div><button onclick="msg()">Send message</button></div>
<p style="margin-top:14px">Email: support@stridestore.example | Phone: +91 98765 43210</p>`;
  }
};

function filt() {
  const q = $("#q").value.toLowerCase(), c = $("#cat").value, m = Number($("#pr").value) || 1e9;
  const r = products.filter(p => p.n.toLowerCase().includes(q) && (!c || p.c === c) && p.p <= m);
  $("#grid").innerHTML = r.length ? r.map(card).join("") : "<p>No products match your search. Try a different word or filter.</p>";
}
function chg(id, d) {
  let cart = get("cart", []); const i = cart.find(c => c.id === id);
  i.qty += d; if (i.qty < 1) cart = cart.filter(c => c.id !== id);
  set("cart", cart); updateCartCount(); route();
}
function rem(id) { set("cart", get("cart", []).filter(c => c.id !== id)); updateCartCount(); route(); }
function saveAddr() {
  const a = { name: $("#an").value.trim(), phone: $("#ap").value.trim(), addr: $("#aa").value.trim(), city: $("#ac").value.trim() };
  if (!a.name || !/^\d{10}$/.test(a.phone) || !a.addr || !a.city) { $("#err").textContent = "Fill all fields. Phone must be 10 digits."; return; }
  set("addr", a); go("payment");
}
function pay() {
  const method = document.querySelector("input[name=pm]:checked").value;
  const items = get("cart", []).map(c => ({ n: find(c.id).n, qty: c.qty }));
  const o = { id: "ORD" + Date.now().toString().slice(-6), date: new Date().toLocaleDateString("en-IN"), items, total: getTotal(), method, addr: get("addr", {}) };
  const os = get("orders", []); os.unshift(o); set("orders", os); set("cart", []);
  updateCartCount(); go("confirm");
}
function reg() {
  const name = $("#rn").value.trim(), email = $("#re").value.trim().toLowerCase(), pass = $("#rp").value;
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || pass.length < 6) { $("#err").textContent = "Enter your name, a valid email and a password of 6+ characters."; return; }
  const us = get("users", []);
  if (us.some(u => u.email === email)) { $("#err").textContent = "This email is already registered. Please login."; return; }
  us.push({ name, email, pass }); set("users", us); set("user", { name, email });
  updateCartCount(); toast("Account created"); go("home");
}
function msg() {
  if (!$("#cn").value.trim() || !/^\S+@\S+\.\S+$/.test($("#ce").value.trim()) || !$("#cm").value.trim()) { $("#err").textContent = "Enter your name, a valid email and a message."; return; }
  toast("Message sent. We will reply soon."); $("#cn").value = $("#ce").value = $("#cm").value = ""; $("#err").textContent = "";
}

function route() {
  const [r, a] = (location.hash.slice(1) || "home").split("/");
  if (r === "logout") { set("user", null); updateCartCount(); toast("Logged out"); go("home"); return; }
  app.innerHTML = (pages[r] || pages.home)(decodeURIComponent(a || ""));
  window.scrollTo(0, 0);
  if (r === "products") filt();
  const lf = $("#loginForm");
  if (lf) lf.addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#email").value.trim().toLowerCase(), pass = $("#password").value;
    if (!/^\S+@\S+\.\S+$/.test(email) || pass.length < 6) { $("#err").textContent = "Enter a valid email and a password of 6+ characters"; return; }
    const u = get("users", []).find(x => x.email === email && x.pass === pass);
    if (!u) { $("#err").textContent = "No account matches these details. Register first or check your password."; return; }
    set("user", { name: u.name, email: u.email }); updateCartCount(); toast("Welcome back, " + u.name); go("home");
  });
}
window.addEventListener("hashchange", route);
updateCartCount();
route();

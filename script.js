const POSTS = [
  {
    id: "sample-post",
    title: "A ramen bowl worth traveling for",
    date: "2026-01-21",
    city: "Phoenix, AZ",
    place: "Example Ramen",
    rating: 8.7,
    type: "review",
    thumb: "posts/sample-ramen.jpg",
    file: "posts/sample-post.html"
  },
  {
    id: "sample-post-2",
    title: "How to spot a great burger in 60 seconds",
    date: "2026-01-22",
    city: "Mesa, AZ",
    place: "Multiple",
    rating: 0,
    type: "guide",
    thumb: "posts/sample-burger.jpg",
    file: "posts/sample-post-2.html"
  }
];

const elList = document.getElementById("list");
const elReader = document.getElementById("reader");
const elReaderBody = document.getElementById("readerBody");
const elReaderMeta = document.getElementById("readerMeta");
const elAbout = document.getElementById("about");
const q = document.getElementById("q");
const backBtn = document.getElementById("backBtn");
const chips = [...document.querySelectorAll(".chip")];

let state = { filter: "all", query: "" };

document.getElementById("year").textContent = new Date().getFullYear();

function uniqCount(key){
  return new Set(POSTS.map(p => (p[key] || "").trim()).filter(Boolean)).size;
}

document.getElementById("countPosts").textContent = POSTS.length;
document.getElementById("countPlaces").textContent = uniqCount("place");
document.getElementById("countCities").textContent = uniqCount("city");

function fmtDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
}

function renderList(){
  const filtered = POSTS
    .filter(p => state.filter === "all" ? true : p.type === state.filter)
    .filter(p => {
      const hay = `${p.title} ${p.city} ${p.place} ${p.type}`.toLowerCase();
      return hay.includes(state.query.toLowerCase());
    })
    .sort((a,b) => (a.date < b.date ? 1 : -1));

  elList.innerHTML = filtered.map(p => {
    const rating = p.rating ? `<span class="badge">Score: ${p.rating.toFixed(1)}</span>` : "";
    const thumb = p.thumb ? `<div class="post__thumb"><img src="${p.thumb}" alt=""></div>` : `<div class="post__thumb"></div>`;
    return `
      <article class="post" data-id="${p.id}">
        ${thumb}
        <h3 class="post__title">${p.title}</h3>
        <div class="post__meta">
          <span>${fmtDate(p.date)}</span>
          <span class="badge">${p.city}</span>
          <span class="badge">${p.type}</span>
          ${rating}
        </div>
      </article>
    `;
  }).join("");

  [...document.querySelectorAll(".post")].forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      location.hash = `#/post/${encodeURIComponent(id)}`;
    });
  });
}

async function openPost(id){
  const post = POSTS.find(p => p.id === id);
  if (!post) return;

  elAbout.hidden = true;
  elList.hidden = true;
  elReader.hidden = false;
  elReaderMeta.textContent = `${fmtDate(post.date)} • ${post.city} • ${post.place}${post.rating ? " • Score " + post.rating.toFixed(1) : ""}`;

  elReaderBody.innerHTML = `<p class="muted">Loading…</p>`;

  const res = await fetch(post.file, { cache: "no-store" });
  const html = await res.text();

  elReaderBody.innerHTML = html;

  requestAnimationFrame(() => {
    elReader.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function showHome(){
  elReader.hidden = true;
  elAbout.hidden = true;
  elList.hidden = false;
}

function showAbout(){
  elReader.hidden = true;
  elList.hidden = true;
  elAbout.hidden = false;
}

function route(){
  const hash = location.hash || "#/";
  if (hash.startsWith("#/about")){
    showAbout();
    return;
  }
  if (hash.startsWith("#/post/")){
    const id = decodeURIComponent(hash.split("/")[2] || "");
    openPost(id);
    return;
  }
  showHome();
}

q.addEventListener("input", () => {
  state.query = q.value.trim();
  renderList();
});

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.filter = chip.getAttribute("data-filter");
    renderList();
  });
});

backBtn.addEventListener("click", () => {
  location.hash = "#/";
});

window.addEventListener("hashchange", route);

renderList();
route();

const MANUAL_IMAGES = [
  'images/01.jpeg',
  'images/02.jpeg',
  'images/03.jpeg',
  'images/04.jpeg',
  'images/05.jpeg',
  'images/06.jpeg',
  'images/07.jpeg',
  'images/08.jpeg',
  'images/09.jpeg',
  'images/10.jpeg',
  'images/11.jpeg',
  'images/12.jpeg',
  'images/13.jpeg',
  'images/14.jpeg',
  'images/15.jpeg',
  'images/16.jpeg',
  'images/17.jpeg',
  'images/18.jpeg',
  'images/19.jpeg',
  'images/20.jpeg',
  'images/21.jpeg',
  'images/22.jpeg',
  'images/23.jpeg',
  'images/24.jpeg',
  'images/25.jpeg',
  'images/26.jpeg',
  'images/27.jpeg',
  'images/28.jpeg',
  'images/29.jpeg',
  'images/30.jpeg',
  'images/31.jpeg',
  'images/32.jpeg',
  'images/33.jpeg',
  'images/34.jpeg',
  'images/35.jpeg',
  'images/36.jpeg',
  'images/37.jpeg',
  'images/38.jpeg',
  'images/39.jpeg',
  'images/40.jpeg',
  'images/41.jpeg',
  'images/42.jpeg',
  'images/43.jpeg',
  'images/44.jpeg',
  'images/45.jpeg',
  'images/46.jpeg',
  'images/47.jpeg',
  'images/48.jpeg',
  'images/49.jpeg',
  'images/50.jpeg',
  'images/51.jpeg',
  'images/52.jpeg',
  'images/53.jpeg',
  'images/54.jpeg',
  'images/55.jpeg',
  'images/56.jpeg',
  'images/57.jpeg',
  'images/58.jpeg',
  'images/59.jpeg',
  'images/60.jpeg',
  'images/61.jpeg',
  'images/62.jpeg',
  'images/63.jpeg',
  'images/64.jpeg',
  'images/65.jpeg',
  'images/66.jpeg',
  'images/67.jpeg',
  'images/68.jpeg',
  'images/69.jpeg',
  'images/70.jpeg',
  'images/71.jpeg',
  'images/72.jpeg',
  'images/73.jpeg',
  'images/74.jpeg',
  'images/75.jpeg',
  'images/76.jpeg',
  'images/77.jpeg',
  'images/78.jpeg',
  'images/79.jpeg',
  'images/80.jpeg',
  'images/81.jpeg',
  'images/82.jpeg',
  'images/83.jpeg',
  'images/84.jpeg',
  'images/85.jpeg',
  'images/86.jpeg',
  'images/87.jpeg',
  'images/88.jpeg',
  'images/89.jpeg',
  'images/90.jpeg',
  'images/91.jpeg',
  'images/92.jpeg',
  'images/93.jpeg',
  'images/94.jpeg',
  'images/95.jpeg',
  'images/96.jpeg',
  'images/97.jpeg',
  'images/98.jpeg',
  'images/99.jpeg',
];

const STICKER_TITLES = ['✦'];
const PACK_STYLES    = ['parchment', 'crimson', 'forest', 'midnight'];
const PACK_SEALS     = ['✦', '❧', '☽', '◈', '⚜', '❈'];

const SAVE_KEY = 'album_paula_25';
 
function saveState() {
  const state = { placed: {}, pending: pendingImages.map(img => img.demo ? JSON.stringify(img) : img) };
  albumSlots.forEach(slot => {
    const idx = parseInt(slot.dataset.index);
    if (placedImages.has(idx)) {
      const img = slot.querySelector('.placed-sticker img');
      if (img) state.placed[idx] = img.src;
    }
  });
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
 
function loadState() {
  try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
}
 
function clearState() { localStorage.removeItem(SAVE_KEY); }

let allImages    = [];
let placedImages = new Set();
let pendingImages = [];
let albumSlots   = [];
let demoSrcCache = {};

const trayBody     = document.getElementById('trayBody');
const trayTab      = document.getElementById('trayTab');
const packTray     = document.getElementById('packTray');
const coverOverlay = document.getElementById('coverOverlay');

function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left  = Math.random() * 100 + '%';
    s.style.top   = Math.random() * 100 + '%';
    s.style.setProperty('--dur',   (2 + Math.random() * 4) + 's');
    s.style.setProperty('--delay', (-Math.random() * 4) + 's');
    s.style.opacity = Math.random() * 0.5;
    container.appendChild(s);
  }
}

async function discoverImages() {
  if (MANUAL_IMAGES.length > 0) return MANUAL_IMAGES.filter(Boolean);
  try {
    const res  = await fetch('images/');
    const text = await res.text();
    const doc  = new DOMParser().parseFromString(text, 'text/html');
    const links = [...doc.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(href => /\.(jpe?g|png|gif|webp|avif)$/i.test(href));
    if (links.length > 0) return links.map(l => 'images/' + l.replace(/^.*\//, ''));
  } catch(e) {}
  return generateDemoImages(12);
}
 
function generateDemoImages(n) {
  const hues = [30, 60, 200, 340, 150, 280, 10, 180, 320, 90, 240, 45];
  return Array.from({ length: n }, (_, i) => ({ demo: true, hue: hues[i % hues.length], index: i }));
}

function buildGrid(count) {
  const grid = document.getElementById('stickersGrid');
  grid.innerHTML = '';
  albumSlots = [];
  if (count === 0) {
    grid.innerHTML = `<div class="no-images-msg"><strong>O álbum aguarda...</strong>
      Adicione fotos na pasta <em>images/</em> e reabra o álbum.</div>`;
    return;
  }
  for (let i = 0; i < count; i++) {
    const slot = document.createElement('div');
    slot.className = 'sticker-slot';
    slot.innerHTML = `<span class="slot-empty-icon">◈</span><span class="slot-number">${i+1}</span>`;
    slot.dataset.index = i;
    grid.appendChild(slot);
    albumSlots.push(slot);
  }
}

function buildPacks() {
  const row = document.getElementById('packsRow');
  row.innerHTML = '';
  pendingImages.forEach((img, packIdx) => {
    const pack      = document.createElement('div');
    pack.className  = 'pack';
    const style     = PACK_STYLES[packIdx % PACK_STYLES.length];
    const seal      = PACK_SEALS[packIdx % PACK_SEALS.length];
    const labelText = STICKER_TITLES[packIdx % STICKER_TITLES.length];
    pack.dataset.style = style;
    const imgSrc = img.demo ? makeDemoSrc(img) : img;
    pack.innerHTML = `
      <div class="pack-inner"><div class="pack-body">
        <div class="pack-flap"></div>
        <div class="pack-bg">
          <div class="pack-seal">${seal}</div>
          <div class="pack-label">${labelText}</div>
        </div>
        <div class="pack-peek"><img src="${imgSrc}" alt=""></div>
      </div></div>`;
    pack.addEventListener('click', () => openPack(packIdx, pack, img, labelText));
    row.appendChild(pack);
  });
  updateTrayCount();
}

function makeDemoSrc(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 260;
  const ctx = canvas.getContext('2d');
  const h = img.hue;
  ctx.fillStyle = `hsl(${h},40%,30%)`;
  ctx.fillRect(0, 0, 200, 260);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `hsla(${h + Math.random()*40 - 20}, 50%, ${40 + Math.random()*30}%, 0.3)`;
    ctx.beginPath();
    ctx.arc(Math.random()*200, Math.random()*260, 10 + Math.random()*40, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle = `hsla(${h}, 60%, 85%, 0.6)`;
  ctx.font = 'bold 32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(img.index + 1, 100, 130);
  return canvas.toDataURL();
}
 
function getDemoSrc(img) {
  if (!demoSrcCache[img.index]) demoSrcCache[img.index] = makeDemoSrc(img);
  return demoSrcCache[img.index];
}

function openPack(packIdx, packEl, img, label) {
  const emptySlot = albumSlots.find(s => !placedImages.has(parseInt(s.dataset.index)));
  if (!emptySlot) return;
  packEl.classList.add('opening');
  burst(packEl);
  setTimeout(() => {
    placeSticker(emptySlot, parseInt(emptySlot.dataset.index), img, label, false);
    pendingImages.splice(packIdx, 1);
    buildPacks();
    packEl.remove();
    updateProgress();
    saveState();
    checkAlbumComplete();
  }, 600);
}

function placeSticker(slot, slotIdx, img, label, silent = false) {
  placedImages.add(slotIdx);
  slot.classList.add('filled');
  slot.innerHTML = '';
  // img can be a string (src from localStorage) or an object
  const imgSrc = (typeof img === 'object' && img !== null)
    ? (img.demo ? getDemoSrc(img) : img)
    : img;
  const wrap = document.createElement('div');
  wrap.className = 'placed-sticker' + (silent ? '' : ' sticker-enter');
  wrap.innerHTML = `<img src="${imgSrc}" alt="${label}"><span class="sticker-label">${label}</span>`;
  wrap.addEventListener('click', () => openLightbox(imgSrc, label));
  slot.appendChild(wrap);
  if (!silent) {
    slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => wrap.classList.remove('sticker-enter'), 700);
  }
}

function burst(el) {
  const rect    = el.getBoundingClientRect();
  const cx      = rect.left + rect.width / 2;
  const cy      = rect.top + rect.height / 2;
  const symbols = ['✦', '❧', '◈', '✧', '⁕', '❈'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className   = 'burst-particle';
    p.textContent = symbols[i % symbols.length];
    p.style.left  = cx + 'px';
    p.style.top   = cy + 'px';
    p.style.color = `hsl(${40 + Math.random()*30}, 80%, ${60 + Math.random()*20}%)`;
    const angle = Math.random() * Math.PI * 2;
    const dist  = 50 + Math.random() * 80;
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--dr', (Math.random() * 360 - 180) + 'deg');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

function updateProgress() {
  const total  = allImages.length;
  const placed = placedImages.size;
  document.getElementById('progressFill').style.width =
    (total > 0 ? (placed / total * 100) : 0) + '%';
  document.getElementById('progressLabel').textContent =
    `${placed} de ${total} figurinha${total !== 1 ? 's' : ''} colada${placed !== 1 ? 's' : ''}`;
  const pages  = Math.ceil(placed / 12) || 1;
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  document.getElementById('pageNum').textContent = `— página ${romans[pages-1] || pages} —`;
}
 
function updateTrayCount() {
  const n = pendingImages.length;
  document.getElementById('trayCount').textContent =
    `${n} figurinha${n !== 1 ? 's' : ''} restante${n !== 1 ? 's' : ''}`;
}

function openLightbox(src, caption) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

let trayOpen = false;
 
function openTray() {
  trayOpen = true;
  trayBody.classList.remove('collapsed');
  trayTab.textContent = '✦ figurinhas para colar ✦';
}
function closeTray() {
  trayOpen = false;
  trayBody.classList.add('collapsed');
  trayTab.textContent = '✦ abrir figurinhas ✦';
}
function revealTray() {
  packTray.style.visibility = 'visible';
  packTray.style.opacity    = '1';
}
function concealTray() {
  packTray.style.visibility = 'hidden';
  packTray.style.opacity    = '0';
}

trayBody.classList.add('collapsed');
concealTray();
 
trayTab.addEventListener('click', () => { trayOpen ? closeTray() : openTray(); });

function showCover() {
  coverOverlay.style.display = 'flex';
  coverOverlay.classList.remove('opening');
  closeTray();
  concealTray();
}
 
function hideCover() {
  coverOverlay.classList.add('opening');
  setTimeout(() => {
    coverOverlay.style.display = 'none';
    packTray.style.transition  = 'opacity 0.6s';
    revealTray();
    // Only open tray if album not complete
    if (placedImages.size < allImages.length) openTray();
  }, 950);
}
 
document.getElementById('coverOpenBtn').addEventListener('click', hideCover);

document.getElementById('backToCoverBtn').addEventListener('click', showCover);

function checkAlbumComplete() {
  if (allImages.length > 0 && placedImages.size === allImages.length) {
    setTimeout(showCompleteState, 800);
  }
}
 
function showCompleteState() {
  closeTray();
  setTimeout(() => {
    document.getElementById('packTray').querySelector('.tray-header h3').textContent = 'Álbum Completo';
    document.getElementById('trayCount').textContent = '✦ todas as figurinhas coladas ✦';
    const row = document.getElementById('packsRow');
    row.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'tray-complete';
    wrap.innerHTML = `
      <span class="tray-complete-title">✦ Álbum Concluído ✦</span>
      <span class="tray-complete-sub">cada momento encontrou seu lugar</span>
      <button class="tray-reset-btn" id="resetBtn">◈ Recomeçar a Jornada ◈</button>
    `;
    row.appendChild(wrap);
    document.getElementById('resetBtn').addEventListener('click', resetAlbum);
    openTray();
  }, 450);
}

function resetAlbum() {
  clearState();
  placedImages  = new Set();
  demoSrcCache  = {};
  pendingImages = [...allImages].sort(() => Math.random() - 0.5);
  buildGrid(allImages.length);
  buildPacks();
  updateProgress();
  document.getElementById('packTray').querySelector('.tray-header h3').textContent = 'Envelopes';
  showCover();
}

async function init() {
  createStars();
  allImages = await discoverImages();
 
  const saved = loadState();
 
  if (saved && Object.keys(saved.placed).length > 0) {
    pendingImages = (saved.pending || []).map(item => {
      try { const p = JSON.parse(item); return (p && p.demo) ? p : item; }
      catch(e) { return item; }
    });
 
    buildGrid(allImages.length);
    buildPacks();
 
    for (const [idxStr, imgSrc] of Object.entries(saved.placed)) {
      const slotIdx = parseInt(idxStr);
      const slot    = albumSlots[slotIdx];
      if (!slot) continue;
      const label = STICKER_TITLES[slotIdx % STICKER_TITLES.length];
      placeSticker(slot, slotIdx, imgSrc, label, true);
    }
 
    updateProgress();
 
    coverOverlay.style.display = 'none';
    revealTray();
 
    if (placedImages.size === allImages.length) {
      showCompleteState();
    } else {
      openTray();
    }
 
  } else {
    pendingImages = [...allImages].sort(() => Math.random() - 0.5);
    buildGrid(allImages.length);
    buildPacks();
    updateProgress();
  }
}
 
init();
 
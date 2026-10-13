/* =========================================================
   TIÃO TE ESPAÑOL — js/app.js
   Motor do jogo: estado, mapa, aula, quiz, resultados,
   insígnias, avatar Tião e sons. Sem dependências.
   ========================================================= */

/* ---------------- 1. Helpers ---------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickN = (arr, n) => shuffle(arr).slice(0, n);
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* A bandeira do Chile desenhada como SVG reutilizável.
   O emoji de bandeira NÃO renderiza no Windows — aparece como as letras "CL",
   então a bandeira é sempre este SVG (mesmo símbolo do <defs> no index.html). */
const FLAG_HTML = '<svg class="flag-inline" viewBox="0 0 30 20" aria-hidden="true"><use href="#flag-cl"/></svg>';

/* ---------------- 1.1 Reações do Tião (com modismos chilenos) ----------------
   Prioriza os modismos que o PRÓPRIO curso ensina (bacán, al tiro, po,
   cachai, fome) para reforçar o aprendizado, além de palavras universais. */
const REACCIONES_OK = [
  '¡Bacán!', '¡Al tiro!', '¡Bien po!', '¡Eso es!', '¡Perfecto!',
  '¡Qué bacán, cachai!', '¡Muy bien!', '¡Vamos!', '¡Excelente!', '¡Bien, po!'
];
const REACCIONES_FAIL = [
  '¡Qué fome!', 'Uy, casi po.', 'Pucha, la próxima es tuya.', 'Tranquilo, así se aprende.',
  'Casi, casi. ¡Sigue!', 'No importa po, vamos de nuevo.', 'Esa estuvo cerca.'
];

/* ---------------- 1.2 Pronúncia em espanhol (Web Speech API) ---------------- */
const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window
                      && typeof window.SpeechSynthesisUtterance === 'function';
let vozEs = null;
function cargarVoces() {
  if (!canSpeak()) return;
  const v = speechSynthesis.getVoices();
  if (!v.length) return;
  vozEs = v.find(x => /es[-_]CL/i.test(x.lang))     /* chileno, se houver */
       || v.find(x => /es[-_]MX/i.test(x.lang))
       || v.find(x => /es[-_]419/i.test(x.lang))
       || v.find(x => /^es/i.test(x.lang)) || null;
}
if (canSpeak()) { cargarVoces(); speechSynthesis.onvoiceschanged = cargarVoces; }

function speak(text, btn) {
  if (!text) return;
  if (!canSpeak()) { toast('Seu navegador não tem voz em espanhol 😕'); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = vozEs ? vozEs.lang : 'es-ES';
    if (vozEs) u.voice = vozEs;
    u.rate = 0.88;
    u.pitch = 1.02;
    if (btn) {
      const parar = () => btn.classList.remove('playing');
      btn.classList.add('playing');
      u.onend = parar;
      u.onerror = parar;
      setTimeout(parar, 6000);   /* segurança: se onend não disparar */
    }
    speechSynthesis.speak(u);
  } catch (e) { /* sem voz disponível */ }
}

/* ---------------- 2. Estado + persistência ---------------- */
const STORAGE_KEY = 'tiao-espanol-v1';
const TOTAL_LESSONS = WORLDS.reduce((n, w) => n + w.lessons.length, 0);
const MAX_STARS = TOTAL_LESSONS * 3;

const memoryStore = {};

/* Estado v2: o XP passa a ser derivado (soma do melhor XP de cada aula),
   o que permite FUNDIR o progresso de dois aparelhos sem perder nada.
   Saves antigos (v1, sem xp por aula) viram "xpBase" para não perder o total. */
function freshState() {
  return { v: 2, name: '', lessons: {}, badges: [], sound: true, tab: 'vocab', xpBase: 0 };
}

function migrateState(s) {
  const out = Object.assign(freshState(), s);
  if (!out.lessons || typeof out.lessons !== 'object') out.lessons = {};
  if (!Array.isArray(out.badges)) out.badges = [];
  /* Save antigo (v1) não tem "v" nem xp por aula: o total antigo vira "xpBase".
     O teste tem de olhar o "v" ORIGINAL — freshState() já injeta v:2 em "out". */
  if (!s || s.v !== 2) {
    out.xpBase = Number(s && s.xp) || 0;
  }
  out.v = 2;
  for (const id of Object.keys(out.lessons)) {
    const l = out.lessons[id];
    if (!l || typeof l !== 'object') { delete out.lessons[id]; continue; }
    l.stars = Math.max(0, Math.min(3, Number(l.stars) || 0));
    l.errors = Math.max(0, Number(l.errors) || 0);
    l.done = !!l.done;
    l.xp = Math.max(0, Number(l.xp) || 0);
  }
  delete out.xp;   /* o XP agora é calculado por totalXp() */
  return out;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    return migrateState(JSON.parse(raw));
  } catch (e) {
    console.warn('localStorage indisponível, usando memória.', e);
    return migrateState(memoryStore);
  }
}
let state = loadState();

/* XP total = XP de saves antigos (xpBase) + melhor XP de cada aula. */
const totalXp = () => (state.xpBase || 0) +
  Object.values(state.lessons).reduce((n, l) => n + (l.xp || 0), 0);

function save() {
  memoryStore.v = state.v;
  memoryStore.name = state.name;
  memoryStore.lessons = state.lessons;
  memoryStore.badges = state.badges;
  memoryStore.xpBase = state.xpBase;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* memória já atualizada */ }
}

const lessonRec = (id) => state.lessons[id] || { stars: 0, errors: 0, done: false };
const isUnlocked = (id) => id === 1 || !!state.lessons[id - 1]?.done;
const completedCount = () => Object.values(state.lessons).filter(l => l.done).length;
const totalStars = () => Object.values(state.lessons).reduce((n, l) => n + (l.stars || 0), 0);
const worldDone = (w) => w.lessons.every(l => state.lessons[l.id]?.done);
const nextLessonId = () => {
  for (let id = 1; id <= TOTAL_LESSONS; id++) if (!state.lessons[id]?.done) return id;
  return TOTAL_LESSONS + 1;   /* curso todo concluído */
};

const findLesson = (id) => {
  for (const w of WORLDS) {
    const l = w.lessons.find(x => x.id === id);
    if (l) return { world: w, lesson: l };
  }
  return null;
};

/* ---------------- 3. Áudio (WebAudio, sem arquivos) ---------------- */
let actx = null;
function tone(freq, dur = 0.12, type = 'sine', vol = 0.05, delay = 0) {
  if (!state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t0 = actx.currentTime + delay;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch (e) { /* áudio indisponível */ }
}
const sfx = {
  click:   () => tone(520, 0.07, 'triangle', 0.04),
  flip:    () => { tone(660, 0.07, 'sine', 0.04); tone(880, 0.09, 'sine', 0.03, 0.06); },
  correct: () => { tone(660, 0.11, 'sine', 0.05); tone(880, 0.12, 'sine', 0.05, 0.09); tone(1180, 0.16, 'sine', 0.04, 0.18); },
  wrong:   () => { tone(240, 0.16, 'sawtooth', 0.045); tone(170, 0.22, 'sawtooth', 0.035, 0.11); },
  star:    () => { tone(880, 0.1, 'triangle', 0.05); tone(1320, 0.14, 'triangle', 0.04, 0.08); },
  unlock:  () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, 'triangle', 0.045, i * 0.09)); },
  finish:  () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'sine', 0.05, i * 0.1)); },
  badge:   () => { tone(988, 0.12, 'square', 0.035); tone(1318, 0.18, 'square', 0.03, 0.1); },
  streak:  () => { [784, 988, 1245, 1568].forEach((f, i) => tone(f, 0.11, 'triangle', 0.05, i * 0.06)); }
};

/* ---------------- 4. Avatar Tião ---------------- */
let moodTimer = null;
function setMood(mood, revertAfter = 0) {
  $$('svg[data-mood]').forEach(svg => svg.setAttribute('data-mood', mood));
  clearTimeout(moodTimer);
  if (revertAfter) moodTimer = setTimeout(() => setMood('normal'), revertAfter);
}
function tiaoAnim(cls) {
  const el = $('#tiao-wrap');
  if (!el) return;
  el.classList.remove('bounce', 'shake', 'jump');
  void el.offsetWidth; /* reinicia a animação */
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 700);
}
function tiaoSays(text, { mood = 'normal', anim = 'bounce', speak = true } = {}) {
  const bubble = $('#lesson-speech');
  const label = $('.speech-text');
  if (label && text) {
    label.textContent = text;
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
  }
  setMood(mood);
  if (anim) tiaoAnim(anim);
  if (speak) sfx.click();
}
function mountMiniTiao() {
  const holder = $('#tiao-mini');
  const original = $('#tiao');
  if (!holder || !original || holder.querySelector('svg')) return;
  const clone = original.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('class', 'tiao-svg');
  holder.appendChild(clone);
  holder.closest('.quiz-tiao')?.classList.add('on');
}

/* ---------------- 5. Telas ---------------- */
function show(screenId) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateHUD();
}

/* ---------------- 6. HUD ---------------- */
function updateHUD(pop = false) {
  $('#xp-value').textContent = totalXp();
  $('#stars-value').textContent = totalStars();
  $('#lessons-value').textContent = completedCount();
  $('#badge-count').textContent = state.badges.length;
  $('#global-progress-fill').style.width = `${(completedCount() / TOTAL_LESSONS) * 100}%`;
  $('#btn-sound').textContent = state.sound ? '🔊' : '🔇';
  $('#btn-sound').setAttribute('aria-pressed', String(state.sound));

  const next = nextLessonId();
  const label = $('#continue-label');
  if (label) {
    if (next > TOTAL_LESSONS) {
      label.innerHTML = 'Curso completo! ' + FLAG_HTML + ' Ver insígnias';
    } else {
      const done = completedCount();
      label.textContent = done === 0
        ? 'Começar a aula 1'
        : `Continuar — aula ${next}`;
    }
  }
  if (pop) {
    const el = $('#stat-xp');
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
}

/* ---------------- 7. Toast + confete ---------------- */
function toast(msg, ms = 2200) {
  const el = document.createElement('div');
  el.className = 'toast';
  /* innerHTML: todas as mensagens são internas (nunca vêm do usuário),
     e algumas contêm a bandeira em SVG (FLAG_HTML). */
  el.innerHTML = msg;
  $('#toast-layer').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 320);
  }, ms);
}

function confetti(count = 90) {
  const layer = $('#confetti-layer');
  const colors = ['#ffb703', '#fb5607', '#31d97c', '#38bdf8', '#c084fc', '#f472b6', '#ffffff'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = (1.9 + Math.random() * 1.9) + 's';
    c.style.animationDelay = (Math.random() * 0.5) + 's';
    if (Math.random() > 0.6) c.style.borderRadius = '50%';
    frag.appendChild(c);
  }
  layer.appendChild(frag);
  setTimeout(() => { layer.innerHTML = ''; }, 4200);
}

/* ---------------- 8. Insígnias ---------------- */
function buildBadges() {
  const list = [
    { id: 'first',   icon: '🐣', name: 'Primeira Aula', desc: 'Concluiu a aula 1', test: () => completedCount() >= 1, progress: () => [Math.min(completedCount(), 1), 1] },
    { id: 'perfect', icon: '🎯', name: 'Nota Máxima',    desc: '3 estrelas numa aula', test: () => Object.values(state.lessons).some(l => l.stars >= 3), progress: () => [Math.max(0, ...Object.values(state.lessons).map(l => l.stars || 0)), 3] },
    { id: 'five',    icon: '🌱', name: 'Metade do Caminho', desc: '20 aulas concluídas', test: () => completedCount() >= 20, progress: () => [Math.min(completedCount(), 20), 20] }
  ];
  WORLDS.forEach(w => list.push({
    id: 'w' + w.id,
    icon: w.icon,
    name: 'Mundo ' + w.id,
    desc: w.title,
    test: () => worldDone(w),
    progress: () => [w.lessons.filter(l => state.lessons[l.id]?.done).length, w.lessons.length]
  }));
  list.push({
    id: 'honor', icon: FLAG_HTML, name: 'Chileno Honorário',
    desc: '100% do curso concluído',
    test: () => completedCount() >= TOTAL_LESSONS,
    progress: () => [Math.min(completedCount(), TOTAL_LESSONS), TOTAL_LESSONS]
  });
  return list;
}

/* Pista da insígnia mais próxima de ser conquistada (a de maior progresso
   parcial que ainda não foi ganha). Devolve '' se não houver nenhuma. */
function nextBadgeHint() {
  const cands = buildBadges()
    .filter(b => !state.badges.includes(b.id) && typeof b.progress === 'function')
    .map(b => { const [c, t] = b.progress(); return { b, c, t, r: t ? c / t : 0 }; })
    .filter(x => x.c > 0 && x.r < 1)
    .sort((a, z) => z.r - a.r);
  if (!cands.length) return '';
  const { b, c, t } = cands[0];
  return `Próxima insígnia: ${b.icon} ${esc(b.name)} — ${c}/${t}`;
}

function checkBadges() {
  const earned = [];
  buildBadges().forEach(b => {
    let ok = false;
    try { ok = b.test(); } catch (e) { ok = false; }
    if (ok && !state.badges.includes(b.id)) {
      state.badges.push(b.id);
      earned.push(b);
    }
  });
  if (earned.length) {
    save();
    earned.forEach((b, i) => setTimeout(() => { sfx.badge(); toast(`${b.icon} Nova insígnia: ${b.name}`); }, 400 + i * 900));
  }
  return earned;
}

function renderBadges() {
  const all = buildBadges();
  $('#badges-grid').innerHTML = all.map(b => {
    const has = state.badges.includes(b.id);
    return `<div class="badge ${has ? 'earned' : 'locked'}">
      <div class="b-ico">${has ? b.icon : '🔒'}</div>
      <div class="b-name">${has ? esc(b.name) : '???'}</div>
      <div class="b-desc">${esc(b.desc)}</div>
    </div>`;
  }).join('');
  $('#badges-summary').textContent =
    `${state.badges.length} de ${all.length} conquistadas • ${completedCount()}/${TOTAL_LESSONS} aulas • ${totalStars()}/${MAX_STARS} estrelas`;
}

/* ---------------- 9.1 Palabra del dia ---------------- */
const ALL_WORDS = WORLDS.flatMap(w => w.lessons.flatMap(l =>
  l.vocab.map(v => ({ es: v.es, pt: v.pt, world: w, lessonId: l.id, lessonTitle: l.title }))
));

function renderWordOfDay() {
  const box = $('#word-day');
  if (!box || !ALL_WORDS.length) return;
  /* escolha determinística pelo dia: a mesma palavra durante todo o dia */
  const dia = Math.floor(Date.now() / 86400000);
  const idx = ((dia % ALL_WORDS.length) + ALL_WORDS.length) % ALL_WORDS.length;
  const w = ALL_WORDS[idx];
  box.hidden = false;
  $('#wd-es').textContent = w.es;
  $('#wd-pt').textContent = w.pt;
  $('#wd-from').textContent = `Mundo ${w.world.id} ${w.world.icon} · aula ${w.lessonId}: ${w.lessonTitle}`;
  const btn = $('#wd-speak');
  btn.hidden = !canSpeak();
  btn.dataset.say = w.es;
}

/* ---------------- 9. Mapa ---------------- */
function renderMap() {
  const list = $('#worlds-list');
  list.innerHTML = WORLDS.map(w => {
    const done = w.lessons.filter(l => state.lessons[l.id]?.done).length;
    const pct = Math.round((done / w.lessons.length) * 100);
    const nodes = w.lessons.map(l => {
      const rec = state.lessons[l.id];
      const cls = rec?.done ? 'done' : (isUnlocked(l.id) ? 'current' : 'locked');
      const stars = rec?.done ? '★'.repeat(rec.stars || 0) + '☆'.repeat(3 - (rec.stars || 0)) : '';
      const icon = cls === 'locked' ? '🔒' : (rec?.done ? '✓' : l.id);
      return `<button class="lesson-node ${cls}" data-lesson="${l.id}" ${cls === 'locked' ? 'disabled' : ''}
                title="Aula ${l.id} — ${esc(l.title)}">
                <span class="n-num">${icon}</span>
                <span class="n-stars">${stars}</span>
              </button>`;
    }).join('');

    return `<section class="world" style="--w:${w.color}">
      <div class="world-head">
        <div class="world-icon">${w.icon}</div>
        <div class="world-titles">
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc)} • aulas ${w.lessons[0].id}–${w.lessons[w.lessons.length - 1].id}</p>
        </div>
        <div class="world-meter">
          <div class="bar"><i style="width:${pct}%"></i></div>
          <span>${done}/${w.lessons.length}</span>
        </div>
      </div>
      <div class="lessons-grid">${nodes}</div>
    </section>`;
  }).join('');

  $$('.lesson-node', list).forEach(btn => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.lesson);
    if (!isUnlocked(id)) return;
    sfx.click();
    renderLesson(id);
  }));

  /* rodapé: dica + pista da próxima insígnia */
  const hint = nextBadgeHint();
  $('#map-foot').innerHTML = 'Dica: toque nas cartas de palavra para virar e ver a tradução.' +
    (hint ? `<br><span class="map-foot-badge">${hint}</span>` : '');

  renderGreeting();
  show('screen-map');
}

/* saudação personalizada com o nome do jogador (se houver) */
function renderGreeting() {
  const el = $('#map-greet');
  if (!el) return;
  const n = (state.name || '').trim();
  el.hidden = !n;
  el.textContent = n ? `¡Hola, ${n}! Bora continuar de onde você parou?` : '';
}

/* ---------------- 10. Aula ---------------- */
let currentLessonId = null;

function renderLesson(id) {
  const found = findLesson(id);
  if (!found) return renderMap();
  const { world, lesson } = found;
  currentLessonId = id;
  state.tab = state.tab || 'vocab';

  $('#tiao').style.setProperty('--tiao-shirt', world.color);
  $('#tiao-mini')?.style.setProperty('--tiao-shirt', world.color);
  $('#lesson-chip').textContent = `Mundo ${world.id} ${world.icon}`;
  $('#lesson-title').textContent = `Aula ${lesson.id} — ${lesson.title}`;
  $('#tab-vocab-count').textContent = `(${lesson.vocab.length})`;
  $('#tab-phrases-count').textContent = `(${lesson.phrases.length})`;

  const rec = state.lessons[id];
  $('#lesson-stars').textContent = rec?.done ? '★'.repeat(rec.stars || 0) : '';

  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === state.tab));
  renderCards();

  show('screen-lesson');
  setMood('normal', 0);
  tiaoSays(lesson.tip, { anim: 'bounce', speak: false });
  sfx.click();
}

function renderCards() {
  const lesson = findLesson(currentLessonId).lesson;
  const grid = $('#cards-grid');
  const kind = state.tab;
  const items = kind === 'vocab' ? lesson.vocab : lesson.phrases;

  grid.style.setProperty('--w', findLesson(currentLessonId).world.color);
  /* o botão de pronúncia só aparece no lado que mostra ESPANHOL */
  const speakBtn = (txt) => canSpeak()
    ? `<button class="speak" data-say="${esc(txt)}" title="Ouvir em espanhol" aria-label="Ouvir: ${esc(txt)}">🔊</button>`
    : '';
  grid.innerHTML = items.map((it, i) => {
    const isVocab = kind === 'vocab';
    const front = isVocab ? it.pt : it.es;
    const back  = isVocab ? it.es : it.pt;
    const frontSpeak = isVocab ? '' : speakBtn(it.es);
    const backSpeak  = isVocab ? speakBtn(it.es) : '';
    return `<div class="flip-card" data-i="${i}" role="button" tabindex="0"
                 aria-label="${esc(front)} — toque para ver a tradução">
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <span class="fc-lang">${isVocab ? 'Português' : 'Español'}</span>
          <span class="fc-text">${esc(front)}</span>
          <span class="fc-hint">toque para virar</span>
          ${frontSpeak}
        </div>
        <div class="flip-face flip-back">
          <span class="fc-lang">${isVocab ? 'Español' : 'Português'}</span>
          <span class="fc-text">${esc(back)}</span>
          ${backSpeak}
        </div>
      </div>
    </div>`;
  }).join('');

  $$('.flip-card', grid).forEach(card => {
    const flip = () => { card.classList.toggle('flipped'); sfx.flip(); };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => {
      if (e.target !== card) return;   /* não virar a carta ao usar o botão de voz */
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });
}

function reviewAll() {
  const cards = $$('.flip-card');
  if (!cards.length) return;
  cards.forEach(c => c.classList.add('flipped'));
  sfx.flip();
  setTimeout(() => cards.forEach(c => c.classList.remove('flipped')), 1700);
  toast('Revisão rápida — nenhuma resposta!', 1700);
}

/* ---------------- 11. Quiz ---------------- */
let quiz = null;

function buildQuiz(lesson) {
  const questions = [];

  /* 6 perguntas de vocabulário (metade PT→ES, metade ES→PT) */
  const picked = pickN(lesson.vocab, 6);
  picked.forEach((item, i) => {
    const pool = lesson.vocab.filter(x => x.pt !== item.pt && x.es !== item.es);
    const distractors = pickN(pool, 3);
    const toSpanish = i % 2 === 0;   /* alterna a direção */
    const options = shuffle([toSpanish ? item.es : item.pt, ...distractors.map(d => toSpanish ? d.es : d.pt)]);
    questions.push({
      type: 'vocab',
      hint: toSpanish ? 'Como se diz em espanhol' : 'Qual a tradução em português',
      prompt: toSpanish ? item.pt : item.es,
      source: toSpanish ? 'Português ➜ Espanhol' : 'Espanhol ➜ Português',
      answer: toSpanish ? item.es : item.pt,
      audio: item.es,
      promptLang: toSpanish ? 'pt' : 'es',
      say: toSpanish
        ? `“${item.pt}” em espanhol é “${item.es}”.`
        : `“${item.es}” em português é “${item.pt}”.`,
      options
    });
  });

  /* 2 perguntas de compreensão de frase */
  pickN(lesson.phrases, 2).forEach(ph => {
    /* o pool nunca pode conter o texto da própria resposta, senão a
       alternativa aparece duplicada (ex.: "De onde você é?" é frase E palavra) */
    const pool = [...new Set([
      ...lesson.phrases.filter(x => x.pt !== ph.pt).map(x => x.pt),
      ...lesson.vocab.filter(v => v.pt !== ph.pt).map(v => v.pt)
    ])];
    const distractors = pickN(pool, 3);
    questions.push({
      type: 'phrase',
      hint: 'O que significa',
      prompt: ph.es,
      source: 'Compreensão de frase',
      answer: ph.pt,
      audio: ph.es,
      promptLang: 'es',
      say: `“${ph.es}” significa “${ph.pt}”.`,
      options: shuffle([ph.pt, ...distractors])
    });
  });

  return shuffle(questions);
}

function startQuiz(id) {
  const { lesson } = findLesson(id);
  quiz = {
    lessonId: id,
    questions: buildQuiz(lesson),
    index: 0,
    score: 0,
    errors: 0,
    hitsVocab: 0,
    hitsPhrase: 0,
    streak: 0,        /* acertos consecutivos */
    maxStreak: 0,
    comboXp: 0,       /* XP extra ganho por racha */
    locked: false
  };
  $('#quiz-counter').textContent = `1/${quiz.questions.length}`;
  $('#quiz-bar-fill').style.width = '0%';
  $('#quiz-score').textContent = '0';
  $('#feedback').classList.remove('on');
  hideCombo();
  show('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  quiz.locked = false;

  $('#quiz-counter').textContent = `${quiz.index + 1}/${total}`;
  $('#quiz-bar-fill').style.width = `${(quiz.index / total) * 100}%`;
  $('#quiz-hint').textContent = q.hint;
  $('#quiz-prompt').textContent = q.prompt;
  $('#quiz-source').textContent = q.source;

  /* botão de ouvir: só quando o enunciado está em ESPANHOL e há voz */
  const listen = $('#quiz-listen');
  const speakBtn = $('#quiz-speak');
  const podeOuvir = canSpeak() && q.promptLang === 'es';
  listen.hidden = !podeOuvir;
  if (podeOuvir) speakBtn.dataset.say = q.prompt;

  const opts = $('#options');
  opts.innerHTML = q.options.map((opt, i) =>
    `<button class="option" data-i="${i}" data-opt="${esc(opt)}">
       <span class="key">${i + 1}</span>${esc(opt)}
     </button>`).join('');

  $$('.option', opts).forEach(btn => btn.addEventListener('click', () => answer(btn, Number(btn.dataset.i))));
  $('#feedback').classList.remove('on');
  setMood('normal', 0);
}

/* ---------------- 11.1 Racha (combo) + XP flutuante ---------------- */
function showCombo(streak, bonus) {
  const el = $('#combo');
  if (!el) return;
  if (streak < 2) return hideCombo();
  el.hidden = false;
  el.classList.toggle('hot', streak >= 4);
  $('#combo-value').textContent = 'x' + streak;
  $('#combo-bonus').textContent = bonus > 0 ? `+${bonus} XP` : 'racha!';
  el.style.animation = 'none';
  void el.offsetWidth;              /* reinicia a animação */
  el.style.animation = '';
}
function hideCombo() {
  const el = $('#combo');
  if (el) el.hidden = true;
}
function floatXP(el, text, kind = 'ok') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'float-xp ' + kind;
  s.textContent = text;
  s.style.left = (r.left + r.width / 2) + 'px';
  s.style.top = (r.top + r.height / 2) + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1300);
}

function answer(btn, index) {
  if (quiz.locked) return;
  quiz.locked = true;

  const q = quiz.questions[quiz.index];
  const chosen = q.options[index];
  const ok = chosen === q.answer;
  const baseXp = q.type === 'vocab' ? 10 : 15;
  let xp = 0, comboBonus = 0;

  if (ok) {
    quiz.streak++;
    quiz.maxStreak = Math.max(quiz.maxStreak, quiz.streak);
    /* bônus de racha: cresce a partir do 3º acerto seguido (máx. +20) */
    comboBonus = quiz.streak >= 3 ? Math.min((quiz.streak - 2) * 5, 20) : 0;
    xp = baseXp + comboBonus;
    quiz.score += xp;
    quiz.comboXp += comboBonus;
    if (q.type === 'vocab') quiz.hitsVocab++; else quiz.hitsPhrase++;
    btn.classList.add('correct');
    sfx.correct();
    setMood('happy');
    tiaoAnim('jump');
    showCombo(quiz.streak, comboBonus);
    floatXP(btn, `+${xp}`, comboBonus ? 'combo' : 'ok');
    if (quiz.streak >= 3) { sfx.streak(); confetti(30); }
  } else {
    quiz.streak = 0;
    quiz.errors++;
    btn.classList.add('wrong');
    $$('.option').forEach(o => {
      if (o.dataset.opt === q.answer) o.classList.add('correct');
      else if (o !== btn) o.classList.add('dimmed');
    });
    sfx.wrong();
    setMood('sad');
    tiaoAnim('shake');
    hideCombo();
    floatXP(btn, pickRandom(['¡Uy!', 'Casi…', '¡Pucha!']), 'bad');
  }
  $$('.option').forEach(o => o.classList.add('disabled'));

  $('#quiz-score').textContent = quiz.score;

  const fb = $('#feedback');
  fb.classList.add('on');
  /* Tião reage com uma frase diferente a cada resposta (modismos chilenos) */
  $('#tiao-reaction').textContent = ok ? pickRandom(REACCIONES_OK) : pickRandom(REACCIONES_FAIL);
  const ft = $('#feedback-text');
  ft.className = 'feedback-text ' + (ok ? 'ok' : 'nope');
  ft.textContent = ok
    ? (comboBonus ? `¡Racha x${quiz.streak}! +${xp} XP` : `Isso! +${xp} XP`)
    : `Ops! A resposta é “${q.answer}”`;

  const sayBtn = canSpeak()
    ? ` <button class="speak" data-say="${esc(q.audio)}" title="Ouvir em espanhol" aria-label="Ouvir em espanhol">🔊</button>`
    : '';
  $('#feedback-translation').innerHTML = `${esc(q.say)}${sayBtn}${ok ? '' : ' <b>Tenta na próxima!</b>'}`;
  $('#btn-next').textContent = quiz.index === quiz.questions.length - 1 ? 'Ver resultado →' : 'Próxima pergunta →';
  $('#btn-next').focus({ preventScroll: true });
}

function nextQuestion() {
  quiz.index++;
  if (quiz.index >= quiz.questions.length) renderResults();
  else renderQuestion();
}

/* ---------------- 12. Resultado ---------------- */
function renderResults() {
  const { lesson } = findLesson(quiz.lessonId);
  const errors = quiz.errors;
  const stars = errors === 0 ? 3 : (errors <= 2 ? 2 : 1);
  const bonus = 20;
  const prev = state.lessons[quiz.lessonId];
  const isNew = !prev?.done;
  const prevXp = (prev && prev.xp) || 0;
  const gainedThisRun = quiz.score + bonus;                 /* o que esta partida rendeu */
  const bestXp = Math.max(prevXp, gainedThisRun);           /* recorde da aula */
  const xpGain = bestXp - prevXp;                           /* o que de fato soma ao total */

  state.lessons[quiz.lessonId] = {
    stars: Math.max(stars, prev?.stars || 0), errors, done: true, xp: bestXp
  };
  save();

  /* sincroniza em segundo plano se o usuário ativou a sincronização automática */
  queueSync();

  const newBadges = checkBadges();

  $('#result-kicker').textContent = errors === 0 ? 'Nota máxima!' : (errors <= 2 ? 'Muito bem!' : 'Aula concluída!');
  $('#result-title').textContent = errors === 0
    ? '¡Perfecto! Você entendeu tudo.'
    : (errors <= 2 ? '¡Muy bien! Quase perfeito.' : '¡Bien! Falta um pouco de treino.');
  $('#result-sub').textContent = errors === 0
    ? 'Tião está orgulhoso. Bora para a próxima?'
    : `Você errou ${errors} de ${quiz.questions.length}. Errar também é aprender.`;

  $('#result-stars').innerHTML = [0, 1, 2]
    .map(i => `<span class="st ${i < stars ? 'on' : ''}">★</span>`).join('');

  $('#result-xp').textContent = xpGain;
  $('#result-detail').textContent = isNew
    ? `${quiz.hitsVocab}×10 palavras + ${quiz.hitsPhrase}×15 frases` +
      (quiz.comboXp ? ` + ${quiz.comboXp} de racha` : '') + ` + ${bonus} bônus`
    : (xpGain > 0
        ? `Novo recorde nesta aula! Subiu +${xpGain} XP (recorde: ${bestXp} XP).`
        : `Aula repetida — vale o seu recorde de ${bestXp} XP nesta aula (sem XP novo).`);

  $('#result-badges').innerHTML = newBadges.length
    ? newBadges.map(b => `<div class="rb">${b.icon} ${esc(b.name)}</div>`).join('')
    : '';

  /* melhor racha de acertos consecutivos */
  const stEl = $('#result-streak');
  stEl.classList.toggle('hidden', quiz.maxStreak < 2);
  stEl.innerHTML = `🔥 Melhor racha: <b>x${quiz.maxStreak}</b>` +
    (quiz.comboXp ? ` · +${quiz.comboXp} XP em bônus` : '');

  /* pista da insígnia mais próxima */
  const hint = nextBadgeHint();
  const nbEl = $('#result-nextbadge');
  nbEl.classList.toggle('hidden', !hint);
  nbEl.innerHTML = hint;

  const nextId = quiz.lessonId + 1;
  const nextBtn = $('#btn-next-lesson');
  if (nextId <= TOTAL_LESSONS) {
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = `Aula ${nextId} →`;
  } else {
    nextBtn.classList.add('hidden');
  }

  $('#tiao').setAttribute('data-mood', 'happy');
  show('screen-result');

  [0, 1, 2].forEach(i => { if (i < stars) setTimeout(() => sfx.star(), 200 + i * 200); });
  setTimeout(() => {
    sfx.finish();
    if (stars >= 2) confetti(stars === 3 ? 130 : 70);
  }, 700);

  const world = findLesson(quiz.lessonId).world;
  if (worldDone(world) && !state.badges.includes('w' + world.id)) toast(`Mundo ${world.id} completo! ${world.icon}`);
  updateHUD(true);
}

/* ---------------- 12.5 Sincronização com GitHub Gist ----------------
   O jogo é 100% estático (roda no GitHub Pages), então não existe servidor
   nem banco de dados. Para levar o progresso de um aparelho a outro usamos um
   "Gist" da conta do próprio usuário, acessado pela API do GitHub com um token
   pessoal. O token NUNCA entra no arquivo de progresso e fica guardado só no
   localStorage deste navegador (chave separada, nunca exportada). */

const SYNC_KEY  = 'tiao-espanol-sync';
const GIST_FILE = 'tiao-espanol-progresso.json';
const GIST_DESC = 'Tião Te Español — progresso do jogo (não apague)';
const GH_API    = 'https://api.github.com';

const SYNC_DEFAULT = { token: '', gistId: '', login: '', lastSync: 0, auto: false };
let sync = loadSync();
let syncBusy = false;
let syncTimer = null;

function loadSync() {
  try { return Object.assign({}, SYNC_DEFAULT, JSON.parse(localStorage.getItem(SYNC_KEY) || '{}')); }
  catch (e) { return Object.assign({}, SYNC_DEFAULT); }
}
function saveSync() {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* segue sem persistir */ }
}
const syncOn = () => !!(sync.token && sync.gistId);

/* --- chamada à API do GitHub com erro legível --- */
async function ghFetch(path, token, opts = {}) {
  const res = await fetch(GH_API + path, {
    method: 'GET',
    ...opts,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* sem corpo */ }
  if (!res.ok) {
    const err = new Error((data && data.message) || ('Erro HTTP ' + res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

/* valida o token de verdade e devolve o login do usuário */
async function ghValidate(token) {
  const u = await ghFetch('/user', token);
  if (!u || !u.login) throw new Error('Resposta inesperada do GitHub.');
  return u.login;
}

/* procura um Gist já criado por este app (até 3 páginas de 100) */
async function ghFindGist(token) {
  for (let page = 1; page <= 3; page++) {
    const lista = await ghFetch('/gists?per_page=100&page=' + page, token);
    if (!Array.isArray(lista) || !lista.length) break;
    const achou = lista.find(g => g.files && g.files[GIST_FILE]);
    if (achou) return achou.id;
    if (lista.length < 100) break;
  }
  return null;
}

/* o que vai para o Gist (nunca inclui o token) */
function syncPayload() {
  return {
    app: 'tiao-espanol',
    v: 2,
    updatedAt: Date.now(),
    data: {
      name: state.name || '',
      lessons: state.lessons || {},
      badges: state.badges || [],
      sound: !!state.sound,
      xpBase: Number(state.xpBase) || 0
    }
  };
}

async function ghWrite(gistId, payload) {
  const body = JSON.stringify({
    description: GIST_DESC,
    public: false,
    files: { [GIST_FILE]: { content: JSON.stringify(payload, null, 2) } }
  });
  return gistId
    ? ghFetch('/gists/' + gistId, sync.token, { method: 'PATCH', body })
    : ghFetch('/gists', sync.token, { method: 'POST', body });
}

async function ghRead(gistId) {
  const g = await ghFetch('/gists/' + gistId, sync.token);
  const file = g && g.files && g.files[GIST_FILE];
  if (!file) throw new Error('O Gist não tem o arquivo de progresso do jogo.');
  let content = file.content;
  if (file.truncated && file.raw_url) {   /* progresso é pequeno, mas por via das dúvidas */
    const r = await fetch(file.raw_url, { headers: { 'Accept': 'application/vnd.github.raw' } });
    content = await r.text();
  }
  return JSON.parse(content);
}

/* Fusão: fica o MELHOR de cada aula nos dois lados — nada se perde. */
function mergeStates(a, b) {
  a = a || {}; b = b || {};
  const out = freshState();
  out.name  = String(a.name || '').trim() || String(b.name || '').trim();
  out.xpBase = Math.max(Number(a.xpBase) || 0, Number(b.xpBase) || 0);
  out.sound = (typeof a.sound === 'boolean') ? a.sound : !!b.sound;
  out.badges = [...new Set([...(a.badges || []), ...(b.badges || [])])];

  const la = a.lessons || {}, lb = b.lessons || {};
  for (const id of new Set([...Object.keys(la), ...Object.keys(lb)])) {
    const x = la[id], y = lb[id];
    if (!x) { out.lessons[id] = y; continue; }
    if (!y) { out.lessons[id] = x; continue; }
    const ex = typeof x.errors === 'number' ? x.errors : 99;
    const ey = typeof y.errors === 'number' ? y.errors : 99;
    out.lessons[id] = {
      stars: Math.max(x.stars || 0, y.stars || 0),
      errors: Math.min(ex, ey),
      done: !!(x.done || y.done),
      xp: Math.max(x.xp || 0, y.xp || 0)
    };
  }
  return out;
}

function applySyncedState(next) {
  state = migrateState(next);
  save();
  updateHUD();
  renderMap();
}

async function syncPull({ silent = false } = {}) {
  if (!syncOn()) return false;
  const remote = await ghRead(sync.gistId);
  const remoteData = remote && remote.data;
  if (!remoteData || typeof remoteData !== 'object') throw new Error('Progresso remoto vazio ou inválido.');

  const before = JSON.stringify({ l: state.lessons, b: state.badges, x: state.xpBase, n: state.name });
  const merged = mergeStates(state, remoteData);
  const after = JSON.stringify({ l: merged.lessons, b: merged.badges, x: merged.xpBase, n: merged.name });

  applySyncedState(merged);
  sync.lastSync = Date.now();
  saveSync();

  if (!silent) toast(before !== after ? 'Progresso baixado e combinado! ☁️' : 'Nada novo para baixar ☁️', 1900);
  return before !== after;
}

async function syncPush({ silent = false } = {}) {
  if (!syncOn()) return;
  const res = await ghWrite(sync.gistId, syncPayload());
  if (res && res.id) sync.gistId = res.id;
  sync.lastSync = Date.now();
  saveSync();
  if (!silent) toast('Progresso enviado para o GitHub ☁️', 1600);
}

/* conecta: valida o token, acha (ou cria) o Gist e já combina os dois lados */
async function syncConnect(token) {
  const login = await ghValidate(token);
  sync.token = token;
  sync.login = login;

  const found = await ghFindGist(token);
  if (!found) {
    const created = await ghWrite('', syncPayload());
    sync.gistId = created.id;
    sync.auto = true;
    sync.lastSync = Date.now();
    saveSync();
    return { created: true, login };
  }
  sync.gistId = found;
  saveSync();
  await syncPull({ silent: true });    /* combina o que já existir */
  await syncPush({ silent: true });    /* devolve a união */
  return { created: false, login };
}

/* envia em segundo plano depois de cada aula, com atraso para juntar eventos */
function queueSync() {
  if (!syncOn() || !sync.auto) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { syncPush({ silent: true }).catch(() => {}); }, 1200);
}

/* tenta combinar ao abrir o jogo */
async function syncOnLoad() {
  if (!syncOn() || !sync.auto) return;
  try { await syncPull({ silent: true }); } catch (e) { /* offline: segue jogando */ }
}

/* --- interface do Perfil --- */
function syncMsg(text, kind = '') {
  const el = $('#sync-status');
  if (!el) return;
  el.className = 'sync-status' + (kind ? ' ' + kind : '');
  el.textContent = text;
}
function syncOffNote(text, kind = '') {
  const el = $('#sync-off-note');
  if (!el) return;
  el.textContent = text || '';
  el.className = 'sync-note' + (kind ? ' ' + kind : '');
}

function renderSyncUI() {
  const connected = !!sync.token;
  $('#sync-off').hidden = connected;
  $('#sync-on').hidden = !connected;
  $('#input-token').value = '';
  if ($('#input-name') !== document.activeElement) $('#input-name').value = state.name || '';

  if (connected) {
    const when = sync.lastSync ? new Date(sync.lastSync).toLocaleString('pt-BR') : 'nunca';
    const el = $('#sync-status');
    el.className = 'sync-status' + (sync.gistId ? '' : ' warn');
    el.innerHTML = sync.gistId
      ? `☁️ Sincronizado como <span class="u">@${esc(sync.login)}</span><small>Última vez: ${esc(when)}</small>`
      : `Conectado como <span class="u">@${esc(sync.login)}</span>, mas sem Gist ainda — clique em “Enviar para o GitHub”.`;
    $('#check-auto').checked = !!sync.auto;
  }
}

async function onConnect() {
  const token = $('#input-token').value.trim();
  if (!token) { syncOffNote('Cole o token primeiro.', 'err'); return; }
  if (syncBusy) return;
  syncBusy = true;
  const btn = $('#btn-connect');
  btn.disabled = true; btn.textContent = 'Conectando…';
  syncOffNote('');
  try {
    const r = await syncConnect(token);
    renderSyncUI();
    sfx.badge();
    toast(r.created ? 'Conectado! Progresso enviado ao GitHub ☁️'
                    : 'Conectado! Progressos combinados ☁️', 2300);
  } catch (e) {
    sync.token = ''; sync.gistId = ''; sync.login = ''; saveSync();
    renderSyncUI();
    const msg = (e.status === 401 || e.status === 403)
      ? 'Token inválido ou sem a permissão “gist”. Crie outro e tente de novo.'
      : 'Não deu para conectar: ' + e.message;
    syncOffNote(msg, 'err');
  } finally {
    syncBusy = false;
    btn.disabled = false; btn.textContent = 'Conectar e sincronizar';
  }
}

async function runSync(fn, label) {
  if (syncBusy) return;
  syncBusy = true;
  const push = $('#btn-push'), pull = $('#btn-pull');
  push.disabled = pull.disabled = true;
  syncMsg(label, 'busy');
  try { await fn(); renderSyncUI(); }
  catch (e) { syncMsg('Falhou: ' + e.message, 'err'); }
  finally { push.disabled = pull.disabled = false; syncBusy = false; }
}

/* ---------------- 13. Eventos ---------------- */
function init() {
  mountMiniTiao();
  renderWordOfDay();

  /* Um único tratador delegado (fase de captura) cuida de TODOS os botões
     .speak — cartas, quiz, palabra del día e feedback. Rodar na captura e
     parar a propagação impede que o clique vire a carta. */
  if (canSpeak()) {
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('.speak');
      if (!b) return;
      e.stopPropagation();
      speak(b.dataset.say, b);
    }, true);
  } else {
    $$('.speak').forEach(b => { b.hidden = true; });
  }

  $('#btn-sound').addEventListener('click', () => {
    state.sound = !state.sound;
    save();
    updateHUD();
    if (state.sound) sfx.click();
    toast(state.sound ? 'Som ligado 🔊' : 'Som desligado 🔇', 1200);
  });

  $('#btn-badges').addEventListener('click', () => {
    renderBadges();
    $('#modal-badges').classList.add('on');
    sfx.click();
  });
  const closeModal = () => $('#modal-badges').classList.remove('on');
  $('#btn-close-modal').addEventListener('click', closeModal);
  $('#btn-modal-close2').addEventListener('click', closeModal);
  $('#modal-badges').addEventListener('click', e => { if (e.target.id === 'modal-badges') closeModal(); });

  /* ---- Perfil / sincronização ---- */
  $('#btn-profile').addEventListener('click', () => {
    renderSyncUI();
    $('#modal-profile').classList.add('on');
    sfx.click();
  });
  const closeProfile = () => $('#modal-profile').classList.remove('on');
  $('#btn-close-profile').addEventListener('click', closeProfile);
  $('#modal-profile').addEventListener('click', e => { if (e.target.id === 'modal-profile') closeProfile(); });

  $('#input-name').addEventListener('input', e => {
    state.name = e.target.value.slice(0, 24);
    save();
    renderGreeting();
  });
  $('#input-name').addEventListener('blur', () => { if (syncOn() && sync.auto) queueSync(); });

  $('#btn-connect').addEventListener('click', onConnect);
  $('#input-token').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onConnect(); } });
  $('#btn-push').addEventListener('click', () => runSync(() => syncPush(), 'Enviando…'));
  $('#btn-pull').addEventListener('click', () => runSync(() => syncPull(), 'Baixando…'));
  $('#check-auto').addEventListener('change', e => {
    sync.auto = e.target.checked;
    saveSync();
    toast(sync.auto ? 'Sincronização automática ligada ☁️' : 'Sincronização automática desligada', 1600);
  });
  $('#btn-disconnect').addEventListener('click', () => {
    if (!confirm('Desconectar deste aparelho? O token será apagado daqui. Seu progresso local NÃO será perdido nem apagado do GitHub.')) return;
    sync = Object.assign({}, SYNC_DEFAULT);
    saveSync();
    renderSyncUI();
    syncOffNote('');
    toast('Desconectado. O progresso continua salvo neste navegador.', 2300);
  });

  $('#btn-reset').addEventListener('click', () => {
    const extra = syncOn() ? '\n\nComo a sincronização está ligada, o progresso também será zerado no GitHub.' : '';
    if (!confirm('Tem certeza? Todo o progresso (XP, estrelas e insígnias) será apagado.' + extra)) return;
    const keepName = state.name;
    state = freshState();
    state.name = keepName;          /* o nome do jogador é preservado */
    save();
    closeModal();
    setMood('normal', 0);
    updateHUD();
    renderMap();
    toast('Progresso reiniciado. Bora de novo! ' + FLAG_HTML);
    if (syncOn()) syncPush({ silent: true }).catch(() => {});
  });

  $('#btn-home').addEventListener('click', () => { sfx.click(); renderMap(); });
  $('#btn-back-map').addEventListener('click', () => { sfx.click(); renderMap(); });
  $('#btn-continue').addEventListener('click', () => {
    sfx.click();
    const id = nextLessonId();
    if (id > TOTAL_LESSONS) { renderBadges(); $('#modal-badges').classList.add('on'); return; }
    renderLesson(id);
  });

  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    state.tab = tab.dataset.tab;
    $$('.tab').forEach(t => t.classList.toggle('active', t === tab));
    sfx.click();
    renderCards();
  }));

  $('#btn-revisit').addEventListener('click', reviewAll);
  $('#btn-start-quiz').addEventListener('click', () => { sfx.click(); startQuiz(currentLessonId); });

  $('#btn-next').addEventListener('click', () => { sfx.click(); nextQuestion(); });
  $('#btn-quit-quiz').addEventListener('click', () => {
    if (!confirm('Sair do desafio? Seu progresso desta aula não será salvo.')) return;
    sfx.click();
    renderLesson(quiz.lessonId);
  });

  $('#btn-retry').addEventListener('click', () => { sfx.click(); startQuiz(quiz.lessonId); });
  $('#btn-to-map').addEventListener('click', () => { sfx.click(); renderMap(); });
  $('#btn-next-lesson').addEventListener('click', () => {
    sfx.unlock();
    renderLesson(quiz.lessonId + 1);
  });

  /* atalhos de teclado no quiz */
  document.addEventListener('keydown', e => {
    if (!$('#screen-quiz').classList.contains('active')) return;
    if (e.key >= '1' && e.key <= '4') {
      const btn = $$('.option')[Number(e.key) - 1];
      if (btn && !btn.classList.contains('disabled')) { e.preventDefault(); btn.click(); }
      return;
    }
    /* Enter só avança se o foco NÃO estiver no próprio botão — senão o
       Enter nativo do <button> dispara o click e a pergunta é pulada */
    if (e.key === 'Enter' && $('#feedback').classList.contains('on') && document.activeElement !== $('#btn-next')) {
      e.preventDefault();
      $('#btn-next').click();
    }
  });

  renderMap();

  /* se a sincronização automática estiver ligada, combina com o GitHub ao abrir */
  syncOnLoad();
}

document.addEventListener('DOMContentLoaded', init);
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

  /* 1 pergunta de ESCUTA: ouvir a palavra e escolher a escrita correta */
  const paraEscuta = canSpeak() ? pickN(lesson.vocab, 2) : [];
  if (paraEscuta[0]) {
    const it = paraEscuta[0];
    const pool = lesson.vocab.filter(x => x.es !== it.es);
    const distractors = pickN(pool, 3).map(d => d.es);
    questions.push({
      type: 'listen',
      hint: 'Ouça e escolha a palavra',
      prompt: '',
      source: 'Escuta ➜ Espanhol',
      answer: it.es,
      audio: it.es,
      promptLang: 'es',
      say: `Você ouviu “${it.es}” (${it.pt}).`,
      options: shuffle([it.es, ...distractors])
    });
  }

  /* 1 pergunta de DITADO: ouvir e escrever em espanhol (acentos são perdoados) */
  if (paraEscuta[1]) {
    const it = paraEscuta[1];
    questions.push({
      type: 'write',
      hint: 'Ouça e escreva em espanhol',
      prompt: '',
      source: 'Ditado ➜ Espanhol',
      answer: it.es,
      audio: it.es,
      promptLang: 'es',
      say: `Era “${it.es}” (${it.pt}).`
    });
  }

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
    hitsListen: 0,
    hitsWrite: 0,
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

  const isListen = q.type === 'listen' || q.type === 'write';
  const isWrite = q.type === 'write';

  $('#quiz-counter').textContent = `${quiz.index + 1}/${total}`;
  $('#quiz-bar-fill').style.width = `${(quiz.index / total) * 100}%`;
  $('#quiz-hint').textContent = q.hint;
  $('#quiz-source').textContent = q.source;

  /* enunciado: nas perguntas de escuta o texto fica escondido (é o que se ouve) */
  const promptEl = $('#quiz-prompt');
  promptEl.textContent = isListen ? '' : q.prompt;
  promptEl.classList.toggle('hidden', isListen);

  /* botão de ouvir: no quiz normal só quando o enunciado está em espanhol;
     nas perguntas de escuta/ditado é a peça principal (dá para repetir à vontade) */
  const listen = $('#quiz-listen');
  const speakBtn = $('#quiz-speak');
  const podeOuvir = canSpeak() && (isListen || q.promptLang === 'es');
  listen.hidden = !podeOuvir;
  if (podeOuvir) {
    speakBtn.dataset.say = isListen ? q.audio : q.prompt;
    speakBtn.textContent = isListen ? '🔊 Ouvir de novo' : '🔊 Ouvir em espanhol';
  }

  const opts = $('#options');
  const writeBox = $('#answer-write');

  if (isWrite) {
    opts.innerHTML = '';
    opts.hidden = true;
    writeBox.hidden = false;
    const inp = $('#write-input');
    inp.value = '';
    inp.disabled = false;
    inp.classList.remove('correct', 'wrong', 'dimmed');
    $('#btn-check-write').disabled = false;
    setTimeout(() => inp.focus(), 250);
  } else {
    writeBox.hidden = true;
    opts.hidden = false;
    opts.innerHTML = q.options.map((opt, i) =>
      `<button class="option" data-i="${i}" data-opt="${esc(opt)}">
         <span class="key">${i + 1}</span>${esc(opt)}
       </button>`).join('');
    $$('.option', opts).forEach(btn => btn.addEventListener('click', () => answer(btn, Number(btn.dataset.i))));
  }

  $('#feedback').classList.remove('on');
  setMood('normal', 0);

  /* toca o áudio sozinho (o jogador clicou para começar, então há gesto do usuário) */
  if (isListen && podeOuvir) setTimeout(() => speak(q.audio, speakBtn), 350);
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

/* Normaliza para comparar: ignora maiúsculas, acentos e pontuação (acentos perdoados) */
function normAns(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   /* tira os acentos */
    .replace(/[¿?¡!.,;:"'`´]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* XP-base por tipo de pergunta */
const BASE_XP = { vocab: 10, phrase: 15, listen: 15, write: 20 };

/* múltipla escolha (vocab / frase / escuta) */
function answer(btn, index) {
  const q = quiz.questions[quiz.index];
  judge(q.options[index], btn);
}

/* ditado: o jogador escreve o que ouviu */
function answerWrite() {
  if (quiz.locked) return;
  const inp = $('#write-input');
  const val = (inp.value || '').trim();
  if (!val) { inp.focus(); return; }
  judge(val, inp);
}

function judge(chosen, el) {
  if (quiz.locked) return;
  quiz.locked = true;

  const q = quiz.questions[quiz.index];
  const isWrite = q.type === 'write';
  /* na múltipla escolha a opção é exata; no ditado perdoamos acentos/maiúsculas */
  const ok = isWrite ? (normAns(chosen) === normAns(q.answer)) : (chosen === q.answer);
  const baseXp = BASE_XP[q.type] || 10;
  let xp = 0, comboBonus = 0;

  if (ok) {
    quiz.streak++;
    quiz.maxStreak = Math.max(quiz.maxStreak, quiz.streak);
    /* bônus de racha: cresce a partir do 3º acerto seguido (máx. +20) */
    comboBonus = quiz.streak >= 3 ? Math.min((quiz.streak - 2) * 5, 20) : 0;
    xp = baseXp + comboBonus;
    quiz.score += xp;
    quiz.comboXp += comboBonus;
    if (q.type === 'vocab') quiz.hitsVocab++;
    else if (q.type === 'phrase') quiz.hitsPhrase++;
    else if (q.type === 'write') quiz.hitsWrite++;
    else quiz.hitsListen++;
    el.classList.add('correct');
    sfx.correct();
    setMood('happy');
    tiaoAnim('jump');
    showCombo(quiz.streak, comboBonus);
    floatXP(el, `+${xp}`, comboBonus ? 'combo' : 'ok');
    if (quiz.streak >= 3) { sfx.streak(); confetti(30); }
  } else {
    quiz.streak = 0;
    quiz.errors++;
    el.classList.add('wrong');
    if (!isWrite) {
      $$('.option').forEach(o => {
        if (o.dataset.opt === q.answer) o.classList.add('correct');
        else if (o !== el) o.classList.add('dimmed');
      });
    }
    sfx.wrong();
    setMood('sad');
    tiaoAnim('shake');
    hideCombo();
    floatXP(el, pickRandom(['¡Uy!', 'Casi…', '¡Pucha!']), 'bad');
  }

  /* trava o campo (ditado) ou as opções (múltipla escolha) */
  if (isWrite) {
    $('#write-input').disabled = true;
    $('#btn-check-write').disabled = true;
  } else {
    $$('.option').forEach(o => o.classList.add('disabled'));
  }

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
  const partes = [];
  if (quiz.hitsVocab)  partes.push(`${quiz.hitsVocab}×10 palavras`);
  if (quiz.hitsPhrase) partes.push(`${quiz.hitsPhrase}×15 frases`);
  if (quiz.hitsListen) partes.push(`${quiz.hitsListen}×15 escuta`);
  if (quiz.hitsWrite)  partes.push(`${quiz.hitsWrite}×20 ditado`);
  $('#result-detail').textContent = isNew
    ? partes.join(' + ') + (quiz.comboXp ? ` + ${quiz.comboXp} de racha` : '') + ` + ${bonus} bônus`
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

/* ---------------- 12.5 Progresso entre aparelhos (código / link) ----------------
   O jogo é 100% estático (roda no GitHub Pages): não existe servidor nem banco
   de dados. Para continuar de outro celular/computador, o jogador gera um
   "código de progresso" compacto (ou um link) e o leva para o outro aparelho.
   Nada vai para a internet e não é preciso criar conta nenhuma. */

const CODE_TAG = 'TE2';          /* etiqueta de versão do formato do código */

/* --- base64url que entende acentos (UTF-8) --- */
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64decode(code) {
  let s = String(code).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* Gera o código: "TE2|nome|xpBase|insígnias|aulas", tudo em base64url.
   Cada aula é "id.estrelas.erros.xpEmBase36" — curto e suficiente para fundir. */
function encodeProgress(s) {
  const lessons = Object.keys(s.lessons).sort((a, b) => a - b).map(id => {
    const l = s.lessons[id];
    return [id, l.stars || 0, l.errors || 0, (l.xp || 0).toString(36)].join('.');
  }).join(';');
  const raw = [
    CODE_TAG,
    encodeURIComponent(s.name || ''),
    (s.xpBase || 0).toString(36),
    (s.badges || []).join(','),
    lessons
  ].join('|');
  return b64encode(raw);
}

/* Aceita tanto o código puro quanto um link colado (…/#p=CÓDIGO). */
function extractCode(text) {
  const m = String(text || '').match(/[#?&]p=([A-Za-z0-9\-_]+)/);
  return (m ? m[1] : String(text || '')).trim();
}

function decodeProgress(text) {
  const raw = b64decode(extractCode(text));
  const p = raw.split('|');
  if (p[0] !== CODE_TAG) throw new Error('Este código não é do Tião Te Español (ou é de uma versão diferente).');
  const out = { v: 2, name: '', xpBase: 0, badges: [], lessons: {} };
  try { out.name = decodeURIComponent(p[1] || ''); } catch (e) { out.name = p[1] || ''; }
  out.xpBase = parseInt(p[2] || '0', 36) || 0;
  out.badges = (p[3] || '').split(',').filter(Boolean);
  if (p[4]) {
    for (const entry of p[4].split(';')) {
      const [id, st, er, xp] = entry.split('.');
      if (!id) continue;
      out.lessons[id] = { stars: +st || 0, errors: +er || 0, done: true, xp: parseInt(xp || '0', 36) || 0 };
    }
  }
  return migrateState(out);
}

/* Link pronto para enviar: abre o jogo já com o progresso no "#p=". */
function progressLink() {
  return location.origin + location.pathname + '#p=' + encodeProgress(state);
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

function applyIncoming(incoming) {
  const merged = mergeStates(state, incoming);
  state = migrateState(merged);
  save();
  updateHUD();
  renderMap();
}

/* --- interface do Perfil --- */
function codeStatus(text, kind = '') {
  const el = $('#code-status');
  if (!el) return;
  el.textContent = text || '';
  el.className = 'sync-note' + (kind ? ' ' + kind : '');
}

function renderProfile() {
  if ($('#input-name') !== document.activeElement) $('#input-name').value = state.name || '';
  const out = $('#code-out');
  if (out && out !== document.activeElement) out.value = encodeProgress(state);
  const inn = $('#code-in');
  if (inn && inn !== document.activeElement) inn.value = '';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    /* fallback para navegadores antigos ou sem permissão de clipboard */
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
    return ok;
  }
}

async function onCopyCode() {
  const ok = await copyText(encodeProgress(state));
  codeStatus(ok ? 'Código copiado! Agora envie para você mesmo (WhatsApp, e-mail…). 📋'
                : 'Não deu para copiar sozinho — toque no texto acima e copie à mão.',
             ok ? '' : 'err');
  if (ok) toast('Código copiado 📋', 1500);
}

async function onCopyLink() {
  const ok = await copyText(progressLink());
  codeStatus(ok ? 'Link copiado! Abra-o no outro aparelho para carregar o progresso. 🔗'
                : 'Não deu para copiar sozinho — use o código acima.',
             ok ? '' : 'err');
  if (ok) toast('Link copiado 🔗', 1500);
}

function onImport() {
  const raw = $('#code-in').value.trim();
  if (!raw) { codeStatus('Cole um código primeiro.', 'err'); return; }
  let incoming;
  try {
    incoming = decodeProgress(raw);
  } catch (e) {
    codeStatus(e.message || 'Código inválido.', 'err');
    return;
  }
  const antes = totalXp() + completedCount() + state.badges.length;
  applyIncoming(incoming);
  const depois = totalXp() + completedCount() + state.badges.length;
  renderProfile();
  if (typeof sfx.badge === 'function') sfx.badge();
  codeStatus(depois > antes
    ? 'Progresso importado e somado ao seu! 🎉'
    : 'Importado. O seu progresso já era igual ou melhor — nada foi perdido. 👌');
  toast('Progresso importado 📥', 1800);
}

/* Se o jogo for aberto por um link com "#p=…", junta o progresso do link. */
function importFromLink() {
  const m = location.hash.match(/[#&?]p=([A-Za-z0-9\-_]+)/);
  if (!m) return;
  try {
    applyIncoming(decodeProgress(m[1]));
    toast('Progresso carregado do link! 📥', 2600);
    history.replaceState(null, '', location.pathname + location.search);
  } catch (e) { /* link inválido: ignora */ }
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

  /* ---- Perfil / progresso (código ou link) ---- */
  $('#btn-profile').addEventListener('click', () => {
    renderProfile();
    codeStatus('');
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

  $('#btn-copy-code').addEventListener('click', onCopyCode);
  $('#btn-copy-link').addEventListener('click', onCopyLink);
  $('#btn-import').addEventListener('click', onImport);

  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('Tem certeza? Todo o progresso (XP, estrelas e insígnias) será apagado.')) return;
    const keepName = state.name;
    state = freshState();
    state.name = keepName;          /* o nome do jogador é preservado */
    save();
    closeModal();
    setMood('normal', 0);
    updateHUD();
    renderMap();
    toast('Progresso reiniciado. Bora de novo! ' + FLAG_HTML);
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
  $('#btn-check-write').addEventListener('click', () => { sfx.click(); answerWrite(); });
  $('#write-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (!quiz || !quiz.locked) answerWrite(); }
  });
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

  /* se o jogo foi aberto por um link de progresso (#p=…), junta o que vem nele */
  importFromLink();
  window.addEventListener('hashchange', importFromLink);
}

document.addEventListener('DOMContentLoaded', init);
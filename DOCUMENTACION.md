# Tião Te Español — Documentación del Proyecto

> ⚠️ **Nota sobre la bandera:** el emoji de bandera de Chile **no se usa en ningún lugar de la app**, porque
> en Windows se renderiza como las letras `"CL"`. La bandera de Chile es un **SVG propio**
> (`<symbol id="flag-cl">` en `index.html`), usado en el HUD, el favicon, las insignias,
> los avisos y la etiqueta de curso completo.

App educativa **100 % HTML + CSS + JS puro** (sin frameworks, sin build, sin dependencias) para aprender el español básico necesario para unas vacaciones en Chile, en formato de **juego con 40 clases**, narrado por el avatar **Tião**.

> Idioma de la interfaz: **portugués (BR)** — porque quien aprende es el turista brasileño.
> Idioma que se enseña: **español de Chile** (con vocabulario y modismos chilenos reales: *po*, *cachai*, *al tiro*, *micro*, *garzón*, *la boleta*, *arriendo de auto*, etc.).

---

## 1. Objetivo

Que un viajero brasileño con cero español pueda, en 40 clases cortas (5–8 min cada una):

1. Saludar, presentarse y sobrevivir el primer contacto.
2. Manejar números, dinero, horas y fechas.
3. Pasar por aeropuerto, hotel, restaurante, transporte y compras.
4. Resolver emergencias, salud y clima.
5. Entender modismos chilenos y despedirse como local.

**Metodología:** primero la palabra/la frase escrita (lectura + memoria), luego el desafío (quiz de opción múltiple generado automáticamente a partir del vocabulario de la clase). Refuerzo por repaso espaciado implícito: las preguntas mezclan dirección PT→ES y ES→PT.

---

## 2. Estructura del juego

### 2.1 Mapa de mundos (8 mundos × 5 clases = 40)

| Mundo | Tema | Clases |
|---|---|---|
| 1 👋 Hola, Chile! | Saudações e apresentação | 1–5 |
| 2 💰 Dinero y tiempo | Números, dinheiro, horas, dias | 6–10 |
| 3 ✈️ Aeropuerto y llegada | Voo, imigração, bagagem, chegada | 11–15 |
| 4 🏨 El hotel | Reserva, quarto, pedidos, problemas | 16–20 |
| 5 🍽️ La comida | Restaurante, bebidas, comida típica, conta | 21–25 |
| 6 🚇 La ciudad | Táxi, micro/metrô, direções, carro | 26–30 |
| 7 🛍️ Las compras | Lojas, roupas, preços, regateio, lembranças | 31–35 |
| 8 🆘 Sobrevivencia | Emergências, farmácia, clima, modismos, despedida | 36–40 |

### 2.2 Flujo de una clase

```
MAPA → Classe desbloqueada → TIÃO APRESENTA (fala + dica chilena)
     → aba PALAVRAS (cartas que viram) → aba FRASES → DESAFIO (8 perguntas)
     → RESULTADO (estrelas 1–3 + XP + confete) → volta ao mapa
```

### 2.3 Mecánicas

- **XP:** +10 por palavra certa, +15 por frase certa, +20 bônus de conclusão.
- **Racha (combo):** acertos consecutivos valem XP extra — `min((racha−2)×5, 20)` a partir do
  3º acerto seguido (máx. **+20** por resposta). Errar zera a racha. O total de bônus por racha
  aparece nos resultados.
- **Estrelas:** 0 erros → ★★★ · 1–2 erros → ★★ · 3+ erros → ★.
- **Desbloqueio sequencial:** a classe N só abre quando a N−1 é concluída.
- **Insígnias (badges):** primeira classe, primeira nota máxima, um por mundo concluído, e "Chileno Honorário" (100 % do curso).
- **Avatar Tião:** SVG com expressões (normal, feliz, triste, surpreso), reage a cada resposta com uma frase diferente (usa os modismos que o próprio curso ensina: *bacán*, *al tiro*, *po*, *cachai*, *fome*) e dá a "Dica do Tião" no início de cada classe.
- **Pronúncia:** botão 🔊 (Web Speech API) nas cartas de vocabulário/frase, no enunciado do quiz
  (quando está em espanhol) e na "palavra do dia". Voz preferida `es-CL` → `es-MX` → `es-419` → `es`.
- **Progresso persistente:** `localStorage` (chave `tiao-espanol-v1`) — fecha e continua depois.
  O **XP é derivado** (melhor tentativa de cada aula), o que permite **sincronizar entre aparelhos**
  com um Gist secreto do GitHub (ver §3.4) e ainda guardar o **nome do jogador**.
- **Sons:** bipes gerados com WebAudio (sem arquivos de áudio), com botão de ligar/desligar.

### 2.3.1 Detalhes "divertidos" acrescentados

| Recurso | O que faz |
|---|---|
| **Palavra do dia** | Card no mapa com uma palavra do curso escolhida de forma determinística pela data (mesma palavra o dia inteiro; 256 palavras giram em 256 dias). |
| **XP flutuante** | Ao responder, um `+XP` sobe a partir do botão clicado (dourado na racha, vermelho no erro). |
| **Indicador de racha** | "🔥 x3 +10 XP" aparece no quiz a partir de 2 acertos seguidos, com confete e som próprio em x3+. |
| **Pista da próxima insígnia** | No mapa e nos resultados: "Próxima insígnia: … — 3/5", calculada pelo progresso parcial mais alto. |
| **Reações variadas** | Tião diz uma frase diferente a cada resposta (em vez de sempre a mesma). |
| **Perfil do jogador** | Nome do jogador (saudação "¡Hola, …!") + sincronização entre aparelhos via GitHub Gist. Botão 👤 no HUD. |

### 2.4 Geração automática do quiz

Cada pergunta é montada em runtime a partir dos dados da classe:

- 6 perguntas de vocabulário (metade PT→ES, metade ES→PT), com 3 distractores sorteados do próprio vocabulário da classe.
- 2 perguntas de compreensão de frase ("O que significa …?"), distractores sorteados do pool de palavras.

Isso significa que **adicionar uma classe nova não exige escrever perguntas** — basta adicionar vocabulário e frases em `js/data.js`.

---

## 3. Arquitectura de archivos

```
Portugues A español/
├── index.html          → estructura de la página única (SPA por estados)
├── css/
│   └── style.css       → todo el visual de juego (gradientes, animaciones, confeti)
├── js/
│   ├── data.js         → WORLDS: 8 mundos, 40 lecciones, vocabulario, frases, tips
│   └── app.js          → estado, render (mapa/aula/quiz/resultado), Tião, sons, badges
└── DOCUMENTACION.md    → este archivo
```

### 3.1 Modelo de datos (`js/data.js`)

```js
const WORLDS = [
  {
    id: 1, icon: "👋", title: "Hola, Chile!",
    desc: "Saudações e apresentação", color: "#ff8a65",
    lessons: [
      {
        id: 1, title: "Saudações",
        tip: "Os chilenos jogam um “¿cachai?” no fim de quase toda frase: significa “tá ligado?”.",
        vocab: [ { pt: "Oi", es: "Hola" }, ... ],   // 6 a 10 itens
        phrases: [ { es: "¡Hola! ¿Cómo estás?", pt: "Oi! Como você está?" }, ... ] // 3 frases
      }
    ]
  }
]
```

### 3.2 Estado (`js/app.js`)

```js
state = {
  v: 2,
  name: "",                       // nombre del jugador (opcional)
  lessons: { [lessonId]: { stars, errors, done, xp } },   // xp = MEJOR XP de esa clase
  badges: [badgeId],
  sound: true,
  tab: "vocab",
  xpBase: 0                       // XP de saves antiguos (v1) no atribuible a una clase
}
```

**El XP es derivado:** `totalXp() = xpBase + Σ lessons[id].xp`. Se guarda el **mejor intento**
de cada clase, así repetir una clase no da XP infinito y —más importante— **el progreso de dos
aparelhos se puede fusionar sin perder nada** (ver §3.4).

Guardado en `localStorage` (clave `tiao-espanol-v1`) en cada evento relevante. Los saves
antiguos (v1, con un único `xp` global) se migran solos: el total viejo pasa a `xpBase`.

### 3.3 Pantallas (render por función)

| Función | Pantalla |
|---|---|
| `renderMap()` | mapa de 8 mundos con clases bloqueadas/hechas/estrellas |
| `renderLesson(id)` | aula: Tião + abas Palavras / Frases + botão do desafio |
| `startQuiz(id)` | monta 8 perguntas aleatorias e inicia |
| `renderQuestion()` | pergunta atual com opções e feedback |
| `renderResults()` | estrelas animadas, XP ganho, novas insígnias |
| `showBadges()` | vitrine de insígnias |

### 3.4 Sincronización entre aparelhos (GitHub Gist)

GitHub Pages es **hosting estático**: no hay servidor ni base de datos. Para que el progreso
viaje de un celular a un computador, el juego usa un **Gist secreto de la propia cuenta de
GitHub** del usuario, vía la API REST (`api.github.com`, que admite CORS desde el navegador).

| Pieza | Detalle |
|---|---|
| Token | Personal Access Token con permiso **`gist`** (enlace directo en el modal) |
| Dónde vive el token | `localStorage`, clave **`tiao-espanol-sync`**, **separada** del progreso |
| Token en el Gist | **Nunca.** El payload solo lleva nombre, clases, insignias, sonido y `xpBase` |
| Archivo en el Gist | `tiao-espanol-progresso.json` (Gist secreto, `public:false`) |
| `syncConnect(token)` | valida con `GET /user` → busca Gist existente → si no hay, crea → combina |
| `ghFindGist` | `GET /gists?per_page=100` y busca un gist con el archivo del juego |
| `syncPull()` | lee el Gist, **fusiona** con lo local y guarda |
| `syncPush()` | escribe el estado local en el Gist (`POST` para crear / `PATCH` para actualizar) |
| `queueSync()` | envío diferido (1,2 s) tras cada clase, si la sincronización automática está activa |
| `syncOnLoad()` | intenta combinar al abrir; si falla (offline), el juego sigue igual |

**Fusión (`mergeStates`)** — nunca se pierde progreso: por cada clase se toma la **mejor**
(`max` estrellas, `max` xp, `min` errores), las insignias se unen (unión) y `xpBase` toma el
máximo. El nombre se conserva si cualquiera de los lados lo tiene.

**Seguridad:** el token queda solo en ese navegador; el botón *Desconectar* lo borra sin tocar
el progreso local ni el Gist. Si el token caduca, la sincronización falla de forma silenciosa
al abrir (el juego funciona offline) y el error se muestra al pulsar *Enviar* / *Baixar*.

---

## 4. Curriculum detallado (40 clases)

**Mundo 1 — Hola, Chile!**
1. Saudações (hola, buenos días, buenas tardes, buenas noches, chao, hasta luego)
2. Apresentação (me llamo, mucho gusto, soy brasileño, turista, estoy de vacaciones)
3. Nacionalidades e idiomas (¿de dónde eres?, país, ciudad, idioma, portugués, español)
4. Números 0–10 (cero…diez)
5. Idade e dados pessoais (¿cuántos años tienes?, tengo…años, cumpleaños, teléfono, dirección)

**Mundo 2 — Dinero y tiempo**
6. Números 11–20 (once…veinte)
7. Dezenas (treinta…cien)
8. Dinheiro (dinero, peso, efectivo, tarjeta, vuelto — o troco chileno)
9. Horas (¿qué hora es?, la una, las dos, mediodía, medianoche, y media)
10. Dias e tempo (lunes…domingo, hoy, mañana)

**Mundo 3 — Aeropuerto y llegada**
11. No aeroporto (aeropuerto, vuelo, pasaje, puerta, embarque, despegue)
12. Imigração (pasaporte, oficial de migración, turismo, visa, firma, equipaje)
13. No avião (asiento, ventana, pasillo, cinturón de seguridad, frazada, azafata)
14. Bagagem (maleta, maleta de mano, cinta, perdida, reclamar, etiqueta)
15. Chegada (llegada, salida, taxi, arriendo de auto — aluguel chileno, casa de cambio, centro)

**Mundo 4 — El hotel**
16. Reserva (reserva, habitación, cama matrimonial, tarifa, confirmar, huésped)
17. Check-in (recepción, llave, formulario, documento, llenar)
18. O quarto (baño, toalla, jabón, agua caliente, aire acondicionado, almohada)
19. Pedidos no hotel (desayuno, servicio a la habitación, limpiar, wifi, contraseña)
20. Problemas (ruido, arreglar, cambiar, reembolso, gerente, quejarse)

**Mundo 5 — La comida**
21. No restaurante (mesa, carta, garzón, la cuenta, plato, entrada)
22. Pedindo comida (quisiera, con, sin, bien cocido, término medio, otro)
23. Bebidas (agua sin/con gas, jugo, cerveza, vino, café, té)
24. Comida típica chilena (empanada, completo, pastel de choclo, cazuela, mariscos, pisco sour)
25. A conta (la cuenta por favor, efectivo, tarjeta, propina, dividir, boleta — o recibo chileno)

**Mundo 6 — La ciudad**
26. Táxi e apps (taxi, aplicación, conductor, carrera, dirección, estoy aquí)
27. Micro e metrô (micro, metro, pasaje, parada, tarjeta Bip!, combinación)
28. Direções (izquierda, derecha, derecho, cuadra, cerca, lejos)
29. Lugares da cidade (plaza, playa, mercado, banco, hospital, servicios)
30. Carro (bomba de bencina, carretera, peaje, estacionamiento, semáforo, manejar)

**Mundo 7 — Las compras**
31. Lojas (tienda, mall, feria, abierto, cerrado, dependiente)
32. Roupas (polera, pantalón, chaqueta, zapatillas, calcetín, talla — roupas e tamanhos chilenos)
33. Preços (¿cuánto cuesta?, caro, barato, descuento, precio, gratis)
34. Regateio (muy caro, ¿acepta tarjeta?, ¿me lo deja más barato?, solo estoy mirando, me lo llevo)
35. Lembranças (recuerdo, artesanía, lana, moai, vino, pisco)

**Mundo 8 — Sobrevivencia**
36. Emergências (¡auxilio!, policía, ambulancia, bomberos, me robaron, perdí)
37. Farmácia (farmacia, medicamento, dolor de cabeza, fiebre, resfrío, receta)
38. Clima e roupa (sol, lluvia, frío, calor, abrigo, pronóstico)
39. Modismos chilenos (po, ¿cachai?, al tiro, bacán, fome, pololo)
40. Despedida (gracias, de nada, perdón, me ayudó mucho, vuelva pronto, ¡nos vemos!)

---

## 5. El avatar Tião

- SVG inline (sin imágenes externas), pele morena, pelo *black power* desenhado com 7 círculos.
- **4 expressões** trocadas por atributo `data-mood` — CSS puro, sem JS de desenho:
  `normal` · `happy` · `sad` · `surprised`. Olhos e boca são `<g>` grupos
  (`eye-set`, `brow-set`, `mouth-set`) e só o conjunto do humor atual aparece.
- **Animações** de corpo via classe no wrapper (`bounce`, `shake`, `jump`), aplicadas
  com `void el.offsetWidth` para reiniciar a animação.
- **Piscar automático** só no humor `normal` (animação `blink` de 5,5 s).
- A **cor da camisa** vem do mundo (`--tiao-shirt`), então o Tião muda de cor a cada mundo.
- Ele cumprimenta (`bounce`), pula ao acertar (`jump`) e sacode ao errar (`shake`), e entrega
  a dica chilena de cada aula no balão de fala.
- Uma **cópia clonada** dele aparece no canto do quiz (`#tiao-mini`), com o mesmo
  `data-mood` sincronizado, para reagir durante as perguntas.

---

## 5.1 Detalhes de implementação que valem saber

- **Atalhos de teclado no quiz:** `1`–`4` respondem, `Enter` avança. O handler ignora o
  `Enter` quando o foco já está no botão "Continuar", senão o Enter nativo do `<button>`
  dispara o click **e** o handler — a pergunta seria pulada.
- **Sem opção duplicada:** o pool de distadores das perguntas de frase exclui textos
  idênticos à resposta (um mesmo texto pode existir como frase *e* como palavra).
- **`localStorage` com fallback:** se o navegador bloquear (acontece em `file://`),
  o estado cai para memória e o jogo continua funcionando, só não persiste.
- **Botões:** `.btn` tem fundo padrão visível — sem isso um `.btn` sem modificador
  ficaria branco do navegador com texto branco por cima (botão invisível).
- **Acessibilidade:** `aria-label`, `role="button"`/`tabindex` nos cards, foco visível,
  `prefers-reduced-motion` respeitado, layout testado de 320 px a 1440 px.

---

## 5.2 Insígnias (12 no total)

| # | Insígnia | Condição |
|---|---|---|
| 1 | 🐣 Primeira Aula | Concluir a aula 1 |
| 2 | 🎯 Nota Máxima | 3 estrelas em alguma aula |
| 3 | 🌱 Metade do Caminho | 20 aulas concluídas |
| 4–11 | 8 insígnias de mundo | Uma por mundo concluído |
| 12 | 🧉 Chileno Honorário | 100 % do curso (40/40) — *na app o ícone é a **bandeira do Chile em SVG*** |

---

## 5.3 La bandera de Chile (SVG propio)

El juego **nunca** usa el emoji de bandera de Chile (en Windows aparece como `"CL"`). En su lugar hay un
`<symbol id="flag-cl">` reutilizable en `index.html`, con el diseño oficial en `viewBox="0 0 30 20"`:

| Franja | Región | Color |
|---|---|---|
| Cantón (arriba-izquierda) | 10×10 (1/3 del ancho × 1/2 del alto) | azul `#0039a6` |
| Estrella de 5 puntas | centrada en el cantón | blanca `#ffffff` |
| Mitad superior (derecha del cantón) | 20×10 | blanca `#ffffff` |
| Mitad inferior | 30×10 | roja `#d52b1e` |

Se usa con `<svg class="flag-inline"><use href="#flag-cl"/></svg>` en:

- el **HUD** (`.hud-flag`);
- la **etiqueta de curso completo** ("Curso completo! 🏳 Ver insígnias" → con la bandera);
- la **insignia "Chileno Honorário"** (`.b-ico .flag-inline`, 38×25 px);
- el **aviso de reset** (toast);
- el **favicon** (data-URI SVG embebido, con los mismos colores).

> El símbolo vive en un bloque `<defs>` compartido fuera del avatar, para que la **copia** de
> Tião del quiz no duplique `id`s (HTML inválido + referencias `url(#…)` ambiguas).

---

## 6. Cómo ejecutar

Es un sitio estático: abrir `index.html` en cualquier navegador (doble clic) o servir la carpeta:

```bash
# opcional
python -m http.server 7100
# → http://localhost:7100
```

No hay instalación, no hay dependencias, funciona offline.

> **Recomendado:** sirva por HTTP en vez de abrir con doble clic. Algunos navegadores
> bloquean `localStorage` en `file://` y el progreso no se guardaría (el juego sigue
> funcionando, pero sin persistencia).

### 6.1 Publicar en GitHub Pages

1. Cree un repositorio en GitHub y suba esta carpeta (puede ser público).
2. *Settings → Pages → Source*: elija **Deploy from a branch** y la rama `main` (carpeta `/root`).
3. Espere ~1 minuto: el juego queda en `https://<usuario>.github.io/<repo>/`.

No hace falta nada más: es un sitio estático. La **sincronización** funciona igual en
GitHub Pages (el navegador llama directamente a `api.github.com`, que permite CORS desde
cualquier origen, también desde `github.io`).

> **El usuario debe hacer UNA cosa para sincronizar:** crear un token de GitHub con permiso
> `gist` (el modal trae el enlace directo y explica el paso). Sin token, el juego sigue
> funcionando con el progreso guardado solo en ese navegador.

---

## 7. Estado de verificación

Todo lo anterior está implementado y probado en navegador real (Chromium):

| Prueba | Resultado |
|---|---|
| Sintaxis `data.js` + `app.js` | OK (`node --check`) |
| Integridade de los datos (40 aulas, ids 1–40, ≥6 vocab, 3 frases, 1 tip) | OK, 0 anomalías |
| Generación de quiz — 16 000 simulaciones / 128 000 preguntas |Sempre 8 perguntas, 4 opções distintas, resposta presente |
| Navegação pelas 40 aulas (cards, abas, dica, quiz) | 0 problemas, 0 erros de JS |
| Playthrough completo das 40 aulas (320 respostas, acertos e erros) | 0 problemas, 0 erros de JS, 40/40 concluídas |
| Bandeira do Chile — verificação píxel a píxel (cantón azul, estrella blanca, franjas) | OK (estrela de 5 pontas) |
| Racha/combo (x2…x8, bônus +5/+10/+15/+20) e XP flutuante | OK |
| Pronúncia: clique no 🔊 **não** vira a carta; some quando não há voz | OK |
| Palavra do dia (determinística por data, 256 palavras) | OK |
| Fluxo de resposta (acerto/erro, humor do Tião, feedback) | OK |
| XP e estrelas (6 acertos → 2★, 85 XP; 0 erros → 3★) | OK |
| Desbloqueio sequencial, persistência, reset | OK |
| 12/12 insígnias com o curso completo | OK |
| Persistência após recarregar o navegador | OK (XP, aulas, estrelas, insígnias) |
| Layout em 320 / 360 / 390 / 412 / 600 / 768 / 1024 / 1440 px | **0 px de overflow** (corrigido `minmax(400px,…)` no `.worlds-list`; e HUD compactado em ≤380 px com o 6.º botão) |
| XP derivado + migração de save antigo (v1 → v2) | OK (xpBase preservado, sem `xp` solto) |
| Fusão de dois "aparelhos" (`mergeStates`) | OK (melhor de cada aula, união de insignias) |
| Fluxo GitHub Gist simulado (conectar → criar → pull → push) | OK; **o token nunca aparece no payload** |
| Token inválido (401) | Mensagem clara, permanece desconectado |
| Persistência do nome + saudação no mapa | OK |
| Console do navegador após toda a bateria de testes | 0 erros, 0 avisos (só os 401 esperados ao usar token falso) |

---

## 8. Cómo extender

- **Nueva clase:** agregar un objeto en `data.js` dentro de su mundo (vocab ≥ 6 itens, 3 frases, 1 tip). El quiz se genera solo.
- **Nuevo mundo:** agregar objeto en `WORLDS`; o mapa se renderiza sozinho.
- **Nova insígnia:** adicionar em `buildBadges()` (`app.js`) com um `test()` (concede) e, opcionalmente, um `progress()` (devolve `[atual, total]`) para aparecer como *próxima insígnia*. O `checkBadges()` concede sozinho.
- **Bandeira do Chile:** o desenho fica no `<symbol id="flag-cl">` do `index.html`. Para reusar, `<svg class="flag-inline"><use href="#flag-cl"/></svg>`; a classe `.flag-inline` só define o tamanho. O favicon é um data-URI com os mesmos `rect`/`path`.
- **Mudar o avatar:** os humores são grupos `[data-set="..."]` no SVG do `index.html`; o CSS
  `[data-mood="X"] .eye-set[data-set="X"]` decide qual aparece. Para um humor novo, copie um
  grupo e acrescente a regra no `css/style.css` + a lista em `setMood()`.
- **Reações do Tião:** edite os arrays `REACCIONES_OK` / `REACCIONES_FAIL` em `js/app.js`
  (prefira os modismos que o próprio curso ensina).
- **Resetar o progresso:** botão "Recomeçar do zero" no modal de insígnias.
- **Sincronização (GitHub Gist):** toda a lógica vive no bloco `12.5` de `js/app.js`
  (`ghFetch`/`syncConnect`/`syncPull`/`syncPush`/`mergeStates`). Para trocar de provedor
  (Supabase, Firebase…), basta reescrever essas quatro funções mantendo o contrato:
  `pull` devolve `{ name, lessons, badges, sound, xpBase }` e `push` recebe o mesmo objeto.
  O token fica em `tiao-espanol-sync`, **separado** de `tiao-espanol-v1` (nunca exporte a
  chave do token junto com o progresso).

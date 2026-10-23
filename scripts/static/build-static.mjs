// Builds every static image the profile README uses: badges, tech-stack panel,
// achievements card and footer wave. Run once after editing; output goes to ../assets.
//   cd scripts/static && npm install && node build-static.mjs
import { makeBadge } from 'badge-maker';
import * as si from 'simple-icons';
import * as siOld from 'si-old'; // simple-icons@9 — still ships LinkedIn / AWS marks
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = process.env.OUT || join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets');
mkdirSync(join(OUT, 'badges'), { recursive: true });

const C = {
  bg: '#0d1117', panel: '#161b22', border: '#30363d', text: '#e6edf3',
  muted: '#8b949e', accent: '#58a6ff', accent2: '#1f6feb', purple: '#a371f7', fire: '#ffa657',
};
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
const MONO = `'JetBrains Mono',ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- icons ----------
const custom = {
  // generic database cylinder (for "SQL")
  database: { hex: '4479A1', path: 'M12 2C7.03 2 3 3.57 3 5.5v13C3 20.43 7.03 22 12 22s9-1.57 9-3.5v-13C21 3.57 16.97 2 12 2zm0 2c4.42 0 7 1.27 7 1.5S16.42 7 12 7 5 5.73 5 5.5 7.58 4 12 4zM5 8.1C6.6 8.68 9.18 9 12 9s5.4-.32 7-.9V12c0 .23-2.58 1.5-7 1.5S5 12.23 5 12V8.1zm0 6.5c1.6.58 4.18.9 7 .9s5.4-.32 7-.9v3.9c0 .23-2.58 1.5-7 1.5s-7-1.27-7-1.5v-3.9z' },
  // node graph (for "Microservices")
  nodes: { hex: 'FF5733', path: 'M12 1.5a3 3 0 0 0-1 5.83v2.34L6.83 12.1A3 3 0 1 0 6 16.5c0-.25-.03-.5-.09-.73L10 13.4v3.27a3 3 0 1 0 2 0V13.4l4.09 2.37A3 3 0 1 0 17.17 12.1L13 9.67V7.33A3 3 0 0 0 12 1.5z' },
  // two opposing arrows (for "REST APIs")
  api: { hex: '58A6FF', path: 'M4 7h12.2l-3-3 1.4-1.4L20 8l-5.4 5.4-1.4-1.4 3-3H4V7zm16 10H7.8l3 3-1.4 1.4L4 16l5.4-5.4 1.4 1.4-3 3H20v2z' },
  mockito: { hex: '78A641', path: 'M12 2 3 6.5v5c0 5.25 3.84 10.16 9 11.5 5.16-1.34 9-6.25 9-11.5v-5L12 2zm-1.5 15-4-4 1.41-1.41L10.5 14.17l5.59-5.58L17.5 10l-7 7z' },
};
function icon(slug) {
  if (custom[slug]) return custom[slug];
  const key = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const i = si[key] || siOld[key];
  if (!i) throw new Error('missing icon ' + slug);
  return { hex: i.hex, path: i.path };
}
const svgIcon = (slug, fill) => {
  const i = icon(slug);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${i.path}"/></svg>`;
};
const b64 = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');

// Lighten brand colours that would vanish on a dark tile.
function lum(hex) {
  const [r, g, b] = [0, 2, 4].map((o) => parseInt(hex.slice(o, o + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// near-black marks -> light text colour; dim marks -> mixed toward white so they stay on-brand but readable
const mix = (hex, t) => '#' + [0, 2, 4].map((o) => Math.round(parseInt(hex.slice(o, o + 2), 16) * (1 - t) + 255 * t).toString(16).padStart(2, '0')).join('');
const onDark = (hex) => { const l = lum(hex); return l < 0.03 ? C.text : l < 0.12 ? mix(hex, 0.38) : '#' + hex; };

// ---------- badges (pixel-identical to shields.io, served from the repo) ----------
function badge(file, { label = '', message, color, labelColor, logo, logoColor = 'white', style = 'for-the-badge' }) {
  const opts = { label, message, color, style };
  if (labelColor) opts.labelColor = labelColor;
  if (logo) opts.logoBase64 = b64(svgIcon(logo, logoColor === 'white' ? '#fff' : logoColor === 'black' ? '#000' : logoColor));
  writeFileSync(join(OUT, 'badges', file + '.svg'), makeBadge(opts));
}
// social row
badge('linkedin', { message: 'LinkedIn', color: '#0A66C2', logo: 'linkedin' });
badge('portfolio', { message: 'Portfolio', color: '#000000', logo: 'firefoxbrowser' });
badge('leetcode', { message: 'LeetCode', color: '#FFA116', logo: 'leetcode', logoColor: 'black' });
badge('email', { message: 'Email', color: '#EA4335', logo: 'gmail' });
badge('view-code', { message: 'View Code', color: '#181717', logo: 'github' });
// project stack chips
const chips = {
  java: ['Java 17', '#ED8B00', 'openjdk'], springboot: ['Spring Boot 3', '#6DB33F', 'springboot'],
  redis: ['Redis', '#DC382D', 'redis'], typescript: ['TypeScript', '#3178C6', 'typescript'],
  nodejs: ['Node.js', '#339933', 'nodedotjs'], fastify: ['Fastify', '#000000', 'fastify'], bedrock: ['AWS Bedrock', '#232F3E', 'amazonaws'], mysql: ['MySQL', '#4479A1', 'mysql'],
 kafka: ['Kafka', '#231F20', 'apachekafka'],
};
for (const [f, [m, c, l]] of Object.entries(chips)) badge('chip-' + f, { message: m, color: c, logo: l, style: 'flat-square' });

// ---------- tech stack panel ----------
const STACK = [ // mirrors the TECHNICAL SKILLS section of the resume
  ['Languages', [['Java', 'openjdk', 'ED8B00'], ['C++', 'cplusplus'], ['SQL', 'database'], ['JavaScript', 'javascript'], ['TypeScript', 'typescript']]],
  ['Frameworks', [['Spring Boot', 'springboot'], ['Spring Security', 'springsecurity'], ['Spring Data JPA', 'spring'], ['Hibernate', 'hibernate'],
    ['Node.js', 'nodedotjs'], ['REST APIs', 'api'], ['Microservices', 'nodes']]],
  ['Data & Messaging', [['MySQL', 'mysql', '4479A1'], ['DynamoDB', 'amazondynamodb'], ['MongoDB', 'mongodb'], ['Redis', 'redis'], ['Apache Kafka', 'apachekafka']]],
  ['Cloud & DevOps', [['AWS', 'amazonaws', 'FF9900'], ['ECS', 'amazonecs'], ['S3', 'amazons3'], ['Lambda', 'awslambda'], ['IAM', 'amazoniam'],
    ['Docker', 'docker'], ['Kubernetes', 'kubernetes'], ['GH Actions', 'githubactions']]],
  ['Testing & Obs.', [['JUnit 5', 'junit5'], ['Mockito', 'mockito'], ['New Relic', 'newrelic']]],
];
{
  const W = 904, PAD = 28, LABELW = 150, PITCH = 88, TILE = 52, ROWH = 96, TOP = 70;
  const H = TOP + STACK.length * ROWH + 12;
  let body = '', n = 0;
  STACK.forEach(([cat, items], r) => {
    const y = TOP + r * ROWH;
    body += `<text x="${PAD}" y="${y + TILE / 2 + 5}" class="cat">${esc(cat)}</text>`;
    if (r) body += `<line x1="${PAD}" x2="${W - PAD}" y1="${y - 14}" y2="${y - 14}" stroke="${C.border}" stroke-opacity=".55"/>`;
    items.forEach(([name, slug, hex], i) => {
      const ic = icon(slug);
      const col = onDark(hex || ic.hex);
      const x = PAD + LABELW + i * PITCH + (PITCH - TILE) / 2;
      const d = (0.04 * n++).toFixed(2);
      body += `<g class="t" style="animation-delay:${d}s"><title>${esc(name)}</title>`
        + `<rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="13" fill="${C.panel}" stroke="${C.border}"/>`
        + `<rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="13" fill="${col}" fill-opacity=".07"/>`
        + `<svg x="${x + 13}" y="${y + 13}" width="26" height="26" viewBox="0 0 24 24"><path fill="${col}" d="${ic.path}"/></svg>`
        + `<text x="${x + TILE / 2}" y="${y + TILE + 18}" class="nm">${esc(name)}</text></g>`;
    });
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack">
<style>
.cat{font:600 13px ${FONT};fill:${C.muted};letter-spacing:.06em;text-transform:uppercase}
.nm{font:500 11px ${FONT};fill:${C.muted};text-anchor:middle}
.h{font:600 15px ${MONO};fill:${C.text}}
.t{animation:up .5s ease-out backwards}
@keyframes up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.t{animation:none}}
</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.border}"/>
<circle cx="${PAD + 6}" cy="30" r="6" fill="#ff5f57"/><circle cx="${PAD + 26}" cy="30" r="6" fill="#febc2e"/><circle cx="${PAD + 46}" cy="30" r="6" fill="#28c840"/>
<text x="${PAD + 68}" y="35" class="h"><tspan fill="${C.accent}">~/stack</tspan> $ ls --all</text>
${body}
</svg>`;
  writeFileSync(join(OUT, 'tech-stack.svg'), svg);
}

// ---------- achievements card ----------
{
  const TILES = [
    { big: 'AIR 6', sub: 'CodeChef', note: 'Long Challenge', slug: 'codechef', col: '#d4a373' },
    { big: '#51', sub: 'Global · LeetCode', note: 'Weekly Contest 472', slug: 'leetcode', col: '#FFA116' },
    { big: '1000+', sub: 'Problems Solved', note: '336 Hard', slug: 'leetcode', col: '#00b8a3' },
    { big: 'Top 11%', sub: 'LeetCode Rating', note: '1724+', slug: 'leetcode', col: C.accent },
  ];
  const W = 904, H = 168, PAD = 20, GAP = 14, TW = (W - 2 * PAD - 3 * GAP) / 4, TH = H - 2 * PAD;
  let body = '';
  TILES.forEach((t, i) => {
    const x = PAD + i * (TW + GAP), y = PAD, cx = x + TW / 2;
    const ic = icon(t.slug);
    body += `<g class="t" style="animation-delay:${0.12 * i}s">
<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="12" fill="${C.panel}" stroke="${C.border}"/>
<rect x="${x}" y="${y}" width="${TW}" height="3" rx="1.5" fill="${t.col}"/>
<svg x="${x + TW - 30}" y="${y + 14}" width="16" height="16" viewBox="0 0 24 24"><path fill="${t.col}" fill-opacity=".8" d="${ic.path}"/></svg>
<text x="${cx}" y="${y + 62}" class="big" fill="url(#g${i})">${esc(t.big)}</text>
<text x="${cx}" y="${y + 88}" class="sub">${esc(t.sub)}</text>
<text x="${cx}" y="${y + 108}" class="note">${esc(t.note)}</text>
</g>`;
  });
  const grads = TILES.map((t, i) => `<linearGradient id="g${i}" x1="0" x2="1"><stop offset="0" stop-color="${t.col}"/><stop offset="1" stop-color="${C.text}"/></linearGradient>`).join('');
  writeFileSync(join(OUT, 'achievements.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Competitive programming achievements">
<defs>${grads}</defs>
<style>
.big{font:700 30px ${FONT};text-anchor:middle}
.sub{font:600 13px ${FONT};fill:${C.text};text-anchor:middle}
.note{font:500 12px ${MONO};fill:${C.muted};text-anchor:middle}
.t{animation:up .55s ease-out backwards}
@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.t{animation:none}}
</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.border}"/>
${body}
</svg>`);
}

// ---------- footer wave (replaces capsule-render) ----------
{
  const W = 1200, H = 120;
  const wave = (amp, base, len, phase) => {
    let d = `M0 ${base}`;
    for (let x = 0; x <= W * 2; x += 20) d += ` L${x} ${(base + amp * Math.sin((x / len) * 2 * Math.PI + phase)).toFixed(1)}`;
    return d + ` L${W * 2} ${H} L0 ${H}Z`;
  };
  // waves are 2x wide and slide left by exactly one period-multiple of W, so the loop is seamless
  const layer = (amp, base, op, dur, ph) =>
    `<path d="${wave(amp, base, W / 2, ph)}" fill="url(#fw)" fill-opacity="${op}"><animateTransform attributeName="transform" type="translate" from="0 0" to="-${W} 0" dur="${dur}s" repeatCount="indefinite"/></path>`;
  let stars = '';
  for (let i = 0; i < 26; i++) {
    const x = (i * 467) % W, y = 12 + ((i * 53) % 46), r = (i % 3) * 0.4 + 0.7;
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9d1d9"><animate attributeName="opacity" values=".1;.9;.1" dur="${2.5 + (i % 5) * 0.7}s" begin="${(i % 7) * 0.4}s" repeatCount="indefinite"/></circle>`;
  }
  writeFileSync(join(OUT, 'footer-wave.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
<defs><linearGradient id="fw" x1="0" x2="1"><stop offset="0" stop-color="${C.accent2}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.accent}"/></linearGradient></defs>
${stars}
${layer(10, 72, 0.35, 14, 0)}
${layer(8, 82, 0.55, 10, 1.6)}
${layer(6, 94, 0.9, 7, 3.1)}
</svg>`);
}

// ---------- section divider ----------
writeFileSync(join(OUT, 'divider.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="904" height="12" viewBox="0 0 904 12" aria-hidden="true">
<defs><linearGradient id="d" x1="0" x2="1"><stop offset="0" stop-color="${C.accent2}" stop-opacity="0"/><stop offset=".5" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></linearGradient></defs>
<rect y="5.5" width="904" height="1.2" fill="url(#d)"/><circle cx="452" cy="6" r="3" fill="${C.accent}"><animate attributeName="opacity" values=".4;1;.4" dur="3s" repeatCount="indefinite"/></circle>
</svg>`);

// ---------- LLM Gateway project animation ----------
// Three 4-second scenes on a 12s loop: cheapest-model routing, confidence escalation, cross-provider fallback.
{
  const W = 1200, H = 180, T = 12;
  const kt = (s) => (s / T).toFixed(4);
  // visible only between a and b (seconds)
  const show = (a, b) => `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" values="0;1;0" keyTimes="0;${kt(a)};${kt(b)}"/>`;
  // a packet that travels along path d between seconds a and b
  const packet = (d, a, b, color, r = 4) => `<circle r="${r}" fill="${color}" opacity="0" filter="url(#gl)">
<animateMotion dur="${T}s" repeatCount="indefinite" calcMode="linear" path="${d}" keyPoints="0;0;1;1" keyTimes="0;${kt(a)};${kt(b)};1"/>${show(a, b)}</circle>`;
  const flash = (x, y, txt, color, a, b, anchor = 'start') => `<text x="${x}" y="${y}" class="ev" fill="${color}" text-anchor="${anchor}" opacity="0">${esc(txt)}${show(a, b)}</text>`;
  // row highlight on a provider
  const glow = (y, color, a, b) => `<rect x="896" y="${y - 15}" width="284" height="30" rx="7" fill="${color}" fill-opacity=".10" stroke="${color}" stroke-opacity=".7" opacity="0">${show(a, b)}</rect>`;

  const REQ = [{ y: 52, t: 'summarize · stream' }, { y: 92, t: 'code review · tools' }, { y: 132, t: 'chat · fallback test' }];
  const GW = { x: 470, y: 28, w: 250, h: 124 };
  const PROV = [
    { name: 'Groq', tier: '$', y: 40, col: '#f55036' },
    { name: 'OpenAI', tier: '$$', y: 75, col: '#10a37f', slug: 'openai' },
    { name: 'Anthropic', tier: '$$$', y: 110, col: '#d97757', slug: 'anthropic' },
    { name: 'AWS Bedrock', tier: '$$', y: 145, col: '#FF9900', slug: 'amazonaws' },
  ];
  const inPath = (y) => `M 232 ${y} C 350 ${y} 360 90 ${GW.x} 90`;
  const outPath = (y) => `M ${GW.x + GW.w} 90 C 810 90 800 ${y} 896 ${y}`;
  const between = (y1, y2) => `M 1040 ${y1 + 8} C 1075 ${(y1 + y2) / 2} 1075 ${(y1 + y2) / 2} 1040 ${y2 - 8}`;

  let s = '';
  // static wiring
  REQ.forEach((r) => { s += `<path d="${inPath(r.y)}" class="wire"/>`; });
  PROV.forEach((p) => { s += `<path d="${outPath(p.y)}" class="wire"/>`; });
  // request chips
  REQ.forEach((r, i) => {
    s += `<rect x="22" y="${r.y - 12}" width="210" height="24" rx="6" fill="${C.panel}" stroke="${C.border}"/>
<circle cx="36" cy="${r.y}" r="3" fill="${C.accent}"><animate attributeName="opacity" values=".35;1;.35" dur="2s" begin="${i * 0.4}s" repeatCount="indefinite"/></circle>
<text x="46" y="${r.y + 4}" class="chip">${esc(r.t)}</text>`;
  });
  // gateway box
  s += `<rect x="${GW.x}" y="${GW.y}" width="${GW.w}" height="${GW.h}" rx="12" fill="${C.panel}" stroke="url(#gw)" stroke-width="1.5"/>
<text x="${GW.x + GW.w / 2}" y="${GW.y + 24}" class="ttl" text-anchor="middle">LLM GATEWAY</text>
<line x1="${GW.x + 16}" x2="${GW.x + GW.w - 16}" y1="${GW.y + 34}" y2="${GW.y + 34}" stroke="${C.border}"/>
${['router  → cheapest capable', 'limits  → per-key rate', 'budget  → daily cap'].map((t, i) =>
    `<text x="${GW.x + 18}" y="${GW.y + 56 + i * 20}" class="row">${esc(t)}</text>`).join('')}
<text x="${GW.x + GW.w - 16}" y="${GW.y + 116}" class="mut" text-anchor="end">OpenAI-compatible · SSE</text>`;
  // providers
  PROV.forEach((p) => {
    const iconSvg = p.slug ? (() => { const ic = icon(p.slug); return `<svg x="912" y="${p.y - 8}" width="16" height="16" viewBox="0 0 24 24"><path fill="${p.col}" d="${ic.path}"/></svg>`; })()
      : `<circle cx="920" cy="${p.y}" r="7" fill="none" stroke="${p.col}" stroke-width="2"/><circle cx="920" cy="${p.y}" r="2.5" fill="${p.col}"/>`;
    s += `<rect x="896" y="${p.y - 15}" width="284" height="30" rx="7" fill="${C.bg}" stroke="${C.border}"/>${iconSvg}
<text x="936" y="${p.y + 4}" class="prov">${esc(p.name)}<tspan class="tier" dx="8">${p.tier}</tspan></text>`;
  });

  // Scene 1 (0–4s): cheap request lands on Groq.
  s += packet(inPath(REQ[0].y), 0.2, 1.3, C.accent) + packet(outPath(PROV[0].y), 1.4, 2.4, C.accent)
    + glow(PROV[0].y, '#3fb950', 2.4, 3.9) + flash(1170, PROV[0].y + 4, '200 · $0.0002', '#3fb950', 2.4, 3.9, 'end')
    + flash(GW.x + GW.w / 2, 170, 'routed to cheapest capable model', C.muted, 1.2, 3.9, 'middle');
  // Scene 2 (4–8s): Groq answers with low confidence, gateway escalates to Anthropic.
  s += packet(inPath(REQ[1].y), 4.2, 5.2, C.accent) + packet(outPath(PROV[0].y), 5.3, 6.1, C.accent)
    + glow(PROV[0].y, C.fire, 6.1, 6.9) + flash(1170, PROV[0].y + 4, 'confidence 0.41', C.fire, 6.1, 6.9, 'end')
    + packet(between(PROV[0].y, PROV[2].y), 6.9, 7.4, C.fire)
    + glow(PROV[2].y, '#3fb950', 7.4, 7.95) + flash(1170, PROV[2].y + 4, 'escalated · 200', '#3fb950', 7.4, 7.95, 'end')
    + flash(GW.x + GW.w / 2, 170, 'low confidence → escalate to a stronger model', C.fire, 5.6, 7.95, 'middle');
  // Scene 3 (8–12s): OpenAI returns 503, gateway falls back to Bedrock.
  s += packet(inPath(REQ[2].y), 8.1, 9.0, C.accent) + packet(outPath(PROV[1].y), 9.1, 9.8, C.accent)
    + glow(PROV[1].y, '#f85149', 9.8, 10.6) + flash(1170, PROV[1].y + 4, '503 unavailable', '#f85149', 9.8, 10.6, 'end')
    + packet(between(PROV[1].y, PROV[3].y), 10.6, 11.1, '#f85149')
    + glow(PROV[3].y, '#3fb950', 11.1, 11.95) + flash(1170, PROV[3].y + 4, 'fallback · 200', '#3fb950', 11.1, 11.95, 'end')
    + flash(GW.x + GW.w / 2, 170, 'provider down → cross-provider fallback', '#f85149', 9.6, 11.95, 'middle');

  writeFileSync(join(OUT, 'llm-gateway-animation.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="LLM Gateway: routing, escalation and fallback">
<defs>
<linearGradient id="lbg" x1="0" x2="1"><stop offset="0" stop-color="#0d1117"/><stop offset=".5" stop-color="#0f1923"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="gw" x1="0" x2="1"><stop offset="0" stop-color="${C.accent2}"/><stop offset="1" stop-color="${C.purple}"/></linearGradient>
<filter id="gl"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
.wire{fill:none;stroke:${C.border};stroke-width:1.2;stroke-dasharray:3 4}
.chip{font:500 11px ${MONO};fill:${C.text}}
.ttl{font:700 13px ${MONO};fill:${C.text};letter-spacing:.12em}
.row{font:500 11px ${MONO};fill:${C.muted}}
.mut{font:500 9px ${MONO};fill:${C.muted}}
.prov{font:600 12px ${FONT};fill:${C.text}}
.tier{font:600 11px ${MONO};fill:${C.muted}}
.ev{font:600 11px ${MONO}}
.lbl{font:600 9px ${MONO};fill:${C.muted};letter-spacing:.1em}
</style>
<rect width="${W}" height="${H}" fill="url(#lbg)"/>
<line x1="0" x2="${W}" y1=".5" y2=".5" stroke="${C.border}"/>
<text x="22" y="22" class="lbl">INCOMING REQUESTS</text>
<text x="896" y="14" class="lbl">PROVIDERS</text>
${s}
</svg>`);
}

console.log('static assets written to', OUT);

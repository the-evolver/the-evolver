// Renders the live stat cards for the profile README into assets/stats/.
// Runs daily in GitHub Actions (see .github/workflows/update-stats.yml). No dependencies (Node 20+).
//
// Fail-safe by design: each card is fetched and rendered on its own. If GitHub or LeetCode
// is down / rate-limits / changes its API, that card's previous SVG is left untouched,
// so the README never shows a broken image.
//
//   GH_TOKEN=... node scripts/update-stats.mjs            # real data
//   node scripts/update-stats.mjs --mock                  # sample data, for previewing designs
//   node scripts/update-stats.mjs --placeholder           # "syncing" cards (only where none exist)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GH_USER = process.env.GH_USER || 'the-evolver';
const LC_USER = process.env.LC_USER || 'recursive_coder';
const OUT = process.env.OUT || join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'stats');
const MOCK = process.argv.includes('--mock');
const PLACEHOLDER = process.argv.includes('--placeholder');
mkdirSync(OUT, { recursive: true });

// ---------------- theme ----------------
const C = {
  bg: '#0d1117', panel: '#161b22', border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  accent: '#58a6ff', accent2: '#1f6feb', purple: '#a371f7', fire: '#ffa657',
  easy: '#00b8a3', medium: '#ffc01e', hard: '#ef4743',
  heat: ['#161b22', '#0c2d6b', '#1158c7', '#2f81f7', '#79c0ff'],
};
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n) => Number(n).toLocaleString('en-US');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso, withYear = false) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ''}`;
};
const ICON = {
  github: 'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3',
  leetcode: 'M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z',
  fire: 'M12 23c-4.4 0-8-3.1-8-7.6 0-3 1.6-5.4 3.4-7.4.5-.5 1.3-.2 1.3.5 0 1.7.9 3.1 2.3 3.6-.2-3.3 1-6.7 3.9-9.9.5-.5 1.3-.2 1.4.4.5 3.2 2.3 5 3.8 6.7C19.5 11 20 12.6 20 15.4 20 19.9 16.4 23 12 23z',
  star: 'M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.1L12 17.6 5.8 21.3l1.6-7.1L2 9.5l7.1-.6z',
  pr: 'M6 3a3 3 0 0 0-1 5.83v6.34a3 3 0 1 0 2 0V8.83A3 3 0 0 0 6 3zm12 12.17V8a3 3 0 0 0-3-3h-1.59l1.3-1.29L13.29 2.3 9.59 6l3.7 3.7 1.42-1.41L13.41 7H15a1 1 0 0 1 1 1v7.17a3 3 0 1 0 2 0z',
  repo: 'M4 2.5A2.5 2.5 0 0 1 6.5 0H20v18H6.5a.5.5 0 0 0 0 1H20v2H6.5A2.5 2.5 0 0 1 4 18.5v-16zM9 4v2h8V4H9z',
  trophy: 'M5 3h14v3a5 5 0 0 1-4 4.9V13h2v2H7v-2h2v-2.1A5 5 0 0 1 5 6V3zM3 4h2v2H3V4zm16 0h2v2h-2V4zM8 17h8v3H8z',
};
const ico = (name, x, y, s, fill) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="${fill}" d="${ICON[name]}"/></svg>`;

const frame = (W, H, label, inner, iconName) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<style>
.t{font:600 14px ${FONT};fill:${C.text}}
.big{font:700 26px ${FONT};fill:${C.text};text-anchor:middle}
.lbl{font:600 12px ${FONT};fill:${C.muted};text-anchor:middle}
.sm{font:500 11px ${MONO};fill:${C.muted};text-anchor:middle}
.k{font:500 12px ${FONT};fill:${C.muted}}
.v{font:700 12px ${FONT};fill:${C.text}}
.fade{animation:in .7s ease-out backwards}
@keyframes in{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.fade,.grow{animation:none}}
</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${C.bg}" stroke="${C.border}"/>
${ico(iconName, 20, 16, 16, C.muted)}<text x="44" y="29" class="t">${esc(label)}</text>
${inner}
</svg>`;

// ---------------- data: GitHub ----------------
async function gql(query, variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${process.env.GH_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-stats' },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error('GitHub: ' + JSON.stringify(j.errors).slice(0, 300));
  return j.data;
}

async function fetchGitHub() {
  if (!process.env.GH_TOKEN) throw new Error('GH_TOKEN not set');
  const base = await gql(`query($u:String!){ user(login:$u){
      createdAt followers{totalCount}
      pullRequests{totalCount}
      repositories(ownerAffiliations:OWNER, isFork:false, first:100, orderBy:{field:STARGAZERS,direction:DESC}){
        totalCount nodes{ stargazerCount } }
  }}`, { u: GH_USER });
  const u = base.user;
  if (!u) throw new Error('GitHub user not found');
  const start = new Date(u.createdAt).getUTCFullYear();
  const now = new Date();
  const days = [];
  for (let y = start; y <= now.getUTCFullYear(); y++) {
    const from = `${y}-01-01T00:00:00Z`;
    const to = y === now.getUTCFullYear() ? now.toISOString() : `${y}-12-31T23:59:59Z`;
    const d = await gql(`query($u:String!,$f:DateTime!,$t:DateTime!){ user(login:$u){
        contributionsCollection(from:$f,to:$t){ contributionCalendar{ weeks{ contributionDays{ date contributionCount } } } } } }`,
    { u: GH_USER, f: from, t: to });
    for (const w of d.user.contributionsCollection.contributionCalendar.weeks)
      for (const day of w.contributionDays) days.push({ date: day.date, count: day.contributionCount });
  }
  const seen = new Set();
  const cal = days.filter((d) => !seen.has(d.date) && seen.add(d.date)).sort((a, b) => a.date.localeCompare(b.date));
  return {
    calendar: cal,
    createdAt: u.createdAt.slice(0, 10),
    stars: u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0),
    repos: u.repositories.totalCount,
    prs: u.pullRequests.totalCount,
    followers: u.followers.totalCount,
  };
}

function streaks(cal) {
  // trim future days GitHub sometimes pads at the end of the calendar
  const today = new Date().toISOString().slice(0, 10);
  const days = cal.filter((d) => d.date <= today);
  const total = days.reduce((s, d) => s + d.count, 0);
  let longest = { len: 0, start: null, end: null }, run = { len: 0, start: null };
  for (const d of days) {
    if (d.count > 0) {
      if (!run.len) run.start = d.date;
      run.len++;
      if (run.len > longest.len) longest = { len: run.len, start: run.start, end: d.date };
    } else run = { len: 0, start: null };
  }
  // current streak: a zero for *today* doesn't break it (the day isn't over yet)
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let cur = { len: 0, start: null, end: null };
  if (i >= 0 && days[i].count > 0) {
    cur.end = days[i].date;
    while (i >= 0 && days[i].count > 0) { cur.len++; cur.start = days[i].date; i--; }
  }
  return { total, first: days.find((d) => d.count > 0)?.date || days[0]?.date, longest, cur };
}

// ---------------- data: LeetCode ----------------
async function fetchLeetCode() {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Referer: `https://leetcode.com/u/${LC_USER}/`, Origin: 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    body: JSON.stringify({
      query: `query($u:String!){
        allQuestionsCount{ difficulty count }
        matchedUser(username:$u){ submitStatsGlobal{ acSubmissionNum{ difficulty count } } }
        userContestRanking(username:$u){ rating globalRanking topPercentage attendedContestsCount }
      }`, variables: { u: LC_USER },
    }),
  });
  if (!r.ok) throw new Error(`LeetCode HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors || !j.data?.matchedUser) throw new Error('LeetCode: ' + JSON.stringify(j.errors || 'user not found').slice(0, 300));
  const pick = (arr, k) => arr.find((x) => x.difficulty === k)?.count ?? 0;
  const ac = j.data.matchedUser.submitStatsGlobal.acSubmissionNum, all = j.data.allQuestionsCount;
  const cr = j.data.userContestRanking;
  return {
    solved: pick(ac, 'All'),
    easy: [pick(ac, 'Easy'), pick(all, 'Easy')], medium: [pick(ac, 'Medium'), pick(all, 'Medium')], hard: [pick(ac, 'Hard'), pick(all, 'Hard')],
    totalQ: pick(all, 'All'),
    rating: cr ? Math.round(cr.rating) : null, top: cr?.topPercentage ?? null, contests: cr?.attendedContestsCount ?? null,
  };
}

// ---------------- renderers ----------------
function ring(cx, cy, r, frac, color, width = 7, delay = 0) {
  const c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.panel}" stroke-width="${width}"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"
 stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})">
<animate attributeName="stroke-dasharray" from="0 ${c.toFixed(1)}" to="${(c * f).toFixed(1)} ${c.toFixed(1)}" dur="1.2s" begin="${delay}s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/></circle>`;
}

function renderGitHub(g) {
  const s = streaks(g.calendar);
  const W = 448, H = 210, col = [W / 6, W / 2, (5 * W) / 6];
  const range = (a, b) => (a ? (a === b ? shortDate(a, true) : `${shortDate(a)} – ${shortDate(b, a.slice(0, 4) !== b.slice(0, 4))}`) : '—');
  const inner = `
<g class="fade">
<text x="${col[0]}" y="98" class="big">${fmt(s.total)}</text>
<text x="${col[0]}" y="122" class="lbl">Total Contributions</text>
<text x="${col[0]}" y="140" class="sm">${s.first ? 'since ' + shortDate(s.first, true) : ''}</text>
</g>
<line x1="${W / 3}" x2="${W / 3}" y1="62" y2="146" stroke="${C.border}"/><line x1="${(2 * W) / 3}" x2="${(2 * W) / 3}" y1="62" y2="146" stroke="${C.border}"/>
${ring(col[1], 92, 36, s.cur.len ? 1 : 0, C.fire, 5)}
${ico('fire', col[1] - 9, 44, 18, C.fire)}
<g class="fade" style="animation-delay:.3s">
<text x="${col[1]}" y="103" class="big" fill="${C.text}">${fmt(s.cur.len)}</text>
<text x="${col[1]}" y="148" class="lbl" style="fill:${C.fire}">Current Streak</text>
<text x="${col[1]}" y="165" class="sm">${range(s.cur.start, s.cur.end)}</text>
</g>
<g class="fade" style="animation-delay:.15s">
<text x="${col[2]}" y="98" class="big">${fmt(s.longest.len)}</text>
<text x="${col[2]}" y="122" class="lbl">Longest Streak</text>
<text x="${col[2]}" y="140" class="sm">${range(s.longest.start, s.longest.end)}</text>
</g>
<line x1="20" x2="${W - 20}" y1="178" y2="178" stroke="${C.border}" stroke-opacity=".6"/>
${[['star', 'Stars', g.stars], ['pr', 'PRs', g.prs], ['repo', 'Repos', g.repos]].map(([ic, k, v], i) => {
    const x = 20 + i * ((W - 40) / 3) + 22;
    return `${ico(ic, x, 187, 13, C.accent)}<text x="${x + 19}" y="198" class="k">${k}</text><text x="${x + 19 + k.length * 7 + 6}" y="198" class="v">${fmt(v)}</text>`;
  }).join('')}`;
  return frame(W, H, 'GitHub Streak', inner, 'github');
}

function renderLeetCode(l) {
  const W = 448, H = 210, cx = 92, cy = 112;
  const frac = l.totalQ ? l.solved / l.totalQ : 0;
  const bars = [['Easy', l.easy, C.easy], ['Medium', l.medium, C.medium], ['Hard', l.hard, C.hard]].map(([k, [got, of], color], i) => {
    const y = 66 + i * 38, x = 190, w = W - x - 24, f = of ? got / of : 0;
    return `<text x="${x}" y="${y}" class="k" style="fill:${color}">${k}</text>
<text x="${x + w}" y="${y}" class="v" text-anchor="end">${fmt(got)}<tspan class="k"> / ${fmt(of)}</tspan></text>
<rect x="${x}" y="${y + 8}" width="${w}" height="6" rx="3" fill="${C.panel}"/>
<rect x="${x}" y="${y + 8}" width="${(w * f).toFixed(1)}" height="6" rx="3" fill="${color}">
<animate attributeName="width" from="0" to="${(w * f).toFixed(1)}" dur="1s" begin="${0.15 * i}s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/></rect>`;
  }).join('');
  const contest = l.rating
    ? [['trophy', 'Rating', fmt(l.rating)], ['star', 'Top', `${l.top}%`], ['repo', 'Contests', fmt(l.contests)]]
    : [['trophy', 'Contest', 'unrated']];
  const inner = `
${ring(cx, cy, 50, frac, C.medium, 7)}
<g class="fade">
<text x="${cx}" y="${cy + 4}" class="big">${fmt(l.solved)}</text>
<text x="${cx}" y="${cy + 22}" class="sm">solved</text>
</g>
<g class="fade" style="animation-delay:.2s">${bars}</g>
<line x1="20" x2="${W - 20}" y1="178" y2="178" stroke="${C.border}" stroke-opacity=".6"/>
${contest.map(([ic, k, v], i) => {
    const x = 20 + i * ((W - 40) / 3) + 22;
    return `${ico(ic, x, 187, 13, C.medium)}<text x="${x + 19}" y="198" class="k">${k}</text><text x="${x + 19 + k.length * 7 + 6}" y="198" class="v">${esc(v)}</text>`;
  }).join('')}`;
  return frame(W, H, 'LeetCode', inner, 'leetcode');
}

function renderHeatmap(cal) {
  const today = new Date().toISOString().slice(0, 10);
  const days = cal.filter((d) => d.date <= today).slice(-371);
  // align to weeks starting Sunday
  const first = new Date(days[0].date + 'T00:00:00Z');
  const lead = first.getUTCDay();
  const cells = [...Array(lead).fill(null), ...days];
  const weeks = Math.ceil(cells.length / 7);
  const CELL = 12, GAP = 3, P = CELL + GAP, X0 = 54, Y0 = 70;
  const W = 904, H = Y0 + 7 * P + 42;
  const last365 = days.slice(-365).reduce((s, d) => s + d.count, 0);
  const max = Math.max(1, ...days.map((d) => d.count));
  // quartile buckets like GitHub, computed on non-zero days
  const nz = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => nz.length ? nz[Math.min(nz.length - 1, Math.floor(p * nz.length))] : max;
  const th = [q(0.25), q(0.5), q(0.75)];
  const lvl = (c) => (c === 0 ? 0 : c <= th[0] ? 1 : c <= th[1] ? 2 : c <= th[2] ? 3 : 4);
  const offset = (W - X0 - 24 - weeks * P) / 2;
  let rects = '', months = '', lastMonth = -1;
  cells.forEach((d, i) => {
    if (!d) return;
    const w = Math.floor(i / 7), r = i % 7, x = X0 + offset + w * P, y = Y0 + r * P;
    const m = Number(d.date.slice(5, 7)) - 1;
    if (r === 0 && m !== lastMonth && w < weeks - 1) { months += `<text x="${x}" y="${Y0 - 9}" class="k">${MONTHS[m]}</text>`; lastMonth = m; }
    rects += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${C.heat[lvl(d.count)]}" class="c" style="animation-delay:${(w * 0.012).toFixed(3)}s"><title>${d.count} on ${d.date}</title></rect>`;
  });
  const lx = W - 24 - 5 * P - 80;
  const legend = `<text x="${lx}" y="${Y0 + 7 * P + 26}" class="k">Less</text>` +
    C.heat.map((c, i) => `<rect x="${lx + 34 + i * P}" y="${Y0 + 7 * P + 16}" width="${CELL}" height="${CELL}" rx="2.5" fill="${c}"/>`).join('') +
    `<text x="${lx + 34 + 5 * P + 6}" y="${Y0 + 7 * P + 26}" class="k">More</text>`;
  const dayLbl = ['Mon', 'Wed', 'Fri'].map((t, i) => `<text x="${X0 + offset - 34}" y="${Y0 + (1 + 2 * i) * P + 10}" class="k">${t}</text>`).join('');
  const inner = `<style>.c{animation:pop .4s ease-out backwards}@keyframes pop{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.c{animation:none}}</style>
<text x="${W - 22}" y="29" class="v" text-anchor="end">${fmt(last365)}<tspan class="k"> contributions in the last year</tspan></text>
${months}${dayLbl}${rects}${legend}`;
  return frame(W, H, 'Contribution Activity', inner, 'github');
}

function placeholder(W, H, label, iconName) {
  return frame(W, H, label, `<text x="${W / 2}" y="${H / 2 + 6}" class="lbl" style="font-size:13px">Syncing stats — refreshed daily by GitHub Actions</text>`, iconName);
}

// ---------------- mock data (for previews only) ----------------
function mockCalendar() {
  const out = []; let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const end = new Date(); end.setUTCHours(0, 0, 0, 0);
  for (let t = new Date(Date.UTC(2021, 0, 1)); t <= end; t = new Date(t.getTime() + 864e5)) {
    const recent = (end - t) / 864e5 < 23;
    out.push({ date: t.toISOString().slice(0, 10), count: recent ? 1 + Math.floor(rnd() * 9) : rnd() < 0.42 ? 0 : Math.floor(rnd() ** 2 * 18) + 1 });
  }
  return out;
}

// ---------------- main ----------------
const write = (name, svg) => { writeFileSync(join(OUT, name), svg); console.log('wrote', name); };
const warn = (m) => console.log(`::warning::${m}`);

if (PLACEHOLDER) {
  for (const [f, w, h, l, i] of [['github.svg', 448, 210, 'GitHub Streak', 'github'], ['leetcode.svg', 448, 210, 'LeetCode', 'leetcode'], ['contributions.svg', 904, 217, 'Contribution Activity', 'github']])
    if (!existsSync(join(OUT, f))) write(f, placeholder(w, h, l, i));
  process.exit(0);
}

let gh = null, lc = null;
if (MOCK) {
  gh = { calendar: mockCalendar(), stars: 42, repos: 18, prs: 63, followers: 30 };
  lc = { solved: 1004, easy: [312, 870], medium: [356, 1820], hard: [336, 820], totalQ: 3510, rating: 1724, top: 11.2, contests: 38 };
} else {
  try { gh = await fetchGitHub(); } catch (e) { warn(`GitHub stats skipped, keeping previous cards: ${e.message}`); }
  try { lc = await fetchLeetCode(); } catch (e) { warn(`LeetCode stats skipped, keeping previous card: ${e.message}`); }
}
if (gh) { write('github.svg', renderGitHub(gh)); write('contributions.svg', renderHeatmap(gh.calendar)); }
if (lc) write('leetcode.svg', renderLeetCode(lc));

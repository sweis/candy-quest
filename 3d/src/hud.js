// DOM HUD, panels and screens. Reads the sim; every button calls a sim action passed in via `act`.
import { ITEMS, ALLIES, RECIPES, LEVELS, PET_MAX, SHOP, canBuy, onSale, BOSS_COINS } from './content.js';
import { halloweenDaysLeft, nextHalloweenStart } from './events.js';
import { eff, objective, canCraft, have, REVIVE_T } from './sim.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Hud {
  constructor(icons, act) {
    this.icons = icons; this.act = act; this.el = $('#hud'); this.toastsEl = $('#toasts'); this.panelEl = $('#panel');
    this.panel = null; this.key = ''; this.showHint = true;
  }
  img(id, cls = '') { const src = this.icons[id] || this.icons['pet:' + id]; return src ? `<img class="${cls}" src="${src}" alt="" draggable="false">` : ''; }

  // ---------------------------------------------------------------- in-play HUD
  mount(G) {
    this.G = G; this.key = ''; this.el.hidden = false; this.showHint = true;
    const bait = G.BAIT;
    this.el.innerHTML = `
      <div class="h-top"><span class="pin"></span><span class="obj"></span></div>
      <div class="h-tl">
        <div class="who frost"><div class="ava">${this.img('pet:hero')}</div><div><div class="nm">Pip</div><div class="st"></div></div></div>
        <div class="hp frost"><span class="lbl">HP</span><div class="meter"><i></i></div><span class="num"></span></div>
        <div class="buff frost" hidden></div>
      </div>
      <div class="h-tr">
        <div class="chip frost" title="Sugar Crystals — candy currency">${this.img('crystal')}<span class="cry"></span></div>
        <div class="chip frost" title="${esc(ITEMS[bait].name)} — feed wild animals to tame them">${this.img(bait)}<span class="bait"></span></div>
        <div class="chip frost" title="Coins — spend them in the Shop">${this.img('coin')}<span class="coin"></span></div>
        <button class="ibtn frost shopbtn" data-a="shop" title="Shop">🛒 Shop</button>
        <button class="ibtn frost" data-a="help" title="Help (?)">?</button>
        <button class="ibtn frost" data-a="pause" title="Menu (Esc)">≡</button>
      </div>
      <div class="h-bl"><div class="party frost"></div></div>
      <div class="h-br">
        <button class="act sm frost" data-a="craft" title="Craft (C)"><span class="gl">🧪</span>Craft</button>
        <button class="act sm frost" data-a="inv" title="Bag (I)"><span class="gl">🎒</span>Bag</button>
        <button class="act lg tame" data-a="tame" title="Tame (E) — uses ${esc(ITEMS[bait].name)}">${this.img(bait)}Tame</button>
        <div class="hitcol">
          <label class="autohit frost" title="Attack automatically when an enemy is in range"><input type="checkbox" data-a="autohit">Auto-hit</label>
          <button class="act lg hit" data-a="attack" title="Attack (Space)"><span class="gl">⚔</span>Hit</button>
        </div>
      </div>
      <div class="hint"><span>Tap ground to move</span><span>Tap enemy to attack</span><span>Tap 🍬 animal to tame</span><span><kbd>WASD</kbd> + <kbd>Space</kbd> · <kbd>Shift</kbd> dash</span></div>`;
    this.el.onclick = (ev) => { const b = ev.target.closest('[data-a]'); if (!b || b.dataset.a === 'autohit') return; ev.stopPropagation(); this.act(b.dataset.a, b.dataset.uid); b.blur(); };
    this.el.onpointerdown = (ev) => ev.stopPropagation();
    const cb = $('[data-a=autohit]', this.el); cb.checked = G.autoHit; cb.onchange = () => { this.act('autohit', cb.checked); cb.blur(); };
    this.update(G, true);
  }
  unmount() { this.el.hidden = true; this.el.innerHTML = ''; this.closePanel(); this.toastsEl.innerHTML = ''; }
  hideHint() { if (this.showHint) { this.showHint = false; const h = $('.hint', this.el); if (h) h.remove(); } }
  update(G, force) {
    const p = G.player, ef = eff(G, p);
    const key = [Math.round(p.hp), G.crystals, G.coins, G.inv[G.BAIT] || 0, ef.atk, ef.def, G.bossDead, G.buffs.map((b) => b.effect).join(),
      G.party.map((m) => m.uid + m.level + m.fainted + m.active + Math.round(m.hp)).join()].join('|');
    if (!force && key === this.key) return; this.key = key;
    const E = this.el;
    $('.obj', E).textContent = objective(G); $('.h-top', E).classList.toggle('gate', G.bossDead);
    $('.st', E).textContent = `ATK ${ef.atk} · DEF ${ef.def}`;
    const hp = Math.max(0, Math.round(p.hp)); $('.hp i', E).style.width = (100 * hp) / p.maxhp + '%'; $('.hp .num', E).textContent = hp;
    $('.cry', E).textContent = G.crystals; $('.coin', E).textContent = G.coins; $('.bait', E).textContent = G.inv[G.BAIT] || 0;
    const bf = $('.buff', E); bf.hidden = !G.buffs.length; bf.textContent = '✨ ' + G.buffs.map((b) => b.effect.toUpperCase()).join(' · ');
    const MAXSHOW = 7; // L10 fields every pet: show the first few, the rest count toward the Party button
    const fielded = G.party.filter((m) => m.active || m.fainted), shown = fielded.slice(0, MAXSHOW), bench = G.party.length - shown.length;
    let h = shown.map((m) => `<button class="pslot${m.fainted ? ' faint' : ''}" data-a="party" title="${esc(m.name)}"><div class="face">${this.img('pet:' + m.key)}
      ${m.fainted ? '<span class="zz">💤</span>' : `<span class="lv">L${m.level}</span><div class="hpb"><i style="width:${(100 * m.hp) / m.maxhp}%"></i></div>`}</div><span class="pn">${esc(m.name.split(' ')[0])}</span></button>`).join('');
    for (let i = shown.length; i < 3; i++) h += `<div class="pslot empty"><div class="face">+</div><span class="pn">—</span></div>`;
    h += `<button class="pslot" data-a="party" title="Party (P)"><div class="face" style="font-size:1.3em">${bench > 0 ? '+' + bench : '👥'}</div><span class="pn">Party</span></button>`;
    const pe = $('.party', E); pe.innerHTML = h; pe.classList.toggle('many', shown.length > 3);
    if (this.panel) this.renderPanel();
  }
  toast(msg) {
    const d = document.createElement('div'); d.className = 't'; d.textContent = msg; this.toastsEl.appendChild(d);
    while (this.toastsEl.children.length > 4) this.toastsEl.firstChild.remove();
    setTimeout(() => d.remove(), 2600);
  }

  // ---------------------------------------------------------------- panels (sim pauses while one is open, as in the classic build)
  openPanel(name) { this.panel = this.panel === name ? null : name; this.sel = null; this.panelEl.innerHTML = ''; this.renderPanel(); }
  closePanel() { this.panel = null; this.panelEl.innerHTML = ''; }
  renderPanel() {
    const G = this.G, P = this.panelEl; if (!this.panel) { P.innerHTML = ''; return; }
    const shell = (icon, title, extra, body) => {
      const cur = P.firstElementChild;
      if (cur && cur.dataset.panel === this.panel) { // refresh in place: keep scroll + no pop-in animation
        const b = cur.querySelector('.pnl-b'), top = b.scrollTop; b.innerHTML = body; b.scrollTop = top;
        cur.querySelector('.pnl-x').innerHTML = extra || ''; return null;
      }
      return `<div class="scrim" data-a="close" data-panel="${this.panel}"><div class="pnl" data-stop><div class="pnl-h"><span style="font-size:1.4em">${icon}</span><h2>${title}</h2><span class="pnl-x">${extra || ''}</span><button class="x" data-a="close">✕</button></div><div class="pnl-b">${body}</div></div></div>`;
    };
    const set = (html) => { if (html != null) P.innerHTML = html; };
    if (this.panel === 'shop') { set(shell('🛒', 'Candy Shop', '', this.shopBody())); this.bindPanel(); return; }
    const inv = { ...G.inv, crystal: G.crystals };
    if (this.panel === 'inv') {
      const ents = Object.entries(inv).filter(([, v]) => v > 0);
      const it = this.sel && ITEMS[this.sel];
      const eq = (slot, icon) => `<div class="eq"><div class="box">${G.equip[slot] ? this.img(G.equip[slot]) : icon}</div><div><b>${slot === 'weapon' ? 'Weapon' : 'Armor'}</b><span class="muted" style="font-size:.8em">${G.equip[slot] ? esc(ITEMS[G.equip[slot]].name) : '— none —'}</span></div></div>`;
      set(shell('🎒', 'Backpack', `<span class="muted">${ents.length} kinds</span>`,
        `<div class="eqs">${eq('weapon', '⚔')}${eq('armor', '🛡')}</div>
         <div class="grid">${ents.map(([k, v]) => `<button class="slot ${ITEMS[k].rarity !== 'common' ? ITEMS[k].rarity : ''}${this.sel === k ? ' sel' : ''}" data-a="sel" data-uid="${k}" title="${esc(ITEMS[k].name)}">${this.img(k)}${v > 1 ? `<span class="ct">${v}</span>` : ''}</button>`).join('') || '<div class="muted" style="grid-column:1/-1;text-align:center;padding:1.5em">Empty. Defeat monsters &amp; pick up loot!</div>'}</div>
         <div class="desc">${it ? `<h4>${esc(it.name)} <span class="muted" style="font:400 .7em var(--mono);text-transform:uppercase">${it.kind}</span></h4><div class="muted">${esc(it.desc)}</div>
           <div style="margin-top:.7em;display:flex;gap:.5em">${it.kind === 'weapon' || it.kind === 'armor' ? `<button class="btn alt" data-a="equip" data-uid="${this.sel}">${G.equip[it.kind] === this.sel ? 'Unequip' : 'Equip'}</button>` : ''}${it.kind === 'food' ? `<button class="btn" data-a="use" data-uid="${this.sel}">Use</button>` : ''}</div>`
           : '<div class="muted">Select an item to inspect it.</div>'}</div>`));
    } else if (this.panel === 'craft') {
      set(shell('🧪', 'Alien-Food Kitchen', '', `<div class="muted" style="margin-bottom:.8em">Combine loot &amp; foraged candy into alien food that buffs your team.</div>` +
        RECIPES.map((r, i) => { const can = canCraft(G, i), o = ITEMS[r.out];
          return `<div class="row${can ? '' : ' no'}"><div class="ico">${this.img(r.out)}</div><div style="flex:1"><div class="nm">${esc(o.name)}</div><div class="muted" style="font-size:.8em">${esc(o.desc)}</div>
            <div class="ings">${Object.entries(r.in).map(([k, n]) => `<span class="${have(G, k) >= n ? '' : 'miss'}">${this.img(k)}${esc(ITEMS[k].name)} ×${n} <span class="muted">(${have(G, k)})</span></span>`).join('')}</div></div>
            <button class="btn alt" data-a="craftrow" data-uid="${i}" ${can ? '' : 'disabled'}>Cook</button></div>`; }).join('')));
    } else if (this.panel === 'party') {
      const card = (m, bench) => { const a = ALLIES[m.key];
        const rec = m.fainted ? Math.round(100 * (1 - (m.reviveT || 0) / REVIVE_T)) : 0;
        return `<div class="pcard${bench ? ' bench' : ''}${m.fainted ? ' faint' : ''}"><div class="av">${this.img('pet:' + m.key)}</div><div class="nm">${esc(m.name)}</div>
          <div class="muted" style="font-size:.75em">Lv ${m.level} · ${a.role}${m.fainted ? ' · 💤 fainted' : ''}</div>
          ${m.fainted ? `<div class="muted" style="font-size:.7em">Recovering… ${rec}%</div><div class="meter rev"><i style="width:${rec}%"></i></div>
            <button class="btn alt" data-a="revive" data-uid="${m.uid}">💗 Revive now</button><div class="muted" style="font-size:.65em;text-align:center">uses 🍬 Mallow Mend, or 5 crystals</div>`
          : `<div class="meter"><i style="width:${(100 * m.hp) / m.maxhp}%"></i></div><div class="sts"><span>ATK ${a.atk + (m.level - 1) * 2}</span><span>DEF ${a.def}</span><span>XP ${m.xp}/${m.level * 40}</span></div>
            <button class="btn ${bench ? 'alt' : 'ghost'}" data-a="toggle" data-uid="${m.uid}">${bench ? 'Send in →' : 'Bench'}</button>`}</div>`; };
      const act = G.party.filter((m) => m.active), ben = G.party.filter((m) => !m.active);
      set(shell('👥', 'Party', `<span class="muted">${act.length}/3 in the field · ${G.party.length}/${PET_MAX} pets</span>`,
        `<b style="font:800 .9em var(--display)">In the field</b><div class="pcards" style="margin:.5em 0 1em">${act.length ? act.map((m) => card(m, false)).join('') : '<div class="muted">No active allies — tame some wild animals!</div>'}</div>` +
        (ben.length ? `<b style="font:800 .9em var(--display)">On the bench</b><div class="pcards" style="margin-top:.5em">${ben.map((m) => card(m, true)).join('')}</div>` : '')));
    } else if (this.panel === 'help') {
      set(shell('❓', 'How to play', '', helpSheet(G, this)));
    }
    this.bindPanel();
  }
  bindPanel() {
    const P = this.panelEl;
    P.onclick = (ev) => {
      const b = ev.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'close' && ev.target.closest('[data-stop]') && !ev.target.closest('.x')) return; // clicks inside the panel don't close it
      if (b.dataset.a === 'sel') { this.sel = b.dataset.uid; this.renderPanel(); return; }
      if (b.dataset.a === 'use') this.sel = null;
      this.act(b.dataset.a, b.dataset.uid);
    };
  }
}

// ---------------------------------------------------------------- shop body
Hud.prototype.shopBody = function () {
  const info = this.shopInfo ? this.shopInfo() : { coins: 0, inLevel: false, ownedPets: [], date: new Date() };
  const rows = SHOP.map((e) => {
    const v = canBuy(e, info), sale = onSale(e, info.date);
    if (e.kind === 'pet') {
      const a = ALLIES[e.id], owned = info.ownedPets.includes(e.id), left = halloweenDaysLeft(info.date);
      const when = sale ? `🎃 On sale now — ${left} day${left === 1 ? '' : 's'} left` : `Back for Halloween · ${nextHalloweenStart(info.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – Nov 3`;
      return `<div class="shopcard legendary${sale ? '' : ' off'}"><div class="av">${this.img('pet:' + e.id)}</div><div class="info">
        <span class="lbadge">${e.badge}</span><div class="nm">${esc(a.name)}</div><div class="muted" style="font-size:.8em">${esc(a.desc)}</div>
        <div class="sts"><span>HP ${a.hp}</span><span>ATK ${a.atk}</span><span>DEF ${a.def}</span><span>${a.kind === 'ranged' ? 'Ranged' : 'Melee'}</span></div>
        <div class="when">${when}</div></div>
        <button class="btn buy" data-a="buy" data-uid="${e.id}" ${v.ok ? '' : 'disabled'}>${owned ? '✓ Owned' : `🪙 ${e.price}`}</button></div>`;
    }
    const it = ITEMS[e.id];
    return `<div class="row${v.ok ? '' : ' no'}"><div class="ico">${this.img(e.id)}</div><div style="flex:1"><div class="nm">${esc(it.name)}</div><div class="muted" style="font-size:.8em">${esc(it.desc)}</div></div>
      <button class="btn alt" data-a="buy" data-uid="${e.id}" ${v.ok ? '' : 'disabled'} title="${v.ok ? '' : esc(v.why)}">🪙 ${e.price}</button></div>`;
  }).join('');
  return `<div class="wallet">${this.img('coin')}<b>${info.coins}</b> coins <span class="muted">· beat a boss for ${BOSS_COINS} · monsters sometimes drop one</span></div>
    ${rows}<div class="muted" style="font-size:.8em;margin-top:.6em">Treats go in your bag — and you keep your bag from level to level.</div>`;
};

// ---------------------------------------------------------------- help sheet, generated from the game's own tables
export function helpSheet(G, hud) {
  const L = LEVELS[G ? G.level : 1];
  const img = (id) => (hud ? hud.img(id) : '');
  const food = Object.entries(ITEMS).filter(([, it]) => it.kind === 'food');
  return `<div class="help">
    <h3>Goal</h3><div>Defeat the <b>${esc(L.bossName)}</b>, then walk into the <b>Candy Gate</b> to clear ${esc(L.name)}. Clearing a level unlocks the next.</div>
    <h3>Controls</h3><table>
      <tr><td><kbd>W A S D</kbd> / arrows</td><td>Move — or tap/click the ground (hold to steer)</td></tr>
      <tr><td><kbd>Space</kbd> / <kbd>J</kbd></td><td>Hit (sweeps in front of you) — or tap an enemy to chase + attack it</td></tr>
      <tr><td><kbd>E</kbd> / <kbd>F</kbd></td><td>Tame the nearest wild animal — or tap it</td></tr>
      <tr><td><kbd>Shift</kbd></td><td>Dash (brief invulnerability)</td></tr>
      <tr><td><kbd>I</kbd> · <kbd>C</kbd> · <kbd>P</kbd></td><td>Bag · Craft · Party (the world pauses while open)</td></tr>
      <tr><td><kbd>?</kbd> · <kbd>Esc</kbd></td><td>This help · Pause menu</td></tr></table>
    <h3>Taming</h3><div>Offer ${img(L.bait)} <b>${esc(ITEMS[L.bait].name)}</b> to wild animals (🍬 name tags). Each treat adds 34% trust; at 100% they join you. Up to 3 fight beside you, ${PET_MAX} pets total, one of each kind.
      Wild here: ${L.wild.length ? L.wild.map((k) => `<b>${esc(ALLIES[k].name)}</b> (${ALLIES[k].role})`).join(', ') : 'none'}.</div>
    <h3>Food</h3><ul>${food.map(([id, it]) => `<li>${esc(it.name)} — ${esc(it.desc.replace('Cooked alien food. ', ''))}</li>`).join('')}</ul>
    <h3>Tips</h3><ul><li>Fainted pets recover on their own after ${REVIVE_T}s, or revive them now from the Party panel.</li>
      <li>Getting knocked out sends you back to camp and costs 3 crystals.</li><li>You keep your bag, gear and crystals from level to level.</li><li>Coins: beat a boss for ${BOSS_COINS}, and monsters sometimes drop one. Spend them in the 🛒 Shop.</li><li>Auto-hit swings whenever an enemy is in reach — handy on phones.</li></ul></div>`;
}

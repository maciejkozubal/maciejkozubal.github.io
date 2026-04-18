// ── ML / MLOps Map · component ────────────────────────────
// Art-deco: deep navy canvas, gold accents, rounded modern type.
// Default view: mindmap with all hubs collapsed for first-glance clarity.

const W = 1760, H = 1000;

// ── LAYOUTS ────────────────────────────────────────────────
function layoutMindmap(hubs, expanded) {
  // Central spine: all 7 hubs arranged in a gentle S-curve,
  // children fan OUTWARD from center (along the hub's radial direction).
  const cx = W/2, cy = H/2;
  const out = {};
  const hubAngles = [-Math.PI*0.48, -Math.PI*0.32, -Math.PI*0.14, 0, Math.PI*0.14, Math.PI*0.32, Math.PI*0.48];
  hubs.forEach((h, i) => {
    const ang = hubAngles[i] || (i * (Math.PI*2 / hubs.length));
    const r = 420;
    const hx = cx + Math.cos(ang) * r;
    const hy = cy + Math.sin(ang) * r;
    out[h.id] = { x: hx, y: hy, _ang: ang };
    if (expanded.has(h.id)) {
      const n = h.children.length;
      // Radial unit vector (hub → out) and its perpendicular
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const px = -uy, py = ux;
      // Two rings: alternating near/far so labels don't collide
      const leafW = 230, leafH = 62;
      const gap = leafW + 30;             // > card width so no same-ring overlap
      const perRing = Math.ceil(n / 2);
      h.children.forEach((c, j) => {
        const ring = j % 2;               // 0 = near, 1 = far
        const col = Math.floor(j / 2);
        // Stagger rings by half-gap so near/far cards don't line up
        const ringShift = ring ? gap / 2 : 0;
        const offset = (col - (perRing - 1) / 2) * gap + ringShift;
        const radial = 180 + ring * (leafH + 40);  // vertical separation > card height
        out[c.id] = {
          x: hx + ux * radial + px * offset,
          y: hy + uy * radial + py * offset,
          _hubAng: ang,
        };
      });
    }
  });
  return out;
}

function layoutConstellation(hubs, expanded) {
  // 7 hubs in a hex-ish ring around center, children cluster nearby
  const cx = W/2, cy = H/2;
  const out = {};
  hubs.forEach((h, i) => {
    const ang = (i / hubs.length) * Math.PI * 2 - Math.PI/2;
    out[h.id] = { x: cx + Math.cos(ang) * 440, y: cy + Math.sin(ang) * 440 };
    if (expanded.has(h.id)) {
      h.children.forEach((c, j) => {
        const a2 = ang + (j - (h.children.length-1)/2) * 0.28;
        const r2 = 520 + (j % 2) * 40;
        out[c.id] = { x: cx + Math.cos(a2) * r2, y: cy + Math.sin(a2) * r2 };
      });
    }
  });
  return out;
}

function layoutTree(hubs, expanded) {
  // Top-down hierarchy: root implicit, hubs across, children below
  const out = {};
  const colCount = hubs.length;
  const colW = W / (colCount + 1);
  hubs.forEach((h, i) => {
    const x = colW * (i + 1);
    out[h.id] = { x, y: 200 };
    if (expanded.has(h.id)) {
      h.children.forEach((c, j) => {
        out[c.id] = { x, y: 340 + j * 90 };
      });
    }
  });
  return out;
}

function computeLayout(hubs, expanded, mode) {
  if (mode === "constellation") return layoutConstellation(hubs, expanded);
  if (mode === "tree")          return layoutTree(hubs, expanded);
  return layoutMindmap(hubs, expanded);
}

// ── EDGES ──────────────────────────────────────────────────
function buildEdges(hubs, expanded) {
  const out = [];
  hubs.forEach(h => {
    if (expanded.has(h.id)) {
      h.children.forEach(c => out.push([h.id, c.id, "child"]));
    }
  });
  return out;
}

// ── ART DECO ORNAMENTS ─────────────────────────────────────
function DecoFrame({ vb }) {
  // Full art-deco treatment: triple frame, stepped ziggurat corners,
  // sunburst fans, chevron borders, top/bottom obelisk medallions.
  const g = "#c9a14a";
  const gb = "#d4b26a";
  const gd = "#8c7442";
  const [x0, y0, w, h] = vb || [0, 0, W, H];
  const x1 = x0 + w, y1 = y0 + h;

  // one corner group — mirror via transforms
  const corner = (key, sx, sy) => (
    <g key={key} transform={`scale(${sx},${sy})`}>
      {/* stepped ziggurat — classic deco */}
      <path d="M 0 20 L 20 20 L 20 40 L 40 40 L 40 60 L 64 60"
            fill="none" stroke={g} strokeWidth="1.2" opacity="0.75"/>
      <path d="M 0 10 L 10 10 L 10 20 L 20 20"
            fill="none" stroke={gb} strokeWidth="1.4" opacity="0.9"/>
      {/* inner stepped twin */}
      <path d="M 0 50 L 30 50 L 30 80 L 60 80"
            fill="none" stroke={gd} strokeWidth="0.7" opacity="0.6"/>
      {/* 24-ray sunburst inside the corner */}
      {Array.from({length: 12}).map((_, k) => (
        <line key={k} x1="0" y1="0"
              x2={(k % 2 === 0 ? 72 : 58) + (k === 0 ? 8 : 0)}
              y2="0"
              stroke={g}
              strokeWidth={k % 2 === 0 ? 0.7 : 0.4}
              opacity={k % 2 === 0 ? 0.55 : 0.32}
              transform={`rotate(${k * 7.5})`}/>
      ))}
      {/* three-tier quarter circles */}
      <path d={`M 0 ${90} A 90 90 0 0 1 90 0`} fill="none" stroke={g} strokeWidth="0.6" opacity="0.35"/>
      <path d={`M 0 ${78} A 78 78 0 0 1 78 0`} fill="none" stroke={g} strokeWidth="0.4" opacity="0.25"/>
      <path d={`M 0 ${66} A 66 66 0 0 1 66 0`} fill="none" stroke={gb} strokeWidth="0.35" opacity="0.4"/>
      {/* pivot gem */}
      <polygon points="0,-5 5,0 0,5 -5,0" fill={gb} opacity="0.85"/>
      <circle cx="0" cy="0" r="2" fill="#0a1626"/>
      {/* radiating pearls */}
      <circle cx="22" cy="22" r="1.5" fill={gb} opacity="0.8"/>
      <circle cx="40" cy="14" r="1.2" fill={gb} opacity="0.6"/>
      <circle cx="14" cy="40" r="1.2" fill={gb} opacity="0.6"/>
    </g>
  );

  // edge chevron run — draws N chevrons along a horizontal strip
  const edgeChevrons = (cx, cy, width, inverted) => {
    const n = Math.floor(width / 14);
    const step = width / n;
    return (
      <g transform={`translate(${cx - width/2}, ${cy})`}>
        {Array.from({length: n}).map((_, i) => (
          <path key={i} d={`M ${i*step} ${inverted ? 4 : -4} L ${i*step + step/2} ${inverted ? -4 : 4} L ${i*step + step} ${inverted ? 4 : -4}`}
                fill="none" stroke={g} strokeWidth="0.55" opacity="0.45"/>
        ))}
      </g>
    );
  };

  // side obelisk — thin vertical column of diamonds & bars on left/right gutters
  const obelisk = (cx, cy, height, side) => (
    <g transform={`translate(${cx},${cy})`}>
      <line x1="0" y1={-height/2} x2="0" y2={height/2} stroke={g} strokeWidth="0.4" opacity="0.35"/>
      {[-1, 0, 1].map((k, i) => (
        <g key={i} transform={`translate(0, ${k * height/3})`}>
          <polygon points="0,-4 3,0 0,4 -3,0" fill="none" stroke={g} strokeWidth="0.6" opacity="0.6"/>
          <line x1="-6" y1="0" x2="-3" y2="0" stroke={g} strokeWidth="0.5" opacity="0.4"/>
          <line x1="3" y1="0" x2="6" y2="0" stroke={g} strokeWidth="0.5" opacity="0.4"/>
        </g>
      ))}
    </g>
  );

  return (
    <g className="deco-frame" pointerEvents="none">
      {/* triple frame lines */}
      <rect x={x0+22} y={y0+22} width={w-44} height={h-44} fill="none" stroke={g} strokeWidth="0.9" opacity="0.55"/>
      <rect x={x0+34} y={y0+34} width={w-68} height={h-68} fill="none" stroke={gb} strokeWidth="0.5" opacity="0.35"/>
      <rect x={x0+42} y={y0+42} width={w-84} height={h-84} fill="none" stroke={g} strokeWidth="0.3" opacity="0.2"/>

      {/* four ziggurat corners */}
      <g transform={`translate(${x0+44},${y0+44})`}>{corner("tl", 1, 1)}</g>
      <g transform={`translate(${x1-44},${y0+44})`}>{corner("tr", -1, 1)}</g>
      <g transform={`translate(${x0+44},${y1-44})`}>{corner("bl", 1, -1)}</g>
      <g transform={`translate(${x1-44},${y1-44})`}>{corner("br", -1, -1)}</g>

      {/* chevron runs along top & bottom */}
      {edgeChevrons(x0 + w/2, y0 + 22, Math.min(w * 0.5, 620), false)}
      {edgeChevrons(x0 + w/2, y1 - 22, Math.min(w * 0.5, 620), true)}

      {/* top & bottom obelisk medallions */}
      {[[x0+w/2, y0+60], [x0+w/2, y1-60]].map(([x,y], i) => (
        <g key={"obm"+i} transform={`translate(${x},${y})`}>
          <line x1="-100" y1="0" x2="-18" y2="0" stroke={g} strokeWidth="0.5" opacity="0.45"/>
          <line x1="18" y1="0" x2="100" y2="0" stroke={g} strokeWidth="0.5" opacity="0.45"/>
          <polygon points="-14,0 0,-8 14,0 0,8" fill="none" stroke={g} strokeWidth="0.8" opacity="0.75"/>
          <polygon points="0,-4 4,0 0,4 -4,0" fill={gb} opacity="0.9"/>
          <circle cx="-20" cy="0" r="1.3" fill={gb} opacity="0.7"/>
          <circle cx="20" cy="0" r="1.3" fill={gb} opacity="0.7"/>
        </g>
      ))}

      {/* side obelisks on left & right gutters */}
      {obelisk(x0 + 28, y0 + h/2, Math.min(h * 0.5, 420), -1)}
      {obelisk(x1 - 28, y0 + h/2, Math.min(h * 0.5, 420), 1)}
    </g>
  );
}

function CenterMedallion() {
  const g = "#d4b26a";
  const gb = "#e8c878";
  return (
    <g className="center-medallion" transform={`translate(${W/2},${H/2})`} pointerEvents="none">
      {/* outer sunburst rays */}
      {Array.from({length: 24}).map((_, i) => (
        <line key={"sr"+i} x1="0" y1="-130" x2="0" y2={i % 2 === 0 ? -114 : -120}
              stroke={g} strokeWidth={i % 2 === 0 ? 0.8 : 0.5} opacity="0.5"
              transform={`rotate(${i*15})`} />
      ))}
      {/* outermost ring */}
      <circle r="128" fill="none" stroke={g} strokeWidth="0.7" opacity="0.45"/>
      <circle r="112" fill="none" stroke={g} strokeWidth="0.5" opacity="0.35"/>
      {/* ornamental dotted ring with diamonds at cardinals */}
      <circle r="104" fill="none" stroke={g} strokeDasharray="1 5" strokeWidth="0.8" opacity="0.65"/>
      {[0,1,2,3].map(i => (
        <g key={"d"+i} transform={`rotate(${i*90}) translate(0,-104)`}>
          <polygon points="0,-5 5,0 0,5 -5,0" fill={g} opacity="0.9"/>
        </g>
      ))}
      {/* inner concentric rings */}
      <circle r="92" fill="none" stroke={g} strokeWidth="0.4" opacity="0.35"/>
      <circle r="86" fill="#0b1a2e" stroke={g} strokeWidth="1.4" opacity="1"/>
      <circle r="80" fill="none" stroke={gb} strokeWidth="0.5" opacity="0.55"/>
      {/* title */}
      <text y="2" textAnchor="middle" className="medallion-title">ML &amp; MLOps</text>
      {/* flanking ornaments */}
      <g opacity="0.75">
        <line x1="-64" y1="22" x2="-24" y2="22" stroke={g} strokeWidth="0.6"/>
        <line x1="24"  y1="22" x2="64"  y2="22" stroke={g} strokeWidth="0.6"/>
        <circle cx="-68" cy="22" r="2" fill={g}/>
        <circle cx="68"  cy="22" r="2" fill={g}/>
        <polygon points="0,16 4,22 0,28 -4,22" fill="none" stroke={g} strokeWidth="0.7"/>
      </g>
    </g>
  );
}

// ── LEAF / HUB NODES ───────────────────────────────────────
function HubNode({ hub, pos, expanded, selected, onToggle, onSelect, dim, active }) {
  const cat = window.CATEGORIES[hub.cat];
  const r = 78;
  const cls = ["hub", expanded && "hub-open", selected && "hub-selected", dim && "dim", active && "active"].filter(Boolean).join(" ");
  return (
    <g className={cls} transform={`translate(${pos.x},${pos.y})`}>
      <circle r={r+10} className="hub-ring-outer" stroke={cat.color} />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
        <line key={i} x1="0" y1={-r-4} x2="0" y2={-r+2} stroke={cat.color} strokeWidth="0.5" opacity="0.5"
              transform={`rotate(${i*30})`} />
      ))}
      <circle r={r} className="hub-bg" />
      <circle r={r-4} className="hub-tint" fill={cat.color} opacity="0.10"/>
      <circle r={r} className="hub-border" stroke={cat.color} />
      <text y="6" textAnchor="middle" className="hub-title">{hub.title}</text>
      {/* expand toggle */}
      <g transform={`translate(0,${r+24})`} className="hub-toggle" onClick={(e) => { e.stopPropagation(); onToggle(hub.id); }}>
        <circle r="14" className="toggle-bg" stroke={cat.color}/>
        <text textAnchor="middle" dy="5" className="toggle-glyph">{expanded ? "−" : "+"}</text>
      </g>
      <circle r={r} fill="transparent" onClick={() => onSelect(hub.id)} style={{cursor: "pointer"}}/>
    </g>
  );
}

function LeafNode({ node, pos, selected, onSelect, dim, active }) {
  const cat = window.CATEGORIES[node.cat];
  const w = 230, h = 62;
  const cls = ["leaf", selected && "leaf-selected", dim && "dim", active && "active"].filter(Boolean).join(" ");
  const nodeTags = (node.tags || []).map(k => window.TAGS[k]).filter(Boolean);
  return (
    <g className={cls} transform={`translate(${pos.x - w/2},${pos.y - h/2})`} onClick={() => onSelect(node.id)}>
      <rect width={w} height={h} rx="12" className="leaf-bg"/>
      <rect width={w} height={h} rx="12" className="leaf-border" stroke={cat.color}/>
      {/* category color bar on the left */}
      <rect x="0" y="0" width="4" height={h} rx="2" fill={cat.color} opacity="0.85"/>
      {/* level dots in TOP RIGHT corner */}
      <g transform={`translate(${w - 12}, 12)`}>
        {[1,2,3].map(i => (
          <circle key={i} cx={-(3-i)*7} cy="0" r="2.6"
                  fill={i <= node.level ? cat.color : "rgba(212,178,106,0.22)"} />
        ))}
      </g>
      <text x={w/2 + 2} y={h/2 + 4} textAnchor="middle" className="leaf-title">{node.title}</text>
      {/* tiny tag glyphs, bottom-right, purely decorative indicator */}
      {nodeTags.length > 0 && (
        <g transform={`translate(${w - 10}, ${h - 8})`}>
          {nodeTags.slice(0,4).map((t, i) => (
            <text key={i} x={-(nodeTags.length-1-i)*10} y="0" textAnchor="end"
                  fill={t.color} opacity="0.72"
                  style={{ fontSize: "8px", fontFamily: "serif" }}>{t.glyph}</text>
          ))}
        </g>
      )}
    </g>
  );
}

// ── EDGE (ornate line, gold) ───────────────────────────────
function DecoEdge({ from, to, dim, active, onPath, cat }) {
  const mx = (from.x + to.x)/2, my = (from.y + to.y)/2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const nx = -dy/len, ny = dx/len;
  const curve = 30;
  const cpx = mx + nx * curve, cpy = my + ny * curve;
  const d = `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;
  const col = cat ? window.CATEGORIES[cat].color : "#c9a14a";
  return (
    <path d={d}
          className={"deco-edge" + (onPath ? " on-path" : "") + (dim ? " dim" : "") + (active ? " active" : "")}
          stroke={col} fill="none" />
  );
}

// ── DETAIL PANEL ───────────────────────────────────────────
function DetailPanel({ node, onClose, onExpandHub }) {
  if (!node) return null;
  const cat = window.CATEGORIES[node.cat];
  if (node.isHub) {
    return (
      <aside className="panel">
        <div className="panel-head">
          <div className="panel-crumb" style={{ color: cat.color }}>HUB · {cat.label}</div>
          <button className="panel-close" onClick={onClose}>×</button>
        </div>
        <h2 className="panel-title">{node.title}</h2>
        <div className="panel-rule" style={{ background: cat.color }}/>
        <p className="panel-blurb">{node.blurb}</p>
        <div className="panel-section-label">Topics inside</div>
        <ul className="panel-topics">
          {node.children.map(c => (
            <li key={c.id}>
              <span className="panel-topic-pip" style={{ background: cat.color }}/>
              <span className="panel-topic-name">{c.title}</span>
              <span className="panel-topic-dots">
                {[1,2,3].map(i => (
                  <span key={i} className={"pt-dot" + (i <= c.level ? " on" : "")}
                        style={i <= c.level ? { background: cat.color } : {}}/>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <button className="panel-link" onClick={() => onExpandHub(node.id)}>
          <span>unfold branch</span><span className="arrow">+</span>
        </button>
      </aside>
    );
  }
  const levelLabel = ["", "basic", "medium", "advanced"][node.level];
  const hasDedicated = ["python","mlopsfund","llm"].includes(node.id);
  const subpage = hasDedicated ? `pages/${node.id}.html` : `pages/_template.html?id=${node.id}`;
  return (
    <aside className="panel">
      <div className="panel-head">
        <div className="panel-crumb" style={{ color: cat.color }}>{cat.label} · {levelLabel}</div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <h2 className="panel-title">{node.title}</h2>
      <div className="panel-rule" style={{ background: cat.color }}/>
      <p className="panel-blurb">{node.blurb}</p>
      <div className="panel-section-label">Key topics</div>
      <ul className="panel-topics">
        {node.topics.map(t => (
          <li key={t}>
            <span className="panel-topic-pip" style={{ background: cat.color }}/>
            <span className="panel-topic-name">{t}</span>
          </li>
        ))}
      </ul>
      <a className="panel-link" href={subpage}>
        <span>full notes &amp; resources</span><span className="arrow">→</span>
      </a>
    </aside>
  );
}

// ── THEMES / TAGS POPOVER ──────────────────────────────────
// Cross-cutting tags that highlight matching leaves across hubs.
// Unlike categories (1:1 with hubs), tags let a topic belong to
// multiple themes — e.g. Ethics is both 'Foundational' and 'LLM-era'.
function TagsButton({ activeTags, toggleTag, onResetTags }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, []);
  const total = Object.keys(window.TAGS).length;
  const nOn = activeTags.size;
  return (
    <div className="legend-wrap" ref={ref}>
      <button className={"legend-trigger" + (open ? " open" : "") + (nOn > 0 ? " has-on" : "")} onClick={() => setOpen(o => !o)} title="Highlight by theme">
        <span className="legend-trigger-dots">
          {Object.entries(window.TAGS).map(([k, c]) => (
            <span key={k} className="ltd" style={{ background: c.color,
              opacity: nOn === 0 ? 0.55 : (activeTags.has(k) ? 1 : 0.18) }}/>
          ))}
        </span>
        <span className="legend-trigger-label">
          {nOn === 0 ? "themes" : `${nOn} theme${nOn>1?"s":""} on`}
        </span>
        <span className="legend-trigger-chev">▾</span>
      </button>
      {open && (
        <div className="legend-pop">
          <div className="legend-pop-head">
            <span>Highlight by theme</span>
            <button className="legend-pop-reset" onClick={onResetTags}>clear</button>
          </div>
          <div className="legend-pop-hint">Tags cut across hubs — toggle to highlight topics; leave all off to see everything equally.</div>
          <ul className="legend-pop-list">
            {Object.entries(window.TAGS).map(([k, c]) => {
              const on = activeTags.has(k);
              return (
                <li key={k} className={"legend-pop-row" + (on ? " on" : "")} onClick={() => toggleTag(k)}>
                  <span className="lpr-swatch" style={{ background: c.color }}>{c.glyph}</span>
                  <span className="lpr-label">
                    <span className="lpr-label-main">{c.label}</span>
                    <span className="lpr-label-hint">{c.hint}</span>
                  </span>
                  <span className="lpr-check">{on ? "✓" : ""}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── TWEAKS ─────────────────────────────────────────────────
function Tweaks({ layout, setLayout, zoom, setZoom, activeTags, toggleTag, onReset, onExpandAll, onCollapseAll }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    function onMsg(e) {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setOpen(false);
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  if (!open) return null;
  return (
    <div className="tweaks">
      <div className="tweaks-head"><span>Tweaks</span><button onClick={() => setOpen(false)}>×</button></div>
      <div className="tweaks-section">
        <div className="tweaks-label">Layout</div>
        <div className="tweaks-row">
          {["mindmap","constellation","tree"].map(m => (
            <button key={m} className={"tweaks-btn" + (layout === m ? " on" : "")} onClick={() => setLayout(m)}>{m}</button>
          ))}
        </div>
      </div>
      <div className="tweaks-section">
        <div className="tweaks-label">Zoom · {zoom}%</div>
        <input type="range" min={60} max={140} step={5} value={zoom} onChange={e => setZoom(+e.target.value)}/>
      </div>
      <div className="tweaks-section">
        <div className="tweaks-label">Themes (highlight)</div>
        <div className="tweaks-col">
          {Object.entries(window.TAGS).map(([k, c]) => (
            <label key={k} className="tweaks-check">
              <input type="checkbox" checked={activeTags.has(k)} onChange={() => toggleTag(k)}/>
              <span className="tweaks-dot" style={{ background: c.color }}/>
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="tweaks-section">
        <div className="tweaks-label">Branches</div>
        <div className="tweaks-row">
          <button className="tweaks-btn" onClick={onExpandAll}>expand all</button>
          <button className="tweaks-btn" onClick={onCollapseAll}>collapse all</button>
        </div>
      </div>
      <button className="tweaks-reset" onClick={onReset}>reset</button>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────
function MLMap() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "layout": "mindmap",
    "zoom": 100,
    "active_tags": [],
    "default_expanded": []
  }/*EDITMODE-END*/;

  const [layout, setLayout] = React.useState(TWEAK_DEFAULTS.layout);
  const [zoom, setZoom] = React.useState(TWEAK_DEFAULTS.zoom);
  const [activeTags, setActiveTags] = React.useState(
    new Set(TWEAK_DEFAULTS.active_tags || [])
  );
  const [expanded, setExpanded] = React.useState(new Set(TWEAK_DEFAULTS.default_expanded));
  const [selected, setSelected] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const [activePath, setActivePath] = React.useState(null);
  const [viewport, setViewport] = React.useState({ w: window.innerWidth, h: window.innerHeight });

  React.useEffect(() => {
    const onR = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  React.useEffect(() => {
    window.parent.postMessage({
      type: "__edit_mode_set_keys",
      edits: {
        layout, zoom,
        active_tags: Array.from(activeTags),
      }
    }, "*");
  }, [layout, zoom, activeTags]);

  // All hubs always visible — categories no longer filter the map.
  const visibleHubs = window.HUBS;

  // Set of node ids matching any active tag (union).
  // Hubs are included if any of their children match.
  const tagSet = React.useMemo(() => {
    if (activeTags.size === 0) return null;
    const matching = new Set();
    for (const h of window.HUBS) {
      let hubHit = false;
      for (const c of h.children) {
        const hit = (c.tags || []).some(t => activeTags.has(t));
        if (hit) { matching.add(c.id); hubHit = true; }
      }
      if (hubHit) matching.add(h.id);
    }
    return matching;
  }, [activeTags]);

  // Combined highlight set: a node is 'on' only if it's in BOTH pathSet and tagSet
  // (when either is active). Dim = not 'on'.
  function isDim(id) {
    if (pathSet && !pathSet.has(id)) return true;
    if (tagSet && !tagSet.has(id)) return true;
    return false;
  }

  const positions = React.useMemo(() => {
    const p = computeLayout(visibleHubs, expanded, layout);
    const cx = W/2, cy = H/2, k = zoom/100;
    const out = {};
    for (const id in p) out[id] = { x: cx + (p[id].x - cx) * k, y: cy + (p[id].y - cy) * k };
    return out;
  }, [visibleHubs, expanded, layout, zoom]);

  const edges = React.useMemo(() => buildEdges(visibleHubs, expanded), [visibleHubs, expanded]);

  // ── Dynamic viewBox: fit all visible nodes with padding ──
  const targetViewBox = React.useMemo(() => {
    const pts = Object.values(positions);
    // Include subnode projected positions if a leaf with subnodes is selected
    if (selected) {
      for (const h of visibleHubs) {
        if (!expanded.has(h.id)) continue;
        const c = h.children.find(ch => ch.id === selected);
        if (!c || !c.subnodes || !positions[c.id]) continue;
        const parent = positions[c.id];
        const ang = Math.atan2(parent.y - H/2, parent.x - W/2);
        const rOut = 180, spread = Math.PI * 0.55, n = c.subnodes.length;
        for (let i = 0; i < n; i++) {
          const a = ang + (i - (n-1)/2) * (spread / Math.max(n-1,1));
          pts.push({ x: parent.x + Math.cos(a) * (rOut + 90), y: parent.y + Math.sin(a) * (rOut + 40) });
        }
      }
    }
    if (pts.length === 0) return [0, 0, W, H];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    minX = Math.min(minX, W/2 - 100); maxX = Math.max(maxX, W/2 + 100);
    minY = Math.min(minY, H/2 - 100); maxY = Math.max(maxY, H/2 + 100);
    const pad = 140;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    let w = maxX - minX, h = maxY - minY;
    const aspect = W / H;
    if (w / h < aspect) { const nw = h * aspect; minX -= (nw - w) / 2; w = nw; }
    else { const nh = w / aspect; minY -= (nh - h) / 2; h = nh; }
    if (w < W) { minX -= (W - w)/2; w = W; }
    if (h < H) { minY -= (H - h)/2; h = H; }
    return [minX, minY, w, h];
  }, [positions, selected, visibleHubs, expanded]);

  // Tween the viewBox smoothly towards target
  const [vb, setVb] = React.useState([0, 0, W, H]);
  React.useEffect(() => {
    const start = vb, end = targetViewBox;
    const t0 = performance.now();
    const dur = 450;
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      // easeInOutCubic
      const e = k < 0.5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
      setVb(start.map((s, i) => s + (end[i] - s) * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetViewBox[0], targetViewBox[1], targetViewBox[2], targetViewBox[3]]);
  const viewBox = vb.join(" ");

  const nodeById = React.useMemo(() => Object.fromEntries(window.ALL_NODES.map(n => [n.id, n])), []);

  const pathSet = React.useMemo(() => activePath ? new Set(window.PATHS[activePath].nodes) : null, [activePath]);

  const selNode = selected ? nodeById[selected] : null;

  function toggleTag(k) {
    setActiveTags(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }

  function toggleExpand(hubId) {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(hubId)) n.delete(hubId); else n.add(hubId);
      return n;
    });
  }

  function expandHub(hubId) {
    setExpanded(prev => new Set(prev).add(hubId));
  }

  function onSelect(id) { setSelected(id === selected ? null : id); }

  function expandAll() { setExpanded(new Set(window.HUBS.map(h => h.id))); }
  function collapseAll() { setExpanded(new Set()); setSelected(null); }

  // If a path is active, auto-expand the hubs it touches
  React.useEffect(() => {
    if (!activePath) return;
    const want = new Set(window.PATHS[activePath].nodes.filter(id => window.HUBS.some(h => h.id === id)));
    setExpanded(prev => new Set([...prev, ...want]));
  }, [activePath]);

  return (
    <div className="app">
      <header className="top">
        <div className="top-left">
          <div className="logo">
            <svg viewBox="0 0 40 40" width="30" height="30">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#d4b26a" strokeWidth="0.8"/>
              <circle cx="20" cy="20" r="13" fill="none" stroke="#d4b26a" strokeWidth="0.5"/>
              <polygon points="20,6 24,20 20,34 16,20" fill="#d4b26a"/>
              <line x1="6" y1="20" x2="34" y2="20" stroke="#d4b26a" strokeWidth="0.5"/>
            </svg>
          </div>
          <div className="title">
            <div className="title-main">The ML Atlas</div>
          </div>
        </div>

        <div className="top-right">
          <button className={"pathbtn" + (activePath === null ? " on" : "")} onClick={() => setActivePath(null)}>overview</button>
          {Object.entries(window.PATHS).map(([k, p]) => (
            <button key={k} className={"pathbtn" + (activePath === k ? " on" : "")} onClick={() => setActivePath(k)}>
              {p.label}
            </button>
          ))}
          <span className="top-divider"/>
          <TagsButton activeTags={activeTags} toggleTag={toggleTag}
                      onResetTags={() => setActiveTags(new Set())}/>
          <span className="top-divider"/>
          <button className="pathbtn sm" onClick={expandAll} title="Expand all branches">＋ all</button>
          <button className="pathbtn sm" onClick={collapseAll} title="Collapse all">− all</button>
        </div>
      </header>

      <div className="main">
        <div className="canvas-wrap">
          <svg className="canvas" viewBox={viewBox} preserveAspectRatio="xMidYMid meet"
               style={{transition: "none"}}
               onMouseLeave={() => setHover(null)}>
            <defs>
              <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#163453" stopOpacity="1"/>
                <stop offset="100%" stopColor="#0a1626" stopOpacity="1"/>
              </radialGradient>
              <pattern id="grid-fine" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(212,178,106,0.04)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect x={vb[0]} y={vb[1]} width={vb[2]} height={vb[3]} fill="url(#bg-grad)"/>
            <rect x={vb[0]} y={vb[1]} width={vb[2]} height={vb[3]} fill="url(#grid-fine)"/>
            <DecoFrame vb={vb}/>
            <CenterMedallion/>

            {/* Edges */}
            {edges.map(([a,b]) => {
              if (!positions[a] || !positions[b]) return null;
              const hub = visibleHubs.find(h => h.id === a);
              const onPath = pathSet && pathSet.has(a) && pathSet.has(b);
              const onTag = tagSet && tagSet.has(a) && tagSet.has(b);
              const dim = (pathSet && !onPath) || (tagSet && !onTag);
              return <DecoEdge key={a+"-"+b} from={positions[a]} to={positions[b]} cat={hub?.cat}
                               onPath={onPath || onTag} dim={dim}/>;
            })}

            {/* Central spokes from center to each hub */}
            {visibleHubs.map(h => positions[h.id] && (
              <line key={"spoke-"+h.id}
                    x1={W/2} y1={H/2} x2={positions[h.id].x} y2={positions[h.id].y}
                    stroke={window.CATEGORIES[h.cat].color} strokeWidth="0.6" opacity={isDim(h.id) ? 0.1 : 0.35}
                    strokeDasharray="2 4" />
            ))}

            {/* Hubs */}
            {visibleHubs.map(h => positions[h.id] && (
              <g key={h.id}
                 onMouseEnter={() => setHover(h.id)}
                 onMouseLeave={() => setHover(null)}>
                <HubNode hub={h} pos={positions[h.id]}
                         expanded={expanded.has(h.id)}
                         selected={selected === h.id}
                         onToggle={toggleExpand}
                         onSelect={onSelect}
                         dim={isDim(h.id)}
                         active={hover === h.id} />
              </g>
            ))}

            {/* Leaves */}
            {visibleHubs.map(h => expanded.has(h.id) && h.children.map(c => positions[c.id] && (
              <LeafNode key={c.id} node={{...c, cat: h.cat}} pos={positions[c.id]}
                        selected={selected === c.id}
                        onSelect={onSelect}
                        dim={isDim(c.id)}
                        active={hover === c.id} />
            )))}

            {/* Sub-nodes — appear when parent leaf is selected */}
            {visibleHubs.map(h => expanded.has(h.id) && h.children.map(c => {
              if (selected !== c.id) return null;
              if (!c.subnodes || !positions[c.id]) return null;
              const cat = window.CATEGORIES[h.cat];
              const parent = positions[c.id];
              const cx = W/2, cy = H/2;
              const ang = Math.atan2(parent.y - cy, parent.x - cx);
              const rOut = 180;
              const spread = Math.PI * 0.55;
              const n = c.subnodes.length;
              return c.subnodes.map((sn, i) => {
                const a = ang + (i - (n-1)/2) * (spread / Math.max(n-1,1));
                const sx = parent.x + Math.cos(a) * rOut;
                const sy = parent.y + Math.sin(a) * rOut;
                const mx = (parent.x+sx)/2, my = (parent.y+sy)/2 - 12;
                return (
                  <g key={sn.id} className="subnode">
                    {/* ornamented connector: dashed arc + gold gem at the midpoint */}
                    <path d={`M ${parent.x} ${parent.y} Q ${mx} ${my} ${sx} ${sy}`}
                          stroke={cat.color} strokeWidth="0.8" opacity="0.55" fill="none"
                          strokeDasharray="3 3"/>
                    <g transform={`translate(${mx}, ${my})`}>
                      <polygon points="0,-4 4,0 0,4 -4,0" fill={cat.color} opacity="0.8"/>
                      <polygon points="0,-2 2,0 0,2 -2,0" fill="#0a1626"/>
                    </g>
                    {/* subnode card with deco motif */}
                    <g transform={`translate(${sx - 82}, ${sy - 24})`}>
                      <rect width="164" height="48" rx="4" className="subnode-bg"/>
                      <rect width="164" height="48" rx="4" className="subnode-border" stroke={cat.color}/>
                      {/* inner deco frame */}
                      <rect x="3" y="3" width="158" height="42" rx="2" fill="none"
                            stroke={cat.color} strokeWidth="0.4" opacity="0.45"/>
                      {/* left medallion: small nested diamond */}
                      <g transform="translate(14, 24)">
                        <circle r="9" fill="none" stroke={cat.color} strokeWidth="0.6" opacity="0.6"/>
                        <polygon points="0,-5 5,0 0,5 -5,0" fill={cat.color} opacity="0.85"/>
                        <polygon points="0,-2.2 2.2,0 0,2.2 -2.2,0" fill="#0a1626"/>
                      </g>
                      {/* right tick marks (art-deco stepped motif) */}
                      <g transform="translate(150, 24)" opacity="0.55">
                        <line x1="0" y1="-6" x2="0" y2="6" stroke={cat.color} strokeWidth="0.5"/>
                        <line x1="-4" y1="-4" x2="-4" y2="4" stroke={cat.color} strokeWidth="0.5"/>
                        <line x1="-8" y1="-2" x2="-8" y2="2" stroke={cat.color} strokeWidth="0.5"/>
                      </g>
                      {/* level dots below title */}
                      <g transform="translate(98, 36)">
                        {[1,2,3].map(k => (
                          <circle key={k} cx={(k-2)*6} cy="0" r="1.6"
                                  fill={k <= sn.level ? cat.color : "rgba(212,178,106,0.22)"} />
                        ))}
                      </g>
                      <text x="82" y="22" textAnchor="middle" className="subnode-title">{sn.title}</text>
                    </g>
                  </g>
                );
              });
            }))}
          </svg>
        </div>

        <DetailPanel node={selNode} onClose={() => setSelected(null)} onExpandHub={expandHub}/>
      </div>

      <Tweaks layout={layout} setLayout={setLayout}
              zoom={zoom} setZoom={setZoom}
              activeTags={activeTags} toggleTag={toggleTag}
              onExpandAll={expandAll} onCollapseAll={collapseAll}
              onReset={() => {
                setLayout("mindmap"); setZoom(100);
                setActiveTags(new Set());
                setExpanded(new Set()); setSelected(null); setActivePath(null);
              }}/>
    </div>
  );
}

window.MLMap = MLMap;

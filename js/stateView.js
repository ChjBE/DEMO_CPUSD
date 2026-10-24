/* CPU Scheduling Simulator - 5-State SVG Diagram */
function stateView(r, t) {
    t = Math.max(0, Math.min(r.T, t));
    const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
    const pStats = snap.procStats;
    const byState = k => pStats.filter(p => {
        if (k === 0) return p.state === 'New';
        if (k === 1) return p.state === 'Ready';
        if (k === 2) return p.state === 'Running';
        if (k === 3) return p.state === 'Waiting';
        if (k === 4) return p.state === 'Terminated';
        return false;
    });

    const W = 103, G = 22, X = k => k * (W + G);
    const mx = Math.max(1, ...[0, 1, 2, 4].map(k => byState(k).length));
    const H = 40 + Math.ceil(mx / 3) * 24 + 8;
    const WY = H + 54, TH = WY + 56, WW = 190;
    const mid = (X(1) + W / 2 + X(2) + W / 2) / 2;
    const c1 = X(1) + W / 2, c2 = X(2) + W / 2;

    const recentEvents = snap.eventsUpToT.slice(-6).reverse();
    const lastEv = recentEvents[0];
    const hasAct = a => lastEv && lastEv.t === t;

    const ar = (id, d, dash) => `<path class="ar${dash ? ' dash' : ''}${hasAct(id) ? ' on' : ''}" d="${d}" marker-end="url(#${hasAct(id) ? 'mo' : 'mh'})"/>`;

    const node = (k, x, y, w, h, dash) => {
        const list = byState(k);
        const c = STC[k];
        const act = list.length > 0;
        return `<g><rect class="nd${dash ? ' dash' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="${act ? 'stroke:' + c : ''}"/>` +
            (act ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" fill-opacity=".08"/>` : '') +
            `<circle cx="${x + 9}" cy="${y + 17}" r="3.5" fill="${c}"/><text x="${x + 17}" y="${y + 21}">${STN[k]}</text><text class="cn" x="${x + w - 7}" y="${y + 21}" style="${act ? 'fill:' + c : ''}">${list.length}</text>` +
            (k === 3 ? `<text class="sub" x="${x + 17}" y="${y + 40}">Chưa áp dụng (mô hình lập lịch CPU thuần)</text>` : '') +
            list.map((p, j) => {
                const px = x + 8 + (j % 3) * 29;
                const py = y + 34 + Math.floor(j / 3) * 24;
                return `<g><title>P${p.pid} – ${p.name}: ${STN[k]}</title><rect x="${px}" y="${py}" width="26" height="20" rx="6" fill="${COL[p.pid % 10]}"/><text class="cp" x="${px + 13}" y="${py + 14.5}">P${p.pid}</text></g>`;
            }).join('') + `</g>`;
    };

    return `<svg class="sd" viewBox="0 0 480 ${TH}" role="img" aria-label="Sơ đồ trạng thái tiến trình tại t = ${t}"><defs><marker id="mh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mh" d="M1 1L9 5L1 9z"/></marker><marker id="mo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mo" d="M1 1L9 5L1 9z"/></marker></defs>` +
        ar('nr', `M${X(0) + W + 1} 22H${X(1) - 3}`) +
        ar('dp', `M${X(1) + W + 1} 16H${X(2) - 3}`) +
        ar('pe', `M${X(2) - 1} 34H${X(1) + W + 3}`) +
        ar('tm', `M${X(2) + W + 1} 22H${X(3) - 3}`) +
        ar('rw', `M${c2} ${H + 1}V${WY - 3}`, 1) +
        ar('wr', `M${c1} ${WY - 1}V${H + 3}`, 1) +
        node(0, X(0), 0, W, H) +
        node(1, X(1), 0, W, H) +
        node(2, X(2), 0, W, H) +
        node(4, X(3), 0, W, H) +
        node(3, mid - WW / 2, WY, WW, 52, 1) +
        `</svg>` +
        `<ul class="evl">${recentEvents.length ? recentEvents.map(e => `<li><span class="tm">t = ${e.t}</span><span class="pc" style="background:${COL[e.pid % 10]}">P${e.pid}</span><span class="st2" style="color:${STC[STN.indexOf(e.from)]||'#666'}">${e.from}</span>${svg('arrow', 14, 2)}<span class="st2" style="color:${STC[STN.indexOf(e.to)]||'#666'}">${e.to}</span><span class="mu">(${e.reason})</span></li>`).join('') : '<li class="mu">Chưa có sự kiện chuyển trạng thái.</li>'}</ul>` +
        `<p class="mu note">Waiting/Blocked được giữ trong sơ đồ cho đủ chuẩn 5 trạng thái của Hệ điều hành; I/O Burst hiện mang tính hiển thị mở rộng, mô hình lập lịch CPU tập trung vào quá trình thực thi trên CPU.</p>`;
}

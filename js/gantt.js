/* CPU Scheduling Simulator - Gantt & Ready Queue Visualizer */
function gantt(r, upto) {
    upto = (upto == null) ? r.T : Math.max(0, Math.min(r.T, upto));
    const minW = Math.min(Math.max(r.T * 26, 320), 2800);
    const curPercent = r.T > 0 ? (upto / r.T * 100) : 0;

    let step = 1;
    if (r.T > 80) step = 10;
    else if (r.T > 40) step = 5;
    else if (r.T > 20) step = 2;
    const ticks = [];
    for (let ti = 0; ti <= r.T; ti += step) ticks.push(ti);
    if (ticks[ticks.length - 1] !== r.T) ticks.push(r.T);

    const axisHtml = `<div class="gt-axis">` + ticks.map(ti => {
        const pos = (ti / r.T * 100);
        return `<span class="gt-tick" style="left:${pos}%">${ti}</span>`;
    }).join('') + `</div>`;

    const blocksHtml = r.g.map((s, k, ar) => {
        const dur = s.e - s.s;
        const isIdle = s.pid < 0;
        let cls = 'sg' + (isIdle ? ' idle' : '');
        if (s.e <= upto) cls += ' past';
        else if (s.s <= upto && upto < s.e) cls += ' active';
        else cls += ' future';

        const bg = isIdle ? '' : `background:${COL[s.pid % 10]};`;
        const label = isIdle ? 'IDLE' : 'P' + s.pid;
        const title = isIdle ? `CPU rỗi: ${s.s}–${s.e}` : `P${s.pid}: ${s.s}–${s.e} (thời lượng: ${dur})`;
        return `<div class="${cls}" style="flex:${dur};${bg}" title="${title}">${label}<small>${s.s}</small>${k == ar.length - 1 ? `<small class="en">${s.e}</small>` : ''}</div>`;
    }).join('');

    const uniquePids = [...new Set(r.g.filter(s => s.pid >= 0).map(s => s.pid))].sort((a,b)=>a-b);
    const legendHtml = `<div class="lgd">` +
        uniquePids.map(pid => `<span><i style="background:${COL[pid % 10]}"></i>P${pid}</span>`).join('') +
        `<span><i style="background:var(--bd);border:1px dashed var(--mu)"></i>CPU rỗi</span>` +
        `<span><i style="background:#ef4444"></i>Con trỏ thời điểm t = ${upto}</span>` +
        `</div>`;

    return `<div class="gt-wrap"><div class="gt-scroll"><div class="gt-inner" style="min-width:${minW}px">` +
        `<div class="gt-cur-line" style="left:${curPercent}%"></div>` +
        `<div class="gt">${blocksHtml}</div>` +
        axisHtml +
        `</div></div>${legendHtml}</div>`;
}

function readyQueueView(snapshot) {
    if (!snapshot || !snapshot.readyList.length) {
        return `<div class="rq-wrap"><span class="rq-lbl">${svg('list', 16, 2)} Hàng đợi sẵn sàng:</span><span class="mu">Trống (Không có tiến trình nào đang chờ cấp CPU)</span></div>`;
    }
    const items = snapshot.readyList.map((p, idx) => {
        const bg = COL[p.pid % 10];
        const extra = (p.lvl != null && S.algo.startsWith('ML') ? ` | Q${p.lvl}` : '') + (p.pr != null ? ` | Ưu tiên ${p.pr}` : '');
        return `<span class="rq-item"><b style="background:${bg}">P${p.pid}</b> ${p.name} <span class="mu">(còn ${p.rem}s${extra})</span></span>`;
    }).join('<span class="rq-arr">→</span>');
    return `<div class="rq-wrap"><span class="rq-lbl">${svg('list', 16, 2)} Hàng đợi sẵn sàng (${snapshot.readyList.length}):</span>${items}</div>`;
}

/* CPU Scheduling Simulator - Simulation Playback Controller */
function getActiveSim() {
    if (S.view === 'load' && S.loadSim) return S.loadSim;
    return S.r;
}

function simBtn() {
    const r = getActiveSim();
    if (!$('#bRun') || !r) return;
    const curT = (S.view === 'load') ? S.loadCur : S.cur;
    $('#bRun').disabled = !!S.tm;
    $('#bStop').disabled = !S.tm;
    $('#bStep').disabled = !!S.tm || curT >= r.T;
}

function simView(t) {
    const r = getActiveSim();
    if (!r) return;
    t = Math.max(0, Math.min(r.T, t));
    if (S.view === 'load') S.loadCur = t;
    else S.cur = t;

    const o = $('#gg .gt-scroll');
    const sl = o ? o.scrollLeft : 0;

    if ($('#gg')) $('#gg').innerHTML = gantt(r, t);
    if ($('#rq')) $('#rq').innerHTML = readyQueueView(r.snapshots[t]);
    if ($('#sd')) $('#sd').innerHTML = stateView(r, t);
    if ($('#pt-sim')) $('#pt-sim').innerHTML = processTableHTML(r, t);
    if ($('#kpi-sim')) $('#kpi-sim').innerHTML = kpiCardsHTML(r, t);

    if ($('#tv')) $('#tv').textContent = t;
    if ($('#ts')) $('#ts').value = t;

    const [m, on] = simStat(r, t);
    const e = $('#ss');
    if (e) {
        e.className = 'ss' + (on ? ' on' : '');
        e.innerHTML = `<i></i>${m}`;
    }

    const n = $('#gg .gt-scroll');
    if (n && r.T > 0) {
        const targetX = (n.scrollWidth - 20) * (t / r.T);
        if (targetX > sl + n.clientWidth - 50) {
            n.scrollLeft = targetX - n.clientWidth + 80;
        } else if (targetX < sl) {
            n.scrollLeft = Math.max(0, targetX - 40);
        }
    }
    simBtn();
}

function simStop() {
    if (S.tm) {
        clearInterval(S.tm);
        S.tm = null;
    }
    simBtn();
}

function simTick() {
    const r = getActiveSim();
    if (!r || (!$('#gg'))) return simStop();
    const curT = (S.view === 'load') ? S.loadCur : S.cur;
    simView(curT + 1);
    const nextT = (S.view === 'load') ? S.loadCur : S.cur;
    if (nextT >= r.T) simStop();
}

function simRun() {
    if (S.tm) return;
    const r = getActiveSim();
    if (!r) return;
    const curT = (S.view === 'load') ? S.loadCur : S.cur;
    if (curT >= r.T) simView(0);
    const spd = +($('#spd')?.value || 700);
    S.tm = setInterval(simTick, spd);
    simBtn();
}

function simStep() {
    simStop();
    const curT = (S.view === 'load') ? S.loadCur : S.cur;
    simView(curT + 1);
}

function simReset() {
    simStop();
    simView(0);
}

function simSpd() {
    if (S.tm) {
        simStop();
        simRun();
    }
}

function simStat(r, t) {
    if (t >= r.T) return ['Hoàn tất: mọi tiến trình đã Terminated.', 0];
    if (t <= 0) return ['Sẵn sàng. Nhấn Chạy hoặc Bước kế để bắt đầu.', 0];
    const sl = r.g.find(s => s.s <= t - 1 && t - 1 < s.e);
    return sl && sl.pid >= 0 ? [`CPU đang xử lý P${sl.pid} trong khoảng [${t - 1}, ${t}).`, 1] : [`CPU rỗi (IDLE) trong khoảng [${t - 1}, ${t}).`, 0];
}

function simUI(r, t) {
    const [m, on] = simStat(r, t);
    return `<div class="card ctl">` +
        `<div class="cb">` +
        `<button class="bt" id="bRun" onclick="simRun()">${svg('run', 16, 2)}Chạy</button>` +
        `<button class="bt g" id="bStop" onclick="simStop()" disabled>${svg('pause', 16, 2)}Dừng</button>` +
        `<button class="bt g" id="bStep" onclick="simStep()" disabled>${svg('step', 16, 2)}Bước kế</button>` +
        `<button class="bt g" onclick="simReset()">${svg('reset', 16, 2)}Đặt lại</button>` +
        `<label>Tốc độ <select id="spd" onchange="simSpd()"><option value="1200">Chậm</option><option value="700" selected>Vừa</option><option value="300">Nhanh</option></select></label>` +
        `</div>` +
        `<div class="tl"><input id="ts" type="range" min="0" max="${r.T}" value="${t}" aria-label="Thời điểm mô phỏng" oninput="simStop();simView(+this.value)"><span>t = <b id="tv">${t}</b> / ${r.T}</span></div>` +
        `<p id="ss" class="ss${on ? ' on' : ''}"><i></i>${m}</p>` +
        `</div>` +
        `<div class="sim">` +
        `<div class="card"><h3>Biểu đồ Gantt & Trục thời gian</h3><p class="mu">Mỗi khối thể hiện khoảng thời gian tiến trình được cấp CPU. Khối viền sáng là tiến trình đang chạy tại t=${t}.</p><div id="gg">${gantt(r, t)}</div></div>` +
        `<div id="rq">${readyQueueView(r.snapshots[t])}</div>` +
        `<div class="card"><h3>Sơ đồ trạng thái tiến trình</h3><p class="mu">Phân loại và hiển thị trực quan các tiến trình theo 5 trạng thái tại thời điểm t=${t}.</p><div id="sd">${stateView(r, t)}</div></div>` +
        `</div>`;
}

/* CPU Scheduling Simulator - Desktop & Process Management */
const ni = (p, k) => `<input type="number" min="${k == 'cpu' ? 1 : 0}" value="${p[k]}" onchange="U(${p.pid},'${k}',this.value)">`;

const U = (id, k, v) => {
    const p = S.procs.find(x => x.pid == id);
    if (p) p[k] = Math.max(k == 'cpu' ? 1 : 0, +v || 0);
    S.fin = false;
    tbl();
};

const del = id => {
    S.procs = S.procs.filter(p => p.pid != id);
    tbl();
};

function tbl() {
    if (!$('#pt')) return;
    $('#pt').innerHTML = `<table><tr><th>PID<th>Tên tiến trình<th>Loại<th>Arrival<th>CPU Burst<th>I/O Burst<th>Priority<th>Trạng thái<th>Xóa</tr>` +
        (S.procs.length ? S.procs.map(p => `<tr><td><b>P${p.pid}</b><td>${p.name}<td>${p.type}<td>${ni(p, 'at')}<td>${ni(p, 'cpu')}<td>${ni(p, 'io')}<td>${ni(p, 'pr')}<td><span class="tag ${S.fin ? 'terminated' : 'ready'}">${S.fin ? 'Terminated' : 'Ready'}</span><td><button class="bt g x" onclick="del(${p.pid})" aria-label="Xóa">${svg('x', 16)}</button></tr>`).join('') :
        `<tr><td colspan="9" class="mu" style="text-align:center;padding:24px">Chưa có tiến trình. Mở một ứng dụng trên máy tính ảo hoặc nhấn “Nạp tập mẫu” để bắt đầu.</td></tr>`) +
        `</table>`;
}

function sample() {
    S.procs = [];
    [[0, 5, 2], [1, 3, 1], [2, 8, 4], [3, 2, 3], [4, 4, 2]].forEach(([a, c, p], idx) => {
        S.procs.push({ pid: idx + 1, name: 'Tiến trình ' + (idx + 1), type: 'HH', at: a, cpu: c, io: 0, pr: p });
    });
    S.pid = 6;
    S.fin = false;
    tbl();
}

function addP(e) {
    e.preventDefault();
    const f = e.target.elements;
    S.procs.push({
        pid: S.pid++,
        name: f.nm.value || ('Tiến trình ' + S.pid),
        type: f.ty.value,
        at: +f.at.value || 0,
        cpu: Math.max(1, +f.cpu.value || 1),
        io: +f.io.value || 0,
        pr: +f.pr.value || 0
    });
    S.fin = false;
    tbl();
    return false;
}

function spawn(i) {
    const a = APPS[i], j = Math.floor(Math.random() * 3) - 1;
    const p = {
        pid: S.pid++,
        name: a[0],
        type: a[2],
        at: Math.floor((Date.now() - S.t0) / 3000),
        cpu: Math.max(1, a[3] + j),
        io: a[4],
        pr: a[5]
    };
    S.procs.push(p);
    S.fin = false;
    tbl();
    return p;
}

function tb() {
    $('#tbi').innerHTML = [...document.querySelectorAll('.win')].map(w => `<span>${ico(w.dataset.ic, 20)}</span>`).join('');
}

function openApp(i) {
    const a = APPS[i], p = spawn(i), w = document.createElement('div'), k = S.wn++ % 6;
    w.className = 'win';
    w.dataset.ic = a[1];
    w.style.left = (230 + k * 28) + 'px';
    w.style.top = (20 + k * 26) + 'px';
    w.style.zIndex = ++S.z;
    w.innerHTML = `<div class="wh"><span class="wt" data-t="${a[0]}">${ico(a[1], 18)}</span><button aria-label="Đóng">${svg('x', 14)}</button></div><div class="wb"><p>${a[6]}</p>${i == 5 ? '<textarea placeholder="Nhập văn bản..."></textarea>' : ''}<p class="mu">Đã tạo tiến trình <b>P${p.pid}</b>: CPU Burst ${p.cpu}, I/O Burst ${p.io}, Priority ${p.pr}.</p><button class="bt">Tạo thêm tiến trình</button></div>`;
    const h = w.querySelector('.wh');
    h.onpointerdown = e => {
        if (e.target.tagName == 'BUTTON') return;
        w.style.zIndex = ++S.z;
        const dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop;
        h.setPointerCapture(e.pointerId);
        h.onpointermove = e => {
            w.style.left = Math.max(0, e.clientX - dx) + 'px';
            w.style.top = Math.max(0, e.clientY - dy) + 'px';
        };
        h.onpointerup = () => { h.onpointermove = null; };
    };
    w.onpointerdown = () => { w.style.zIndex = ++S.z; };
    h.querySelector('button').onclick = () => { w.remove(); tb(); };
    w.querySelector('.bt').onclick = () => {
        const q = spawn(i);
        w.querySelector('.mu').innerHTML += ` Thêm <b>P${q.pid}</b>.`;
    };
    $('#dk').appendChild(w);
    tb();
}

function clk() {
    const d = new Date();
    const el = $('#clk');
    if (el) el.innerHTML = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + '<br>' + d.toLocaleDateString('vi-VN');
}

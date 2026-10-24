/* CPU Scheduling Simulator - Page Views & Renderers */
const ctrl = (pg) => `<select aria-label="Thuật toán" onchange="S.algo=this.value;go('${pg}',1)">${!S.algo ? '<option value="" disabled selected>-- Chọn thuật toán --</option>' : ''}${AL.map(a => `<option value="${a[0]}" ${a[0] == S.algo ? 'selected' : ''}>${NM[a[0]]}</option>`).join('')}</select> Time Quantum <input type="number" min="1" value="${S.q}" style="width:68px" onchange="S.q=Math.max(1,+this.value||1);go('${pg}',1)"> <label><input type="checkbox" ${S.pp ? 'checked' : ''} onchange="S.pp=this.checked;go('${pg}',1)"> Priority có ngắt</label>`;

function processTableHTML(r, t) {
    t = Math.max(0, Math.min(r.T, t));
    const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
    return `<table><tr><th>PID<th>Tên tiến trình<th>Loại<th>Arrival<th>CPU Burst<th>Priority<th>Trạng thái (t)<th>CPU còn lại<th>Thời gian chờ (t)<th>Bắt đầu (RT)<th>Hoàn tất (CT)<th>Quay vòng (TAT)</tr>` +
        snap.procStats.map(p => {
            const isRunning = p.state === 'Running';
            const tagClass = 'tag ' + p.state.toLowerCase();
            const rtStr = p.rt !== null ? p.rt : '--';
            const ctStr = p.ct !== null ? p.ct : (p.state === 'Terminated' ? p.ct : '--');
            const tatStr = (p.ct !== null || p.at <= t) ? p.tat : '--';
            return `<tr class="${isRunning ? 'tr-active' : ''}">` +
                `<td><b>P${p.pid}</b></td>` +
                `<td>${p.name}</td>` +
                `<td>${p.type}</td>` +
                `<td>${p.at}</td>` +
                `<td>${p.cpu}</td>` +
                `<td>${p.pr}</td>` +
                `<td><span class="${tagClass}">${p.state}</span></td>` +
                `<td>${p.rem} / ${p.cpu}</td>` +
                `<td>${p.wt}</td>` +
                `<td>${rtStr}</td>` +
                `<td>${ctStr}</td>` +
                `<td>${tatStr}</td>` +
                `</tr>`;
        }).join('') + `</table>`;
}

function kpiCardsHTML(r, t) {
    t = Math.max(0, Math.min(r.T, t));
    const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
    return `<div><b>${r.wt.toFixed(2)}</b>TB thời gian chờ (khi xong)</div>` +
        `<div><b>${r.tat.toFixed(2)}</b>TB quay vòng (khi xong)</div>` +
        `<div><b>${r.rt.toFixed(2)}</b>TB phản hồi</div>` +
        `<div><b>${snap.u.toFixed(1)}%</b>CPU mô phỏng (tại t=${t})</div>` +
        `<div><b>${snap.thr.toFixed(3)}</b>Throughput (tại t=${t})</div>` +
        `<div><b>${snap.cs}</b>Đổi ngữ cảnh (tại t=${t})</div>`;
}

const V = {
    home() {
        const n = S.procs.length;
        const kp = (ic, v, l, g) => `<div><span class="bd ${g ? 'g' : ''}">${svg(ic, 24)}</span><b>${v}</b>${l}</div>`;
        const fc = c => `<div class="card fc"><span class="bd">${svg(c[0], 24)}</span><h3>${c[1]}</h3><p class="mu">${c[2]}</p><button class="bt g sm" onclick="go('${c[3]}')">Mở</button></div>`;
        return `<section class="pg"><div class="hero"><div class="hc"><span class="ey">CPU SCHEDULING SIMULATOR</span><h1>Mô phỏng lập lịch CPU</h1><p>Tạo các tiến trình, chọn thuật toán và quan sát cách CPU được phân bổ qua biểu đồ Gantt, hàng đợi sẵn sàng, sơ đồ trạng thái và các chỉ số hiệu suất chuẩn xác.</p><button class="bt hb" onclick="go('vm')">Vào máy tính ảo ${svg('arrow', 18, 2)}</button></div><div class="hv">${HERO_SVG}</div></div>
<div class="kpi">${kp('list', n, 'Tiến trình đã tạo')}${kp('clock', S.fin ? 0 : n, 'Đang chờ')}${kp('check', S.fin ? n : 0, 'Đã hoàn thành', 1)}${kp('nodes', (S.algo && NM[S.algo]) ? NM[S.algo] : '-', 'Thuật toán đang chọn')}</div>
<div class="grid">${[['monitor', 'Máy tính ảo', 'Mô phỏng ứng dụng, sinh tiến trình mô phỏng.', 'vm'], ['bars', 'Thuật toán', 'Nguyên lý, ưu và nhược điểm của 7 thuật toán.', 'alg'], ['gauge', 'Phân tích tải CPU', 'Tạo kịch bản quá tải, phân tích và áp dụng thuật toán tối ưu.', 'load'], ['chart', 'Kết quả', 'Gantt, chỉ số, sơ đồ trạng thái và so sánh 7 thuật toán.', 'res']].map(fc).join('')}</div></section>`;
    },

    alg() {
        const AL_TAGS = {
            FCFS: { mode: 'Không ngắt (Non-preemptive)', badge: 'FCFS' },
            SJF: { mode: 'Không ngắt (Non-preemptive)', badge: 'SJF' },
            SRTF: { mode: 'Có ngắt (Preemptive)', badge: 'SRTF' },
            PRIO: { mode: 'Hỗ trợ ngắt & không ngắt', badge: 'Priority' },
            RR: { mode: 'Có ngắt (Time Quantum)', badge: 'Round Robin' },
            MLQ: { mode: 'Đa cấp cố định (Multilevel)', badge: 'MLQ' },
            MLFQ: { mode: 'Đa cấp phản hồi (Feedback)', badge: 'MLFQ' }
        };

        return `<section class="pg"><h1>Các thuật toán lập lịch</h1><p class="mu">Bấm “Chạy thuật toán này” để mô phỏng tập tiến trình hiện tại. Với Priority, số nhỏ nghĩa là ưu tiên cao.</p><div class="alg-grid">` +
            AL.map(a => {
                const meta = AL_TAGS[a[0]] || { mode: 'Tiêu chuẩn', badge: a[0] };
                return `<div class="card alg-card">` +
                    `<div class="alg-head"><div><h3>${NM[a[0]]}</h3><span class="alg-mode">${meta.mode}</span></div><span class="alg-badge">${meta.badge}</span></div>` +
                    `<div class="alg-body">` +
                    `<p class="alg-desc">${a[1]}</p>` +
                    `<div class="alg-details">` +
                    `<div class="alg-box ok-box"><b class="ok">Ưu điểm:</b> ${a[2]}</div>` +
                    `<div class="alg-box over-box"><b class="hi">Hạn chế:</b> ${a[3]}</div>` +
                    `</div>` +
                    `</div>` +
                    `<div class="alg-footer"><button class="bt" onclick="S.algo='${a[0]}';go('res')">${svg('run', 15, 2)}Chạy thuật toán này</button></div>` +
                    `</div>`;
            }).join('') +
            `</div></section>`;
    },

    res() {
        if (!S.procs.length) {
            return `<section class="pg"><h1>Kết quả mô phỏng</h1><p class="mu">Chưa có tiến trình để mô phỏng.</p><button class="bt" onclick="sample();go('res')">Nạp tập mẫu</button> <button class="bt g" onclick="go('vm')">Tạo trên máy tính ảo</button></section>`;
        }
        S.fin = true;
        simStop();
        if (!S.algo) S.algo = 'FCFS';
        const r = S.r = sim(S.procs, S.algo, S.q, S.pp);
        S.cur = r.T;
        const t = S.cur;

        return `<section class="pg"><h1>Kết quả mô phỏng: ${NM[S.algo]}</h1>` +
            `<p class="mu">${AL.find(a => a[0] == S.algo)?.[1] || ''}</p>` +
            `<div class="bar">${ctrl('res')}</div>` +
            `<h2>Mô phỏng theo thời gian thực</h2>${simUI(r, t)}` +
            `<h2>Chi tiết tiến trình tại t = <span id="tv-tbl">${t}</span></h2>` +
            `<div class="sc" id="pt-sim">${processTableHTML(r, t)}</div>` +
            `<h2>Chỉ số hiệu suất</h2>` +
            `<div class="kpi" id="kpi-sim">${kpiCardsHTML(r, t)}</div>` +
            `<h2>So sánh 7 thuật toán trên cùng tập tiến trình</h2>${cmpT(cmp(S.procs))}</section>`;
    },

    load() {
        let h = `<section class="pg"><h1>Phân tích tải CPU</h1><p class="mu">Tạo kịch bản tải thực tế, hệ thống chạy tập tiến trình trên các thuật toán, phân tích nguyên nhân và đề xuất phương án tối ưu.</p>` +
            `<div class="bar"><select id="sc" aria-label="Kịch bản">${SC.map(s => `<option value="${s[0]}" ${s[0] == S.sc ? 'selected' : ''}>${s[1]}</option>`).join('')}</select> Số tiến trình <input id="nn" type="number" min="5" max="40" value="${S.n}" style="width:72px"> <button class="bt" onclick="mkLoad()">${svg('run', 16, 2)}Tạo tải và phân tích</button></div>`;

        const L = S.load;
        if (!L) return h + `<div class="card">Chưa có kịch bản tải. Hãy chọn kịch bản ở trên rồi nhấn “Tạo tải và phân tích”.</div></section>`;

        const scInfo = SC_INFO[L.sc] || SC_INFO.burst;
        const rows = cmp(L.P);
        const r = rows.find(x => x.id == (S.algo || 'FCFS'))?.r || rows[0].r;
        S.loadSim = r;
        if (S.loadCur == null || S.loadCur > r.T) S.loadCur = r.T;
        const t = S.loadCur;

        const n = L.P.length;
        const ac = L.P.reduce((s, p) => s + p.cpu, 0) / n;
        const ratio = r.wt / ac;
        const st = ratio >= 4 && r.u > 88 ? ['Quá tải nghiêm trọng', 'over'] : ratio >= 1.5 ? ['Tải cao', 'hi'] : ['Bình thường', 'ok'];

        const d = [];
        d.push(`Hàng đợi sẵn sàng đạt tối đa ${r.mq} tiến trình. Thời gian chờ trung bình là ${r.wt.toFixed(1)}, gấp ${ratio.toFixed(1)} lần CPU Burst trung bình (${ac.toFixed(1)}).`);
        const sv = r.m.reduce((a, b) => b.wt > a.wt ? b : a);
        if (sv.wt >= 2.5 * r.wt && sv.wt - r.wt >= 4) {
            d.push(`Phát hiện nguy cơ Starvation: Tác vụ P${sv.pid} (ưu tiên ${sv.pr}, burst ${sv.cpu}) phải chờ ${sv.wt} đơn vị thời gian (gấp ${(sv.wt / Math.max(r.wt, 0.1)).toFixed(1)} lần mức chờ trung bình).`);
        } else {
            d.push('Thời gian chờ giữa các tiến trình tương đối đồng đều, chưa ghi nhận dấu hiệu bị bỏ đói nghiêm trọng.');
        }
        const io = r.m.filter(x => x.type == 'IO');
        if (io.length) {
            const ir = io.reduce((s, x) => s + x.rt, 0) / io.length;
            d.push(`Thời gian phản hồi trung bình của ${io.length} tác vụ tương tác là ${ir.toFixed(1)} đơn vị thời gian (${ir > 4 ? 'chậm, nên dùng thuật toán có chia lát thời gian như Round Robin hoặc MLFQ' : 'đạt mức tốt'}).`);
        }

        const best = k => rows.reduce((a, b) => b.r[k] < a.r[k] ? b : a);
        const recRows = [
            ['Giảm thời gian chờ trung bình', 'wt', 'Chờ TB'],
            ['Cải thiện tốc độ phản hồi', 'rt', 'Phản hồi TB'],
            ['Tăng tính công bằng, tránh Starvation', 'mw', 'Chờ tối đa']
        ].map(([goal, metric, metricLabel]) => {
            const b = best(metric);
            const isApplied = S.algo === b.id;
            return `<tr>` +
                `<td><b>${NM[b.id]}</b></td>` +
                `<td>${goal}</td>` +
                `<td>${metricLabel} = ${b.r[metric].toFixed(1)} (tốt nhất trong 7 thuật toán)</td>` +
                `<td>${LIM[b.id]}</td>` +
                `<td><button class="bt sm ${isApplied ? 'g' : ''}" onclick="applyAlgo('${b.id}')">${isApplied ? '✓ Đang áp dụng' : 'Áp dụng'}</button></td>` +
                `</tr>`;
        }).join('');

        const appliedBadge = L.appliedAlgo ?
            `<div class="card" style="background:var(--okbg);border-color:var(--ok);color:var(--ok);margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between"><span><strong>✓ Đã áp dụng thuật toán: ${NM[L.appliedAlgo]}</strong> cho kịch bản này. Kết quả mô phỏng bên dưới đã được tính toán lại.</span><button class="bt sm" onclick="go('res')">Mở trang Kết quả đầy đủ →</button></div>` : '';

        const procListHtml = `<div class="sc" style="max-height:220px"><table><tr><th>PID<th>Tên tác vụ<th>Loại<th>Thời điểm đến (Arrival)<th>CPU Burst<th>Priority</tr>` +
            L.P.map(p => `<tr><td><b>P${p.pid}</b></td><td>${p.name}</td><td>${p.type}</td><td>${p.at}</td><td>${p.cpu}</td><td>${p.pr}</td></tr>`).join('') +
            `</table></div>`;

        return h +
            `<div class="card" style="margin-bottom:16px">` +
            `<h3>${scInfo.title}</h3>` +
            `<p>${scInfo.desc}</p>` +
            `<p><b class="hi">Nguyên nhân tải:</b> ${scInfo.cause}</p>` +
            `<p><b class="ok">Định hướng giải quyết:</b> ${scInfo.rec}</p>` +
            `</div>` +
            appliedBadge +
            `<h2>Tập tiến trình của kịch bản (${n} tiến trình)</h2>${procListHtml}` +
            `<h2>Giám sát mô phỏng kịch bản (${(S.algo && NM[S.algo]) || NM[rows[0].id]})</h2>` +
            `<div class="bar">Đang xem theo: ${ctrl('load')}</div>` +
            simUI(r, t) +
            `<h2>Chỉ số tải và hiệu năng</h2>` +
            `<div class="kpi">` +
            `<div><b>${r.u.toFixed(1)}%</b>CPU mô phỏng</div>` +
            `<div><b>${r.mq}</b>Ready Queue tối đa</div>` +
            `<div><b>${r.wt.toFixed(1)}</b>TB thời gian chờ</div>` +
            `<div><b>${n}/${n}</b>Hoàn thành sau ${r.T} đv</div>` +
            `<div><b>${r.thr.toFixed(3)}</b>Throughput</div>` +
            `<div><b class="${st[1]}">${st[0]}</b>Đánh giá tải</div>` +
            `</div>` +
            `<div class="card"><h3 style="margin-top:0">Nhận xét chuyên sâu từ kết quả mô phỏng</h3><ul>${d.map(x => `<li>${x}</li>`).join('')}</ul></div>` +
            `<h2>Thuật toán đề xuất & Hành động</h2>` +
            `<div class="sc"><table><tr><th>Thuật toán<th>Mục tiêu tối ưu<th>Căn cứ thực nghiệm<th>Đánh đổi cần lưu ý<th>Thao tác</tr>${recRows}</table></div>` +
            `<h2>So sánh 7 thuật toán trên tập tiến trình kịch bản này</h2>${cmpT(rows)}</section>`;
    },

    about() {
        return `<section class="pg">` +
            `<div class="hero">` +
            `<div class="hc">` +
            `<span class="ey">HỆ ĐIỀU HÀNH • MÔ PHỎNG HỌC THUẬT</span>` +
            `<h1>Giới thiệu hệ thống</h1>` +
            `<p>CPU Scheduling Simulator là nền tảng mô phỏng tương tác trực quan các thuật toán lập lịch CPU kinh điển, phục vụ giảng dạy, học tập và nghiên cứu môn Hệ điều hành.</p>` +
            `<div class="bar" style="margin:0;gap:12px">` +
            `<button class="bt hb" onclick="go('home')">Vào Trang chủ ${svg('arrow', 18, 2)}</button>` +
            `<button class="bt g" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)" onclick="go('vm')">Máy tính ảo</button>` +
            `</div>` +
            `</div>` +
            `<div class="hv">${HERO_SVG}</div>` +
            `</div>` +

            `<h2>Tính năng cốt lõi của hệ thống</h2>` +
            `<div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px;">` +
            `<div class="card fc" style="align-items:flex-start;text-align:left;padding:22px">` +
            `<span class="bd" style="margin:0 0 14px 0">${svg('clock', 24)}</span>` +
            `<h3 style="font-size:16px;margin-bottom:6px">Mô phỏng thời gian thực</h3>` +
            `<p class="mu" style="max-width:none;font-size:13.5px;margin-bottom:0">Quan sát từng tích tắc CPU được cấp phát. Hỗ trợ Chạy tự động, Tạm dừng, Đi từng bước (Step-by-step), Đặt lại và thanh trượt tua thời gian tùy ý.</p>` +
            `</div>` +
            `<div class="card fc" style="align-items:flex-start;text-align:left;padding:22px">` +
            `<span class="bd g" style="margin:0 0 14px 0">${svg('bars', 24)}</span>` +
            `<h3 style="font-size:16px;margin-bottom:6px">7 Thuật toán kinh điển</h3>` +
            `<p class="mu" style="max-width:none;font-size:13.5px;margin-bottom:0">Đầy đủ FCFS, SJF, SRTF, Priority (hỗ trợ có ngắt & không ngắt), Round Robin (tùy chỉnh Quantum), Multilevel Queue và Multilevel Feedback Queue.</p>` +
            `</div>` +
            `<div class="card fc" style="align-items:flex-start;text-align:left;padding:22px">` +
            `<span class="bd" style="margin:0 0 14px 0">${svg('nodes', 24)}</span>` +
            `<h3 style="font-size:16px;margin-bottom:6px">Sơ đồ 5 trạng thái & Ready Queue</h3>` +
            `<p class="mu" style="max-width:none;font-size:13.5px;margin-bottom:0">Trực quan hóa vòng đời tiến trình qua 5 trạng thái chuẩn: New, Ready, Running, Waiting, Terminated đồng bộ tức thời cùng hàng đợi Ready Queue.</p>` +
            `</div>` +
            `<div class="card fc" style="align-items:flex-start;text-align:left;padding:22px">` +
            `<span class="bd g" style="margin:0 0 14px 0">${svg('gauge', 24)}</span>` +
            `<h3 style="font-size:16px;margin-bottom:6px">Phân tích tải & Tối ưu hóa</h3>` +
            `<p class="mu" style="max-width:none;font-size:13.5px;margin-bottom:0">Giả lập 6 kịch bản tải thực tế (quá tải, CPU-bound, tác vụ tương tác, starvation) và đề xuất thuật toán tối ưu có thể áp dụng ngay lập tức.</p>` +
            `</div>` +
            `</div>` +

            `<h2>Quy trình thực thi mô phỏng</h2>` +
            `<div class="card" style="padding:24px">` +
            `<div class="pipeline">` +
            `<div class="pipe-step"><div class="pipe-num">1</div><div><b>Khởi tạo tiến trình</b><p class="mu" style="margin:4px 0 0;font-size:13px">Mở ứng dụng trên máy tính ảo hoặc nhập thời điểm đến (Arrival), CPU Burst và mức ưu tiên (Priority).</p></div></div>` +
            `<div class="pipe-sep">→</div>` +
            `<div class="pipe-step"><div class="pipe-num">2</div><div><b>Chọn thuật toán</b><p class="mu" style="margin:4px 0 0;font-size:13px">Lựa chọn 1 trong 7 thuật toán và thiết lập các tham số như Time Quantum hoặc chế độ Priority có ngắt.</p></div></div>` +
            `<div class="pipe-sep">→</div>` +
            `<div class="pipe-step"><div class="pipe-num">3</div><div><b>Mô phỏng & Quan sát</b><p class="mu" style="margin:4px 0 0;font-size:13px">Theo dõi biểu đồ Gantt, trục thời gian, hàng đợi sẵn sàng và sơ đồ chuyển dịch trạng thái theo thời gian thực.</p></div></div>` +
            `<div class="pipe-sep">→</div>` +
            `<div class="pipe-step"><div class="pipe-num">4</div><div><b>Đánh giá & So sánh</b><p class="mu" style="margin:4px 0 0;font-size:13px">Đối chiếu các chỉ số: Thời gian chờ, Thời gian quay vòng, Phản hồi, CPU Utilization và Throughput giữa các thuật toán.</p></div></div>` +
            `</div>` +
            `</div>` +

            `<h2>Công thức tính toán</h2>` +
            `<div class="sc"><table>` +
            `<tr><th>Chỉ số<th>Ý nghĩa giáo trình<th>Công thức áp dụng</tr>` +
            `<tr><td><b>Thời gian quay vòng (TAT)</b><td>Tổng thời gian từ khi tiến trình đến đến khi hoàn tất<td><code>Turnaround Time = Completion Time - Arrival Time</code></td></tr>` +
            `<tr><td><b>Thời gian chờ (Waiting Time)</b><td>Tổng thời gian tiến trình phải chờ đợi trong Ready Queue<td><code>Waiting Time = Turnaround Time - CPU Burst</code></td></tr>` +
            `<tr><td><b>Thời gian phản hồi (Response Time)</b><td>Thời gian từ khi đến đến lần đầu tiên được cấp CPU<td><code>Response Time = First Run Time - Arrival Time</code></td></tr>` +
            `<tr><td><b>Hiệu suất CPU (CPU Utilization)</b><td>Tỷ lệ thời gian CPU bận thực thi tiến trình trên tổng thời gian<td><code>(Tổng thời gian CPU bận / Tổng thời gian mô phỏng) × 100%</code></td></tr>` +
            `<tr><td><b>Thông lượng (Throughput)</b><td>Số lượng tiến trình hoàn thành trên một đơn vị thời gian<td><code>Số tiến trình hoàn tất / Tổng thời gian đánh giá</code></td></tr>` +
            `<tr><td><b>Chuyển ngữ cảnh (Context Switch)</b><td>Số lần CPU đổi quyền thực thi giữa các tiến trình khác nhau<td><code>Đếm tự động mỗi khi CPU chuyển đổi ngữ cảnh tiến trình</code></td></tr>` +
            `</table></div>` +

            `<div class="card" style="margin-top:28px;background:var(--ac2);border-color:var(--ac);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;padding:24px">` +
            `<div><h3 style="margin:0 0 4px;color:var(--ac)">Sẵn sàng bắt đầu mô phỏng?</h3><p class="mu" style="margin:0;font-size:13.5px">Truy cập Trang chủ hoặc Máy tính ảo để nạp dữ liệu và trải nghiệm trực quan ngay.</p></div>` +
            `<div style="display:flex;gap:10px"><button class="bt" onclick="go('home')">Vào Trang chủ</button><button class="bt g" onclick="go('vm')">Máy tính ảo</button></div>` +
            `</div></section>`;
    },

    contact() {
        return `<section class="pg">` +
            `<div class="hero" style="background: linear-gradient(135deg, #1e3a8a, #0284c7); margin-bottom: 24px; padding: 36px 40px;">` +
            `<div class="hc" style="max-width:none">` +
            `<span class="ey" style="color:#bae6fd">KẾT NỐI & HỖ TRỢ HỌC THUẬT</span>` +
            `<h1 style="font-size:32px">Liên hệ & Đóng góp ý kiến</h1>` +
            `<p style="margin-bottom:0;max-width:62ch;color:#e0f2fe">Hệ thống luôn sẵn sàng lắng nghe mọi góp ý từ sinh viên và giảng viên để hoàn thiện mô phỏng chính xác và trực quan hơn.</p>` +
            `</div>` +
            `</div>` +

            `<div class="contact-grid">` +
            `<div style="display:flex;flex-direction:column;gap:18px">` +
            `<div class="card">` +
            `<h3 style="margin-top:0;display:flex;align-items:center;gap:8px">${svg('globe', 20)} Thông tin dự án</h3>` +
            `<p class="mu" style="font-size:13.5px;line-height:1.65;margin:0">` +
            `<b>Đề tài:</b> CPU Scheduling Simulator (Mô phỏng lập lịch CPU).<br>` +
            `<b>Môn học:</b> Hệ điều hành (Operating Systems).<br>` +
            `<b>Mục tiêu:</b> Phục vụ trực quan hóa bài giảng và hỗ trợ làm đồ án môn học.<br>` +
            `<b>Nền tảng:</b> Thuần Web (HTML5/CSS3/JavaScript), không cần cài đặt thêm phần mềm.` +
            `</p>` +
            `</div>` +

            `<div class="card">` +
            `<h3 style="margin-top:0;display:flex;align-items:center;gap:8px">${svg('check', 20)} Câu hỏi thường gặp (FAQ)</h3>` +
            `<div class="faq-list">` +
            `<div class="faq-item"><b>Hệ thống có hoạt động ngoại tuyến (Offline) không?</b><p class="mu">Có. Ứng dụng chạy 100% trong trình duyệt của bạn (Client-side), hoàn toàn không cần kết nối mạng hay máy chủ.</p></div>` +
            `<div class="faq-item"><b>Dữ liệu tiến trình có bị lộ ra ngoài không?</b><p class="mu">Không. Toàn bộ tiến trình chỉ lưu trong bộ nhớ tạm phiên làm việc hiện tại, đảm bảo an toàn tuyệt đối.</p></div>` +
            `<div class="faq-item"><b>Làm sao để so sánh đối chiếu 7 thuật toán?</b><p class="mu">Tại trang<b>Kết quả</b>hoặc<b>Phân tích tải CPU</b>, hệ thống tự động tổng hợp bảng so sánh và đánh dấu xanh giá trị tối ưu nhất.</p></div>` +
            `</div>` +
            `</div>` +

            `<div class="card" style="background:var(--okbg);border-color:var(--ok)">` +
            `<h4 style="margin:0 0 6px;color:var(--ok);font-size:14.5px">Hỗ trợ giảng dạy trên lớp</h4>` +
            `<p class="mu" style="margin:0;font-size:13px;color:var(--tx)">Giảng viên và sinh viên có thể trình chiếu trực tiếp trên máy chiếu để minh họa diễn biến hàng đợi, sự kiện ngắt và chuyển ngữ cảnh trong giờ học.</p>` +
            `</div>` +
            `</div>` +

            `<div>` +
            `<div class="card">` +
            `<h3 style="margin-top:0;display:flex;align-items:center;gap:8px">${svg('note', 20)} Gửi thư đóng góp ý kiến</h3>` +
            `<p class="mu" style="font-size:13.5px;margin-bottom:18px">Điền thông tin bên dưới nếu bạn muốn đề xuất tính năng mới, báo cáo vấn đề hoặc gửi câu hỏi về thuật toán.</p>` +
            `<form class="fm" style="max-width:none" onsubmit="return handleContactSubmit(event)">` +
            `<div class="form-row">` +
            `<label><span>Họ và tên <b style="color:var(--er)">*</b></span><input id="cf-name" placeholder="Nguyễn Văn A" required></label>` +
            `<label><span>Email liên hệ <b style="color:var(--er)">*</b></span><input id="cf-email" type="email" placeholder="student@university.edu.vn" required></label>` +
            `</div>` +
            `<div class="form-row">` +
            `<label><span>Chủ đề</span><select id="cf-topic"><option>Góp ý cải tiến giao diện</option><option>Báo lỗi thuật toán lập lịch</option><option>Đề xuất thêm tính năng mới</option><option>Câu hỏi học tập môn Hệ điều hành</option><option>Khác</option></select></label>` +
            `<label><span>Thuật toán quan tâm</span><select id="cf-algo"><option>Tất cả các thuật toán</option><option>FCFS</option><option>SJF / SRTF</option><option>Round Robin</option><option>Priority Scheduling</option><option>MLQ / MLFQ</option></select></label>` +
            `</div>` +
            `<label><span>Nội dung góp ý <b style="color:var(--er)">*</b></span><textarea id="cf-msg" rows="5" placeholder="Mô tả chi tiết câu hỏi, trường hợp cần kiểm tra hoặc ý tưởng cải tiến của bạn..." required></textarea></label>` +
            `<button class="bt" type="submit" style="margin-top:6px">${svg('arrow', 16, 2)} Gửi phản hồi ngay</button>` +
            `<div id="cf-alert" style="display:none;margin-top:14px;padding:12px 16px;border-radius:8px;font-size:13.5px"></div>` +
            `</form>` +
            `</div>` +
            `</div>` +
            `</div></section>`;
    }
};

function handleContactSubmit(e) {
    e.preventDefault();
    const alertEl = $('#cf-alert');
    const name = $('#cf-name') ? $('#cf-name').value : 'bạn';
    if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = 'var(--okbg)';
        alertEl.style.color = 'var(--ok)';
        alertEl.style.border = '1px solid var(--ok)';
        alertEl.innerHTML = `<strong>✓ Cảm ơn ${name}!</strong> Góp ý của bạn đã được ghi nhận vào phiên làm việc hiện tại.`;
        setTimeout(() => {
            if ($('#cf-msg')) $('#cf-msg').value = '';
        }, 1500);
    }
    return false;
}

/* CPU Scheduling Simulator - Core Simulation Engine */
function sim(P0, algo, q, pp) {
    if (!P0 || !P0.length) return null;
    q = Math.max(1, +q || 3);
    const P = P0.map((p, idx) => ({
        idx,
        pid: p.pid,
        name: p.name || ('P' + p.pid),
        type: p.type || 'HH',
        at: Math.max(0, +p.at || 0),
        cpu: Math.max(1, +p.cpu || 1),
        io: Math.max(0, +p.io || 0),
        pr: +p.pr || 0,
        rem: Math.max(1, +p.cpu || 1),
        lvl: 0,
        usedQ: 0,
        firstRun: null,
        ct: null,
        wt: 0
    }));
    const n = P.length;
    let t = 0, cur = null, lastPid = null;
    let cs = 0, busy = 0, done = 0;
    const gantt = [];
    const events = [];
    const snapshots = [];
    const Q = algo === 'MLQ' ? [[], []] : algo === 'MLFQ' ? [[], [], []] : [[]];

    function logEv(time, pid, from, to, reason) {
        events.push({ t: time, pid, from, to, reason });
    }

    function recordSnapshot(now) {
        const readyList = [];
        if (algo === 'MLQ') {
            for (let l = 0; l < 2; l++) {
                for (let p of Q[l]) readyList.push({ idx: p.idx, pid: p.pid, name: p.name, rem: p.rem, pr: p.pr, lvl: l });
            }
        } else if (algo === 'MLFQ') {
            for (let l = 0; l < 3; l++) {
                for (let p of Q[l]) readyList.push({ idx: p.idx, pid: p.pid, name: p.name, rem: p.rem, pr: p.pr, lvl: l });
            }
        } else {
            for (let p of Q[0]) readyList.push({ idx: p.idx, pid: p.pid, name: p.name, rem: p.rem, pr: p.pr, lvl: 0 });
        }

        const procStats = P.map(p => {
            let st = 'New';
            if (p.ct !== null && p.ct <= now) st = 'Terminated';
            else if (cur && cur.pid === p.pid) st = 'Running';
            else if (p.at <= now) st = 'Ready';
            return {
                idx: p.idx,
                pid: p.pid,
                name: p.name,
                type: p.type,
                at: p.at,
                cpu: p.cpu,
                io: p.io,
                pr: p.pr,
                rem: p.rem,
                lvl: p.lvl,
                state: st,
                wt: p.wt,
                tat: (p.ct !== null && p.ct <= now) ? (p.ct - p.at) : (p.at <= now ? now - p.at : 0),
                rt: p.firstRun !== null && p.firstRun <= now ? (p.firstRun - p.at) : null,
                ct: p.ct !== null && p.ct <= now ? p.ct : null
            };
        });

        snapshots.push({
            t: now,
            curRunningPid: cur ? cur.pid : -1,
            readyList,
            procStats,
            busy,
            cs,
            done,
            u: now > 0 ? (busy / now * 100) : 0,
            thr: now > 0 ? (done / now) : 0,
            eventsUpToT: events.slice()
        });
    }

    while (done < n && t < 10000) {
        // 1. Tiến trình đến tại thời điểm t
        const arriving = P.filter(p => p.at === t);
        for (let p of arriving) {
            logEv(t, p.pid, 'New', 'Ready', 'Đến hệ thống, vào hàng đợi sẵn sàng');
            if (algo === 'MLQ') {
                p.lvl = (p.type === 'CPU') ? 1 : 0;
                Q[p.lvl].push(p);
            } else if (algo === 'MLFQ') {
                p.lvl = 0;
                p.usedQ = 0;
                Q[0].push(p);
            } else {
                Q[0].push(p);
            }
        }

        // 2. Kiểm tra hết Quantum hoặc Tiền đình (Preemption)
        if (cur !== null) {
            let qLimit = 1e9;
            if (algo === 'RR') qLimit = q;
            else if (algo === 'MLQ') qLimit = (cur.lvl === 0) ? q : 1e9;
            else if (algo === 'MLFQ') qLimit = (cur.lvl === 0) ? q : (cur.lvl === 1) ? 2 * q : 1e9;

            if (cur.usedQ >= qLimit) {
                if (algo === 'MLFQ') {
                    cur.lvl = Math.min(2, cur.lvl + 1);
                    cur.usedQ = 0;
                    logEv(t, cur.pid, 'Running', 'Ready', 'Hết Quantum (' + qLimit + '), chuyển xuống Q' + cur.lvl);
                    Q[cur.lvl].push(cur);
                } else if (algo === 'MLQ') {
                    cur.usedQ = 0;
                    logEv(t, cur.pid, 'Running', 'Ready', 'Hết Quantum, quay lại cuối Q' + cur.lvl);
                    Q[cur.lvl].push(cur);
                } else if (algo === 'RR') {
                    cur.usedQ = 0;
                    logEv(t, cur.pid, 'Running', 'Ready', 'Hết Quantum (' + q + '), quay lại cuối hàng đợi');
                    Q[0].push(cur);
                }
                cur = null;
            } else {
                let preempt = false, reason = '';
                if (algo === 'SRTF') {
                    let minP = null;
                    for (let p of Q[0]) {
                        if (!minP || p.rem < minP.rem || (p.rem === minP.rem && p.at < minP.at)) minP = p;
                    }
                    if (minP && minP.rem < cur.rem) {
                        preempt = true;
                        reason = 'Bị ngắt bởi P' + minP.pid + ' có thời gian còn lại ngắn hơn (' + minP.rem + ' < ' + cur.rem + ')';
                        Q[0].push(cur);
                    }
                } else if (algo === 'PRIO' && pp) {
                    let minP = null;
                    for (let p of Q[0]) {
                        if (!minP || p.pr < minP.pr || (p.pr === minP.pr && p.at < minP.at)) minP = p;
                    }
                    if (minP && minP.pr < cur.pr) {
                        preempt = true;
                        reason = 'Bị ngắt bởi P' + minP.pid + ' có ưu tiên cao hơn (' + minP.pr + ' < ' + cur.pr + ')';
                        Q[0].push(cur);
                    }
                } else if (algo === 'MLQ') {
                    if (cur.lvl === 1 && Q[0].length > 0) {
                        preempt = true;
                        reason = 'Bị ngắt bởi tiến trình ở hàng đợi Q0 ưu tiên hơn';
                        Q[1].unshift(cur);
                    }
                } else if (algo === 'MLFQ') {
                    let hasHigher = false;
                    for (let l = 0; l < cur.lvl; l++) {
                        if (Q[l].length > 0) { hasHigher = true; break; }
                    }
                    if (hasHigher) {
                        preempt = true;
                        reason = 'Bị ngắt bởi tiến trình ở hàng đợi ưu tiên cao hơn';
                        Q[cur.lvl].unshift(cur);
                    }
                }
                if (preempt) {
                    logEv(t, cur.pid, 'Running', 'Ready', reason);
                    cur = null;
                }
            }
        }

        // 3. Dispatch CPU
        if (cur === null) {
            if (algo === 'SJF') {
                if (Q[0].length > 0) {
                    let b = 0;
                    for (let i = 1; i < Q[0].length; i++) {
                        if (Q[0][i].cpu < Q[0][b].cpu || (Q[0][i].cpu === Q[0][b].cpu && Q[0][i].at < Q[0][b].at)) b = i;
                    }
                    cur = Q[0].splice(b, 1)[0];
                    cur.usedQ = 0;
                }
            } else if (algo === 'SRTF') {
                if (Q[0].length > 0) {
                    let b = 0;
                    for (let i = 1; i < Q[0].length; i++) {
                        if (Q[0][i].rem < Q[0][b].rem || (Q[0][i].rem === Q[0][b].rem && Q[0][i].at < Q[0][b].at)) b = i;
                    }
                    cur = Q[0].splice(b, 1)[0];
                    cur.usedQ = 0;
                }
            } else if (algo === 'PRIO') {
                if (Q[0].length > 0) {
                    let b = 0;
                    for (let i = 1; i < Q[0].length; i++) {
                        if (Q[0][i].pr < Q[0][b].pr || (Q[0][i].pr === Q[0][b].pr && Q[0][i].at < Q[0][b].at)) b = i;
                    }
                    cur = Q[0].splice(b, 1)[0];
                    cur.usedQ = 0;
                }
            } else if (algo === 'MLQ') {
                if (Q[0].length > 0) {
                    cur = Q[0].shift();
                    cur.usedQ = 0;
                } else if (Q[1].length > 0) {
                    cur = Q[1].shift();
                    cur.usedQ = 0;
                }
            } else if (algo === 'MLFQ') {
                for (let l = 0; l < 3; l++) {
                    if (Q[l].length > 0) {
                        cur = Q[l].shift();
                        break;
                    }
                }
            } else {
                if (Q[0].length > 0) {
                    cur = Q[0].shift();
                    cur.usedQ = 0;
                }
            }

            if (cur !== null) {
                if (cur.firstRun === null) cur.firstRun = t;
                if (lastPid !== null && lastPid !== cur.pid) cs++;
                lastPid = cur.pid;
                logEv(t, cur.pid, 'Ready', 'Running', 'Được cấp CPU thực thi');
            }
        }

        recordSnapshot(t);

        // 4. Gantt
        const pid = (cur !== null) ? cur.pid : -1;
        const lastG = gantt[gantt.length - 1];
        if (lastG && lastG.pid === pid && lastG.e === t) {
            lastG.e++;
        } else {
            gantt.push({ pid, s: t, e: t + 1 });
        }

        // 5. Execute 1 unit [t, t+1)
        if (cur !== null) {
            cur.rem--;
            cur.usedQ++;
            busy++;
        }

        for (let l = 0; l < Q.length; l++) {
            for (let p of Q[l]) p.wt++;
        }

        if (cur !== null && cur.rem === 0) {
            cur.ct = t + 1;
            done++;
            logEv(t + 1, cur.pid, 'Running', 'Terminated', 'Hoàn thành tiến trình');
            cur = null;
        }

        t++;
    }

    recordSnapshot(t);

    const T = t;
    const m = P.map(p => ({
        idx: p.idx,
        pid: p.pid,
        name: p.name,
        type: p.type,
        at: p.at,
        cpu: p.cpu,
        io: p.io,
        pr: p.pr,
        ct: p.ct,
        firstRun: p.firstRun,
        tat: p.ct - p.at,
        wt: p.ct - p.at - p.cpu,
        rt: p.firstRun - p.at
    }));
    const avg = k => m.reduce((s, x) => s + x[k], 0) / n;
    const mq = Math.max(...snapshots.map(s => s.readyList.length));
    return {
        g: gantt,
        m,
        P,
        T,
        wt: avg('wt'),
        tat: avg('tat'),
        rt: avg('rt'),
        thr: T > 0 ? (n / T) : 0,
        u: T > 0 ? (busy / T * 100) : 0,
        cs,
        mq,
        mw: Math.max(...m.map(x => x.wt)),
        snapshots,
        events
    };
}

const cmp = P => AL.map(a => ({ id: a[0], r: sim(P, a[0], S.q, S.pp) }));

function cmpT(rows) {
    if (!rows || !rows.length) return '';
    const f = (k, b) => Math[b == 'max' ? 'max' : 'min'](...rows.map(x => x.r[k])),
        c = (x, k, d, b) => `<td class="${x.r[k] == f(k, b) ? 'bst' : ''}">${x.r[k].toFixed(d)}`;
    return `<div class="sc"><table><tr><th>Thuật toán<th>TB chờ<th>TB quay vòng<th>TB phản hồi<th>Throughput<th>CPU %<th>Đổi ngữ cảnh<th>Chờ tối đa</tr>` +
        rows.map(x => `<tr><td><b>${NM[x.id]}</b>${c(x, 'wt', 2)}${c(x, 'tat', 2)}${c(x, 'rt', 2)}${c(x, 'thr', 3, 'max')}${c(x, 'u', 1, 'max')}${c(x, 'cs', 0)}${c(x, 'mw', 0)}</tr>`).join('') +
        `</table></div><p class="mu">Ô màu xanh đậm là giá trị tốt nhất theo từng chỉ số giữa 7 thuật toán.</p>`;
}

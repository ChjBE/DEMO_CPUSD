/* CPU Scheduling Simulator - Load Analysis & Recommendation Engine */
function mkLoad() {
    simStop();
    S.sc = $('#sc').value;
    S.n = Math.min(40, Math.max(5, +$('#nn').value || 12));
    const n = S.n, sc = S.sc, R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), P = [];
    for (let i = 0; i < n; i++) {
        let at, cpu, type = 'HH', pr = R(1, 5);
        if (sc == 'burst') { at = R(0, 2); cpu = R(2, 8); }
        else if (sc == 'cpu') { at = R(0, Math.floor(n * 0.8)); cpu = R(10, 20); type = 'CPU'; }
        else if (sc == 'mixed') { at = R(0, n * 2); if (i % 2) { type = 'IO'; cpu = R(1, 4); } else { type = 'CPU'; cpu = R(8, 15); } }
        else if (sc == 'inter') { if (i == 0) { at = 0; cpu = 20; type = 'CPU'; pr = 4; } else { at = R(0, Math.round(n * 1.5)); cpu = R(1, 3); type = 'IO'; pr = R(1, 3); } }
        else if (sc == 'hiprio') { at = R(0, n * 2); if (i % 5 == 0) { pr = 5; cpu = R(5, 9); } else { pr = R(1, 2); cpu = R(3, 7); } }
        else { // starve
            if (i == 0) { at = 0; cpu = 6; pr = 9; }
            else { at = i * 2 - 1; cpu = R(3, 5); pr = 1; }
        }
        P.push({ pid: i + 1, name: 'Tác vụ ' + (i + 1), type, at, cpu, io: type == 'IO' ? R(1, 4) : 0, pr });
    }
    S.load = { P, sc, appliedAlgo: null };
    S.loadSim = sim(P, S.algo, S.q, S.pp);
    S.loadCur = S.loadSim.T;
    go('load', 1);
}

function applyAlgo(algoId) {
    if (!S.load) return;
    simStop();
    S.algo = algoId;
    S.load.appliedAlgo = algoId;
    S.procs = S.load.P.map(p => ({ ...p }));
    S.fin = false;
    S.loadSim = sim(S.load.P, algoId, S.q, S.pp);
    S.r = S.loadSim;
    S.loadCur = S.loadSim.T;
    S.cur = S.r.T;
    go('load', 1);
}

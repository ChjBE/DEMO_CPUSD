/* CPU Scheduling Simulator - Global Application State */
const $ = s => document.querySelector(s);

const S = {
    view: 'home',
    procs: [],
    pid: 1,
    t0: Date.now(),
    algo: null,
    q: 3,
    pp: true,
    fin: false,
    z: 5,
    wn: 0,
    sc: 'starve',
    n: 12,
    load: null,
    r: null,
    cur: 0,
    tm: null,
    loadSim: null,
    loadCur: 0
};

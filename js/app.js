/* CPU Scheduling Simulator - Application Entry & Router */
function go(v, preserveScroll) {
    S.view = v;
    const isVm = (v === 'vm');
    $('#vm').hidden = !isVm;
    $('#v').hidden = isVm;
    if (!isVm) {
        $('#v').innerHTML = V[v]();
        simBtn();
    } else {
        tbl();
    }
    $('#nav').innerHTML = `<span class="lg">${svg('chip', 30, 1.7)}<b>CPU Scheduling Simulator</b></span>` +
        TABS.map(t => `<button class="${t[0] == v ? 'on' : ''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('');
    if (!preserveScroll) scrollTo(0, 0);
}

// Khởi tạo Desktop ảo
$('#vm').innerHTML = `<section class="pg"><h1>Máy tính ảo</h1><p class="mu">Nhấp vào biểu tượng để mở ứng dụng; mỗi lần mở sẽ sinh một tiến trình mô phỏng tương ứng vào hệ thống. Bạn có thể kéo di chuyển cửa sổ bằng thanh tiêu đề.</p>` +
    `<div class="dk" id="dk">${APPS.map((a, i) => `<button class="ic" onclick="openApp(${i})"><span class="tile">${ico(a[1], 26)}</span>${a[0]}</button>`).join('')}` +
    `<div class="tk"><div class="st"><i></i><i></i><i></i><i></i></div><div class="se">${svg('search', 16)}<span>Tìm kiếm...</span></div><div id="tbi"></div><div class="cl" id="clk"></div></div></div>` +
    `<h2>Danh sách tiến trình</h2>` +
    `<form class="bar" onsubmit="return addP(event)">` +
    `<input name="nm" placeholder="Tên tiến trình">` +
    `<select name="ty"><option>CPU</option><option>IO</option><option selected>HH</option></select>` +
    `<input name="at" type="number" min="0" placeholder="Arrival" style="width:84px">` +
    `<input name="cpu" type="number" min="1" placeholder="CPU" style="width:70px">` +
    `<input name="io" type="number" min="0" placeholder="I/O" style="width:70px">` +
    `<input name="pr" type="number" min="0" placeholder="Priority" style="width:96px">` +
    `<button class="bt">Thêm tiến trình</button>` +
    `<button type="button" class="bt g" onclick="sample()">Nạp tập mẫu</button>` +
    `<button type="button" class="bt g" onclick="S.procs=[];S.fin=false;tbl()">Xóa tất cả</button>` +
    `</form>` +
    `<div class="sc" id="pt"></div>` +
    `<div class="bar"><button class="bt g" onclick="go('alg')">Chọn thuật toán</button><button class="bt" onclick="go('res')">Chạy mô phỏng</button></div>` +
    `<p class="mu">Loại tiến trình: CPU = CPU-bound (thiên về tính toán), IO = I/O-bound (thiên về nhập xuất), HH = hỗn hợp.</p></section>`;

// Kích hoạt
clk();
setInterval(clk, 15000);
go('home');

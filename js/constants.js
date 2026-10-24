/* CPU Scheduling Simulator - Constants & Helpers */
const IC = {
    chip: '<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    nodes: '<circle cx="12" cy="5.5" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M10.8 7.8L6.8 15.7M13.2 7.8l4 7.9"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    bars: '<path d="M5 20V13M12 20V4M19 20V9"/>',
    gauge: '<path d="M4.5 18a9 9 0 1 1 15 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1"/>',
    chart: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7 15l3.5-3.5 2.5 2.5 4-5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.5 9.5v5l4-2.5z"/>',
    note: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    run: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    step: '<path d="M5 5.5l9 6.5-9 6.5zM19 5v14"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4.5V9h4.5"/>'
};

const svg = (n, s = 22, w = 1.8) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||IC.chip}</svg>`;
const EM = { '🖥️': 'monitor', '📁': 'folder', '🌐': 'globe', '🧮': 'calc', '▶️': 'play', '📝': 'note', '⚙️': 'gear' };
const ico = (e, s = 20) => svg(EM[e] || 'chip', s);

const HERO_SVG = `<svg viewBox="0 0 520 240" fill="none" aria-hidden="true"><g stroke="#cfe0ff" stroke-width="3" stroke-linecap="round"><path d="M70 22v22M100 22v22M130 22v22M160 22v22M70 196v22M100 196v22M130 196v22M160 196v22M22 70h22M22 100h22M22 130h22M22 160h22M186 70h22M186 100h22M186 130h22M186 160h22"/></g><rect x="44" y="44" width="142" height="152" rx="18" fill="rgba(255,255,255,.08)" stroke="#8fb4ff" stroke-width="3"/><rect x="66" y="68" width="98" height="104" rx="10" fill="rgba(255,255,255,.06)" stroke="#fff" stroke-width="3"/><text x="115" y="130" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#fff">CPU</text><rect x="236" y="30" width="268" height="180" rx="12" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><g stroke="rgba(255,255,255,.18)"><path d="M270 44v152M320 44v152M370 44v152M420 44v152M470 44v152"/></g><rect x="262" y="56" width="62" height="16" rx="3" fill="#5b8cff"/><rect x="298" y="86" width="74" height="16" rx="3" fill="#8fb4ff"/><rect x="352" y="116" width="74" height="16" rx="3" fill="#6f9bff"/><rect x="408" y="146" width="54" height="16" rx="3" fill="#8fb4ff"/><rect x="446" y="176" width="42" height="16" rx="3" fill="#bcd2ff"/></svg>`;

const NM = { FCFS: 'FCFS', SJF: 'SJF', SRTF: 'SRTF', PRIO: 'Priority', RR: 'Round Robin', MLQ: 'Multilevel Queue', MLFQ: 'Multilevel Feedback Queue' };

const AL = [
    ['FCFS', 'Tiến trình đến trước được cấp CPU trước, chạy đến khi xong (không ngắt). Phù hợp khi các tác vụ có độ dài tương đương.', 'Đơn giản, công bằng theo thứ tự đến.', 'Hiệu ứng đoàn xe: tiến trình dài làm tiến trình ngắn chờ lâu.'],
    ['SJF', 'Chọn tiến trình sẵn sàng có CPU Burst ngắn nhất, không ngắt. Cần biết trước thời gian xử lý.', 'Giảm thời gian chờ trung bình.', 'Tiến trình dài có thể bị bỏ đói; phải ước lượng burst.'],
    ['SRTF', 'Phiên bản có ngắt của SJF: luôn chạy tiến trình còn lại ít nhất, tiến trình mới ngắn hơn sẽ giành CPU.', 'Thời gian chờ trung bình thấp nhất trong nhóm dựa trên burst.', 'Đổi ngữ cảnh nhiều; tiến trình dài dễ bị bỏ đói.'],
    ['PRIO', 'Chọn tiến trình có mức ưu tiên cao nhất (số nhỏ = ưu tiên cao). Có thể bật chế độ ngắt; cùng ưu tiên xếp theo thứ tự đến.', 'Phục vụ tác vụ quan trọng trước.', 'Nguy cơ starvation với tiến trình ưu tiên thấp.'],
    ['RR', 'Mỗi tiến trình dùng CPU tối đa một Time Quantum rồi quay lại cuối hàng đợi.', 'Công bằng, phản hồi tốt cho tác vụ tương tác.', 'Quantum quá nhỏ gây đổi ngữ cảnh nhiều; quá lớn thành FCFS.'],
    ['MLQ', 'Hai hàng đợi cố định theo loại tiến trình: hàng 0 (tương tác, Round Robin) ưu tiên hơn hàng 1 (CPU-bound, FCFS).', 'Chính sách riêng cho từng nhóm.', 'Tiến trình không đổi hàng; nhóm thấp có thể bị bỏ đói.'],
    ['MLFQ', 'Ba hàng đợi: Quantum q, 2q rồi FCFS. Tiến trình mới vào hàng cao nhất, dùng hết quantum thì bị đẩy xuống.', 'Ưu tiên tác vụ ngắn mà không cần biết trước burst.', 'Nhiều tham số; tiến trình dài ở hàng thấp có thể chờ lâu.']
];

const LIM = { FCFS: 'Hiệu ứng đoàn xe', SJF: 'Cần biết trước burst; có thể bỏ đói tiến trình dài', SRTF: 'Đổi ngữ cảnh nhiều; có thể bỏ đói tiến trình dài', PRIO: 'Nguy cơ starvation', RR: 'Phụ thuộc Quantum, đổi ngữ cảnh nhiều', MLQ: 'Nhóm cố định, hàng thấp có thể bị bỏ đói', MLFQ: 'Nhiều tham số cần cấu hình' };

const APPS = [['This PC', '🖥️', 'HH', 2, 0, 3, 'Xem ổ đĩa và thiết bị.'], ['Thư mục', '📁', 'IO', 2, 3, 3, 'Mở, đọc và ghi tệp (nhiều chờ I/O).'], ['Trình duyệt', '🌐', 'IO', 4, 3, 3, 'Tải trang và tương tác (CPU xen I/O).'], ['Máy tính', '🧮', 'HH', 2, 0, 2, 'Phép tính với CPU Burst xác định.'], ['Video', '▶️', 'IO', 5, 6, 3, 'Phát video: nhiều giai đoạn CPU xen chờ I/O.'], ['Notepad', '📝', 'IO', 1, 1, 1, 'Soạn văn bản, tác vụ tương tác nhẹ.'], ['Chạy chương trình', '⚙️', 'CPU', 10, 0, 4, 'Chương trình tính toán nặng (CPU-bound).']];

const SC = [['burst', 'Nhiều tiến trình đến cùng lúc'], ['cpu', 'Tải CPU cao'], ['mixed', 'Tải hỗn hợp'], ['inter', 'Tác vụ tương tác'], ['hiprio', 'Tải ưu tiên cao'], ['starve', 'Nguy cơ Starvation']];

const SC_INFO = {
    burst: {
        title: 'Nhiều tiến trình đến cùng lúc (Burst Load)',
        desc: 'Hàng loạt tác vụ đồng loạt xuất hiện tại thời điểm ban đầu hoặc trong khoảng thời gian rất ngắn (ví dụ: máy tính vừa khởi động và tải một loạt dịch vụ).',
        cause: 'Hiệu ứng đoàn xe (Convoy Effect) xảy ra nếu dùng FCFS vì tiến trình dài chiếm CPU khiến các tiến trình ngắn đến cùng lúc phải chờ đợi rất lâu. Tỷ lệ thời gian chờ / CPU burst tăng vọt.',
        rec: 'SJF hoặc SRTF giúp giải phóng nhanh các tiến trình ngắn; Round Robin chia đều thời gian giúp mọi tiến trình phản hồi sớm.'
    },
    cpu: {
        title: 'Tải CPU cao (CPU-bound Workload)',
        desc: 'Tập tác vụ tính toán nặng nề (mã hóa dữ liệu, render video, tính toán khoa học) đòi hỏi thời gian CPU burst rất dài, hầu như không có thời gian nhàn rỗi.',
        cause: 'Mức bận CPU đạt ~100%, hàng đợi tích lũy nhiều tiến trình. Thuật toán có nhiều chuyển ngữ cảnh (như Round Robin với quantum quá nhỏ) sẽ sinh overhead lớn làm chậm thông lượng toàn hệ thống.',
        rec: 'FCFS hoặc SJF giúp tối ưu throughput và giảm thiểu số lần chuyển ngữ cảnh context switch; Round Robin với Quantum lớn.'
    },
    mixed: {
        title: 'Tải hỗn hợp (Mixed CPU-bound & I/O-bound)',
        desc: 'Môi trường thực tế điển hình: bao gồm cả tác vụ tương tác người dùng ngắn (soạn thảo, lướt web) xen lẫn các tác vụ tính toán ngầm kéo dài.',
        cause: 'Nếu dùng thuật toán đơn cấp như FCFS, tác vụ tính toán nặng sẽ chặn đứng tác vụ tương tác. Cần cơ chế phân lớp hàng đợi để phục vụ tác vụ ngắn trước mà không làm tắc nghẽn hệ thống.',
        rec: 'Multilevel Feedback Queue (MLFQ) hoặc Multilevel Queue (MLQ) là tối ưu nhất vì tự động phân tách tác vụ ngắn sang hàng đợi ưu tiên cao, đẩy tác vụ dài xuống hàng đợi thấp.'
    },
    inter: {
        title: 'Tác vụ tương tác (Interactive / Low Latency)',
        desc: 'Người dùng đang thao tác trên giao diện: gõ phím, nhấp chuột, cuộn trang. Yêu cầu quan trọng nhất là thời gian phản hồi (Response Time) phải cực nhỏ để giao diện không bị giật lag.',
        cause: 'Các thuật toán không ngắt (FCFS, SJF) có thể khiến tác vụ tương tác bị trễ hàng chục đơn vị thời gian nếu có một tiến trình dài đang chiếm CPU.',
        rec: 'Round Robin (với Quantum vừa phải) hoặc MLFQ giúp phản hồi tức thì cho người dùng ngay khi có sự kiện.'
    },
    hiprio: {
        title: 'Tải ưu tiên cao (High Priority Dominance)',
        desc: 'Hệ thống có các tác vụ quản trị, tiến trình hạt nhân (kernel) hoặc dịch vụ thời gian thực có mức ưu tiên cao hơn các tác vụ thông thường của người dùng.',
        cause: 'Cần đảm bảo các tiến trình khẩn cấp được phục vụ ngay lập tức. Tuy nhiên, nếu luồng tác vụ ưu tiên cao xuất hiện liên tục thì các tác vụ ưu tiên thấp sẽ có nguy cơ bị đói CPU (Starvation).',
        rec: 'Priority Scheduling (có ngắt) để phục vụ ngay tác vụ cấp bách; kết hợp cơ chế tránh starvation như Round Robin hoặc Aging/MLFQ.'
    },
    starve: {
        title: 'Nguy cơ Starvation (Bỏ đói tiến trình)',
        desc: 'Tiến trình ưu tiên thấp hoặc tiến trình có CPU Burst dài liên tục bị hoãn lại vô thời hạn do liên tục có các tiến trình ưu tiên cao hơn hoặc ngắn hơn đến sau chen ngang.',
        cause: 'SRTF và Priority Preemptive gây ra sự bất công bằng nghiêm trọng khi tải cao: một tiến trình có thể phải chờ gấp nhiều lần thời gian thực thi của chính nó.',
        rec: 'Round Robin hoặc MLFQ để bảo đảm tính công bằng (Fairness), giới hạn thời gian chờ tối đa (Max Waiting Time) và đảm bảo mọi tiến trình đều được cấp CPU.'
    }
};

const COL = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#059669', '#dc2626', '#4f46e5', '#0891b2', '#ea580c'];
const STN = ['New', 'Ready', 'Running', 'Waiting/Blocked', 'Terminated'];
const STC = ['#7c8aa5', '#2563eb', '#16a34a', '#d97706', '#64748b'];

const TABS = [
    ['about', 'Giới thiệu'],
    ['home', 'Trang chủ'],
    ['vm', 'Máy tính ảo'],
    ['alg', 'Thuật toán'],
    ['load', 'Phân tích tải CPU'],
    ['res', 'Kết quả'],
    ['contact', 'Liên hệ']
];

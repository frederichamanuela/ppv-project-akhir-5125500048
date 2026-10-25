const $ = (id) => document.getElementById(id);

const form = $("taskForm");
const daftar = $("taskList");
const inNama = $("inName");
const inMatkul = $("inMatkul");
const inDeadline = $("inDeadline");
const inPrioritas = $("inPrioritas");
const inKet = $("inDesc");
const selFilter = $("filterStatus");

let tugas = [];
let catatan = [];
let filter = "semua";
let catatanAktif = null;
const JADWAL = {
  1: [
    { mk: "PRAKTIKUM ANIMASI 2D", jam: "08.00-09.40" },
    { mk: "ANIMASI 2D", jam: "10.00-11.40" },
    { mk: "SISTEM PEMANCAR", jam: "13.00-14.30" },
    { mk: "PRAKTIKUM SISTEM PEMANCAR", jam: "14.50-16.20" }
  ],
  2: [
    { mk: "WORKSHOP UI/UX", jam: "08.00-10.30" },
    { mk: "PEMROGRAMAN VISUAL", jam: "13.00-15.30" }
  ],
  3: [
    { mk: "JURNALISTIK", jam: "08.00-09.40" },
    { mk: "PRAKTIKUM PEMROGRAMAN VISUAL", jam: "10.00-11.40" },
    { mk: "JARINGAN KOMPUTER", jam: "13.00-14.30" },
    { mk: "PRAKTIKUM JARINGAN KOMPUTER", jam: "14.50-16.20" }
  ],
  4: [
    { mk: "TEKNIK PENYIARAN", jam: "08.00-10.30" },
    { mk: "PRODUKSI KONTEN DIGITAL", jam: "13.00-15.30" }
  ],
  5: [], 6: [], 0: []
};

const HARI = { 1: "SENIN", 2: "SELASA", 3: "RABU", 4: "KAMIS", 5: "JUMAT", 6: "SABTU", 0: "MINGGU" };
const BULAN = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
const URUT_HARI = [1, 2, 3, 4, 5, 6, 0]; // senin dulu, minggu terakhir
const BOBOT = { "URGENT": 0, "SEMI URGENT": 1, "NORMAL": 2 };

const hariIni = new Date();
hariIni.setHours(0, 0, 0, 0);

let hariAktif = hariIni.getDay();
let tglDipilih = null;
let kalTahun = hariIni.getFullYear();
let kalBulan = hariIni.getMonth();

const dua = (n) => String(n).padStart(2, "0");
const keISO = (d) => `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
const namaHari = (s) => HARI[new Date(s + "T00:00:00").getDay()] || "";

function tglPendek(s) {
  return new Date(s + "T00:00:00")
    .toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    .toUpperCase();
}

function senin(ref) {
  const d = new Date(ref);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function jamKeAngka(jam) {
  const [h, m] = jam.split(".").map(Number);
  return h + m / 60;
}
function urutkan(arr) {
  return [...arr].sort((a, b) =>
    (a.done - b.done) ||
    (BOBOT[a.prioritas] - BOBOT[b.prioritas]) ||
    (a.deadline < b.deadline ? -1 : 1) ||
    (b.id - a.id)
  );
}

function toast(pesan) {
  tampilToast(pesan);
}
// ASET AUDIO: BUNYI SELESAI, GAGAL DIMUAT = DIAM
function bunyi() {
  try {
    new Audio("assets/selesai.wav").play().catch(() => {});
  } catch (e) {}
}

// ANIMASI PUNYA FUNGSI, HANYA TRANSFORM/OPACITY, HORMATI REDUCED-MOTION
const GERAK_MINIM = matchMedia("(prefers-reduced-motion: reduce)").matches;
function animMasuk(el, geser = 10) {
  if (GERAK_MINIM || !el.animate) return;
  el.animate(
    [{ opacity: 0, transform: `translateY(${geser}px)` }, { opacity: 1, transform: "none" }],
    { duration: 250, easing: "ease-out" }
  );
}
function animGoyang(el) {
  if (GERAK_MINIM || !el.animate) return;
  el.animate(
    [
      { transform: "none" },
      { transform: "translateX(-7px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "none" }
    ],
    { duration: 300, easing: "ease-out" }
  );
}
let idBaru = null;

function pindahTab(nama) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  const tampil = $("view-" + nama);
  tampil.classList.remove("hidden");
  animMasuk(tampil);
  document.querySelectorAll(".rail button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === nama);
  });
  window.scrollTo({ top: 0 });
}

document.querySelectorAll(".rail button").forEach((b) => {
  b.addEventListener("click", () => pindahTab(b.dataset.view));
});

function updateJam() {
  const n = new Date();
  $("clockTime").textContent = dua(n.getHours()) + ":" + dua(n.getMinutes());
  $("clockDate").textContent = `${HARI[n.getDay()]}, ${n.getDate()} ${BULAN[n.getMonth()]} ${n.getFullYear()}`;
}
updateJam();
setInterval(updateJam, 1000);

function gambarMinggu() {
  const sn = senin(hariIni);
  $("weekTitle").textContent = BULAN[sn.getMonth()] + " " + sn.getFullYear();

  const strip = $("weekStrip");
  strip.innerHTML = "";

  URUT_HARI.forEach((wd, i) => {
    const d = new Date(sn);
    d.setDate(sn.getDate() + i);

    const tombol = document.createElement("button");
    if (wd === hariAktif) tombol.classList.add("active");
    if (keISO(d) === keISO(hariIni)) tombol.classList.add("istoday");

    const angka = document.createElement("b");
    angka.textContent = d.getDate();
    const nama = document.createElement("span");
    nama.textContent = HARI[wd].slice(0, 3);
    tombol.appendChild(angka);
    tombol.appendChild(nama);

    tombol.addEventListener("click", () => {
      hariAktif = wd;
      gambarMinggu();
      gambarTimeline();
    });
    strip.appendChild(tombol);
  });

  // label di atas timeline
  const terpilih = new Date(sn);
  terpilih.setDate(sn.getDate() + URUT_HARI.indexOf(hariAktif));
  $("tlDayLabel").textContent = `${HARI[hariAktif]}, ${terpilih.getDate()} ${BULAN[terpilih.getMonth()].slice(0, 3)}`;
}

function gambarTimeline() {
  // TASK BERDEADLINE DI TANGGAL TAMPIL: NAMA + MATKUL + DEADLINE
  const snTgl = senin(hariIni);
  snTgl.setDate(snTgl.getDate() + URUT_HARI.indexOf(hariAktif));
  const isoTampil = keISO(snTgl);
  const deadTampil = tugas
    .filter((t) => !t.done && t.deadline === isoTampil)
    .sort((a, b) => BOBOT[a.prioritas] - BOBOT[b.prioritas]);
  const box = $("tlTugas");
  box.innerHTML = "";
  box.classList.toggle("hidden", !deadTampil.length);
  deadTampil.forEach((t) => {
    const li = document.createElement("li");
    const nama = document.createElement("div");
    nama.className = "tt-nama";
    nama.textContent = t.nama;
    const meta = document.createElement("div");
    meta.className = "tt-meta";
    meta.textContent = `${t.matkul} • DEADLINE ${tglPendek(t.deadline)}`;
    li.appendChild(nama);
    li.appendChild(meta);
    box.appendChild(li);
  });

  const tl = $("timeline");
  tl.innerHTML = "";

  const kelas = JADWAL[hariAktif] || [];
  const JAM_MULAI = 8, JAM_AKHIR = 17, TINGGI_BARIS = 52;

  for (let h = JAM_MULAI; h < JAM_AKHIR; h++) {
    const baris = document.createElement("div");
    baris.className = "tl-row";
    const label = document.createElement("div");
    label.className = "tl-hour";
    label.textContent = dua(h);
    const sel = document.createElement("div");
    sel.className = "tl-cell";
    baris.appendChild(label);
    baris.appendChild(sel);
    tl.appendChild(baris);
  }

  if (!kelas.length) {
    const kosong = document.createElement("div");
    kosong.className = "tl-free";
    kosong.textContent = "TIDAK ADA KELAS HARI INI. CEK PENGINGAT DI SAMPING.";
    tl.appendChild(kosong);
    return;
  }

  tl.style.position = "relative";
  kelas.forEach((k, i) => {
    const [mulai, selesai] = k.jam.split("-");
    const blok = document.createElement("div");
    blok.className = "tl-block" + (i % 2 ? " alt" : "");
    blok.style.top = ((jamKeAngka(mulai) - JAM_MULAI) * TINGGI_BARIS + 4) + "px";
    blok.style.height = Math.max(44, (jamKeAngka(selesai) - jamKeAngka(mulai)) * TINGGI_BARIS - 8) + "px";

    const judul = document.createElement("div");
    judul.textContent = k.mk;
    const waktu = document.createElement("small");
    waktu.textContent = mulai.replace(".", ":") + " - " + selesai.replace(".", ":");
    blok.appendChild(judul);
    blok.appendChild(waktu);
    tl.appendChild(blok);
  });
}

function gambarKalender() {
  $("calTitle").textContent = BULAN[kalBulan] + " " + kalTahun;
  const grid = $("calGrid");
  grid.innerHTML = "";

  const kosongAwal = (new Date(kalTahun, kalBulan, 1).getDay() + 6) % 7;
  const jumlahHari = new Date(kalTahun, kalBulan + 1, 0).getDate();
  // tanggal yg masih ada deadline belum selesai
  const adaDeadline = new Set(tugas.filter((t) => !t.done).map((t) => t.deadline));

  for (let i = 0; i < kosongAwal; i++) {
    const s = document.createElement("span");
    s.className = "cal-blank";
    s.setAttribute("aria-hidden", "true");
    grid.appendChild(s);
  }

  for (let d = 1; d <= jumlahHari; d++) {
    const b = document.createElement("button");
    b.textContent = d;
    const key = `${kalTahun}-${dua(kalBulan + 1)}-${dua(d)}`;

    if (key === keISO(hariIni)) b.classList.add("today");
    if (adaDeadline.has(key)) {
      // TITIK KECIL = INDIKATOR VISUAL, BUKAN TOMBOL BARU
      b.classList.add("has-dl");
      const titik = document.createElement("span");
      titik.className = "titik";
      titik.setAttribute("aria-hidden", "true");
      b.appendChild(titik);
    }
    if (key === tglDipilih) b.classList.add("picked");

    b.addEventListener("click", () => {
      tglDipilih = key;
      inDeadline.value = key;
      $("errDeadline").textContent = "";
      inDeadline.classList.remove("invalid");
      gambarKalender();
      pindahTab("tugas");
      setTimeout(() => inNama.focus(), 300);
      toast("DEADLINE: " + tglPendek(key) + ". TINGGAL ISI NAMA + MATKUL.");
    });
    grid.appendChild(b);
  }
}

$("calPrev").addEventListener("click", () => {
  kalBulan--;
  if (kalBulan < 0) { kalBulan = 11; kalTahun--; }
  gambarKalender();
});
$("calNext").addEventListener("click", () => {
  kalBulan++;
  if (kalBulan > 11) { kalBulan = 0; kalTahun++; }
  gambarKalender();
});
$("calToday").addEventListener("click", () => {
  kalTahun = hariIni.getFullYear();
  kalBulan = hariIni.getMonth();
  gambarKalender();
});

function gambarPengingat() {
  const ul = $("remindList");
  ul.innerHTML = "";

  const belum = tugas.filter((t) => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline));

  if (!belum.length) {
    ul.innerHTML = `<li class="ok"><span>SEMUA TUGAS SUDAH SELESAI. AMAN.</span><span class="jam">TIDAK ADA PENGINGAT</span></li>`;
    return;
  }

  belum.slice(0, 5).forEach((t) => {
    const li = document.createElement("li");
    const judul = document.createElement("span");
    judul.textContent = t.nama.toUpperCase();
    const ket = document.createElement("span");
    ket.className = "jam";
    ket.textContent = "DEADLINE " + namaHari(t.deadline) + ", " + tglPendek(t.deadline);
    li.appendChild(judul);
    li.appendChild(ket);
    ul.appendChild(li);
  });
}

const judulNote = $("noteTitle");
const isiNote = $("noteBody");
let timerSimpan = null;

function tandaiTersimpan() {
  const n = new Date();
  $("noteSaved").textContent = `✓ TERSIMPAN ${dua(n.getHours())}:${dua(n.getMinutes())}:${dua(n.getSeconds())}`;
}

const catatanSekarang = () => catatan.find((n) => n.id === catatanAktif);

$("noteAdd").addEventListener("click", () => {
  const baru = {
    id: Date.now(),
    title: "",
    body: "",
    ts: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" }).toUpperCase()
  };
  catatan.unshift(baru);
  catatanAktif = baru.id;
  gambarNotes();
  judulNote.focus();
  toast("CATATAN BARU DIBUAT.");
});
function bikinKalauKosong() {
  if (catatanSekarang()) return;
  $("noteAdd").click();
}
$("noteEmpty").addEventListener("click", bikinKalauKosong);
$("noteEmpty").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    bikinKalauKosong();
  }
});

$("noteDel").addEventListener("click", () => {
  if (!catatanSekarang()) { toast("PILIH DULU CATATAN YANG MAU DIHAPUS."); return; }
  catatan = catatan.filter((n) => n.id !== catatanAktif);
  catatanAktif = catatan.length ? catatan[0].id : null;
  gambarNotes();
  toast("CATATAN DIHAPUS.");
});

$("noteDone").addEventListener("click", () => {
  const n = catatanSekarang();
  if (!n) { toast("BELUM ADA CATATAN DIPILIH."); return; }
  clearTimeout(timerSimpan);
  n.title = judulNote.value.trim();
  n.body = isiNote.value;
  catatanAktif = null;
  $("noteSaved").textContent = "BELUM ADA PERUBAHAN.";
  gambarNotes();
  toast("CATATAN TERSIMPAN. SILAKAN BUAT BARU.");
});
function autosave() {
  $("noteSaved").textContent = "● MENGETIK…";
  clearTimeout(timerSimpan);
  timerSimpan = setTimeout(() => {
    const n = catatanSekarang();
    if (!n) return;
    n.title = judulNote.value.trim();
    n.body = isiNote.value;
    gambarDaftarNote();
    tandaiTersimpan();
  }, 600);
}
judulNote.addEventListener("input", autosave);
isiNote.addEventListener("input", autosave);

function gambarDaftarNote() {
  const ul = $("noteList");
  ul.innerHTML = "";
  catatan.forEach((n) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = n.id === catatanAktif ? "active" : "";

    const judul = document.createElement("b");
    judul.textContent = n.title || "TANPA JUDUL";
    const sub = document.createElement("small");
    sub.textContent = n.ts + (n.body ? " - " + n.body.slice(0, 24) : "");
    b.appendChild(judul);
    b.appendChild(sub);

    b.addEventListener("click", () => {
      catatanAktif = n.id;
      gambarNotes();
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
}

function gambarNotes() {
  gambarDaftarNote();
  const n = catatanSekarang();
  $("noteEmpty").classList.toggle("hidden", !!n);
  $("noteFields").classList.toggle("hidden", !n);
  if (n) {
    judulNote.value = n.title;
    isiNote.value = n.body;
  }
}

const board = $("board");
const wrap = $("drawWrap");
const layer = $("stickLayer");
const ctx = board.getContext("2d");

ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0, 0, board.width, board.height);

let lagiGambar = false;
let alat = "hl";
let coretan = [];
let goresan = null; // goresan yang lagi digambar
const riwayat = [];
const WARNA_STICKY = ["", "blue", "paper"];

function catatRiwayat(aksi) {
  riwayat.push(aksi);
  if (riwayat.length > 30) riwayat.shift();
}

function gambarUlang() {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  coretan.forEach((c) => {
    ctx.strokeStyle = c.style;
    ctx.lineWidth = c.width;
    ctx.beginPath();
    c.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  });
}
function posCanvas(e) {
  const r = board.getBoundingClientRect();
  return [
    (e.clientX - r.left) * board.width / r.width,
    (e.clientY - r.top) * board.height / r.height
  ];
}

board.addEventListener("pointerdown", (e) => {
  if (alat !== "hl") return;
  lagiGambar = true;
  board.setPointerCapture(e.pointerId);
  goresan = { pts: [posCanvas(e)], style: "", width: 0 };
});

board.addEventListener("pointermove", (e) => {
  if (!lagiGambar || !goresan) return;
  goresan.pts.push(posCanvas(e));
  goresan.style = `rgba(${warnaHl},.55)`;
  goresan.width = 20;
  gambarUlang();
  ctx.strokeStyle = goresan.style;
  ctx.lineWidth = goresan.width;
  ctx.beginPath();
  goresan.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
});

["pointerup", "pointercancel", "pointerleave"].forEach((ev) => {
  board.addEventListener(ev, () => {
    if (lagiGambar && goresan && goresan.pts.length) {
      coretan.push(goresan);
      catatRiwayat({ k: "stroke" });
    }
    lagiGambar = false;
    goresan = null;
  });
});

let warnaHl = "58,78,251";
document.querySelectorAll(".swatches .sw").forEach((s) => {
  s.style.background = `rgb(${s.dataset.hl})`;
  s.addEventListener("click", () => {
    warnaHl = s.dataset.hl;
    alat = "hl";
    tandaiAlat();
    document.querySelectorAll(".swatches .sw").forEach((x) => x.classList.toggle("active", x === s));
  });
});
document.querySelectorAll("#fmtPop .sw").forEach((s) => {
  s.style.background = s.dataset.warna;
});

function tandaiAlat() {
  document.querySelectorAll(".draw-bar .chip[data-tool]").forEach((x) => {
    x.classList.toggle("active", x.dataset.tool === alat);
  });
}

document.querySelectorAll(".draw-bar .chip[data-tool]").forEach((c) => {
  c.addEventListener("click", () => {
    alat = c.dataset.tool;
    tandaiAlat();
    // sticky langsung ditempel, alat balik ke stabilo
    if (alat === "sticky") {
      tambahIde("sticky");
      alat = "hl";
      tandaiAlat();
      return;
    }
    toast("ALAT: " + c.textContent + ".");
  });
});

function persenPapan(e) {
  const r = wrap.getBoundingClientRect();
  return [
    ((e.clientX - r.left) / r.width * 100).toFixed(1),
    ((e.clientY - r.top) / r.height * 100).toFixed(1)
  ];
}

wrap.addEventListener("click", (e) => {
  if (alat !== "text") return;
  if (e.target.closest(".brain,.freetext")) return;
  if (!e.target.closest("canvas")) return;
  const [x, y] = persenPapan(e);
  tambahIde("text", x, y);
});

let geser = 0;

function tambahIde(jenis, x, y) {
  if (x === undefined) {
    geser = (geser + 1) % 6;
    x = 6 + geser * 5;
    y = 8 + geser * 7;
  }

  let el;

  if (jenis === "text") {
    el = document.createElement("div");
    el.className = "freetext";
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.color = "#2D2654";
    el.contentEditable = "true";
    el.dataset.ph = "KETIK…";
    el.textContent = "";
    el.addEventListener("pointerdown", (ev) => dragKalauGeser(ev, el));
    el.focus();
  } else {
    el = document.createElement("div");
    el.className = "brain";
    el.style.left = x + "%";
    el.style.top = y + "%";

    const grab = document.createElement("div");
    grab.className = "grab";
    const tblWarna = document.createElement("button");
    tblWarna.className = "mini";
    tblWarna.textContent = "WARNA";
    tblWarna.title = "GANTI WARNA";
    const tblHapus = document.createElement("button");
    tblHapus.className = "mini del";
    tblHapus.textContent = "✕";
    tblHapus.title = "HAPUS";
    grab.appendChild(tblWarna);
    grab.appendChild(tblHapus);

    const isi = document.createElement("div");
    isi.className = "body";
    isi.contentEditable = "true";
    isi.dataset.ph = "TULIS IDE…";

    const sudut = document.createElement("div");
    sudut.className = "sh";
    sudut.title = "BESARKAN / KECILKAN";

    el.appendChild(grab);
    el.appendChild(isi);
    el.appendChild(sudut);

    let idx = 0;
    tblWarna.addEventListener("click", (ev) => {
      ev.stopPropagation();
      idx = (idx + 1) % 3;
      el.classList.remove("blue", "paper");
      if (WARNA_STICKY[idx]) el.classList.add(WARNA_STICKY[idx]);
    });

    tblHapus.addEventListener("click", (ev) => {
      ev.stopPropagation();
      catatRiwayat({ k: "del", el, next: el.nextSibling });
      el.remove();
      toast("STICKY DICOPOT.");
    });
    sudut.addEventListener("pointerdown", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      const wr = wrap.getBoundingClientRect();
      const startX = ev.clientX;
      const lebarAwal = el.getBoundingClientRect().width / wr.width * 100;
      const fontAwal = parseFloat(getComputedStyle(el).fontSize);
      const dari = { w: lebarAwal, fs: fontAwal };

      const gerak = (mv) => {
        const lebar = Math.min(95, Math.max(12, lebarAwal + (mv.clientX - startX) / wr.width * 100));
        el.style.width = lebar + "%";
        el.style.fontSize = Math.min(30, Math.max(11, fontAwal * lebar / lebarAwal)) + "px";
      };
      const lepas = () => {
        document.removeEventListener("pointermove", gerak);
        document.removeEventListener("pointerup", lepas);
        catatRiwayat({
          k: "scale",
          el,
          from: dari,
          to: { w: parseFloat(el.style.width), fs: parseFloat(el.style.fontSize) }
        });
      };
      document.addEventListener("pointermove", gerak);
      document.addEventListener("pointerup", lepas);
    });

    el.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest("button") || ev.target.closest(".body") || ev.target.closest(".sh")) return;
      dragLangsung(ev, el);
    });

    isi.focus();
  }

  layer.appendChild(el);
  catatRiwayat({ k: "add", el });
  toast(jenis === "text" ? "TEKS DIBUAT. KETIK, TARIK BUAT PINDAH." : "STICKY DITEMPEL. GESER LEWAT BAR ATASNYA.");
}
function dragLangsung(e, el) {
  e.preventDefault();
  const wr = wrap.getBoundingClientRect();
  const sx = e.clientX, sy = e.clientY;
  const dari = { l: parseFloat(el.style.left), t: parseFloat(el.style.top) };

  const gerak = (ev) => {
    el.style.left = Math.min(92, Math.max(0, dari.l + (ev.clientX - sx) / wr.width * 100)) + "%";
    el.style.top = Math.min(94, Math.max(0, dari.t + (ev.clientY - sy) / wr.height * 100)) + "%";
  };
  const lepas = () => {
    document.removeEventListener("pointermove", gerak);
    document.removeEventListener("pointerup", lepas);
    catatRiwayat({ k: "move", el, from: dari, to: { l: parseFloat(el.style.left), t: parseFloat(el.style.top) } });
  };
  document.addEventListener("pointermove", gerak);
  document.addEventListener("pointerup", lepas);
}

function dragKalauGeser(e, el) {
  const sx = e.clientX, sy = e.clientY;
  let jalan = false;
  const dari = { l: parseFloat(el.style.left), t: parseFloat(el.style.top) };

  const gerak = (ev) => {
    if (!jalan && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
    jalan = true;
    ev.preventDefault();
    const wr = wrap.getBoundingClientRect();
    el.style.left = Math.min(92, Math.max(0, dari.l + (ev.clientX - sx) / wr.width * 100)) + "%";
    el.style.top = Math.min(94, Math.max(0, dari.t + (ev.clientY - sy) / wr.height * 100)) + "%";
  };
  const lepas = () => {
    document.removeEventListener("pointermove", gerak);
    document.removeEventListener("pointerup", lepas);
    if (jalan) {
      catatRiwayat({ k: "move", el, from: dari, to: { l: parseFloat(el.style.left), t: parseFloat(el.style.top) } });
    }
  };
  document.addEventListener("pointermove", gerak);
  document.addEventListener("pointerup", lepas);
}

function undoBoard() {
  const a = riwayat.pop();
  if (!a) { toast("NGGAK ADA YANG BISA DIBATALKAN."); return; }

  if (a.k === "stroke") {
    coretan.pop();
    gambarUlang();
  } else if (a.k === "add") {
    a.el.remove();
  } else if (a.k === "del") {
    layer.insertBefore(a.el, a.next);
  } else if (a.k === "move") {
    a.el.style.left = a.from.l + "%";
    a.el.style.top = a.from.t + "%";
  } else if (a.k === "scale") {
    a.el.style.width = a.from.w + "%";
    a.el.style.fontSize = a.from.fs + "px";
  } else if (a.k === "clear") {
    coretan = a.strokes;
    gambarUlang();
    a.nodes.forEach((n) => layer.appendChild(n));
  }
  toast("DIBATALKAN.");
}

$("boardClear").addEventListener("click", () => {
  if (!confirm("HAPUS SEMUA GAMBAR + STICKY DI PAPAN?")) return;
  catatRiwayat({ k: "clear", strokes: coretan, nodes: [...layer.children] });
  coretan = [];
  gambarUlang();
  layer.innerHTML = "";
  toast("PAPAN DIBERSIHKAN.");
});

let terakhirDiedit = null;
wrap.addEventListener("focusin", (e) => {
  if (e.target.contentEditable === "true") terakhirDiedit = e.target;
});

function targetFormat() {
  const a = document.activeElement;
  if (a && a.contentEditable === "true" && wrap.contains(a)) return a;
  return terakhirDiedit && wrap.contains(terakhirDiedit) ? terakhirDiedit : null;
}

const FONT = {
  inter: "Inter,sans-serif",
  arial: "Arial,sans-serif",
  georgia: "Georgia,serif",
  times: "'Times New Roman',serif",
  courier: "'Courier New',monospace",
  verdana: "Verdana,sans-serif",
  trebuchet: "'Trebuchet MS',sans-serif"
};

$("fmtFont").addEventListener("change", () => {
  const t = targetFormat();
  const v = $("fmtFont").value;
  if (!t || !v) return;
  t.style.fontFamily = FONT[v];
  toast("FONT DIGANTI.");
});

function tutupPop() {
  $("fmtPop").classList.add("hidden");
  $("fmtWarnaBtn").setAttribute("aria-expanded", "false");
}
$("fmtWarnaBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const buka = $("fmtPop").classList.contains("hidden");
  tutupPop();
  if (buka) {
    $("fmtPop").classList.remove("hidden");
    $("fmtWarnaBtn").setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("pointerdown", (e) => {
  if (!$("fmtPop").classList.contains("hidden") && !e.target.closest(".pop")) tutupPop();
});
document.querySelectorAll("#fmtPop .sw").forEach((s) => {
  s.addEventListener("click", () => {
    const t = targetFormat();
    if (!t) { toast("KLIK DULU TEKS DI PAPAN."); return; }
    t.style.color = s.dataset.warna;
    tutupPop();
    toast("WARNA TEKS DIGANTI.");
  });
});
$("fmtCustom").addEventListener("input", () => {
  const t = targetFormat();
  if (!t) { toast("KLIK DULU TEKS DI PAPAN."); return; }
  t.style.color = $("fmtCustom").value;
});

function ubahUkuran(selisih) {
  const t = targetFormat();
  if (!t) { toast("KLIK DULU TEKS DI PAPAN."); return; }
  const skrg = parseFloat(getComputedStyle(t).fontSize);
  t.style.fontSize = Math.min(40, Math.max(10, skrg + selisih)) + "px";
  toast("UKURAN HURUF DIGANTI.");
}
$("fmtInc").addEventListener("click", () => ubahUkuran(2));
$("fmtDec").addEventListener("click", () => ubahUkuran(-2));

// B / I / U: kalau udah aktif dimatiin, kalau belum dinyalain
function tekan(id, nyala) {
  $(id).setAttribute("aria-pressed", nyala ? "true" : "false");
}
function segarkanFmt() {
  const t = targetFormat();
  tekan("fmtB", !!t && t.style.fontWeight === "800");
  tekan("fmtI", !!t && t.style.fontStyle === "italic");
  tekan("fmtU", !!t && t.style.textDecoration === "underline");
}
wrap.addEventListener("focusin", () => setTimeout(segarkanFmt, 0));
function toggleGaya(nama, prop, nyala, mati) {
  const t = targetFormat();
  if (!t) { toast("KLIK DULU TEKS DI PAPAN."); return; }
  t.style[prop] = t.style[prop] === nyala ? mati : nyala;
  segarkanFmt();
  toast(nama + " DIGANTI.");
}
$("fmtB").addEventListener("click", () => toggleGaya("BOLD", "fontWeight", "800", "400"));
$("fmtI").addEventListener("click", () => toggleGaya("ITALIC", "fontStyle", "italic", "normal"));
$("fmtU").addEventListener("click", () => toggleGaya("UNDERLINE", "textDecoration", "underline", "none"));


const teksLoader = ["MEMUAT…", "MENYIAPKAN JADWAL…", "SELESAI…"];
let langkah = 0;

const loaderJalan = setInterval(() => {
  $("preFill").style.width = Math.min(100, (langkah + 1) * 38) + "%";
  $("preText").textContent = teksLoader[Math.min(langkah, teksLoader.length - 1)];
  langkah++;

  if (langkah >= 4) {
    clearInterval(loaderJalan);
    setTimeout(() => {
      $("preloader").classList.add("done");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        renderSemua();
      }, 600);
    }, 350);
  }
}, 450);

function validasi(tampilkan = true) {
  const err = {};

  if (inNama.value.trim().length < 3) err.nama = "NAMA TUGAS MINIMAL 3 KARAKTER.";
  if (!inMatkul.value) err.matkul = "PILIH MATA KULIAH.";

  if (!inDeadline.value) {
    err.deadline = "ISI DEADLINE.";
  } else if (new Date(inDeadline.value + "T00:00:00") < hariIni) {
    err.deadline = "DEADLINE TIDAK BOLEH TANGGAL LAMPAU.";
  }

  if (tampilkan) {
    $("errName").textContent = err.nama || "";
    $("errMatkul").textContent = err.matkul || "";
    $("errDeadline").textContent = err.deadline || "";
    inNama.classList.toggle("invalid", !!err.nama);
    inMatkul.classList.toggle("invalid", !!err.matkul);
    inDeadline.classList.toggle("invalid", !!err.deadline);
  }

  return Object.keys(err).length === 0;
}

function setLoading(nyala) {
  $("loading").classList.toggle("hidden", !nyala);
  if (nyala) {
    $("empty").classList.add("hidden");
    daftar.innerHTML = "";
  }
}


function renderSemua() {
  gambarMinggu();
  gambarTimeline();
  gambarKalender();
  gambarPengingat();
  render();
}

function render() {
  const tampil = urutkan(tugas.filter((t) => {
    if (filter === "semua") return true;
    return filter === "selesai" ? t.done : !t.done;
  }));

  daftar.innerHTML = "";
  $("empty").classList.toggle("hidden", tugas.length > 0);

  if (tugas.length) {
    if (!tampil.length) {
      daftar.innerHTML = `<li class="task"><div class="t-main"><div class="t-name">TIDAK ADA DI FILTER INI.</div><div class="t-meta">GANTI FILTER KE SEMUA.</div></div></li>`;
    }

    tampil.forEach((t) => {
      const li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");
      const telat = !t.done && new Date(t.deadline + "T00:00:00") < hariIni;
      if (t.id === idBaru) {
        idBaru = null;
        animMasuk(li, 12);
      }
      const kelasPrioritas = t.prioritas.replace(/\s/g, "");

      li.innerHTML = `<input type="checkbox" class="t-check" ${t.done ? "checked" : ""} title="SELESAI?" />
        <div class="t-main"><div class="t-name"></div>
        <div class="t-meta"><span class="badge">${t.matkul}</span><span class="badge ${kelasPrioritas}">${t.prioritas}</span><span class="badge ${telat ? "overdue" : ""}">${tglPendek(t.deadline)}${telat ? " - TERLEWAT" : ""}</span></div></div>
        <div class="t-actions"><button class="btn-del" title="HAPUS">✕</button></div>`;


      li.querySelector(".t-name").textContent = t.nama.toUpperCase();
      // KOMPATIBEL MUNDUR: tugas lama tanpa ket tetap kebaca
      if ((t.ket || "").trim()) {
        const dd = document.createElement("div");
        dd.className = "t-desc";
        dd.textContent = t.ket;
        li.querySelector(".t-main").insertBefore(dd, li.querySelector(".t-meta"));
      }

      li.querySelector(".t-check").addEventListener("click", () => {
        t.done = !t.done;
        if (t.done) bunyi();
        toast(t.done ? "TUGAS SELESAI." : "TUGAS DIAKTIFKAN KEMBALI.");
        renderSemua();
      });

      li.querySelector(".btn-del").addEventListener("click", () => {
        tugas = tugas.filter((x) => x.id !== t.id);
        toast("TUGAS DIHAPUS.");
        renderSemua();
      });

      li.addEventListener("mouseover", () => li.classList.add("hovered"));
      li.addEventListener("mouseout", () => li.classList.remove("hovered"));

      daftar.appendChild(li);
    });
  }

  updateStatistik();
}

function updateStatistik() {
  const selesai = tugas.filter((t) => t.done).length;
  $("statTotal").textContent = tugas.length;
  $("statDone").textContent = selesai;
  $("statActive").textContent = tugas.length - selesai;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validasi(true)) {
    toast("PERIKSA KEMBALI ISIAN YANG DITANDAI MERAH.");
    [inNama, inMatkul, inDeadline].forEach((el) => {
      if (el.classList.contains("invalid")) animGoyang(el);
    });
    return;
  }

  setLoading(true);
  $("btnSave").disabled = true;

  setTimeout(() => {
    tugas.unshift({
      id: Date.now(),
      nama: inNama.value.trim(),
      matkul: inMatkul.value,
      deadline: inDeadline.value,
      prioritas: inPrioritas.value,
      ket: inKet.value.trim(),
      done: false
    });
    setLoading(false);
    $("btnSave").disabled = false;
    form.reset();
    inPrioritas.value = "NORMAL";
    $("nameCount").textContent = "0/60";
    tglDipilih = null;
    idBaru = tugas[0].id;
    renderSemua();
    toast("TUGAS DITAMBAHKAN.");
  }, 800);
});

inNama.addEventListener("input", () => {
  $("nameCount").textContent = `${inNama.value.length}/60`;
  if (inNama.value.trim().length >= 3) {
    $("errName").textContent = "";
    inNama.classList.remove("invalid");
  }
});

inMatkul.addEventListener("change", () => {
  if (inMatkul.value) {
    $("errMatkul").textContent = "";
    inMatkul.classList.remove("invalid");
  }
});

inDeadline.addEventListener("change", () => {
  tglDipilih = inDeadline.value || null;
  gambarKalender();
  validasi(true);
});

inPrioritas.addEventListener("change", () => toast("PRIORITAS: " + inPrioritas.value + "."));

selFilter.addEventListener("change", () => {
  filter = selFilter.value;
  render();
});


document.addEventListener("keydown", (e) => {
  // ctrl+z cuma buat undo board kalau lagi nggak ngetik
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    const a = document.activeElement;
    const lagiNgetik = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable);
    if (!lagiNgetik) {
      e.preventDefault();
      undoBoard();
    }
    return;
  }

  if (e.key === "Escape") {
    form.reset();
    $("nameCount").textContent = "0/60";
    toast("FORM DIRESET.");
  }

  if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    pindahTab("tugas");
    setTimeout(() => inNama.focus(), 300);
  }
});

gambarNotes();
renderSemua();
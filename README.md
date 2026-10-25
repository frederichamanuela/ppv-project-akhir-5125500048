TugasIde: Tracker Tugas Mahasiswa

Website untuk mencatat tugas kuliah, brainstorming ide, mencatat catatan, dan juga memberikan fitur pomodoro di dalamnya. 

A. Cara menjalankan website ini:
1. Ekstrak file zip-nya.
2. Klik dua kali `index.html`, langsung jalan di browser. 
3. Pada bagian beranda untuk melihat jadwal, mencatat tugas, brainstorming pada whiteboard, fitur notes untuk mencatat catatan dan juga fitur timer.

B. Fitur
- Opening loader: logo "TUGASIDE" dan bar loading yang geser sendiri.
- Bar kiri: 5 tab (Beranda / Tugas / Notes / Board / Fokus).
- Bar fokus: 5 kartu timer ring ungu (15/25/30/45/60 menit) + kartu CUSTOM (input menit se-kartu + MULAI, validasi 1-180, ring ngikutin durasi), jalannya sendiri-sendiri. Pas klik mulai, langsung muncul popup besar. Kalau waktunya habis, alarm bunyi dan lanjut hitung waktu lembur. Sisa waktu juga kelihatan di judul tab browser.
- Header: hari, tanggal lengkap, jam:menit (tanpa detik) dan juga profile.
- Beranda: kalender mini, pengingat, strip minggu, dan timeline jam jadwal kuliah + daftar nama task yang deadline-nya pas tanggal tampil
- Kalender mini: tanggal yang ada titiknya berarti masih ada deadline yang belum selesai. Klik tanggal, deadline di form langsung keisi dan layar loncat ke form.
- Notes: daftar di kiri, editor di kanan, autosave, dan ada indikator status (mengetik / tersimpan + jam). Isi catatan pakai kapital normal (nggak dipaksa capslock). Tombol Selesai buat nyimpen sekalian nutup catatan. Klik area kosong langsung bikin catatan baru.
- Board brainstorming: stabilo 5 warna dalam grupnya sendiri (kuning, hijau, pink, biru, oranye, klik dot langsung ganti), teks bebas (klik papan, tarik buat pindah), dan sticky note 3 warna yang bisa digeser, di-scale lewat sudut, dan dihapus satuan. Format teks: 7 font + popup palet 10 warna + warna bebas + A-/A+ + Bold/Italic/Underline (ikon + status aktif kelihatan). Ada hapus semua (pakai konfirmasi), dan Ctrl+Z. Offline, nggak butuh Figma.
- Tambah tugas: isi nama, matkul (13 pilihan), deadline, prioritas (Urgent / Semi Urgent / Normal), dan keterangan (opsional). Daftar otomatis keurut: Urgent dulu, lalu deadline terdekat, yang udah selesai di paling bawah.
- Tandai selesai lewat checkbox, hapus lewat tombol silang yang muncul.
- Filter: Semua / Aktif / Selesai.
- Statistik: Total / Selesai / Aktif.
- Aset media: `assets/logo.svg` = ikon (ada alt, disembunyikan bila gagal dimuat) + `assets/kosong.svg` = gambar ilustrasi empty state (ada alt, disembunyikan bila gagal dimuat) + `assets/selesai.wav` = audio (bunyi pas tugas selesai dan timer selesai, diam + bunyi cadangan bila gagal dimuat).

C. Validasi Form (3 aturan)
1. Nama tugas minimal 3 karakter.
2. Mata kuliah wajib dipilih.
3. Deadline wajib diisi dan nggak boleh tanggal yang udah lewat.

D. Desain
Saya menggunakan desain sederhana dengan warna ungu dan putih agar tampilan aplikasi tetap mudah dibaca dan tidak terlalu ramai.
1. Border tipis 1px + bayangan lembut, biar kesannya kalem dan nggak kayak tempelan tebal.
2. Radius dibedain: kartu 12-20, input 10, badge 6. Biar ada hierarki, nggak semuanya bentuk pil.
3. Pink dipakai seperlunya aja (tab aktif, tanggal hari ini, badge Semi) supaya aksennya tetap satu.
4. Header blur jadi satu-satunya permukaan kaca.
5. Tanpa marquee, tanpa gradien, tanpa dekorasi yang nggak ada gunanya.
6. Capslock, font Inter/system, dan palet ini sesuai permintaan pemilik.

E. Font
Header menggunakan font apple dan body text menggunakan font inter
1. Semua teks capslock (lewat CSS `text-transform`).
2. Heading: system Apple (`-apple-system` / SF Pro Display, fallback Segoe UI), 20px, rata kiri.
3. Caption helper: 11px abu-abu (`.cap`), selalu rata kiri di bawah judul.
4. Body/label: Inter, 13-14px.


F. Bonus: Pintasan Keyboard
1. `Enter` pas fokus di form = simpan tanpa mouse.
2. `/` = loncat ke form tugas, `Esc` = reset form.
3. `Ctrl+Z` di Board = batalin langkah terakhir. Aman, karena pas ngetik di form, Ctrl+Z tetap undo tulisan.

G. Tabel Animasi (Tugas 4)
| Kode | Animasi | Pemicu | Properti | Durasi | Fungsi |
|---|---|---|---|---|---|
| A-01 | Tampilan masuk | Klik tab rail | opacity + transform | 250ms ease-out | Penanda bahwa tampilan baru sudah muncul |
| A-02 | Kartu baru masuk | Submit form | opacity + transform | 250ms ease-out | Penanda di mana data baru muncul |
| A-03 | Isian salah bergetar | Validasi gagal | transform | 300ms ease-out | Penanda kolom mana yang salah |
- Semua pakai `element.animate()`, cuma transform/opacity.
- Kalau pengguna mengaktifkan "kurangi gerak" (`prefers-reduced-motion: reduce`), semua animasi dan transisi dimatikan (dicek lewat matchMedia di JS + media query di CSS).

H. Daftar Event (6 jenis)
| # | Event | Lokasi | Fungsi |
|---|---|---|---|
| 1 | `submit` | Form tugas | Validasi + loading + tambah tugas |
| 2 | `click` | Rail, strip hari, tanggal kalender, checkbox, hapus, notes, board, timer | Pindah tampilan, kelola data, gambar, fokus |
| 3 | `input` | Nama tugas, judul/isi notes | Counter, hapus error, autosave |
| 4 | `change` | Matkul, deadline, prioritas, filter, format board | Validasi, sinkron kalender, filter |
| 5 | `keydown` | Document | `Esc`, `/`, `Enter`, `Ctrl+Z` |
| 6 | `mouseover`/`mouseout` | Kartu tugas | Highlight kartu |

I. Struktur File
index.html  - struktur halaman
style.css   - tema dashboard (dipakai juga sama timer.html)
timer.html  - 5 kartu timer ring mandiri (dimuat lewat iframe)
app.js      - event, validasi, render, kalender, timeline, notes, whiteboard, animasi
assets/     - logo.svg + kosong.svg + selesai.wav
README.md   - file ini

J. Referensi
1. https://id.pinterest.com/pin/707276316520163390/ (tampilan ui nya)
2. https://oatside.com/ (fitur interaktif animasinya)
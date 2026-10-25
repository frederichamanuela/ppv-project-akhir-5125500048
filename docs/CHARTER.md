# Charter TugasIde

## Masalah
Mahasiswa D3 MM B kesulitan memantau deadline tugas karena tugas dari 13 mata kuliah diumumkan lewat kanal yang berbeda (grup chat, e-learning, lisan di kelas) dan tidak ada satu daftar yang menyatukannya, sehingga tugas terlewat atau baru dikerjakan mendekati batas.

## Persona
Habib, 19 tahun, mahasiswa semester 3 D3 MM B. Tiap hari ia kuliah dan praktikum, lalu mengerjakan tugas malam hari lewat laptop dan ponsel. Info tugas ia dapat dari beberapa grup chat dan catatan di ponsel. Masalahnya: ia sering baru sadar ada tugas saat teman bertanya "sudah kumpul belum?", dan di minggu padat ia tidak tahu tugas mana yang harus dikerjakan lebih dulu.

## Fitur MVP (MoSCoW)
| Fitur | Label |
|---|---|
| Kelola tugas: tambah, centang selesai, hapus, filter | Must |
| Kalender dan pengingat deadline terdekat | Must |
| Data tugas tetap ada setelah halaman di-refresh | Must |
| Catatan (Notes) | Should |
| Timer Pomodoro | Could |
| Login dan sinkron antar perangkat | **Won't** |

Won't: login dan sinkronisasi butuh server dan basis data, sedangkan proyek ini sepenuhnya di sisi browser dalam satu semester. Whiteboard sudah ada sejak Tugas 4 dan dicatat sebagai fitur warisan di luar MVP.

## Kriteria sukses
1. Pengguna baru menambah satu tugas lengkap tanpa bantuan dalam ≤ 30 detik.
2. Pengguna baru menyelesaikan alur utama (tambah tugas, lihat di pengingat, centang selesai) dalam ≤ 2 menit.
3. 100% tugas yang disimpan masih ada setelah refresh (diuji 5 kali).
4. Tampilan tidak terpotong dan tidak ada scroll samping di lebar 400 px.
5. Tampilan setelah Bootstrap dipasang sama dengan sebelumnya (dibandingkan lewat screenshot).

## Risiko dan antisipasi
| Risiko | Antisipasi |
|---|---|
| Bootstrap mengubah tampilan karena nama kelas `.card` dan `.toast` bentrok | Muat Bootstrap dengan `@layer` supaya CSS sendiri menang; bandingkan screenshot sebelum dan sesudah |
| Data hilang karena penyimpanan browser dihapus atau penuh | Bungkus baca/tulis dengan `try/catch`, tampilkan pesan, sediakan ekspor data |
| Pustaka CDN gagal dimuat saat offline | Kunci versi `@5.3.3`; fitur inti tidak bergantung pada Bootstrap JS |
| Waktu tidak cukup | Kerjakan berurutan sesuai label MoSCoW; Could dipotong lebih dulu |
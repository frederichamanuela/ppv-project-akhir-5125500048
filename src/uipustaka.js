// Wrapper pustaka UI. Hanya berkas ini yang boleh memanggil `bootstrap.`

function tampilToast(pesan) {
  if (typeof bootstrap === "undefined") return;
  const el = document.getElementById("toastEl");
  if (!el) return;
  el.querySelector(".toast-body").textContent = pesan;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

// bukaModal() menyusul di langkah berikutnya
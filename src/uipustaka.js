// Wrapper pustaka UI. Hanya berkas ini yang boleh memanggil `bootstrap.`

function tampilToast(pesan) {
  if (typeof bootstrap === "undefined") return;
  const el = document.getElementById("toastEl");
  if (!el) return;
  el.querySelector(".toast-body").textContent = pesan;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

function bukaModal(opsi) {
  if (typeof bootstrap === "undefined") {
    if (confirm(opsi.isi)) opsi.onYa();
    return;
  }
  const el = document.getElementById("modalKonfirmasi");
  el.querySelector(".modal-title").textContent = opsi.judul;
  el.querySelector(".modal-body").textContent = opsi.isi;
  const lama = el.querySelector("#modalYa");
  const baru = lama.cloneNode(true);
  lama.replaceWith(baru);
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  baru.addEventListener("click", () => {
        document.activeElement.blur();
    modal.hide();
    opsi.onYa();
  });
  modal.show();
}
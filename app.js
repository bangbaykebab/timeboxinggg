// ====== Inisialisasi Awal ======
document.addEventListener("DOMContentLoaded", () => {
  showSection("dashboard");
  loadTransactions();
});

// ====== Navigasi Antar Halaman ======
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ====== Modal ======
const modal = document.getElementById("modal");
const form = document.getElementById("formTransaction");
let editIndex = null;

function openModal() {
  form.reset();
  editIndex = null;
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
}

// ====== Data Transaksi ======
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  loadTransactions();
}

// ====== Tambah / Edit Transaksi ======
form.addEventListener("submit", e => {
  e.preventDefault();
  const type = form.type.value;
  const desc = form.desc.value.trim();
  const amount = parseFloat(form.amount.value);

  if (!desc || isNaN(amount)) return alert("Lengkapi semua data!");

  if (editIndex !== null) {
    transactions[editIndex] = { type, desc, amount };
  } else {
    transactions.push({ type, desc, amount });
  }

  saveTransactions();
  closeModal();
});

// ====== Hapus Transaksi ======
function deleteTransaction(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    transactions.splice(index, 1);
    saveTransactions();
  }
}

// ====== Load & Tampilkan Data ======
function loadTransactions() {
  const tbody = document.getElementById("transactionTable");
  const balanceEl = document.getElementById("balanceValue");
  tbody.innerHTML = "";

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
      <td>${t.desc}</td>
      <td>Rp ${t.amount.toLocaleString()}</td>
      <td>
        <button class="btn-primary" onclick="editTransaction(${i})">Edit</button>
        <button class="btn-danger" onclick="deleteTransaction(${i})">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);

    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  const balance = totalIncome - totalExpense;
  balanceEl.textContent = `Rp ${balance.toLocaleString()}`;
}

// ====== Edit Transaksi ======
function editTransaction(index) {
  const t = transactions[index];
  form.type.value = t.type;
  form.desc.value = t.desc;
  form.amount.value = t.amount;
  editIndex = index;
  modal.classList.add("active");
}

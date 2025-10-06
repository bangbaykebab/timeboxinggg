// ==============================
// UANGKU - SCRIPT DASAR
// ==============================

// Data disimpan di localStorage
let dataKeuangan = JSON.parse(localStorage.getItem("dataKeuangan")) || {};

// ==============================
// RENDER DASHBOARD (Halaman 1)
// ==============================
function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  const monthList = document.getElementById("monthList");
  monthList.innerHTML = "";

  let totalIncome = 0;
  let totalExpenses = 0;

  for (let bulan in dataKeuangan) {
    const monthData = dataKeuangan[bulan];
    const income = monthData.totalIncome || 0;
    const expenses = monthData.totalExpenses || 0;
    totalIncome += income;
    totalExpenses += expenses;

    const row = document.createElement("div");
    row.className = "month-row";
    row.innerHTML = `
      <div class="month-name" onclick="openMonth('${bulan}')">${bulan}</div>
      <div class="month-income">Rp ${income.toLocaleString()}</div>
      <div class="month-expense">Rp ${expenses.toLocaleString()}</div>
    `;
    monthList.appendChild(row);
  }

  document.getElementById("currentBalance").innerText = `Rp ${(totalIncome - totalExpenses).toLocaleString()}`;
  document.getElementById("totalIncome").innerText = `Rp ${totalIncome.toLocaleString()}/mo`;
  document.getElementById("totalExpenses").innerText = `Rp ${totalExpenses.toLocaleString()}/mo`;
}

// ==============================
// HALAMAN 2 - RIWAYAT BULANAN
// ==============================
function openMonth(bulan) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("monthDetail").style.display = "block";
  document.getElementById("monthTitle").innerText = bulan;
  const dayList = document.getElementById("dayList");
  dayList.innerHTML = "";

  const monthData = dataKeuangan[bulan] || {};
  let totalIncome = 0, totalExpenses = 0;

  for (let tanggal in monthData.harian || {}) {
    const dataHari = monthData.harian[tanggal];
    const income = dataHari.income || 0;
    const expenses = dataHari.expenses || 0;
    totalIncome += income;
    totalExpenses += expenses;

    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <div class="day-name" onclick="openDay('${bulan}','${tanggal}')">${tanggal}</div>
      <div class="day-income">Rp ${income.toLocaleString()}</div>
      <div class="day-expense">Rp ${expenses.toLocaleString()}</div>
    `;
    dayList.appendChild(row);
  }

  document.getElementById("monthIncome").innerText = `Rp ${totalIncome.toLocaleString()}`;
  document.getElementById("monthExpenses").innerText = `Rp ${totalExpenses.toLocaleString()}`;
}

function backToDashboard() {
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("monthDetail").style.display = "none";
  renderDashboard();
}

// ==============================
// HALAMAN 3 - RIWAYAT HARIAN
// ==============================
function openDay(bulan, tanggal) {
  document.getElementById("monthDetail").style.display = "none";
  document.getElementById("dayDetail").style.display = "block";
  document.getElementById("dayTitle").innerText = `${tanggal} (${bulan})`;

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  const dataHari = dataKeuangan[bulan]?.harian?.[tanggal]?.transaksi || [];

  let totalIncome = 0;
  let totalExpenses = 0;

  dataHari.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "transaction-card";
    div.innerHTML = `
      <div class="transaction-desc">${item.deskripsi}</div>
      <div class="transaction-income">${item.tipe === "income" ? "Rp " + item.nominal.toLocaleString() : ""}</div>
      <div class="transaction-expense">${item.tipe === "expenses" ? "Rp " + item.nominal.toLocaleString() : ""}</div>
    `;
    div.onclick = () => openEditForm(bulan, tanggal, index);
    list.appendChild(div);

    if (item.tipe === "income") totalIncome += item.nominal;
    else totalExpenses += item.nominal;
  });

  document.getElementById("dayIncome").innerText = `Rp ${totalIncome.toLocaleString()}`;
  document.getElementById("dayExpenses").innerText = `Rp ${totalExpenses.toLocaleString()}`;
}

function backToMonth() {
  document.getElementById("dayDetail").style.display = "none";
  document.getElementById("monthDetail").style.display = "block";
  renderDashboard();
}

// ==============================
// HALAMAN 4 & 5 - FORM TAMBAH / EDIT
// ==============================
let editMode = null; // null = tambah, {bulan, tanggal, index} = edit

function openAddForm(bulan, tanggal) {
  editMode = null;
  document.getElementById("formModal").style.display = "block";
  document.getElementById("formDate").value = tanggal || "";
  document.getElementById("formType").value = "income";
  document.getElementById("formNominal").value = "";
  document.getElementById("formDesc").value = "";
}

function openEditForm(bulan, tanggal, index) {
  editMode = { bulan, tanggal, index };
  const item = dataKeuangan[bulan].harian[tanggal].transaksi[index];

  document.getElementById("formModal").style.display = "block";
  document.getElementById("formDate").value = tanggal;
  document.getElementById("formType").value = item.tipe;
  document.getElementById("formNominal").value = item.nominal;
  document.getElementById("formDesc").value = item.deskripsi;
}

function saveForm() {
  const tanggal = document.getElementById("formDate").value;
  const tipe = document.getElementById("formType").value;
  const nominal = parseInt(document.getElementById("formNominal").value) || 0;
  const deskripsi = document.getElementById("formDesc").value;
  const bulan = document.getElementById("monthTitle").innerText;

  if (!dataKeuangan[bulan]) dataKeuangan[bulan] = { totalIncome: 0, totalExpenses: 0, harian: {} };
  if (!dataKeuangan[bulan].harian[tanggal]) dataKeuangan[bulan].harian[tanggal] = { income: 0, expenses: 0, transaksi: [] };

  const hariData = dataKeuangan[bulan].harian[tanggal];

  if (editMode) {
    hariData.transaksi[editMode.index] = { tipe, nominal, deskripsi };
  } else {
    hariData.transaksi.push({ tipe, nominal, deskripsi });
  }

  // Update total income & expense harian
  hariData.income = hariData.transaksi.filter(t => t.tipe === "income").reduce((a, b) => a + b.nominal, 0);
  hariData.expenses = hariData.transaksi.filter(t => t.tipe === "expenses").reduce((a, b) => a + b.nominal, 0);

  // Update total bulanan
  dataKeuangan[bulan].totalIncome = Object.values(dataKeuangan[bulan].harian).reduce((a, b) => a + b.income, 0);
  dataKeuangan[bulan].totalExpenses = Object.values(dataKeuangan[bulan].harian).reduce((a, b) => a + b.expenses, 0);

  localStorage.setItem("dataKeuangan", JSON.stringify(dataKeuangan));
  closeForm();
  backToMonth();
}

function closeForm() {
  document.getElementById("formModal").style.display = "none";
}

// ==============================
// INISIALISASI
// ==============================
window.onload = () => {
  renderDashboard();
};

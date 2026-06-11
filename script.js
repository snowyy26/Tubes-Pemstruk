// === DATA & LOCAL STORAGE ===
let data = [];

// Muat data dari Local Storage saat pertama kali dibuka
function loadData() {
    const stored = localStorage.getItem('travelLogData');
    if (stored) {
        data = JSON.parse(stored);
    } else {
        // Data dummy awal
        data = [
            ["2023-01-01", "Bali", "Liburan", 2500000],
            ["2023-02-15", "Yogyakarta", "Business Trip", 1500000]
        ];
        saveData();
    }
}

// Simpan data ke Local Storage
function saveData() {
    localStorage.setItem('travelLogData', JSON.stringify(data));
    updateStatistik();
}

// === TOAST NOTIFICATION ===
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === NAVIGATION ===
function showPage(pageId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(b => b.classList.remove('active'));

    document.getElementById('page-' + pageId).classList.add('active');
    document.getElementById('btn-' + pageId).classList.add('active');

    if(pageId === 'view') renderTable();
    if(pageId === 'edit') populateSelectEdit();
    if(pageId === 'delete') populateSelectDelete();
    if(pageId === 'statistik') updateStatistik();
}

// === TAMBAH DATA (CREATE) ===
function handleAdd(e) {
    e.preventDefault();

    const tgl = document.getElementById('inp-tanggal').value;
    const tujuan = document.getElementById('inp-tujuan').value;
    const keperluan = document.getElementById('inp-keperluan').value;
    const biaya = parseFloat(document.getElementById('inp-biaya').value);

    if (!tgl || !tujuan || !keperluan || !biaya) {
        showToast("⚠️ Mohon lengkapi semua data!");
        return;
    }

    // Validasi biaya harus positif
    if (biaya <= 0) {
        showToast("⚠️ Biaya harus lebih dari 0!");
        return;
    }

    data.push([tgl, tujuan, keperluan, biaya]);
    saveData();

    showToast("✅ Catatan berhasil ditambahkan!");
    e.target.reset();
}

// === LIHAT DATA (READ) ===
function renderTable(filterKeyword = "") {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = "";

    let displayData = data;

    // Pencarian real-time
    if(filterKeyword !== "") {
        displayData = data.filter(item => 
            item[1].toLowerCase().includes(filterKeyword.toLowerCase()) || 
            item[2].toLowerCase().includes(filterKeyword.toLowerCase())
        );
    }

    // Sorting default: berdasarkan tanggal (terbaru di atas)
    displayData.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    if(displayData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #999; padding: 30px;">
            📭 Belum ada data perjalanan<br>
            <small>Klik "Tambah" untuk menambahkan perjalanan pertama Anda</small>
        </td></tr>`;
        return;
    }

    displayData.forEach((item, index) => {
        const biayaRp = item[3].toLocaleString('id-ID');
        
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${formatDate(item[0])}</td>
            <td><strong>${item[1]}</strong></td>
            <td>${item[2]}</td>
            <td>Rp ${biayaRp}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}

function searchData() {
    const input = document.getElementById('search-input').value;
    renderTable(input);
}

function sortData(ascending) {
    data.sort((a, b) => {
        if(ascending) return a[3] - b[3];
        else return b[3] - a[3];
    });
    renderTable();
    showToast(ascending ? "⬆️ Urutkan: Termurah" : "⬇️ Urutkan: Termahal");
}

// === UBAH DATA (UPDATE) ===
function populateSelectEdit() {
    const select = document.getElementById('edit-select-index');
    select.innerHTML = "<option value=''>-- Pilih Nomor Data --</option>";
    
    // Urutkan berdasarkan tanggal terbaru
    const sortedData = [...data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    sortedData.forEach((item, index) => {
        const biayaRp = item[3].toLocaleString('id-ID');
        select.innerHTML += `<option value="${index}">${item[1]} - ${item[2]} (Rp ${biayaRp})</option>`;
    });
}

function fillEditForm() {
    const idx = document.getElementById('edit-select-index').value;
    if(idx === "") {
        document.getElementById('edit-tanggal').value = "";
        document.getElementById('edit-tujuan').value = "";
        document.getElementById('edit-keperluan').value = "";
        document.getElementById('edit-biaya').value = "";
        return;
    }

    // Ambil data sesuai indeks setelah di-sort
    const sortedData = [...data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const item = sortedData[idx];
    
    document.getElementById('edit-index').value = idx;
    document.getElementById('edit-tanggal').value = item[0];
    document.getElementById('edit-tujuan').value = item[1];
    document.getElementById('edit-keperluan').value = item[2];
    document.getElementById('edit-biaya').value = item[3];
}

function handleUpdate(e) {
    e.preventDefault();
    const idx = document.getElementById('edit-select-index').value;
    
    if(idx === "") {
        showToast("⚠️ Pilih data yang ingin diubah!");
        return;
    }

    const tgl = document.getElementById('edit-tanggal').value;
    const tujuan = document.getElementById('edit-tujuan').value;
    const keperluan = document.getElementById('edit-keperluan').value;
    const biaya = parseFloat(document.getElementById('edit-biaya').value);

    if (!tgl || !tujuan || !keperluan || !biaya) {
        showToast("⚠️ Data tidak boleh kosong!");
        return;
    }

    // Update data (注意⚠️: Ini update data asli yang sudah di-sort)
    const sortedData = [...data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const originalIndex = data.indexOf(sortedData[idx]);
    
    data[originalIndex] = [tgl, tujuan, keperluan, biaya];
    saveData();

    showToast("✅ Data berhasil diperbarui!");
    showPage('view');
}

// === HAPUS DATA (DELETE) ===
function populateSelectDelete() {
    const select = document.getElementById('delete-select-index');
    select.innerHTML = "<option value=''>-- Pilih Nomor Data --</option>";
    
    const sortedData = [...data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    sortedData.forEach((item, index) => {
        select.innerHTML += `<option value="${index}">${item[1]} - ${item[2]}</option>`;
    });
}

function handleDelete() {
    const idx = document.getElementById('delete-select-index').value;
    
    if(idx === "") {
        showToast("⚠️ Pilih data yang ingin dihapus!");
        return;
    }

    const konfirmasi = confirm("Yakin ingin menghapus data ini?");
    if(konfirmasi) {
        const sortedData = [...data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
        const originalIndex = data.indexOf(sortedData[idx]);
        
        data.splice(originalIndex, 1);
        saveData();
        
        showToast("🗑️ Data berhasil dihapus!");
        populateSelectDelete();
    }
}

// === REKOMENDASI DESTINASI ===
function rekomendasiDestinasi() {
    const budget = parseFloat(document.getElementById('budget-input').value);
    const resultDiv = document.getElementById('rekomendasi-result');
    
    if(!budget || isNaN(budget) || budget <= 0) {
        showToast("⚠️ Masukkan budget yang valid!");
        resultDiv.innerHTML = "";
        return;
    }

    const destinasi_list = [
        ["Bali", "Termasuk wisata pantai dan budaya", 2500000],
        ["Bromo", "Belum termasuk jeep", 900000],
        ["Labuan Bajo", "Termasuk tour guide", 3500000],
        ["Yogyakarta", "Termasuk sewa mobil", 1500000],
        ["Surabaya", "Termasuk hotel 1 malam", 1200000],
        ["Jakarta", "Wisata kota", 1000000],
        ["Bogor", "Wisata alam", 800000],
        ["Malang", "Wisata keluarga", 1300000],
        ["Makassar", "Wisata pantai", 1600000],
        ["Padang", "Wisata budaya", 1400000]
    ];

    // Filter destinasi sesuai budget
    const cocok = destinasi_list.filter(d => d[2] <= budget);

    if(cocok.length === 0) {
        resultDiv.innerHTML = `<div style="text-align:center; padding: 20px; color: #e74c3c;">
            😔 Tidak ada destinasi yang sesuai budget<br>
            <small>Coba naikkan budget Anda</small>
        </div>`;
        return;
    }

    // Urutkan yang terdekat dengan budget
    cocok.sort((a, b) => b[2] - a[2]);

    let html = `<div style="margin-top: 20px;">
        <h3 style="color: #27ae60;">🎯 Rekomendasi Destinasi:</h3>
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Destinasi</th>
                    <th>Keterangan</th>
                    <th>Perkiraan Biaya</th>
                </tr>
            </thead>
            <tbody>`;
    
    cocok.forEach((d, i) => {
        const sisaBudget = budget - d[2];
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${d[0]}</strong></td>
            <td>${d[1]}</td>
            <td>Rp ${d[2].toLocaleString('id-ID')}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    resultDiv.innerHTML = html;
    
    showToast("🎯 Ditemukan " + cocok.length + " destinasi dalam budget!");
}

// === STATISTIK ===
function updateStatistik() {
    // Total Trip
    document.getElementById('stat-total-trip').innerText = data.length;
    
    // Total Biaya
    const totalBiaya = data.reduce((sum, item) => sum + item[3], 0);
    document.getElementById('stat-total-biaya').innerText = "Rp " + totalBiaya.toLocaleString('id-ID');
    
    // Rata-rata Biaya
    const rata = data.length > 0 ? Math.floor(totalBiaya / data.length) : 0;
    document.getElementById('stat-rata-biaya').innerText = "Rp " + rata.toLocaleString('id-ID');
    
    // Tujuan Favorit
    if(data.length > 0) {
        const tujuanCounts = {};
        data.forEach(item => {
            tujuanCounts[item[1]] = (tujuanCounts[item[1]] || 0) + 1;
        });
        
        const fav = Object.keys(tujuanCounts).reduce((a, b) => 
            tujuanCounts[a] > tujuanCounts[b] ? a : b
        );
        document.getElementById('stat-fav').innerText = fav;
    } else {
        document.getElementById('stat-fav').innerText = "-";
    }
}

function resetAllData() {
    const konfirmasi = confirm("⚠️ Yakin ingin RESET semua data? Data tidak bisa dikembalikan!");
    if(konfirmasi) {
        data = [];
        saveData();
        showToast("🔄 Semua data telah direset!");
        showPage('view');
    }
}

// === INISIALISASI SAAT HALAMAN DIMUAT ===
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showPage('add');
});

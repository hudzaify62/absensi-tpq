// Inisialisasi Data dari LocalStorage
let daftarSantri = JSON.parse(localStorage.getItem('tpq_santri')) || [];
let dataAbsensi = JSON.parse(localStorage.getItem('tpq_absensi')) || [];

const tglHariIni = new Date().toISOString().split('T')[0];
document.getElementById('tgl-sekarang').innerText = "Tanggal: " + tglHariIni;

// Fungsi Navigasi
function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';
    
    if (sectionId === 'absensi') renderAbsensi();
    if (sectionId === 'rekap') renderRekap();
    if (sectionId === 'santri') renderSantri();
}

// 1. Logika Daftar Santri
function tambahSantri() {
    const input = document.getElementById('nama-santri');
    if (input.value.trim() === "") return;
    
    daftarSantri.push(input.value.trim());
    input.value = "";
    simpanKeStorage();
    renderSantri();
}

function hapusSantri(index) {
    if (confirm("Hapus santri ini?")) {
        daftarSantri.splice(index, 1);
        simpanKeStorage();
        renderSantri();
    }
}

function renderSantri() {
    const list = document.getElementById('list-santri');
    list.innerHTML = daftarSantri.map((s, i) => `
        <li style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
            ${s} <button class="delete-btn" onclick="hapusSantri(${i})">Hapus</button>
        </li>
    `).join('');
}

// 2. Logika Absensi
function renderAbsensi() {
    const tbody = document.getElementById('table-absensi-body');
    // Ambil absensi hari ini jika sudah pernah disimpan
    const absensiHariIni = dataAbsensi.filter(a => a.tanggal === tglHariIni);

    tbody.innerHTML = daftarSantri.map(s => {
        const record = absensiHariIni.find(r => r.nama === s);
        const status = record ? record.status : 'Hadir'; // Default Hadir
        
        return `
            <tr>
                <td>${s}</td>
                <td>
                    <select data-nama="${s}">
                        <option value="Hadir" ${status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                        <option value="Izin" ${status === 'Izin' ? 'selected' : ''}>Izin</option>
                        <option value="Sakit" ${status === 'Sakit' ? 'selected' : ''}>Sakit</option>
                        <option value="Alpha" ${status === 'Alpha' ? 'selected' : ''}>Alpha</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQwXXmR5dqjYAQMh3Jjz_uBNWpZv0MJIzwzNxGNFEEF0ba-WW-vn9A2Vq5z1RkwkEDLg/exec";

async function simpanAbsensi() {
    const selects = document.querySelectorAll('#table-absensi-body select');
    const dataBaru = [];
    
    selects.forEach(sel => {
        dataBaru.push({
            nama: sel.getAttribute('data-nama'),
            status: sel.value,
            tanggal: tglHariIni
        });
    });

    // Tampilkan loading sederhana
    const btn = document.querySelector('.btn-save');
    btn.innerText = "Mengirim...";
    btn.disabled = true;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dataBaru)
        });
        
        // Tetap simpan di lokal sebagai cadangan
        dataAbsensi = [...dataAbsensi, ...dataBaru];
        simpanKeStorage();
        
        alert("Berhasil simpan ke Google Sheets!");
    } catch (error) {
        alert("Gagal kirim ke online, tapi data tersimpan di HP ini.");
        console.error(error);
    } finally {
        btn.innerText = "Simpan Absensi";
        btn.disabled = false;
    }
}

function resetAbsensiHariIni() {
    if (confirm("Reset absensi khusus hari ini?")) {
        dataAbsensi = dataAbsensi.filter(a => a.tanggal !== tglHariIni);
        simpanKeStorage();
        renderAbsensi();
    }
}

// 3. Logika Rekap
function renderRekap() {
    const tbody = document.getElementById('table-rekap-body');
    
    tbody.innerHTML = daftarSantri.map(s => {
        const hitung = (status) => dataAbsensi.filter(a => a.nama === s && a.status === status).length;
        
        return `
            <tr>
                <td>${s}</td>
                <td>${hitung('Hadir')}</td>
                <td>${hitung('Izin')}</td>
                <td>${hitung('Sakit')}</td>
                <td>${hitung('Alpha')}</td>
            </tr>
        `;
    }).join('');
}

function simpanKeStorage() {
    localStorage.setItem('tpq_santri', JSON.stringify(daftarSantri));
    localStorage.setItem('tpq_absensi', JSON.stringify(dataAbsensi));
}

// Load Awal
renderSantri();
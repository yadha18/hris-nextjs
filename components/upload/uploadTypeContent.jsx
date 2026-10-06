import { DEFAULT_LEMBUR_YEARS } from '@/lib/config';
import { UPLOAD_TYPES } from '@/lib/upload/uploadRegistry';

export const UPLOAD_TYPE_CONTENT = {
  karyawan: {
    description: (
      <>
        Kolom: {UPLOAD_TYPES.karyawan.columns.map(({ header }) => header).join(', ')}.
        <br />
        💡 <strong>Sub Bidang</strong> tetap tersimpan meski belum ada di Daftar Sub Bidang — tambahkan lewat menu &quot;Daftar Jabatan&quot; agar muncul di dropdown.
        <br />
        🔑 <strong>NIP diperlakukan sebagai Primary Key.</strong> NIP yang sudah terdaftar tidak menambah data baru — hanya kolom yang masih kosong yang dilengkapi.
      </>
    ),
    previewNote: (
      <>
        ℹ️ NIP diperlakukan sebagai <strong>Primary Key</strong>. Baris <strong>Baru</strong> ditambahkan sebagai karyawan baru. Baris <strong>🔁 NIP Diperbarui</strong> (NIK cocok dengan karyawan yang sudah ada, tapi NIP berbeda) akan MENGGANTI NIP lama ke NIP baru pada karyawan yang sama, dan data Lembur/SPPD serta Monitoring Laptop miliknya ikut disesuaikan otomatis. Baris <strong>🧩 NIP Sudah Ada</strong> TIDAK menambah data baru maupun menimpa data yang sudah terisi — hanya kolom yang di data lama masih KOSONG yang diisi dari file ini.
      </>
    ),
  },
  lembur: {
    description: (
      <>
        Kolom: <strong>NIP, Nominal, Bulan, Tagihan</strong> (Bulan: &quot;Januari&quot;–&quot;Desember&quot; {DEFAULT_LEMBUR_YEARS.join('/')}; Tagihan: &quot;SPPD 1 2&quot; atau &quot;Lembur&quot;).
        <br />
        ℹ️ Nama, SBU, dan Jabatan otomatis diambil dari Data Karyawan berdasarkan NIP — cukup isi NIP di file Excel.
      </>
    ),
    previewNote: (
      <>
        ℹ️ Nama, SBU, dan Jabatan otomatis diambil dari NIP. Kolom <strong>Bulan</strong> wajib salah satu dari 12 bulan tahun {DEFAULT_LEMBUR_YEARS.join(' / ')} (mis. &quot;Januari&quot;, &quot;Januari 2027&quot;) agar masuk breakdown bulanan.
      </>
    ),
  },
  laptop: {
    description: (
      <>
        Kolom: <strong>NIP (opsional), Nama Perangkat, PA, Serial Number, Status</strong> (Status: &quot;Aktif&quot;, &quot;Belum Dikembalikan&quot;, atau &quot;Sudah Dikembalikan&quot; — boleh dikosongkan).
        <br />
        ℹ️ NIP <strong>tidak wajib</strong> — jika diisi &amp; ditemukan di Data Karyawan, Nama Pengguna &amp; Regional (SBU) otomatis terisi. Jika NIP kosong/tidak ditemukan, isi kolom <strong>Nama Pengguna</strong> &amp; <strong>Regional</strong> di Excel (salah satu dari NIP/Nama Pengguna wajib terisi).
        <br />
        📎 <strong>Bukti Berita Acara Pengembalian</strong> (gambar) tidak bisa diupload lewat Excel — upload manual per laptop lewat tombol ✏️ Edit setelah data masuk.
      </>
    ),
    previewNote: (
      <>
        ℹ️ Nama Pengguna &amp; Regional otomatis diambil dari NIP bila ditemukan. Bukti Berita Acara diupload manual per laptop setelah data ini masuk.
      </>
    ),
  },
};
import { 
  Student, 
  AttendanceRecord, 
  Pegawai, 
  MasterKelas, 
  PelanggaranRecord, 
  RewardRecord, 
  SchoolProfileData 
} from '../types';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: string[];
}

export class GoogleSheetsService {
  /**
   * Fetch spreadsheet info and verify access
   */
  static async getSpreadsheetInfo(accessToken: string, spreadsheetId: string): Promise<SpreadsheetInfo> {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengakses spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
      title: data.properties?.title || 'Untitled Spreadsheet',
      sheets: (data.sheets || []).map((s: any) => s.properties?.title || '')
    };
  }

  /**
   * Create a new structured school database spreadsheet in user's Google Drive
   */
  static async createSchoolSpreadsheet(
    accessToken: string, 
    schoolName: string = 'SDN Kebonagung 1'
  ): Promise<SpreadsheetInfo> {
    const title = `STAR-KIDS Database - ${schoolName} (${new Date().getFullYear()})`;
    
    const requestBody = {
      properties: {
        title,
        locale: 'id_ID',
        timeZone: 'Asia/Jakarta'
      },
      sheets: [
        { properties: { title: 'Ringkasan & Profil', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Data Siswa', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Presensi Harian', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Guru & Pegawai', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Rombel & Wali Kelas', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Catatan Pelanggaran', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Catatan Reward', gridProperties: { frozenRowCount: 1 } } }
      ]
    };

    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat spreadsheet baru (${res.status})`);
    }

    const data = await res.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
      title: data.properties?.title || title,
      sheets: (data.sheets || []).map((s: any) => s.properties?.title || '')
    };
  }

  /**
   * Export and synchronize all school data into Google Sheets tabs
   */
  static async exportAllData(
    accessToken: string,
    spreadsheetId: string,
    payload: {
      schoolProfile?: SchoolProfileData;
      students: Student[];
      attendanceList: AttendanceRecord[];
      pegawaiList: Pegawai[];
      masterKelas: MasterKelas[];
      pelanggaranList: PelanggaranRecord[];
      rewardList: RewardRecord[];
    }
  ): Promise<{ updatedCells: number; timestamp: string }> {
    const {
      schoolProfile,
      students,
      attendanceList,
      pegawaiList,
      masterKelas,
      pelanggaranList,
      rewardList
    } = payload;

    const nowStr = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium'
    }).format(new Date());

    // 1. Sheet: Ringkasan & Profil
    const profilRows: any[][] = [
      ['PARAMETER PROFIL', 'NILAI / KETERANGAN'],
      ['Nama Sekolah', schoolProfile?.namaSekolah || 'SDN Kebonagung 1'],
      ['NPSN', schoolProfile?.npsn || '20535384'],
      ['Status Sekolah', schoolProfile?.statusSekolah || 'Negeri'],
      ['Akreditasi', schoolProfile?.akreditasi || 'A (Unggul)'],
      ['Kepala Sekolah', schoolProfile?.kepalaSekolahNama || '-'],
      ['NIP Kepala Sekolah', schoolProfile?.kepalaSekolahNip || '-'],
      ['Alamat Lengkap', `${schoolProfile?.alamatJalan || ''}, ${schoolProfile?.kelurahan || ''}, ${schoolProfile?.kecamatan || ''}, ${schoolProfile?.kota || ''}`],
      ['Telepon / WA', schoolProfile?.teleponKantor || '-'],
      ['Hotline Satgas TPPK', schoolProfile?.hotlineTppk || '-'],
      ['Terakhir Disinkronkan', nowStr],
      ['Total Siswa Aktif', students.length],
      ['Total Guru & Pegawai', pegawaiList.length],
      ['Total Rekor Presensi', attendanceList.length],
      ['Total Kasus Pelanggaran', pelanggaranList.length],
      ['Total Prestasi/Reward', rewardList.length]
    ];

    // 2. Sheet: Data Siswa
    const studentRows: any[][] = [
      ['NO', 'NISN', 'NAMA LENGKAP', 'L/P', 'KELAS', 'WALI KELAS', 'ORANG TUA / WALI', 'NO HP ORANG TUA', 'POIN PELANGGARAN', 'POIN REWARD', 'STATUS RESIKO']
    ];
    students.forEach((st, idx) => {
      studentRows.push([
        idx + 1,
        st.nisn,
        st.namaLengkap,
        st.jenisKelamin,
        st.kelas,
        st.waliKelas || '-',
        st.namaOrangTua || '-',
        st.noHpOrangTua || '-',
        st.totalPoinPelanggaran || 0,
        st.totalPoinReward || 0,
        st.statusResiko || 'Aman'
      ]);
    });

    // 3. Sheet: Presensi Harian
    const attendanceRows: any[][] = [
      ['NO', 'TANGGAL', 'NISN', 'NAMA SISWA', 'KELAS', 'STATUS', 'KETERANGAN', 'WALI KELAS', 'WAKTU REKAM']
    ];
    // Sort recent first
    const sortedAtt = [...attendanceList].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    sortedAtt.forEach((att, idx) => {
      attendanceRows.push([
        idx + 1,
        att.tanggal,
        att.nisn,
        att.nama,
        att.kelas,
        att.status,
        att.keterangan || '-',
        att.waliKelas || '-',
        att.timestamp || '-'
      ]);
    });

    // 4. Sheet: Guru & Pegawai
    const pegawaiRows: any[][] = [
      ['NO', 'NIP', 'NAMA LENGKAP', 'L/P', 'KATEGORI', 'JABATAN', 'KELAS BINAAN', 'STATUS KEPEGAWAIAN', 'NO HP', 'EMAIL']
    ];
    pegawaiList.forEach((p, idx) => {
      pegawaiRows.push([
        idx + 1,
        p.nip || '-',
        p.namaLengkap,
        p.jenisKelamin,
        p.kategori,
        p.jabatan,
        p.kelasBinaan || '-',
        p.statusKepegawaian,
        p.noHp,
        p.email || '-'
      ]);
    });

    // 5. Sheet: Rombel & Wali Kelas
    const rombelRows: any[][] = [
      ['NO', 'KELAS / ROMBEL', 'WALI KELAS', 'NIP WALI KELAS', 'TAHUN AJARAN', 'KAPASITAS SISWA']
    ];
    masterKelas.forEach((k, idx) => {
      rombelRows.push([
        idx + 1,
        k.kelas,
        k.waliKelas,
        k.nipWaliKelas || '-',
        k.tahunAjaran,
        k.kapasitasSiswa || 28
      ]);
    });

    // 6. Sheet: Catatan Pelanggaran
    const pelanggaranRows: any[][] = [
      ['NO', 'TANGGAL', 'NISN', 'NAMA SISWA', 'KELAS', 'KATEGORI', 'JENIS PELANGGARAN', 'POIN', 'STATUS PENANGANAN', 'PETUGAS']
    ];
    pelanggaranList.forEach((pg, idx) => {
      pelanggaranRows.push([
        idx + 1,
        pg.tanggal,
        pg.nisn,
        pg.namaSiswa,
        pg.kelas,
        pg.kategori,
        pg.jenisPelanggaran,
        pg.poin,
        pg.statusPenanganan,
        pg.petugas || '-'
      ]);
    });

    // 7. Sheet: Catatan Reward
    const rewardRows: any[][] = [
      ['NO', 'TANGGAL', 'NISN', 'NAMA SISWA', 'KELAS', 'KATEGORI', 'JENIS REWARD / PRESTASI', 'TINGKAT', 'POIN APRESIASI', 'PETUGAS']
    ];
    rewardList.forEach((rw, idx) => {
      rewardRows.push([
        idx + 1,
        rw.tanggal,
        rw.nisn,
        rw.namaSiswa,
        rw.kelas,
        rw.kategori,
        rw.jenisReward,
        rw.tingkat,
        rw.poin,
        rw.petugas || '-'
      ]);
    });

    const dataPayload = [
      { range: "'Ringkasan & Profil'!A1:B16", values: profilRows },
      { range: "'Data Siswa'!A1:K" + studentRows.length, values: studentRows },
      { range: "'Presensi Harian'!A1:I" + Math.min(attendanceRows.length, 3000), values: attendanceRows.slice(0, 3000) },
      { range: "'Guru & Pegawai'!A1:J" + pegawaiRows.length, values: pegawaiRows },
      { range: "'Rombel & Wali Kelas'!A1:F" + rombelRows.length, values: rombelRows },
      { range: "'Catatan Pelanggaran'!A1:J" + (pelanggaranRows.length > 1 ? pelanggaranRows.length : 2), values: pelanggaranRows },
      { range: "'Catatan Reward'!A1:J" + (rewardRows.length > 1 ? rewardRows.length : 2), values: rewardRows }
    ];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: dataPayload
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengekspor data ke Google Sheets (${res.status})`);
    }

    const result = await res.json();
    return {
      updatedCells: result.totalUpdatedCells || 0,
      timestamp: nowStr
    };
  }

  /**
   * Import students from Google Sheets tab
   */
  static async importStudents(
    accessToken: string,
    spreadsheetId: string,
    range = "'Data Siswa'!A2:K1000"
  ): Promise<Partial<Student>[]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membaca tab Data Siswa (${res.status})`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    const students: Partial<Student>[] = [];
    rows.forEach(row => {
      // row[1] = NISN, row[2] = Nama Lengkap, row[3] = L/P, row[4] = Kelas, row[5] = Wali Kelas, row[6] = Orang Tua, row[7] = No HP
      if (row[1] && row[2]) {
        students.push({
          nisn: String(row[1]).trim(),
          namaLengkap: String(row[2]).trim(),
          jenisKelamin: (row[3] === 'P' ? 'P' : 'L'),
          kelas: String(row[4] || '1A').trim(),
          waliKelas: String(row[5] || '').trim(),
          namaOrangTua: String(row[6] || '').trim(),
          noHpOrangTua: String(row[7] || '').trim(),
          totalPoinPelanggaran: parseInt(row[8], 10) || 0,
          totalPoinReward: parseInt(row[9], 10) || 0,
          statusResiko: (row[10] === 'Berisiko' || row[10] === 'Waspada') ? row[10] : 'Aman'
        });
      }
    });

    return students;
  }
}

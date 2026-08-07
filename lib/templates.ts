// ─── Template Library ───────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  kategori: string;
  defaultTema: string;
  defaultDurasi: number;
  defaultGaya: string;
  prompt: string;
  description: string;
  tags: string[];
}

export const TEMPLATES: Template[] = [
  // ─── Khutbah Jumat ───────────────────────────────────────────────────────
  {
    id: "kj-sabar",
    name: "Khutbah Jumat: Sabar",
    kategori: "Khutbah Jumat",
    defaultTema: "Kesabaran di Tengah Cobaan",
    defaultDurasi: 20,
    defaultGaya: "formal",
    prompt: "Buatkan khutbah Jumat tentang kesabaran. Sertakan ayat Al-Quran tentang sabar, hadits Nabi tentang ujian, dan contoh sabar para sahabat. Struktur: pembukaan, ayat/hadits, penjelasan, dan penutup dengan doa.",
    description: "Khutbah tentang kesabaran menghadapi cobaan hidup berdasarkan Al-Quran dan Hadits.",
    tags: ["sabar", "cobaan", "ketabahan", "sunnah"],
  },
  {
    id: "kj-ikhlas",
    name: "Khutbah Jumat: Ikhlas",
    kategori: "Khutbah Jumat",
    defaultTema: "Ikhlas dalam Beramal",
    defaultDurasi: 20,
    defaultGaya: "formal",
    prompt: "Buatkan khutbah Jumat tentang keikhlasan. Sertakan firman Allah tentang ikhlas, hadits tentang niat, dan contoh ikhlas dalam kehidupan sehari-hari. Struktur: pembukaan, dalil, penjelasan, dan penutup.",
    description: "Khutbah tentang keikhlasan dalam beramal dan beribadah kepada Allah.",
    tags: ["ikhlas", "niat", "amal"],
  },
  {
    id: "kj-taqwa",
    name: "Khutbah Jumat: Taqwa",
    kategori: "Khutbah Jumat",
    defaultTema: "Bertakwa kepada Allah",
    defaultDurasi: 20,
    defaultGaya: "formal",
    prompt: "Buatkan khutbah Jumat tentang taqwa. Jelaskan makna taqwa, ciri-ciri orang bertakwa berdasarkan Al-Quran, dan cara meningkatkan taqwa. Struktur: pembukaan, ayat, penjelasan, dan penutup dengan doa.",
    description: "Khutbah tentang makna dan pentingnya taqwa dalam kehidupan seorang muslim.",
    tags: ["taqwa", "ketakwaan", "fear of allah"],
  },
  {
    id: "kj-ukhuwah",
    name: "Khutbah Jumat: Ukhuwah",
    kategori: "Khutbah Jumat",
    defaultTema: "Persaudaraan dalam Islam",
    defaultDurasi: 20,
    defaultGaya: "formal",
    prompt: "Buatkan khutbah Jumat tentang ukhuwah Islamiyah. Sertakan ayat tentang persaudaraan, hadits tentang talian persaudaraan, dan tips mempererat ukhuwah. Struktur: pembukaan, dalil, penjelasan, dan penutup.",
    description: "Khutbah tentang pentingnya mempererat tali persaudaraan sesama muslim.",
    tags: ["ukhuwah", "persaudaraan", "tali silaturahmi"],
  },
  {
    id: "kj-syukur",
    name: "Khutbah Jumat: Syukur",
    kategori: "Khutbah Jumat",
    defaultTema: "Bersyukur atas Nikmat Allah",
    defaultDurasi: 20,
    defaultGaya: "formal",
    prompt: "Buatkan khutbah Jumat tentang rasa syukur. Sertakan ayat tentang nikmat dan syukur, hadits tentang bersyukur, dan cara menunjukkan rasa syukur. Struktur: pembukaan, dalil, penjelasan, dan penutup.",
    description: "Khutbah tentang pentingnya bersyukur atas segala nikmat yang Allah berikan.",
    tags: ["syukur", "nikmat", "gratitude"],
  },

  // ─── Kultum Subuh ────────────────────────────────────────────────────────
  {
    id: "ks-berjamaah",
    name: "Kultum Subuh: Sholat Berjamaah",
    kategori: "Kultum Subuh",
    defaultTema: "Keutamaan Sholat Berjamaah",
    defaultDurasi: 10,
    defaultGaya: "formal",
    prompt: "Buatkan kultum subuh tentang keutamaan sholat berjamaah. Sertakan hadits tentang pahala sholat berjamaah, perbedaan pahala sendirian vs berjamaah, dan motivasi untuk rajin ke masjid. Singkat dan padat.",
    description: "Kultum singkat tentang keutamaan sholat berjamaah di masjid.",
    tags: ["sholat", "berjamaah", "masjid", "subuh"],
  },
  {
    id: "ks-dzikir",
    name: "Kultum Subuh: Dzikir Pagi",
    kategori: "Kultum Subuh",
    defaultTema: "Dzikir Pagi dan Petang",
    defaultDurasi: 10,
    defaultGaya: "formal",
    prompt: "Buatkan kultum subuh tentang dzikir pagi. Sebutkan dzikir-dzikir penting setelah sholat subuh, keutamaannya berdasarkan hadits, dan manfaat dzikir bagi kehidupan. Singkat dan mudah dipahami.",
    description: "Kultum tentang dzikir pagi setelah sholat subuh dan keutamaannya.",
    tags: ["dzikir", "pagi", "subuh", "wirid"],
  },
  {
    id: "ks-sedekah",
    name: "Kultum Subuh: Sedekah",
    kategori: "Kultum Subuh",
    defaultTema: "Keutamaan Sedekah",
    defaultDurasi: 10,
    defaultGaya: "formal",
    prompt: "Buatkan kultum subuh tentang sedekah. Sertakan hadits tentang pahala sedekah, jenis-jenis sedekah, dan motivasi bersedekah meski dengan sedikit. Singkat dan penuh motivasi.",
    description: "Kultum tentang keutamaan sedekah dan cara bersedekah dalam Islam.",
    tags: ["sedekah", "amal", "kebaikan"],
  },
  {
    id: "ks-istiqomah",
    name: "Kultum Subuh: Istiqomah",
    kategori: "Kultum Subuh",
    defaultTema: "Istiqomah dalam Beribadah",
    defaultDurasi: 10,
    defaultGaya: "formal",
    prompt: "Buatkan kultum subuh tentang istiqomah. Sertakan ayat tentang istiqomah, hadits tentang amal yang paling dicintai Allah, dan tips konsisten beribadah. Singkat dan memotivasi.",
    description: "Kultum tentang pentingnya istiqomah atau konsistensi dalam beribadah.",
    tags: ["istiqomah", "konsisten", "ibadah"],
  },

  // ─── Ceramah ─────────────────────────────────────────────────────────────
  {
    id: "cr-isramiraj",
    name: "Ceramah: Isra Mi'raj",
    kategori: "Ceramah",
    defaultTema: "Perjalanan Isra Mi'raj",
    defaultDurasi: 30,
    defaultGaya: "naratif",
    prompt: "Buatkan ceramah tentang Isra Mi'raj. Jelaskan kronologi perjalanan Nabi Muhammad SAW dari Mekah ke Yerusalem hingga ke langit, hikmah dan pelajaran dari peristiwa tersebut, serta kaitannya dengan perintah sholat 5 waktu. Gunakan gaya naratif yang menarik.",
    description: "Ceramah mendalam tentang peristiwa Isra Mi'raj Nabi Muhammad SAW.",
    tags: ["isra", "miraj", "nabi muhammad", "sholat"],
  },
  {
    id: "cr-maulid",
    name: "Ceramah: Maulid Nabi",
    kategori: "Ceramah",
    defaultTema: "Memperingati Maulid Nabi",
    defaultDurasi: 30,
    defaultGaya: "formal",
    prompt: "Buatkan ceramah tentang Maulid Nabi Muhammad SAW. Sertakan sejarah kelahiran Nabi, akhlak mulia beliau, dan teladan yang dapat diambil. Gunakan gaya formal yang khidmat.",
    description: "Ceramah tentang sejarah dan hikmah memperingati kelahiran Nabi Muhammad SAW.",
    tags: ["maulid", "nabi", "kelahiran", "akhlak"],
  },
  {
    id: "cr-idulfitri",
    name: "Ceramah: Idul Fitri",
    kategori: "Ceramah",
    defaultTema: "Hikmah Idul Fitri",
    defaultDurasi: 25,
    defaultGaya: "formal",
    prompt: "Buatkan ceramah tentang Idul Fitri. Jelaskan makna kembali suci, pentingnya saling memaafkan, dan bagaimana mempertahankan semangat Ramadhan setelahnya. Gunakan gaya formal yang penuh hikmah.",
    description: "Ceramah tentang hikmah dan makna Idul Fitri setelah menjalani Ramadhan.",
    tags: ["idul fitri", "lebaran", "mohon maaf"],
  },
  {
    id: "cr-ramadhan",
    name: "Ceramah: Ramadhan",
    kategori: "Ceramah",
    defaultTema: "Menyambut Ramadhan",
    defaultDurasi: 25,
    defaultGaya: "formal",
    prompt: "Buatkan ceramah tentang menyambut bulan Ramadhan. Jelaskan keutamaan Ramadhan, cara memaksimalikannya, dan doa menyambut Ramadhan. Gunakan gaya formal yang penuh semangat.",
    description: "Ceramah tentang keutamaan bulan Ramadhan dan cara memanfaatkannya.",
    tags: ["ramadhan", "puasa", "ibadah"],
  },

  // ─── Sambutan Sekolah ────────────────────────────────────────────────────
  {
    id: "ss-mpls",
    name: "Sambutan: MPLS",
    kategori: "Sambutan Sekolah",
    defaultTema: "Pembukaan MPLS",
    defaultDurasi: 15,
    defaultGaya: "formal",
    prompt: "Buatkan sambutan untuk pembukaan MPLS (Masa Pengenalan Lingkungan Sekolah). Sertakan ucapan selamat datang, harapan untuk siswa baru, dan semangat belajar. Gunakan bahasa formal yang menyemangati.",
    description: "Sambutan kepala sekolah atau guru untuk pembukaan MPLS.",
    tags: ["mpls", "sambutan", "siswa baru", "sekolah"],
  },
  {
    id: "ss-harlah",
    name: "Sambutan: Hari Lahir Sekolah",
    kategori: "Sambutan Sekolah",
    defaultTema: "Peringatan Hari Lahir Sekolah",
    defaultDurasi: 15,
    defaultGaya: "formal",
    prompt: "Buatkan sambutan untuk peringatan hari lahir sekolah. Sertakan sejarah singkat sekolah, prestasi yang diraih, dan visi ke depan. Gunakan bahasa formal yang membanggakan.",
    description: "Sambutan untuk memperingati hari lahir atau hari jadi sekolah.",
    tags: ["harlah", "hari jadi", "sekolah", "prestasi"],
  },
  {
    id: "ss-pentasseni",
    name: "Sambutan: Pentas Seni",
    kategori: "Sambutan Sekolah",
    defaultTema: "Pentas Seni dan Budaya",
    defaultDurasi: 10,
    defaultGaya: "formal",
    prompt: "Buatkan sambutan untuk acara pentas seni sekolah. Sertakan apresiasi terhadap bakat siswa, pentingnya seni dan budaya, serta dukungan terhadap kreativitas. Gunakan bahasa formal yang mengapresiasi.",
    description: "Sambutan untuk pembukaan acara pentas seni dan budaya sekolah.",
    tags: ["pentas seni", "budaya", "kreativitas", "seni"],
  },
  {
    id: "ss-pelepasan",
    name: "Sambutan: Pelepasan Siswa",
    kategori: "Sambutan Sekolah",
    defaultTema: "Pelepasan Siswa Keluar",
    defaultDurasi: 15,
    defaultGaya: "formal",
    prompt: "Buatkan sambutan untuk pelepasan siswa yang lulus atau pindah. Sertakan ungkapan bangga, harapan untuk masa depan, dan doa untuk kelancaran jalan mereka. Gunakan bahasa formal yang haru.",
    description: "Sambutan untuk melepas siswa yang telah lulus atau berpindah sekolah.",
    tags: ["pelepasan", "wisuda", "lulus", "kelulusan"],
  },

  // ─── Pidato Perpisahan ───────────────────────────────────────────────────
  {
    id: "pp-siswa",
    name: "Pidato Perpisahan: Siswa",
    kategori: "Pidato Perpisahan",
    defaultTema: "Perpisahan dari Siswa",
    defaultDurasi: 15,
    defaultGaya: "emosional",
    prompt: "Buatkan pidato perpisahan dari siswa yang akan lulus. Sertakan kenangan selama di sekolah, rasa terima kasih kepada guru, harapan untuk teman-teman, dan doa untuk masa depan. Gunakan gaya emosional yang tulus.",
    description: "Pidato perpisahan yang disampaikan oleh siswa yang akan lulus.",
    tags: ["perpisahan", "siswa", "lulus", "kenangan"],
  },
  {
    id: "pp-guru",
    name: "Pidato Perpisahan: Guru",
    kategori: "Pidato Perpisahan",
    defaultTema: "Perpisahan dari Guru",
    defaultDurasi: 15,
    defaultGaya: "emosional",
    prompt: "Buatkan pidato perpisahan dari guru kepada siswa yang lulus. Sertakan ungkapan kebanggaan, nasihat untuk masa depan, dan doa untuk kesuksesan. Gunakan gaya emosional yang menginspirasi.",
    description: "Pidato perpisahan yang disampaikan oleh guru kepada siswa lulusan.",
    tags: ["perpisahan", "guru", "nasihat", "doa"],
  },
  {
    id: "pp-walimurid",
    name: "Pidato Perpisahan: Wali Murid",
    kategori: "Pidato Perpisahan",
    defaultTema: "Perpisahan dari Wali Murid",
    defaultDurasi: 15,
    defaultGaya: "emosional",
    prompt: "Buatkan pidato perpisahan dari wali murid. Sertakan ungkapan terima kasih kepada sekolah dan guru, kebanggaan terhadap anak, dan harapan untuk sekolah ke depan. Gunakan gaya emosional yang tulus.",
    description: "Pidato perpisahan yang disampaikan oleh wali murid dari siswa yang lulus.",
    tags: ["perpisahan", "wali murid", "orang tua", "terima kasih"],
  },
];

export function getTemplates(kategori?: string): Template[] {
  if (!kategori) return TEMPLATES;
  return TEMPLATES.filter((t) => t.kategori === kategori);
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

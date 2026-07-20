# Katalog Template Nusantara

## Tujuan

Dokumen ini adalah arahan desain untuk koleksi undangan digital bertema Nusantara. Setiap template memakai identitas visual provinsi secara terukur: satu motif utama, satu bentuk arsitektur/alam, dan satu aksen gerak. Tujuannya terasa lokal serta modern, bukan menjadi kolase ornamen.

> Catatan cakupan: permintaan awal menyebut 34 provinsi. Administrasi Indonesia saat ini terdiri dari 38 provinsi; katalog ini mencakup 34 provinsi terdahulu beserta empat provinsi baru di Tanah Papua agar roadmap tidak perlu diulang. Rujukan jumlah provinsi: [Indonesia.go.id](https://indonesia.go.id/kategori/editorial/9053/ajang-menguatkan-sinergi-pusat-dan-daerah-di-lembah-tidar?lang=1).

## Fase aktif: tepat 38 provinsi

Implementasi produk kini mencakup seluruh 38 provinsi Indonesia dalam satu registry. Sepuluh edisi flagship memakai ilustrasi orisinal, sementara 28 edisi regional baru memakai artwork CSS yang ringan, palet khas, bentuk bingkai foto, pola, dan motion signature masing-masing. Pendekatan CSS-first menghindari pemakaian simbol adat yang belum dikurasi sekaligus menjaga semua URL template siap digunakan.

### Context tambahan: motion pass pertama

Motion pass pertama difokuskan pada lima template agar kualitasnya bisa terasa matang sebelum disalin ke template lain. Gerak dibuat seperti ambience panggung, bukan efek ramai: muncul saat section masuk viewport, idle sangat pelan saat pengguna berhenti scroll, dan hilang dari perhatian ketika konten utama dibaca.

| Template | Fokus animasi baru | Batas elegansi |
| --- | --- | --- |
| `sunda-parahyangan` | Wayang samping ikut idle pada tiap section, frame foto bernapas tipis, dan galeri punya kilau lembut. | Wayang tetap transparan pada section isi agar tidak mengganggu teks. |
| `jawa-wayang-heritage` | Wayang kulit di sisi section sway pelan, galeri kelir diberi sheen hangat, dan frame foto bergerak sangat ringan. | Ritme panggung tetap soga-tenang, tanpa efek lampu berlebihan. |
| `serambi-meukuta` | Ukiran floral bernapas, garis emas cover membuka-menutup halus, dan ornamen penutup hidup saat terlihat. | Ukiran dipakai sebagai border/nafas visual, bukan memenuhi seluruh layar. |
| `ulos-toba` | Pita ulos bawah cover menegang berlawanan, penanda jadwal pulse halus, dan frame foto terasa seperti kain yang hidup. | Gerak pita tidak mengubah rotasi besar agar tidak terasa norak. |
| `rangkiang-minang` | Sudut gonjong/songket terangkat bergantian, galeri diberi glint emas, dan frame foto naik ringan saat section masuk. | Kilau emas dipakai sesekali, bukan shimmer terus-menerus di semua elemen. |

Implementasi teknis memakai atribut `data-cultural-motion`, `is-visible`, dan `is-motion-active` dari renderer bersama. Dengan begitu, template berikutnya cukup menambahkan motion signature baru tanpa mengubah struktur undangan atau data pengguna.

### Sepuluh edisi flagship dengan aset ilustrasi

| Provinsi | Slug | Identitas utama | Motion signature |
| --- | --- | --- | --- |
| Jawa Barat | `sunda-parahyangan` | Parahyangan, Julang Ngapak, wayang golek | Wayang masuk dari kedua sisi lalu bergoyang ringan saat idle. |
| Jawa Tengah | `jawa-wayang-heritage` | Batik parang, kelir, wayang Jawa | Dua wayang saling menghadap, masuk seperti membuka panggung, lalu sway pelan. |
| Aceh | `serambi-meukuta` | Rumoh Aceh dan ukiran floral | Ukiran bernapas dua piksel dan garis emas terbuka satu kali. |
| Sumatera Utara | `ulos-toba` | Rumah Bolon, Danau Toba, ritme ulos | Dua pita tenun menegang berlawanan tanpa mengubah rotasinya. |
| Sumatera Barat | `rangkiang-minang` | Rumah Gadang, rangkiang, songket | Sudut songket terangkat halus secara bergantian. |
| Riau | `melayu-lancang` | Rumah panggung, Lancang Kuning, sulur | Sulur membuka dari tengah lalu mengalun horizontal. |
| Kepulauan Riau | `selat-melayu` | Lancang, pulau pesisir, garis pasang | Garis pasang-surut bergerak pelan seperti arus. |
| Bali | `bali-candi-bentar` | Candi Bentar, meru, batu vulkanik | Dua siluet gerbang membuka sekali dan kemudian diam. |
| Kalimantan Selatan | `sasirangan-banjar` | Bubungan Tinggi, sungai, sasirangan | Ritme titik sasirangan mengalir kecil seperti riak. |
| Sulawesi Selatan | `pinisi-tongkonan` | Pinisi, lengkung Tongkonan, kayu jati | Garis layar berayun kurang dari setengah derajat. |

Semua animasi dekoratif berhenti ketika elemen keluar viewport dan menjadi statis pada `prefers-reduced-motion`. Informasi tidak pernah bergantung pada animasi.

## Prinsip UI/UX lintas template

1. Mobile-first, portrait, dan setiap section menjadi satu bab cerita saat pengguna scroll.
2. Motif budaya dipakai sebagai tekstur 8–18% opacity atau bingkai; jangan ditempatkan di setiap komponen.
3. Maksimal tiga warna utama ditambah warna netral. Kontras teks minimum mengikuti WCAG AA.
4. Cover memuat satu hero visual; section lain cukup memakai motif, garis, atau siluet agar tetap bernapas.
5. Animasi hanya untuk hero/ornamen: masuk saat halaman dibuka, kemudian idle sangat ringan. Selalu sediakan `prefers-reduced-motion`.
6. Foto mempelai hadir pada section penyelenggara dengan bingkai khas template, tanpa filter wajah atau potongan yang agresif.
7. Ikon sakral, aksara, motif adat, dan objek ritual wajib divalidasi bersama kurator/mitra lokal sebelum rilis publik.
8. Semua aset wajib memiliki sumber, lisensi, teks alternatif, dan fallback warna jika gambar gagal dimuat.

## Struktur section bersama

Setiap template memakai data yang sama agar pengguna dapat berganti desain tanpa mengisi ulang:

1. Sampul
2. Salam hangat
3. Penyelenggara dan foto mempelai
4. Hitung mundur
5. Rangkaian acara
6. Lokasi
7. Galeri
8. RSVP
9. Ucapan dan doa
10. Penutup

Perbedaan tiap provinsi terjadi pada palet, ritme ruang, motif, framing foto, serta micro-motion—bukan pada struktur atau aksesibilitas form.

## Sumatra dan Kepulauan

| Status | Provinsi | Template / slug | Arah visual dan identitas | Signature UI |
| --- | --- | --- | --- | --- |
| [x] | Aceh | `serambi-meukuta` | Ilustrasi orisinal Rumoh Aceh di taman tropis; hijau tua, kayu hangat, gading, dan emas lembut. | Hero sinematik, bingkai foto berlengkung, galeri lanskap, dan garis ukiran floral yang tenang. |
| [x] | Sumatera Utara | `ulos-toba` | Ilustrasi orisinal Rumah Bolon dan Danau Toba; merah ulos, arang, krem, dan kuningan hangat. | Hero sinematik, frame atap runcing, jadwal berpita tenun, dan galeri lanskap Toba. |
| [x] | Sumatera Barat | `rangkiang-minang` | Ilustrasi orisinal Rumah Gadang dan rangkiang; marun, arang, emas songket, dan lanskap Bukit Barisan. | Hero sinematik, frame gonjong, galeri lanskap, dan lapisan geometri songket. |
| [x] | Riau | `melayu-lancang` | Ilustrasi orisinal rumah panggung Melayu dan Lancang Kuning; hijau zamrud, kuning diraja, dan putih tulang. | Hero tepian sungai, frame sudut sulur, jadwal berplakat tipis, dan galeri zamrud. |
| [x] | Kepulauan Riau | `selat-melayu` | Ilustrasi orisinal lancang berlayar, pulau granit, dan balai pesisir; biru selat, pasir, dan emas kusam. | Hero maritim, frame berbentuk layar, garis pasang-surut, dan galeri panorama selat. |
| [x] | Jambi | `angso-duo` | Cokelat tanah, emas, nila; batik Jambi dan siluet Angso Duo yang sangat kecil. | Frame foto oval berlapis motif batik; galeri seperti lembar kain. |
| [x] | Sumatera Selatan | `songket-limas` | Marun, hitam, emas; pola songket dan geometri Rumah Limas. | Border foto bertingkat seperti limas; counter tampil sebagai ukiran angka emas. |
| [x] | Kepulauan Bangka Belitung | `cual-timah` | Biru granit, putih pasir, tembaga; tenun cual dan tekstur batu pesisir. | Galeri berbingkai mineral; dekorasi titik timah beranimasi sangat pelan. |
| [x] | Bengkulu | `besurek-rafflesia` | Indigo gelap, krem, terakota; tekstur kain besurek abstrak dan Rafflesia sebagai aksen tunggal. | Bunga hanya muncul sebagai emboss di pembuka/penutup, tidak di setiap section. |
| [x] | Lampung | `siger-saibatin` | Merah bata, emas, hitam; bentuk mahkota Siger dan garis tapis. | Bingkai foto menyerupai lengkung Siger sederhana; RSVP memakai label tapis. |

## Jawa, Bali, dan Nusa Tenggara

| Provinsi | Template / slug | Arah visual dan identitas | Signature UI |
| --- | --- | --- | --- |
| DKI Jakarta | `betawi-gigi-balang` | Hijau tua, jingga bata, krem; pola gigi balang, arsitektur rumah Betawi. | Header dan divider bergerigi halus; ondel-ondel hanya dipakai sebagai ilustrasi opsional. |
| Jawa Barat | `sunda-parahyangan` | Nila, sage, emas; Julang Ngapak, kujang, dan wayang golek. | Wayang masuk dari sisi lalu bergoyang idle; frame foto organik emas–nila. |
| Jawa Tengah | `jawa-wayang-heritage` | Soga, nila gelap, emas; batik parang, gunungan, dan wayang Jawa. | Wayang saling menghadap pada cover; frame foto berbentuk lengkung klasik; latar batik subtil. |
| DI Yogyakarta | `jogja-kawung` | Indigo, putih kapur, emas tua; kawung, Tugu Jogja, dan ritme keraton. | Cover punya komposisi ruang kosong; foto dalam frame kawung empat-lobus yang minimal. |
| Jawa Timur | `majapahit-terra` | Terakota, batu candi, hijau gelap; relief Majapahit dan bata merah. | Timeline muncul seperti relief bertingkat; section lokasi memakai siluet gapura. |
| Banten | `baduy-sederhana` | Hitam, putih gading, biru indigo; tenun Baduy dengan ruang yang sangat sederhana. | Tanpa efek berlebihan, border tenun tipis dan foto dalam frame persegi lembut. |
| Bali | `bali-candi-bentar` | Batu vulkanik, putih, emas, hijau palem; Candi Bentar dan endek. | Cover terbuka seperti gerbang; foto dalam frame candi yang sangat tipis, bukan ukiran padat. |
| Nusa Tenggara Barat | `sasak-lumbung` | Cokelat jerami, merah tenun, hitam; lumbung Sasak dan songket. | Atap lumbung menjadi curve hero; jadwal dibaca seperti jalur tenun. |
| Nusa Tenggara Timur | `tenun-flobamora` | Tanah liat, nila, gading; tenun ikat dan kontur pulau. | Galeri menggunakan blok tenun vertikal; foto dibingkai ikat tipis, bukan pola penuh. |

## Kalimantan

| Provinsi | Template / slug | Arah visual dan identitas | Signature UI |
| --- | --- | --- | --- |
| Kalimantan Barat | `kapuas-rumah-panjang` | Hijau hutan, arang, kuning rotan; Rumah Panjang dan aliran Kapuas. | Scroll indicator seperti aliran sungai; frame foto anyaman rotan minimal. |
| Kalimantan Tengah | `betang-borneo` | Hijau lumut, tanah merah, krem; Rumah Betang dan tekstur kayu. | Section berganti lewat garis vertikal seperti tiang rumah; motif adat hanya setelah validasi kurator. |
| Kalimantan Selatan | `sasirangan-banjar` | Ungu tua, emas, merah marun; Sasirangan dan atap Bubungan Tinggi. | Latar memiliki gelombang sasirangan transparan; angka countdown memakai aksen kuningan. |
| Kalimantan Timur | `lamin-mahakam` | Biru Mahakam, hitam kayu, emas madu; Rumah Lamin dan sungai. | Hero memakai garis arus; frame foto berstruktur panel kayu modern. |
| Kalimantan Utara | `tidung-perbatasan` | Biru malam, hijau rimba, pasir; tenun/ornamen Tidung dan lanskap pesisir. | Divider seperti jalinan serat; animasi daun tipis sebagai ambience. |

## Sulawesi

| Provinsi | Template / slug | Arah visual dan identitas | Signature UI |
| --- | --- | --- | --- |
| Sulawesi Utara | `minahasa-wale` | Biru danau, putih, emas; Rumah Walewangko dan bunga lokal sebagai aksen. | Foto dalam frame atap tinggi sederhana; lokasi memakai kontur danau. |
| Gorontalo | `karawo-hulondalo` | Biru langit, emas, putih; sulaman Karawo yang ringan. | Detail Karawo dipakai hanya pada sudut dan button outline. |
| Sulawesi Tengah | `tambi-donggala` | Cokelat kopi, nila, gading; Rumah Tambi dan tenun Donggala. | Cover berkomposisi segitiga atap; jadwal memakai jalur tenun tenang. |
| Sulawesi Barat | `mandar-sandeq` | Biru laut, putih layar, merah tenun; perahu Sandeq dan tenun Mandar. | Garis layar menjadi progress scroll; photo frame seperti layar melengkung. |
| Sulawesi Selatan | `pinisi-tongkonan` | Nila laut, soga, emas; Pinisi dan siluet Tongkonan. | Hero perahu hanya sebagai garis; section foto memakai lengkung atap Tongkonan minimal. |
| Sulawesi Tenggara | `buton-malige` | Kuning kunyit, nila, abu batu; tenun Buton dan Rumah Malige. | Layout location berlapis seperti rumah panggung; galeri memakai border tenun halus. |

## Maluku dan Tanah Papua

| Provinsi | Template / slug | Arah visual dan identitas | Signature UI |
| --- | --- | --- | --- |
| Maluku | `baileo-rempah` | Biru laut, pala, krem; Rumah Baileo dan rempah. | Aksen daun pala tipis pada cover; RSVP seperti kartu pelayaran sederhana. |
| Maluku Utara | `kie-hibualamo` | Oranye senja, arang, emas; Gunung Kie dan rumah Hibualamo. | Latar memakai gradien gunung tenang; divider berupa garis horizon. |
| Papua Barat | `cenderawasih-pesisir` | Biru laguna, hijau hutan, pasir; burung cenderawasih hanya sebagai siluet ringan. | Foto dalam frame organik terinspirasi pesisir; hindari menyalin motif adat tanpa izin. |
| Papua | `sentani-danau` | Biru danau, abu batu, kuning tanah; ritme air Danau Sentani. | Section bergerak dengan pola riak lembut; galeri memakai layout panorama. |
| Papua Selatan | `asmat-selatan` | Merah tanah, hitam kayu, gading; tekstur kayu Asmat dengan izin dan kurasi. | Hindari objek ritual sebagai dekorasi; gunakan garis ukir abstrak yang disetujui. |
| Papua Tengah | `kamoro-pegunungan` | Kabut abu-biru, hijau gelap, tembaga; kontur pegunungan dan pesisir. | Hero memakai lapisan kontur, tanpa menyederhanakan seni adat menjadi pola generik. |
| Papua Pegunungan | `lembah-honai` | Batu hangat, kabut, cokelat rumput; siluet honai dan lereng. | Frame foto bundar rendah dengan tekstur batu lembut; motion kabut sangat pelan. |
| Papua Barat Daya | `raja-ampat` | Biru safir, karst, pasir putih; kontur pulau Raja Ampat. | Cover menggunakan siluet karst minimal dan transisi seperti arus laut. |

## Aturan produksi aset ilustratif

- Buat satu `theme manifest` per template, tetapi pakai registry section yang sama.
- Siapkan paling sedikit: `cover-desktop`, `cover-mobile`, `portrait-frame`, `motif-tile`, dan `ornament-cutout` bila diperlukan.
- Motif tile harus seamless dan diuji pada opacity 5%, 10%, dan 15%.
- Ornamen bergerak hanya boleh memakai aset transparan; tidak boleh membawa background persegi.
- Gunakan gambar buatan sendiri, aset berlisensi, atau aset dengan persetujuan pemegang hak/kontak budaya lokal.

## Status implementasi

1. Registry, route demo, seed database, palet, frame foto, pola, serta motion signature sudah tersedia untuk 38 provinsi.
2. Sepuluh edisi flagship tetap menjadi standar kualitas untuk artwork raster dan ilustrasi orisinal.
3. Dua puluh delapan edisi tambahan menggunakan visual CSS-first agar ringan dan aman dari penggunaan simbol sakral yang belum dikurasi.
4. Penambahan artwork raster berikutnya dilakukan per pulau setelah review aksesibilitas, lisensi, dan kurasi budaya.

## Definition of done untuk setiap template

- Tampak berbeda pada cover, section penyelenggara, jadwal, galeri, dan penutup.
- Foto mempelai dapat diunggah dan tampil proporsional pada desktop maupun ponsel.
- Tidak ada teks di atas motif yang gagal kontras.
- Tidak ada animasi yang wajib untuk memahami informasi.
- Tidak ada aset atau simbol budaya yang dipakai tanpa sumber/lisensi dan validasi yang sesuai.

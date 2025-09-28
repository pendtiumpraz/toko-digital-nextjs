import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg px-8 py-10">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
              ← Kembali ke Beranda
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kebijakan Privasi</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Pendahuluan</h2>
              <p className="text-gray-600 mb-4">
                Toko Digital (&quot;kami&quot;, &quot;kita&quot;) berkomitmen untuk melindungi privasi Anda.
                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi
                informasi pribadi Anda saat menggunakan platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Informasi yang Kami Kumpulkan</h2>
              <p className="text-gray-600 mb-4">Kami mengumpulkan beberapa jenis informasi:</p>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Informasi Akun</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Nama lengkap</li>
                <li>Alamat email</li>
                <li>Nomor telepon/WhatsApp</li>
                <li>Nama toko dan informasi bisnis</li>
                <li>Alamat fisik toko (opsional)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Informasi Transaksi</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Detail produk yang dijual</li>
                <li>Data pelanggan (nama, alamat pengiriman)</li>
                <li>Riwayat transaksi dan pembayaran</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Informasi Teknis</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Alamat IP</li>
                <li>Jenis browser dan perangkat</li>
                <li>Log aktivitas platform</li>
                <li>Cookie dan teknologi pelacakan serupa</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Penggunaan Informasi</h2>
              <p className="text-gray-600 mb-4">Kami menggunakan informasi Anda untuk:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Menyediakan dan mengoperasikan layanan platform</li>
                <li>Memproses transaksi dan pembayaran</li>
                <li>Mengirim notifikasi penting terkait layanan</li>
                <li>Meningkatkan kualitas layanan dan pengalaman pengguna</li>
                <li>Mencegah penipuan dan aktivitas ilegal</li>
                <li>Mematuhi kewajiban hukum</li>
                <li>Mengirim informasi promosi (dengan persetujuan Anda)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Berbagi Informasi</h2>
              <p className="text-gray-600 mb-4">
                Kami tidak menjual informasi pribadi Anda. Kami dapat berbagi informasi dengan:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Penyedia layanan pihak ketiga (hosting, payment gateway)</li>
                <li>Partner bisnis untuk integrasi layanan</li>
                <li>Pihak berwenang jika diwajibkan oleh hukum</li>
                <li>Pembeli potensial dalam hal merger atau akuisisi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Keamanan Data</h2>
              <p className="text-gray-600 mb-4">
                Kami menerapkan berbagai langkah keamanan untuk melindungi informasi Anda:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Enkripsi data sensitif (SSL/TLS)</li>
                <li>Akses terbatas ke data pribadi</li>
                <li>Monitoring keamanan 24/7</li>
                <li>Backup data rutin</li>
                <li>Audit keamanan berkala</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookie dan Teknologi Pelacakan</h2>
              <p className="text-gray-600 mb-4">
                Kami menggunakan cookie untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Menyimpan preferensi pengguna</li>
                <li>Autentikasi dan keamanan sesi</li>
                <li>Analitik penggunaan platform</li>
                <li>Meningkatkan performa website</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur mungkin tidak berfungsi optimal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Hak Pengguna</h2>
              <p className="text-gray-600 mb-4">Anda memiliki hak untuk:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Mengakses data pribadi Anda</li>
                <li>Memperbarui atau mengoreksi data</li>
                <li>Meminta penghapusan data</li>
                <li>Menolak penggunaan data untuk marketing</li>
                <li>Mendapatkan salinan data Anda</li>
                <li>Membatasi pemrosesan data tertentu</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Penyimpanan Data</h2>
              <p className="text-gray-600 mb-4">
                Data Anda disimpan selama:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Akun Anda aktif di platform kami</li>
                <li>Diperlukan untuk memberikan layanan</li>
                <li>Diperlukan untuk mematuhi kewajiban hukum</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Setelah akun dihapus, data akan dihapus dalam 30 hari kecuali diperlukan untuk tujuan hukum.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Privasi Anak-anak</h2>
              <p className="text-gray-600 mb-4">
                Layanan kami tidak ditujukan untuk anak di bawah 18 tahun.
                Kami tidak sengaja mengumpulkan informasi dari anak di bawah usia tersebut.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Perubahan Kebijakan</h2>
              <p className="text-gray-600 mb-4">
                Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu.
                Perubahan signifikan akan diberitahukan melalui email atau notifikasi dalam aplikasi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Hubungi Kami</h2>
              <p className="text-gray-600 mb-4">
                Untuk pertanyaan tentang Kebijakan Privasi atau data Anda:
              </p>
              <div className="text-gray-600">
                <p>Email: privacy@toko-digital.com</p>
                <p>WhatsApp: +62 812-3456-7890</p>
                <p>Alamat: Jl. Technology No. 123, Jakarta 12345</p>
              </div>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Saya Setuju & Daftar
            </Link>
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
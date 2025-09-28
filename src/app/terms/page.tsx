import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg px-8 py-10">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
              ← Kembali ke Beranda
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Syarat & Ketentuan</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Penerimaan Ketentuan</h2>
              <p className="text-gray-600 mb-4">
                Dengan menggunakan layanan Toko Digital, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
                Jika Anda tidak setuju dengan ketentuan ini, harap tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Deskripsi Layanan</h2>
              <p className="text-gray-600 mb-4">
                Toko Digital adalah platform SaaS (Software as a Service) yang menyediakan solusi toko online untuk bisnis.
                Layanan kami meliputi:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Pembuatan toko online</li>
                <li>Manajemen katalog produk</li>
                <li>Sistem pemesanan via WhatsApp</li>
                <li>Dashboard analitik</li>
                <li>Manajemen keuangan dan stok</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Trial Gratis 14 Hari</h2>
              <p className="text-gray-600 mb-4">
                Pengguna baru berhak mendapatkan trial gratis selama 14 hari. Setelah masa trial berakhir,
                Anda dapat memilih untuk melanjutkan dengan paket berbayar atau akun Anda akan dinonaktifkan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Pembayaran dan Langganan</h2>
              <p className="text-gray-600 mb-4">
                Pembayaran dilakukan secara bulanan atau tahunan sesuai paket yang dipilih.
                Pembayaran dapat dilakukan melalui transfer bank atau payment gateway yang tersedia.
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Paket Starter: Rp 99.000/bulan</li>
                <li>Paket Professional: Rp 299.000/bulan</li>
                <li>Paket Enterprise: Rp 999.000/bulan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Kewajiban Pengguna</h2>
              <p className="text-gray-600 mb-4">Sebagai pengguna, Anda setuju untuk:</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Memberikan informasi yang akurat dan lengkap</li>
                <li>Tidak menggunakan platform untuk aktivitas ilegal</li>
                <li>Tidak melanggar hak kekayaan intelektual pihak lain</li>
                <li>Menjaga kerahasiaan kredensial akun Anda</li>
                <li>Bertanggung jawab atas konten yang Anda upload</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Hak Kekayaan Intelektual</h2>
              <p className="text-gray-600 mb-4">
                Semua hak kekayaan intelektual dalam platform Toko Digital adalah milik kami.
                Konten yang Anda upload tetap menjadi milik Anda, namun Anda memberikan kami lisensi
                untuk menggunakannya dalam konteks penyediaan layanan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Batasan Tanggung Jawab</h2>
              <p className="text-gray-600 mb-4">
                Toko Digital tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental,
                atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Penghentian Layanan</h2>
              <p className="text-gray-600 mb-4">
                Kami berhak untuk menangguhkan atau menghentikan akun Anda jika Anda melanggar ketentuan ini.
                Anda juga dapat menghentikan langganan kapan saja melalui dashboard akun.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Perubahan Ketentuan</h2>
              <p className="text-gray-600 mb-4">
                Kami dapat mengubah syarat dan ketentuan ini sewaktu-waktu.
                Perubahan akan diberitahukan melalui email atau notifikasi dalam aplikasi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Kontak</h2>
              <p className="text-gray-600 mb-4">
                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami di:
              </p>
              <div className="text-gray-600">
                <p>Email: support@toko-digital.com</p>
                <p>WhatsApp: +62 812-3456-7890</p>
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
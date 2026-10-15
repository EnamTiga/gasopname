import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderKanban, FileSignature, Ruler, Wallet, BarChart3, ShieldCheck, HardHat, MoveRight } from "lucide-react";

const FITUR = [
  { icon: FolderKanban, judul: "Kelola Proyek", isi: "Data paket, perusahaan, engineer, dan daftar pekerjaan lengkap dengan RAB dan RAP." },
  { icon: FileSignature, judul: "SPK Rapi", isi: "Pilih pekerjaan, tentukan harga satuan kontrak, nilai SPK dihitung otomatis." },
  { icon: Ruler, judul: "Opname Mingguan", isi: "Input volume pekerjaan tiap minggu, progres dan akumulasi terlihat jelas." },
  { icon: Wallet, judul: "Realisasi & Kasbon", isi: "Catat pembayaran dan kasbon mandor, saldo selalu ikut terpantau." },
  { icon: BarChart3, judul: "Dashboard Jelas", isi: "Ringkasan uang dan progres tiap paket dalam satu layar." },
  { icon: ShieldCheck, judul: "Tanpa Ribet", isi: "Tanpa penguncian data. Semua bisa diperbaiki lagi kapan saja." },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } }),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className="transition-transform duration-300 ease-out will-change-transform">
      {children}
    </div>
  );
}

function DemoOpname() {
  const [vol, setVol] = useState(60);
  const harga = 125_000;
  const retensi = 5;
  const nilai = Math.round(vol * harga);
  const potongan = Math.round(nilai * retensi / 100);
  return (
    <div className="border border-rule bg-sheet p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <HardHat className="h-5 w-5 text-survey" aria-hidden />
        <p className="text-sm font-semibold">Coba sendiri: opname pekerjaan cor</p>
      </div>
      <label htmlFor="demo-vol" className="mt-4 block text-xs text-ink-soft">
        Volume terpasang minggu ini: <span className="font-mono font-bold text-ink">{vol} m³</span> dari 100 m³ kontrak
      </label>
      <input id="demo-vol" type="range" min={0} max={100} value={vol}
        onChange={(e) => setVol(Number(e.target.value))}
        className="mt-2 w-full accent-[#077B9E]" />
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="border border-rule bg-paper px-3.5 py-3">
          <p className="text-[11px] text-ink-soft">Nilai opname</p>
          <p className="font-mono text-sm font-bold tabular-nums sm:text-base">{rupiah(nilai)}</p>
        </div>
        <div className="border border-rule bg-paper px-3.5 py-3">
          <p className="text-[11px] text-ink-soft">Retensi {retensi}%</p>
          <p className="font-mono text-sm font-bold tabular-nums sm:text-base">{rupiah(potongan)}</p>
        </div>
        <div className="border border-survey/40 bg-survey/5 px-3.5 py-3">
          <p className="text-[11px] text-ink-soft">Diajukan</p>
          <p className="font-mono text-sm font-bold tabular-nums text-survey sm:text-base">{rupiah(nilai - potongan)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-soft">Angka ini yang biasanya Anda hitung manual di spreadsheet — di sini otomatis.</p>
    </div>
  );
}

export function Landing() {
  useReveal();
  const navigate = useNavigate();
  const [heroOn, setHeroOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroOn(true), 60); return () => clearTimeout(t); }, []);
  const anim = (i: number) =>
    `transition-all duration-700 ease-out ${heroOn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}` +
    (i ? ` [transition-delay:${i * 90}ms]` : "");

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* latar grid teknik + parallax tipis */}
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "linear-gradient(#DCE5E8 1px, transparent 1px), linear-gradient(90deg, #DCE5E8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <p className="text-xl font-extrabold tracking-tight">
          GAS<span className="text-survey">opname</span>
        </p>
        <Button onClick={() => navigate("/dashboard")} className="h-11 bg-survey text-white transition-transform active:scale-95 hover:bg-survey/90">
          Buka aplikasi
        </Button>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 pb-20">
        <section className="grid grid-cols-1 items-center gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className={`mb-4 inline-flex items-center gap-1.5 rounded-full border border-rule bg-sheet px-4 py-1.5 text-xs font-semibold text-survey ${anim(0)}`}>
              <HardHat className="h-3.5 w-3.5" aria-hidden /> Sistem internal perusahaan
            </p>
            <h1 className={`text-3xl font-bold leading-tight tracking-tight text-pretty sm:text-4xl lg:text-[2.6rem] ${anim(1)}`}>
              Opname mingguan proyek konstruksi, akhirnya tidak pakai spreadsheet lagi
            </h1>
            <p className={`mt-4 max-w-xl text-pretty text-ink-soft sm:text-base lg:text-lg ${anim(2)}`}>
              Catat progres pekerjaan tiap minggu, hitung nilai opname dan retensi otomatis,
              pantau realisasi pembayaran dan kasbon. Semua dalam satu aplikasi ringan.
            </p>
            <div className={`mt-8 flex flex-wrap items-center gap-3 ${anim(3)}`}>
              <Button onClick={() => navigate("/dashboard")} className="h-12 bg-survey px-6 text-white transition-transform active:scale-95 hover:bg-survey/90">
                Mulai sekarang <MoveRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <p className={`mt-3 text-xs text-ink-soft ${anim(4)}`}>Gratis dipakai. Tidak perlu daftar akun.</p>
          </div>
          <div className={`${anim(3)} lg:self-center`}>
            <DemoOpname />
          </div>
        </section>

        <section className="mt-8">
          <h2 data-reveal className="reveal text-lg font-semibold">Semua yang Anda butuhkan untuk opname</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((f, i) => (
              <div key={f.judul} data-reveal className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <TiltCard>
                  <div className="h-full border border-rule bg-sheet p-5 shadow-sm transition-shadow hover:shadow-md">
                    <f.icon className="mb-3 h-6 w-6 text-survey" aria-hidden />
                    <h3 className="text-base font-semibold">{f.judul}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{f.isi}</p>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </section>

        <section data-reveal className="reveal mt-12 border border-rule bg-sheet p-6">
          <h2 className="text-lg font-semibold">Cara kerjanya sederhana</h2>
          <ol className="mt-4 space-y-3 text-sm text-ink-soft">
            <li><span className="font-semibold text-ink">1.</span> Buat proyek, lalu masukkan daftar pekerjaan (volume, satuan, harga RAB & RAP).</li>
            <li><span className="font-semibold text-ink">2.</span> Buat SPK: pilih pekerjaan dan isi harga satuan kontrak. Nilai SPK dihitung otomatis.</li>
            <li><span className="font-semibold text-ink">3.</span> Tiap minggu, lakukan opname: isi volume progres. Nilai diajukan dan retensi muncul otomatis.</li>
            <li><span className="font-semibold text-ink">4.</span> Catat realisasi pembayaran dan kasbon. Dashboard memantau semuanya.</li>
          </ol>
        </section>
      </main>

      <footer className="relative border-t border-rule py-6 text-center text-xs text-ink-soft">
        GASopname — sistem opname internal perusahaan
      </footer>
    </div>
  );
}

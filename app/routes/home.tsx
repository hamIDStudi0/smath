import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import "../css/home.css";

const WORDS: string[] = ["A Masterpieces", "Some Magics", "An Achievements", "Great Memories"];

const FEATURES = [
  {
    id: 0,
    title: "Belajar Bersama",
    content: "Kami membangun ekosistem belajar dan komunitas dengan tujuan bersama berbagi pengalaman seputar matematika. Setiap anggota bebas bertanya, berdiskusi, dan saling melengkapi pemahaman.",
  },
  {
    id: 1,
    title: "Digagas Bersama",
    content: "Komunitas ini dibangun oleh dan untuk seluruh anggota yang ingin berkontribusi penuh dalam pengembangannya — bukan proyek satu orang, tapi hasil kerja banyak tangan.",
  },
  {
    id: 2,
    title: "Terus Berkembang",
    content: "Tempat ini tidak akan pernah menemui garis finish. Materi, artikel, dan cara kami mengajar terus diperbarui mengikuti kebutuhan anggota dari waktu ke waktu.",
  },
  {
    id: 3,
    title: "Selalu Terbuka",
    content: "Dimanapun kalian berada, kami akan selalu menemani lewat website ini — menyajikan ilmu bermanfaat kapan saja dibutuhkan, tanpa batas jam operasional.",
  },
  {
    id: 4,
    title: "Mengasah Potensi",
    content: "Kami percaya banyak potensi belum terasah dengan baik. Lewat latihan soal dan pembahasan yang konsisten, kami ingin membantu generasi ini melampaui batas kemampuannya sendiri.",
  },
  {
    id: 5,
    title: "Saling Membantu",
    content: "Dengan dukungan seluruh anggota, kami berharap komunitas ini menjadi jembatan yang membantu kalian meraih masa depan yang lebih cerah — satu soal, satu diskusi pada satu waktu.",
  },
];

const STATS = [
  { value: "1000+", label: "Soal & Materi" },
  { value: "50+", label: "Artikel Terbit" },
  { value: "OSN", label: "Fokus Olimpiade" },
  { value: "24/7", label: "Akses Kapan Saja" },
];

/** Efek parallax ringan: elemen bergerak lebih lambat dari scroll halaman. */
function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
      el.style.transform = `translateY(${distanceFromCenter * -speed}px)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return ref;
}

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const heroImgRef = useParallax(0.12);
  const bandImgRef = useParallax(0.15);

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 150;
    const delay =
      !isDeleting && currentText === WORDS[currentWordIndex] ? 2000 :
      isDeleting && currentText === "" ? 500 :
      typeSpeed;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText !== WORDS[currentWordIndex]) {
        setCurrentText(WORDS[currentWordIndex].substring(0, currentText.length + 1));
      } else if (isDeleting && currentText !== "") {
        setCurrentText(currentText.substring(0, currentText.length - 1));
      } else if (!isDeleting && currentText === WORDS[currentWordIndex]) {
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });

    const hiddenElements = document.querySelectorAll(".reveal-item");
    hiddenElements.forEach((el) => observer.observe(el));
    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__media media-tinted" aria-hidden="true">
          <div ref={heroImgRef} className="hero__media-inner">
            <img
              src="https://images.unsplash.com/photo-1758685734643-db77920292bc?fm=jpg&q=80&w=2400&auto=format&fit=crop"
              alt=""
            />
          </div>
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Komunitas Belajar Matematika</p>
          <h1 className="title">
            <span className="title-static">Let's Create</span>
            <span className="title-dynamic">{currentText}<span className="cursor"></span></span>
          </h1>
          <div className="description">
            <p>
              Keinginan hanya bisa diraih dengan usaha, usaha hanya bisa diterapkan dengan aksi dan
              kerja keras yang diikuti dengan doa. Di sinilah SMAGAMATH berdiri — sebagai ruang bagi
              siapapun yang ingin memahami matematika lebih dalam, bukan sekadar menghafal rumus.
            </p>
            <p>
              Selamat datang di website kami, yang menyajikan ilmu-ilmu seputar OSN matematika,
              pembahasan soal, artikel pengembangan diri, hingga informasi kegiatan komunitas —
              semuanya kami rawat dengan usaha yang sama seperti saat kami pertama membangunnya.
            </p>
          </div>
          <div className="hero__actions">
            <Link to="/article" className="btn-blue">Lihat Artikel</Link>
            <Link to="/about" className="btn-secondary">Tentang Kami</Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="stats-strip">
        {STATS.map((s) => (
          <div key={s.label} className="stats-strip__item">
            <p className="stats-strip__value">{s.value}</p>
            <p className="stats-strip__label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Cerita kami — teks penuh, terpusat, tidak berdampingan dengan foto
             supaya seimbang di semua ukuran layar ── */}
      <section className="story-section">
        <p className="section-eyebrow">Siapa Kami</p>
        <h2 className="section-heading">SMAGAMATH, rumah untuk pecinta matematika</h2>
        <div className="story-section__body">
          <p>
            SMAGAMATH adalah komunitas belajar yang lahir dari keinginan sederhana: berkembang
            bersama. Semuanya dimulai dari kumpulan catatan latihan soal OSN yang dibagikan
            antar-teman, lalu perlahan tumbuh menjadi tempat berbagi materi, artikel, dan
            pengalaman yang lebih luas.
          </p>
          <p>
            Kami percaya bahwa matematika bukan sekadar pelajaran untuk dilewati, melainkan cara
            berpikir yang bisa dilatih siapa saja. Karena itu, setiap materi yang kami susun selalu
            diusahakan mudah dipahami, relevan dengan kebutuhan olimpiade, dan tetap terasa dekat
            dengan keseharian anggota — tanpa kehilangan kedalaman isinya.
          </p>
        </div>
      </section>

      {/* ── Foto banner penuh dengan teks overlay, terpusat ── */}
      <section className="banner-section reveal-item">
        <div className="banner-section__media media-tinted">
          <div ref={bandImgRef} className="banner-section__media-inner">
            <img
              src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?fm=jpg&q=80&w=2000&auto=format&fit=crop"
              alt="Anggota komunitas berdiskusi dan belajar bersama"
            />
          </div>
        </div>
        <div className="banner-section__body">
          <p className="section-eyebrow">Kolaborasi</p>
          <h2 className="section-heading">Tumbuh lewat kerja sama, bukan sendiri-sendiri</h2>
          <p className="section-subheading">
            Setiap artikel dan materi yang terbit di sini adalah hasil kerja tim — mulai dari
            riset soal, penulisan pembahasan, hingga penyuntingan akhir. Kami percaya belajar
            matematika jauh lebih berarti dan lebih mudah bertahan ketika dilakukan bersama-sama,
            saling mengoreksi, dan saling menyemangati.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-block">
        <div className="section-block__intro">
          <p className="section-eyebrow">Kenapa SMAGAMATH</p>
          <h2 className="section-heading">Dibangun untuk komunitas, oleh komunitas</h2>
          <p className="section-subheading">
            Enam hal ini yang selalu kami jaga dalam setiap materi, artikel, dan keputusan yang
            kami ambil sebagai komunitas.
          </p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((box, i) => (
            <div key={box.id} className="feature-card reveal-item" style={{ transitionDelay: `${i * 80}ms` }}>
              <h3>{box.title}</h3>
              <p>{box.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section reveal-item">
        <h2 className="section-heading">Siap mulai belajar bersama kami?</h2>
        <p className="section-subheading">
          Jelajahi artikel dan materi yang sudah terbit, kenali lebih jauh perjalanan generasi
          SMAGAMATH, atau ceritakan langsung masukanmu untuk kami.
        </p>
        <div className="hero__actions" style={{ justifyContent: "center", marginTop: "1.75rem" }}>
          <Link to="/article" className="btn-blue">Mulai Jelajahi</Link>
          <Link to="/feedback" className="btn-secondary">Beri Masukan</Link>
        </div>
      </section>
    </div>
  );
}

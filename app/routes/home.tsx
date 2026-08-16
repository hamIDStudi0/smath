import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../css/home.css";

const WORDS: string[] = ["A Masterpieces", "Some Magics", "An Achievements", "Great Memories"];

const FEATURES = [
  { id: 0, title: "Belajar Bersama", content: "Kami membangun sebuah ekosistem belajar dan komunitas dengan tujuan untuk bersama berbagi pengalaman seputar matematika." },
  { id: 1, title: "Digagas Bersama", content: "Dibangun oleh dan untuk seluruh anggota yang ingin berkontribusi penuh dalam pengembangan komunitas ini." },
  { id: 2, title: "Terus Berkembang", content: "Tempat ini tidak akan pernah berhenti berkembang, dan akan terus melaju menembus batas kemampuan." },
  { id: 3, title: "Selalu Terbuka", content: "Dimanapun kami akan selalu menemani lewat website ini, yang bersedia menyajikan seluruh ilmu yang bermanfaat." },
  { id: 4, title: "Mengasah Potensi", content: "Kami ingin mewujudkan generasi yang mampu mengasah dan melampaui batas kemampuannya sendiri." },
  { id: 5, title: "Saling Membantu", content: "Kami harap komunitas ini bisa menjadi jembatan yang membantu kalian meraih masa depan yang cerah." },
];

const STATS = [
  { value: "1000+", label: "Soal & Materi" },
  { value: "50+", label: "Artikel Terbit" },
  { value: "OSN", label: "Fokus Olimpiade" },
  { value: "24/7", label: "Akses Kapan Saja" },
];

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll(".reveal-item");
    hiddenElements.forEach((el) => observer.observe(el));
    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1758685734643-db77920292bc?fm=jpg&q=80&w=2400&auto=format&fit=crop"
            alt=""
          />
          <div className="hero__scrim" />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Komunitas Belajar Matematika</p>
          <h1 className="title">
            <span className="title-static">Let's Create</span>
            <span className="title-dynamic">{currentText}<span className="cursor"></span></span>
          </h1>
          <div className="description">
            <p>Keinginan hanya bisa diraih dengan usaha, usaha hanya bisa diterapkan dengan aksi dan kerja keras yang diikuti dengan doa.</p>
            <p>Selamat datang di SMAGAMATH — tempat kami menyajikan ilmu-ilmu seputar OSN matematika maupun informasi seputar kegiatan komunitas.</p>
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

      {/* ── About / mission with photo ── */}
      <section className="split-section">
        <div className="split-section__media reveal-item">
          <img
            src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?fm=jpg&q=80&w=1600&auto=format&fit=crop"
            alt="Anggota komunitas berdiskusi dan belajar bersama"
          />
        </div>
        <div className="split-section__body reveal-item">
          <p className="section-eyebrow">Siapa Kami</p>
          <h2 className="section-heading">SMAGAMATH, rumah untuk pecinta matematika</h2>
          <p className="section-subheading">
            SMAGAMATH adalah komunitas belajar yang lahir dari keinginan untuk berkembang bersama.
            Kami menghimpun materi, artikel, dan pengalaman seputar matematika — khususnya persiapan
            OSN — supaya siapapun yang bergabung punya tempat untuk terus mengasah kemampuannya.
          </p>
          <Link to="/about" className="link-arrow">Selengkapnya tentang kami →</Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-block">
        <div className="section-block__intro">
          <p className="section-eyebrow">Kenapa SMAGAMATH</p>
          <h2 className="section-heading">Dibangun untuk komunitas, oleh komunitas</h2>
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

      {/* ── Collaboration photo band ── */}
      <section className="band-section">
        <div className="band-section__media reveal-item">
          <img
            src="https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?fm=jpg&q=80&w=1800&auto=format&fit=crop"
            alt="Tim berkolaborasi mengembangkan materi dan artikel"
          />
          <div className="band-section__scrim" />
        </div>
        <div className="band-section__body reveal-item">
          <p className="section-eyebrow">Kolaborasi</p>
          <h2 className="section-heading">Tumbuh lewat kerja sama tim</h2>
          <p className="section-subheading">
            Setiap artikel dan materi yang terbit di sini adalah hasil kerja sama — mulai dari
            riset soal, penulisan, hingga penyuntingan. Kami percaya belajar matematika jauh lebih
            berarti ketika dilakukan bersama.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section reveal-item">
        <h2 className="section-heading">Siap mulai belajar bersama kami?</h2>
        <p className="section-subheading">Jelajahi artikel, materi, dan perjalanan generasi SMAGAMATH.</p>
        <div className="hero__actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <Link to="/article" className="btn-blue">Mulai Jelajahi</Link>
          <Link to="/feedback" className="btn-secondary">Beri Masukan</Link>
        </div>
      </section>
    </div>
  );
}

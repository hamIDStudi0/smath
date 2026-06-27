// app/routes/about.tsx
import { Link } from 'react-router';
import '../css/About.css';

// ── Icons ─────────────────────────────────────────────────────────────────────

const SeedlingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/>
    <path d="M5 12C5 7 8 4 12 4c0 0-2 4 0 8"/>
    <path d="M19 12c0-5-3-8-7-8 0 0 2 4 0 8"/>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const PenLineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const HandshakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4"/>
    <path d="M5 7H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/>
    <path d="M16 2l5 5-8 8H8V10L16 2z"/>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div className="about">
      <div className="about__hero">
        <div className="about__hero-accent" />
        <h1 className="about__headline">
          About <em>Us</em>
        </h1>
        <p className="about__lead">
          Selamat datang di website kami yang penuh dengan kejutan, dengan membawamu melintasi ilmu-ilmu bermanfaat membuat pandangan baru terhadap aspek-aspek yang sebelumnya kalian lihat membosankan berubah menjadi sesuatu yang berguna dalam cakupan jangka panjang.
        </p>
      </div>

      <div className="about__section">
        <h2><SeedlingIcon /> Asal</h2>
        <p>
          Platform yang muncul dari keinginan untuk berkembang, dibantu oleh semangat dan dukungan memberikan kekuatan dalam membangun sebuah tempat yang akan memberikan timbal balik positif dan dikenang selamanya.
        </p>
      </div>

      <hr className="about__divider" />

      <div className="about__section">
        <h2><TargetIcon /> Purpose</h2>
        <p>
          Tujuan dibangunnya website ini adalah untuk memberikan tempat atau wadah yang dimana bisa dimanfaatkan kepada para kontributor maupun user untuk berkembang dan saling berbagi ilmu maupun pengalaman.
        </p>
      </div>

      <div className="about__values">
        <div className="about__value">
          <div className='top__area'>
            <div className="about__value-icon"><PenLineIcon /></div>
            <h3>Share</h3>
            <div className='empty__area'></div>
          </div>
          <br/>
          <p>Berbagi adalah salah satu bukti nyata yang bisa diberikan untuk membangun dan mengembangkan platfom ini.</p>
        </div>
        <div className="about__value">
          <div className='top__area'>
            <div className="about__value-icon"><HandshakeIcon /></div>
            <h3>Collab</h3>
            <div className='empty__area'></div>
          </div>
          <br/>
          <p>Kami menerima bantuan kontributor untuk mengembangkan website ini, dari projek bernama requirements.</p>
        </div>
        <div className="about__value">
          <div className='top__area'>
            <div className="about__value-icon"><ZapIcon /></div>
            <h3>Win</h3>
            <div className='empty__area'></div>
          </div>
          <br/>
          <p>Memenangkan mungkin tidaklah mudah, tapi berusaha adalah salah satu bukti nyata dari satu langkah menuju kemenangan, maka dari itu mari kita berjuang bersama.</p>
        </div>
      </div>

      <hr className="about__divider" />

      <div className="about__section">
        <h2><FileTextIcon /> Closing</h2>
        <p>
          Terimakasih telah menyediakan waktunya untuk membaca ini, saya harap kalian mendapatkan dampak yang sepadan dengan kontribusi positif untuk membangun dan mengembangkan generasi ini, setiap langkah membawa kita menuju tantangan dan setiap tantangan merupakan bekal yang berupa pengalaman, dan pengalaman tersebut bisa dijadikan batu tanjakan untuk meraih sesuatu yang sebelumnya masih belum teraih.
        </p>
      </div>

      <div className="about__closing">
        <h2>C'mon <RocketIcon /></h2>
        <p><q>This is just the beginning, not the end</q> by <span className='hi__close'>creACTOR</span></p>
      </div>

      {/* ── Feedback CTA ── */}
      <div className="about__feedback-cta">
        <div className="about__feedback-cta__icon">
          <MessageIcon />
        </div>
        <div className="about__feedback-cta__body">
          <h3 className="about__feedback-cta__title">Ada masukan untuk kami?</h3>
          <p className="about__feedback-cta__desc">
            Ceritakan pengalamanmu, laporkan bug, atau berikan saran. Setiap suara berarti bagi kami.
          </p>
        </div>
        <Link to="/feedback" className="about__feedback-cta__btn">
          Kirim Feedback <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}
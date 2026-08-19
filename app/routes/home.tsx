import { useEffect, useState } from "react";
import "../css/home.css"
const WORDS:string[] = ["A Masterpieces", "Some Magics", "An Achievements", "Great Memories"]

const INFO_BOXES = [
  { id: 0, title: 'What are you Build?', content: 'Kami membangun sebuah ekosistem belajar dan komunitas dalam tujuan untuk bersama berbagi pengalaman.' },
  { id: 1, title: 'Who built it?', content: 'Pembangun komunitas ini sebenarnya adalah seluruh orang yang ingin berkontribusi penuh dalam pengembangan komunitas ini.' },
  { id: 2, title: 'When will you reach the finish line?', content: 'Tempat ini tidak akan pernah menemui garis finish dan akan terus melaju menembus batas.' },
  { id: 3, title: 'Where can we find this place?', content: 'Dimanapun kami akan selalu menenami lewat website ini, yang bersedia menyajikan seluruh ilmu yang bermanfaat.' },
  { id: 4, title: 'Why choose us?', content: 'Karena melihat seluruh potensi yang belum terasah dengan baik, kami ingin cita-cita kami untuk mewujudkan generasi yang melebihi batas kemampuannya.' },
  { id: 5, title: 'How can this help?', content: 'Dengan dibantu seluruh umat kami harap bisa menjadikan komunitas ini sebagai jembatan yang akan membantu kalian meraih masa depan yang cerah :).' },
];

const MathIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const AnalystIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const TechIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const AdaptIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const SKILLS = [
  { name: 'Mathematics', percentage: 47, color: '#3b82f6', Icon: MathIcon },
  { name: 'Analyst',     percentage: 32, color: '#10b981', Icon: AnalystIcon },
  { name: 'Technology',  percentage: 12, color: '#8b5cf6', Icon: TechIcon },
  { name: 'Adaptation',  percentage: 9,  color: '#f59e0b', Icon: AdaptIcon },
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
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1 
    });

    const hiddenElements = document.querySelectorAll('.reveal-item');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []); 
  return (
    <div className="app-container">
      <main className="content-container">
        {/* Page 1 */}
        <section className="fullscreen-section">
          <div className="content">
            <h1 className="title">
              <span className="title-static">Let's Create</span><span className="title-dynamic">{currentText}<span className="cursor"></span></span>
              
            </h1>
            <div className="description">
              <p>Keinginan hanya bisa diraih dengan usaha, usaha hanya bisa diterapkan dengan aksi dan kerja keras yang diikuti dengan doa.</p>
              <p>Selamat datang di Website kami, yang akan menyajikan ilmu-ilmu seputar OSN matematika maupun sekedar informasi events dsb.</p>
            </div>
          </div>
        </section>
        {/* Page 2 */}
        <section className="fullscreen-section">
          <div className="content-wrapper align-top">
            <h2 className="section-title"></h2>
            <div className="content-wrapper-box">
              {INFO_BOXES.map((box, i)=>{
                return(
                  <div key={box.id} className="box reveal-item" style={{transitionDelay:`${i*100}ms`}}>
                    <div className="box-header"><h3>{box.title}</h3></div>
                    <div className="box-content-static"><p>{box.content}</p></div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        {/* Page 3 */}
        <section className="fullscreen-section">
          <div className="content-wrapper align top">
            <h2 className="section-title"></h2>
            <div className="skills-container">
              {SKILLS.map((skill,i)=>(
                <div key={skill.name} className="skill-item reveal-item" style={{transitionDelay:`${i*150}ms`}}>
                  <div className="skill-info">
                    <span className="skill-name"><span className="skill-icon"><skill.Icon color={skill.color}/></span>{skill.name}</span>
                    <span className="skill-percentage">{skill.percentage}%</span>
                  </div>
                  <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{'--target-width':`${skill.percentage}%`,backgroundColor:skill.color}as React.CSSProperties}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
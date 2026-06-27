import { useLoaderData } from 'react-router';
import {prisma} from '../db.server';
import { useState } from 'react';
import '../css/Generations.css';

interface MemberProps {
    id:number;
    name:string;
    bio:string;
    imageUrl:string|null;
    generationId:number;
}

interface GenerationProps {
    id:number;
    name:string;
    members: MemberProps[];
}

interface SelectedMemberData extends MemberProps {
    generationName: string;
}

export async function loader() {
  const generations = await prisma.generation.findMany({
    include: { members: { orderBy: { id: 'asc' } } },
    orderBy: { id: 'asc' },
  });
  return { generations };
}

const DefaultAvatarSVG = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="default-svg"
  >
    <rect width="100" height="100" rx="20" fill="#1a1a1a" />
    <circle cx="50" cy="40" r="15" fill="#444" />
    <path
      d="M20 90C20 73.4315 33.4315 60 50 60C66.5685 60 80 73.4315 80 90H20Z"
      fill="#444"
    />
  </svg>
);

export default function Generations() {
    const {generations} = useLoaderData() as {generations: GenerationProps[]};
    const [selectedMember, setSelectedMember] = useState<SelectedMemberData | null>(null);

  return (
    <div className='generations-page'>
        <div className='header'>
            <h1>Struktur</h1>
            <p className='gen-page__subtitle'>Kenali para anggota kami</p>
        </div>
        {generations.length === 0 ? (<div className='gen-page__empty'><p>Belum terdapat angkatan kepengurusan</p></div>):(generations.map((gen)=>{
            const totalCards = gen.members.length;
            const centerIndex = (totalCards - 1)/2;
            return(
                <div key={gen.id} className='generation-section'>
                    <div className='generation-divider'>
                        <span className='generatiom-title'>{gen.name}</span>
                    </div>
                    <div className='cuerved-container'>
                        {gen.members.length === 0 ? (<p className='gen-section__empty'>Belum terdapat anggota angkatan</p>):(gen.members.map((member,i)=>{
                            const distance = Math.abs(i - centerIndex);
                            const translateY = Math.pow(distance,2) * 12;
                            const rotate = (i - centerIndex) * 4;
                            return (
                                <div
                                    key={member.id}
                                    className="member-card-mini"
                                    style={{
                                    transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
                                    zIndex: 100 - Math.floor(distance),
                                    }}
                                    onClick={() =>
                                    setSelectedMember({ ...member, generationName: gen.name })
                                    }
                                >
                                    {member.imageUrl ? (
                                    <img
                                        src={member.imageUrl}
                                        alt={member.name}
                                        className="member-image"
                                    />
                                    ) : (
                                    <DefaultAvatarSVG />
                                    )}
                                </div>
                            ) 
                        }))}
                    </div>
                </div>
            )
        }))}
        {selectedMember && (
        <div
          className="soft-modal-overlay"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="split-detail-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMember(null)}
            >
              ✕
            </button>

            <div className="detail-left">
              {selectedMember.imageUrl ? (
                <img
                  src={selectedMember.imageUrl}
                  alt="Profile"
                  className="detail-image"
                />
              ) : (
                <DefaultAvatarSVG />
              )}
            </div>

            <div className="detail-right">
              <span className="detail-badge">{selectedMember.generationName}</span>
              <h3 className="detail-name">{selectedMember.name}</h3>
              <div className="detail-bio">
                <p>{selectedMember.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
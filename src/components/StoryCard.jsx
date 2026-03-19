import React from 'react';
import { Link } from 'react-router-dom';

export default function StoryCard({ s }) {
  return (
    <Link to={`/story/${s.id}`} className="story-card animate-fade">
      <div className="cover">
        <img src={s.coverUrl} alt={s.title} loading="lazy" />
      </div>
      <div className="meta">
        <h4 title={s.title}>{s.title}</h4>
        <div className="sub">{s.author} • {s.status === 'ongoing' ? 'Ongoing' : 'Completed'}</div>
      </div>
    </Link>
  );
}
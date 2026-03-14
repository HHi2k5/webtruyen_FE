import React from 'react';
import { Link } from 'react-router-dom';

export default function StoryCard({ s }) {
  return (
    <div className="story-card">
      <Link to={`/story/${s.id}`}>
        <div className="cover">
          <img src={s.coverUrl} alt={s.title} />
        </div>
        <div className="meta">
          <h4 title={s.title}>{s.title}</h4>
          <div className="sub">{s.author} • {s.status}</div>
        </div>
      </Link>
    </div>
  );
}
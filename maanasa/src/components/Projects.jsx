import React from 'react';

const ProjectCard = ({ item }) => (
  <div className="card">
    <h4 className="card-title" style={{ marginBottom: 4 }}>
      {item.title}
    </h4>
    <p className="card-meta">
      {item.org} · {item.period}
    </p>
    <ul className="card-bullets">
      {item.bullets.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
    {item.links && item.links.length ? (
      <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {item.links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            style={{ padding: 0 }}
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    ) : null}
  </div>
);

const Projects = ({ projects }) => {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="card-list">
          {projects.map((p) => (
            <ProjectCard key={p.title} item={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;

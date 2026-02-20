import React from 'react';

function Projects({ projects }) {
  return (
    <section className="bento-card">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((proj, idx) => (
          <div key={idx} className="project-card">
            <div className="project-header">
              <h3 className="project-title">{proj.title}</h3>
              <div className="project-meta">
                <span>{proj.org}</span>
                <span className="dot-separator">•</span>
                <span className="project-period">{proj.period}</span>
              </div>
            </div>

            <ul className="project-bullets">
              {proj.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>

            {proj.links && proj.links.length > 0 && (
              <div className="project-links mt-4 no-print">
                {proj.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tag project-link"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;

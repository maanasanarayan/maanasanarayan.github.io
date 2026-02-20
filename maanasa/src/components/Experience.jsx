import React from 'react';

function Experience({ experiences }) {
  return (
    <section className="bento-card">
      <h2 className="section-title">Experience</h2>
      <div className="experience-list">
        {experiences.map((exp, idx) => (
          <div key={idx} className="experience-item">
            <div className="experience-header">
              <div className="company-info flex-row gap-3">
                <img
                  src={exp.logo}
                  alt={`${exp.company} logo`}
                  className="company-logo"
                  loading="lazy"
                />
                <div>
                  <h3 className="experience-role">{exp.role}</h3>
                  <div className="experience-meta">
                    {exp.company} • {exp.location}
                  </div>
                </div>
              </div>
              <div className="experience-period tag">{exp.period}</div>
            </div>
            <ul className="experience-bullets">
              {exp.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Experience;

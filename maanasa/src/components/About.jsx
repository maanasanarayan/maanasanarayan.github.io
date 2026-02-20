import React from 'react';

function About({ about }) {
  const { skills, education } = about;

  return (
    <section className="bento-card about-section">
      <h2 className="section-title">About & Skills</h2>

      <div className="skills-grid">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="skill-category">
            <h3 className="skill-title">{category}</h3>
            <p className="skill-items">{items}</p>
          </div>
        ))}
      </div>

      <div className="education-section mt-5 print-break">
        <h3 className="subsection-title">Education</h3>
        <div className="education-list">
          {education.map((edu, idx) => (
            <div key={idx} className="education-item">
              <div className="flex-row justify-between">
                <h4 className="edu-degree">{edu.degree}</h4>
                <span className="tag">{edu.period}</span>
              </div>
              <p className="edu-school">{edu.school}</p>
              <p className="edu-extra">{edu.extra}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;

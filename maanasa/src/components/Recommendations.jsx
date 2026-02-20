import React from 'react';

function Recommendations({ recommendations }) {
  // Duplicate array to make the infinite scroll seamless
  const duplicatedRecs = [...recommendations, ...recommendations];

  return (
    <section className="dynamic-card recommendations-section">
      <h2 className="section-title">Recommendations</h2>
      <div className="recommendations-marquee">
        <div className="marquee-track">
          {duplicatedRecs.map((rec, idx) => (
            <div key={idx} className="recommendation-item print-break">
              <blockquote className="recommendation-quote">
                &quot;{rec.quote}&quot;
              </blockquote>
              <div className="recommendation-author flex-row gap-3 mt-4">
                <img
                  src={rec.logo}
                  alt={`${rec.name} company logo`}
                  className="author-logo"
                  loading="lazy"
                />
                <div>
                  <div className="author-name">{rec.name}</div>
                  <div className="author-role">{rec.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Recommendations;

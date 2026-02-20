import React from 'react';

function Hero({ profile }) {
  return (
    <section className="bento-card col-span-12 hero-section">
      <div className="hero-content">
        <img
          src={profile.avatar}
          alt={`${profile.name} Avatar`}
          className="hero-avatar"
          loading="lazy"
        />
        <div className="hero-text">
          <h1 className="hero-title">{profile.name}</h1>
          <h2 className="hero-subtitle">{profile.title}</h2>
          <p className="hero-summary">{profile.summary}</p>
          <a
            href="/documents/MaanasaNarayan.pdf"
            download="MaanasaNarayan_Resume.pdf"
            className="btn btn-primary no-print"
            aria-label="Download Resume as PDF"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Resume
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;

import React, { useState } from 'react';
import Toast from './Toast';

function Contact({ contact }) {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setToastMessage('Email copied to clipboard!');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch {
      setToastMessage('Failed to copy email');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  return (
    <section className="bento-card contact-section text-center">
      <h2 className="section-title">Let&apos;s Connect</h2>
      <p className="contact-text text-muted mb-4">
        I&apos;m always interested in discussing technical challenges, new projects, or potential collaborations. Feel free to reach out!
      </p>

      <div className="contact-links">
        <button
          onClick={handleCopyEmail}
          className="contact-link no-print"
          aria-label="Copy Email Address"
        >
          <span className="contact-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <span>{contact.email}</span>
        </button>

        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <span className="contact-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </span>
          <span>LinkedIn</span>
        </a>

        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <span className="contact-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </span>
          <span>GitHub</span>
        </a>

        {/* This represents a print-only visible fallback for contact mechanisms */}
        <div className="contact-link print-only">
          <span className="contact-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </span>
          <span>{contact.phone}</span>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} />
    </section>
  );
}

export default Contact;

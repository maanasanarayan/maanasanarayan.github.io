import React from 'react';

const Contact = ({ contact, resumeUrl }) => {
	return (
		<section id="contact" className="section">
			<div className="container">
				<h2 className="section-title">Contact</h2>
				<p className="section-subtitle">I’m open to software engineering roles and impactful projects.</p>
				<div className="card" style={{ display: 'grid', gap: 8 }}>
					<div>
						<strong>Email:</strong> <a className="nav-link" style={{ padding: 0 }} href={`mailto:${contact.email}`}>{contact.email}</a>
					</div>
					<div>
						<strong>Phone:</strong> <a className="nav-link" style={{ padding: 0 }} href={`tel:${contact.phone}`}>{contact.phone}</a>
					</div>
					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
						<a className="btn btn-primary" href={resumeUrl} download>Download Resume</a>
						<a className="btn btn-outline" href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
						<a className="btn btn-outline" href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Contact; 
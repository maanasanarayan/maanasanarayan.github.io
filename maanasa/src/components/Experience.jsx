import React from 'react';

const ExperienceCard = ({ item }) => (
	<div className="card experience-card">
		<div className="card-header">
			<img className="company-logo" src={item.logo} alt={item.company} />
			<div>
				<h4 className="card-title">{item.role}</h4>
				<p className="card-meta">{item.company} · {item.location} · {item.period}</p>
			</div>
		</div>
		<ul className="card-bullets">
			{item.bullets.map((b, i) => <li key={i}>{b}</li>)}
		</ul>
	</div>
);

const Experience = ({ experiences }) => {
	return (
		<section id="experience" className="section" style={{ background: 'var(--surface)' }}>
			<div className="container">
				<h2 className="section-title">Experience</h2>
				<div className="experience-grid">
					{experiences.map((exp) => (
						<ExperienceCard key={exp.company + exp.period} item={exp} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Experience; 
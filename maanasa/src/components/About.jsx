import React, { useState } from 'react';

const KeyValues = ({ data }) => (
	<dl className="kv">
		{Object.entries(data).map(([key, value]) => (
			<div key={key}>
				<dt>{key}</dt>
				<dd>{value}</dd>
			</div>
		))}
	</dl>
);

const About = ({ about }) => {
	const [activeTab, setActiveTab] = useState('skills');

	const tabs = [
		{ id: 'skills', label: 'Skills', icon: '⚡' },
		{ id: 'education', label: 'Education', icon: '🎓' },
		{ id: 'accolades', label: 'Accolades', icon: '🏆' }
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case 'skills':
				return <KeyValues data={about.skills} />;
			case 'education':
				return (
					<div className="education-list">
						{about.education.map((edu) => (
							<div key={edu.degree} className="education-item">
								<div className="education-header">
									<h4>{edu.degree}</h4>
									<span className="education-period">{edu.period}</span>
								</div>
								<p>{edu.school}</p>
								{edu.extra && <p className="education-extra">{edu.extra}</p>}
							</div>
						))}
					</div>
				);
			case 'accolades':
				return (
					<div className="accolades-list">
						{about.accolades.map((a) => (
							<div key={a.title} className="accolade-item">
								<div className="accolade-header">
									<h4>{a.title}</h4>
									<span className="accolade-year">{a.year}</span>
								</div>
								<p>{a.org}</p>
							</div>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<section id="about" className="section">
			<div className="container">
				<h2 className="section-title">About</h2>
				<div className="about-layout-simple">
					
					<div className="about-tabs">
						<div className="tab-nav">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<span className="tab-icon" style={{ marginRight: 8 }}>{tab.icon}</span>
									{tab.label}
								</button>
							))}
						</div>
						<div className="tab-content">
							{renderTabContent()}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About; 
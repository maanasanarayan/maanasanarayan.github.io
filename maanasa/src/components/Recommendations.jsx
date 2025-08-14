import React from 'react';

const RecCard = ({ item }) => (
	<div className="card">
		<div className="card-header">
			<img className="company-logo" src={item.logo} alt={item.role} />
			<div>
				<h4 className="card-title" style={{ marginBottom: 0 }}>{item.name}</h4>
				<p className="card-meta">{item.role}</p>
			</div>
		</div>
		<p className="quote">“{item.quote}”</p>
	</div>
);

const Recommendations = ({ recommendations }) => {
	return (
		<section id="recommendations" className="section" style={{ background: 'var(--surface)' }}>
			<div className="container">
				<h2 className="section-title">Recommendations</h2>
				<div className="card-list">
					{recommendations.map((r) => <RecCard key={r.name} item={r} />)}
				</div>
			</div>
		</section>
	);
};

export default Recommendations; 
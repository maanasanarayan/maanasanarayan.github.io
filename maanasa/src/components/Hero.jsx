import React, { useState, useEffect } from 'react';

const TypingEffect = ({ text, speed = 100 }) => {
	const [displayText, setDisplayText] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setDisplayText(prev => prev + text[currentIndex]);
				setCurrentIndex(prev => prev + 1);
			}, speed);

			return () => clearTimeout(timeout);
		}
	}, [currentIndex, text, speed]);

	return <span>{displayText}<span className="typing-cursor">|</span></span>;
};

const Hero = ({ profile }) => {
	return (
		<section id="home" className="section hero">
			<div className="container">
				<div className="hero-card-with-photo">
					<div className="hero-photo">
						<img src={profile.avatar} alt={profile.name} className="hero-avatar" />
					</div>
					<div className="hero-content">
						<h1 className="hero-title">
							<TypingEffect text={profile.name} speed={120} />
						</h1>
						<p className="hero-subtitle">{profile.title}</p>
						<p className="hero-summary">{profile.summary}</p>
						<div className="hero-actions">
							<a className="btn btn-primary" href={profile.resumeUrl} download>Download Resume</a>
							<a className="btn btn-outline" href="#contact">Get in touch</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero; 
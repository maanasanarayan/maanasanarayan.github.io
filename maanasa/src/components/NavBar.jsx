import React, { useState, useEffect } from 'react';

const NavBar = ({ name }) => {
	const [activeSection, setActiveSection] = useState('home');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const sections = ['home', 'about', 'experience', 'projects', 'recommendations', 'contact'];
			const scrollPosition = window.scrollY + 100;
			
			let currentSection = 'home'; // Default to home

			// Check each section to see which one is currently most visible
			sections.forEach(sectionId => {
				const section = document.getElementById(sectionId);
				if (section) {
					const rect = section.getBoundingClientRect();
					const sectionTop = window.scrollY + rect.top;
					const sectionBottom = sectionTop + rect.height;
					
					// Check if the current scroll position is within this section
					// with some tolerance for the navbar
					if (scrollPosition >= sectionTop - 50 && scrollPosition < sectionBottom - 50) {
						currentSection = sectionId;
					}
				}
			});

			setActiveSection(currentSection);
		};

		// Throttle scroll events for better performance
		let ticking = false;
		const throttledHandleScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', throttledHandleScroll);
		handleScroll(); // Call once to set initial state

		return () => window.removeEventListener('scroll', throttledHandleScroll);
	}, []);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const handleLinkClick = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className="navbar">
			<div className="container navbar-inner">
				<div className="nav-links-container">
					<button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
						<span></span>
						<span></span>
						<span></span>
					</button>
					<div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
						<a className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} href="#home" onClick={handleLinkClick}>Home</a>
						<a className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} href="#about" onClick={handleLinkClick}>About</a>
						<a className={`nav-link ${activeSection === 'experience' ? 'active' : ''}`} href="#experience" onClick={handleLinkClick}>Experience</a>
						<a className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} href="#projects" onClick={handleLinkClick}>Projects</a>
						<a className={`nav-link ${activeSection === 'recommendations' ? 'active' : ''}`} href="#recommendations" onClick={handleLinkClick}>Recs</a>
						<a className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} href="#contact" onClick={handleLinkClick}>Contact</a>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default NavBar; 
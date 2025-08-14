const content = {
  profile: {
    name: 'Maanasa Narayan',
    title: 'Software Engineer',
    avatar: '/images/Me.jpeg',
    resumeUrl: '/documents/MaanasaNarayan.pdf',
    summary: 'Passionate Software Engineer with experience building scalable web applications and cloud solutions at Kayak, Amazon, Nokia, and Adobe. I love solving complex problems and creating seamless user experiences.'
  },
  about: {
    skills: {
      Languages: 'Java, Python, JavaScript (JS), TypeScript (TS), SQL, HTML, CSS',
      'Web Technologies': 'React, Redux, Node, Express, Spring Boot, RESTful APIs, HTML/CSS/Bootstrap, jQuery, JSON, XML',
      Databases: 'MySQL, MongoDB, SQL, SQLite',
      Tools: 'AWS Lambda, API Gateway, Elasticsearch, Kibana, Docker, Kubernetes, GitHub Actions, IntelliJ, VS Code, Eclipse, PyCharm, Postman, SoapUI, Android Studio, ServiceNow, Git, Puppeteer, JUnit, Jest',
      'Cloud & DevOps': 'AWS, CI/CD, Serverless Architecture, Containerization',
      'Non-Technical': 'Detail-oriented, problem solver, fast learner, strong communicator'
    },
    education: [
      {
        period: 'Sep 2021 – May 2023',
        degree: 'M.S. in Computer Science',
        school: 'Northeastern University',
        extra: 'GPA: 3.9/4.0'
      },
      {
        period: 'Aug 2014 – May 2018',
        degree: 'B.E. in Computer Science',
        school: 'KSIT, VTU',
        extra: 'Aggregate: 85%'
      }
    ],
    accolades: [
      { year: '2020', title: 'Sales Achievement Award', org: 'Adobe' },
      { year: '2019', title: 'Delight Driven Individual Award', org: 'Adobe' },
      { year: '2018', title: '10th Rank and Award of Merit', org: 'VTU' }
    ]
  },
  experiences: [
    {
      company: 'Kayak',
      logo: '/images/kayak-logo.png',
      role: 'Software Engineer',
      location: 'Boston, MA',
      period: 'Jul 2023 – Present',
      bullets: [
        'Built a Java-based API integration layer for new airline providers across 6 critical endpoints (search, availability, seat-map, baggage, booking, receipt) with comprehensive JUnit tests.',
        'Shipped integrations via GitHub Actions with staged A/B experiments and real-time Kibana log monitoring for safe rollouts.',
        'Led cross-functional debugging using SQL and Kibana dashboards to resolve edge-case errors with minimal user impact.',
        'Improved observability and proposed architectural changes that stabilized the flight-booking flow.'
      ]
    },
    {
      company: 'Amazon',
      logo: '/images/amazon.jpg',
      role: 'Software Engineering Intern',
      location: 'Seattle, WA',
      period: 'Sep 2022 – Dec 2022',
      bullets: [
        'Eliminated ~20 engineer-hours of manual QA per release by building an internal Amazon\'s Choice badging validator with React, AWS Lambda, and Puppeteer.',
        'Implemented batch processing that streamed results in 10% increments, providing immediate feedback while large Excel files processed.',
        'Delivered a full-stack MVP plus signed-off requirements/design docs and thorough hand-off within 10 weeks.',
        'Stack: Node.js, React, AWS Lambda, API Gateway, S3, Puppeteer.'
      ]
    },
    {
      company: 'Nokia',
      logo: '/images/nokia.jpg',
      role: 'Application Developer Co-op',
      location: 'Raleigh, NC',
      period: 'May 2022 – Aug 2022',
      bullets: [
        'Built application logic for BST on ServiceNow to collect and report Global Business Services.',
        'Redesigned the ESB data aggregation platform. Stack: JavaScript, ServiceNow, Java, SQL.'
      ]
    },
    {
      company: 'Adobe',
      logo: '/images/adobe.png',
      role: 'Software Engineer (Associate Technical Consultant)',
      location: 'Bengaluru, India',
      period: 'Nov 2018 – Aug 2021',
      bullets: [
        'Guided global clients in experiment design and built alternate site variants across Adobe Target, AEP, Analytics, and AEM using HTML/JavaScript.',
        'Integrated a recommendation system (Target + Analytics) that increased on-site engagement 4x.',
        'Authored a Selenium automation bot that eliminated repetitive internal traffic-allocation tasks for the consulting team.'
      ]
    },
    {
      company: 'Infosys',
      logo: '/images/infosys.jpg',
      role: 'Systems Engineer Trainee',
      location: 'Mysuru, India',
      period: 'Jul 2018 – Sep 2018',
      bullets: [
        'Trained on MERN stack; built an aircraft booking web app as capstone.',
        'Stack: Python, React, Node, Express, MongoDB.'
      ]
    }
  ],
  projects: [
    {
      title: 'Stock Trader — MERN Web App',
      org: 'Northeastern University',
      period: 'Nov 2021 – Dec 2021',
      bullets: [
        'Developed a trading platform with role-based access, state management, and live financial API integration.',
        'Frontend: React; Backend: Express/Node; DB: MongoDB.'
      ],
      links: [
        { label: 'React repo', url: 'https://github.com/maanasanarayan/webdev-cs5610-project' },
        { label: 'Node repo', url: 'https://github.com/maanasanarayan/webdev-cs5610-node-project' }
      ]
    },
    {
      title: 'Bug Bash — Automation Tool',
      org: 'Amazon, Seattle',
      period: 'Sep 2021 – Nov 2021',
      bullets: [
        'Automated AC badging validation with React UI and Node (AWS Lambda, API Gateway, S3).',
        'Web scraping with Puppeteer; tested with Jest; delivered in 12 weeks.'
      ]
    },
    {
      title: 'Interactive Adventure Game — Java App',
      org: 'Northeastern University',
      period: 'Oct 2021 – Dec 2021',
      bullets: [
        'Adventure game in Java using OO, MVC, and design patterns with a Swing GUI.',
        'Wrote exhaustive plans and 100+ JUnit tests.'
      ]
    },
    {
      title: 'BeatBeat — Android App',
      org: 'Northeastern University',
      period: 'Feb 2021 – Apr 2021',
      bullets: [
        'Music learning game with rhythm challenges and avatar progression.',
        'Built in Java (Android Studio); tested with real users.'
      ],
      links: [
        { label: 'GitHub', url: 'https://github.com/maanasanarayan/BeatBeat_FinalProject_CS5520' }
      ]
    }
  ],
  recommendations: [
    {
      name: 'Zhigang Yang',
      role: 'SDM, Amazon',
      logo: '/images/amazon-light.png',
      quote: 'One of the best interns I\'ve had. Ramp-up was fast, delivery met our needs within 12 weeks.'
    },
    {
      name: 'Cahya Ong',
      role: 'SDE, Amazon',
      logo: '/images/amazon-light.png',
      quote: 'Quickly picked up new domains, asked the right questions, and delivered results including stretch goals.'
    },
    {
      name: 'Tarence DSouza',
      role: 'Customer Success, Adobe',
      logo: '/images/adobe.png',
      quote: 'Expressive, articulate, and resourceful team member. You\'ll likely learn a thing or two working with her.'
    }
  ],
  contact: {
    email: 'mnsnryn@gmail.com',
    phone: '+1 (774) 777-8729',
    linkedin: 'https://www.linkedin.com/in/maanasa-narayan/',
    github: 'https://github.com/maanasanarayan'
  }
};

export default content; 
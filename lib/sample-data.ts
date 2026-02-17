import type { ResumeData } from '@/types/resume';

/**
 * Sample resume data for testing and preview
 * UK entry-level software developer
 */
export const sampleResumeData: ResumeData = {
  personal: {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.co.uk',
    phone: '+44 20 1234 5678',
    city: 'London, UK',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
  },
  education: [
    {
      id: '1',
      institution: 'University of Manchester',
      degree: 'BSc Computer Science',
      field: 'Software Engineering',
      startDate: '2020-09',
      endDate: '2024-06',
      grade: 'First Class Honours',
      achievements: [
        'Dean\'s List for Academic Excellence (2022, 2023)',
        'Final year project: Built a real-time collaboration tool using React and WebSockets',
      ],
    },
  ],
  experience: [
    {
      id: '1',
      company: 'Tech Startup Ltd',
      position: 'Software Developer Intern',
      location: 'London, UK',
      startDate: '2023-06',
      endDate: '2023-09',
      current: false,
      responsibilities: [
        'Developed new features for the company\'s web application using React and Node.js',
        'Fixed bugs and improved code quality, reducing bug reports by 30%',
        'Collaborated with senior developers in Agile sprints',
      ],
    },
  ],
  projects: [
    {
      id: '1',
      name: 'Task Management App',
      highlights: [
        'Built full-stack task management application using React and Node.js, serving 100+ active users',
        'Implemented real-time updates with Socket.io, reducing page refresh needs by 80%',
        'Designed responsive UI with TailwindCSS, achieving 95+ Lighthouse performance score',
        'Integrated PostgreSQL database with authentication system, maintaining 99.9% uptime'
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'TailwindCSS'],
      url: 'github.com/alexjohnson/task-app',
      startDate: '2024-01',
      endDate: '2024-04',
    },
    {
      id: '2',
      name: 'Weather Dashboard',
      highlights: [
        'Created interactive weather dashboard consuming OpenWeather API, providing forecasts for 50+ cities',
        'Visualized weather data using Chart.js, improving data comprehension by 60%',
        'Implemented caching strategy reducing API calls by 40% and improving load times',
        'Achieved 4.5-star rating from 200+ users on ProductHunt'
      ],
      technologies: ['JavaScript', 'Chart.js', 'REST API', 'HTML/CSS'],
      url: 'github.com/alexjohnson/weather-dashboard',
      startDate: '2023-10',
      endDate: '2023-12',
    },
  ],
  skills: {
    technical: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'SQL',
      'Git',
      'HTML/CSS',
      'REST APIs',
    ],
    soft: [
      'Problem Solving',
      'Teamwork',
      'Communication',
      'Time Management',
      'Attention to Detail',
    ],
  },
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2024-03',
    },
  ],
  summary:
    'Recent Computer Science graduate with hands-on experience in full-stack web development. Passionate about building user-friendly applications and learning new technologies.',
};

/**
 * Empty resume template for new users
 */
export const emptyResumeData: ResumeData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    city: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
  },
};

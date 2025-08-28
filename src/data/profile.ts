export type LanguageLevel = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';

export type Language = Readonly<{
  name: 'DUTCH'|'ENGLISH'|'FRENCH';
  listening: LanguageLevel;
  reading: LanguageLevel;
  spokenInteraction: LanguageLevel;
  spokenProduction: LanguageLevel;
  writing: LanguageLevel;
}>;

export type Experience = Readonly<{
  id: string;
  company: string;
  customer?: string;
  start: string; // ISO or human
  end?: string;
  type: 'professional'|'internship'|'gapfiller';
  months: number; // effective months
  tech: string[];
}>;

export type Education = Readonly<{
  id: string;
  school: string;
  start: string;
  end: string;
}>;

export type Profile = Readonly<{
  name: string;
  birthday: string;
  nationality: string;
  currentEmployer: string;
  since: string;
  movingToMediorDate: string; // contextual note
  skills: Readonly<{
    core: string[];
    devops: string[];
    databases: string[];
    other: string[];
  }>;
  languages: Language[];
  education: Education[];
  experience: Experience[];
}>;

export const profile: Profile = {
  name: 'Antoine Ghigny',
  birthday: '2001-04-11',
  nationality: 'BE',
  currentEmployer: 'ARHS Group Part of Accenture',
  since: '2024-02-12',
  movingToMediorDate: '2025-09-01',
  skills: {
    core: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'Node.js', 'GraphQL', 'Kafka', 'Reactive architectures'],
    devops: ['CI/CD', 'Docker', 'Kubernetes', 'Monitoring', 'Performance', 'JMeter DSL'],
    databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
    other: ['C++', 'Python', 'Kotlin', 'Laravel', 'Django']
  },
  languages: [
    {name: 'DUTCH', listening: 'B1', reading: 'B1', spokenInteraction: 'B1', spokenProduction: 'B1', writing: 'B1'},
    {name: 'ENGLISH', listening: 'C1', reading: 'C1', spokenInteraction: 'C1', spokenProduction: 'C1', writing: 'C1'},
    {name: 'FRENCH', listening: 'C2', reading: 'C2', spokenInteraction: 'C2', spokenProduction: 'C2', writing: 'C2'}
  ],
  education: [
    {
      id: 'edu-arn',
      school: 'Athénée Royal de Nivelles — General secondary education',
      start: '2013-09-01',
      end: '2020-06-30',
    },
    {
      id: 'edu-uni',
      school: 'ESI - HE2B',
      start: '2020-09-01',
      end: '2023-06-30',
    }
  ],
  experience: [
    {
      id: 'xp-proximus-intern',
      company: 'Proximus',
      start: '2023-02-01',
      end: '2023-07-01',
      type: 'internship',
      months: 4,
      customer: 'Proximus',
      tech: ['Spring Boot', 'Kafka', 'GraphQL', 'Angular', 'Reactive architectures', 'Business rules engine', 'Microservices', 'Scrum']
    },
    {
      id: 'xp-proximus-node',
      company: 'Proximus',
      start: '2023-07-01',
      end: '2024-02-01',
      type: 'professional',
      months: 6,
      tech: ['Node.js', 'TypeScript', 'GraphQL', 'Angular']
    },
    {
      id: 'xp-arhs-carbon',
      company: 'ARHS Group Part of Accenture',
      start: '2024-02-12',
      type: 'professional',
      months: 19,
      customer: 'European Commission (CBAM)',
      tech: ['Angular', 'Java', 'Spring', 'DevOps', 'JMeter DSL']
    }
  ]
};

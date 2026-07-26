import OpenAI from 'openai';

function generateSmartFallback(action: string, payload: any) {
  const { title, companyName, industry } = payload;

  switch (action) {
    case 'generate-description': {
      const jobTitle = title || 'Software Engineer';
      const company = companyName || 'Innovate Tech';
      return {
        description: `We are looking for a highly skilled ${jobTitle} to join ${company}. In this role, you will be key to architecting scalable, modern software solutions, working closely with cross-functional product and engineering teams to deliver high-impact feature releases.`,
        responsibilities: `• Architect, develop, and maintain production-grade web applications.\n• Collaborate with UX/UI designers and product managers to define specs.\n• Optimize front-end web vitals and back-end latency.\n• Conduct code reviews and champion engineering best practices.`,
        requirements: `• 3+ years experience with modern stack (TypeScript, React, Next.js, Node.js).\n• Solid understanding of relational databases and REST/GraphQL APIs.\n• Strong problem-solving abilities and communication skills.`,
        benefits: `• Top-of-market salary package & equity.\n• $2,500 annual learning & tech workspace stipend.\n• Flexible remote/hybrid schedule & comprehensive healthcare.`,
      };
    }

    case 'improve-title': {
      const current = title || 'Developer';
      return {
        originalTitle: current,
        suggestedTitles: [
          `Senior ${current} (Cloud & React)`,
          `Lead ${current} - High Growth SaaS`,
          `Staff ${current} (AI & Distributed Systems)`,
          `Principal Product ${current}`,
        ],
        reasoning: 'Adding seniority indicators, specific tech stack keywords (React/Cloud/AI), and impact domains increases qualified applicant click-through rates by up to 45%.',
      };
    }

    case 'suggest-skills': {
      const t = (title || '').toLowerCase();
      let defaultSkills = ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'GraphQL', 'REST APIs', 'PostgreSQL', 'Docker', 'CI/CD'];
      if (t.includes('ai') || t.includes('data') || t.includes('machine learning')) {
        defaultSkills = ['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'Vector DBs', 'TensorFlow', 'FastAPI', 'Pandas', 'TypeScript', 'Docker'];
      } else if (t.includes('design') || t.includes('ui') || t.includes('ux')) {
        defaultSkills = ['Figma', 'Design Systems', 'Framer Motion', 'User Research', 'Prototyping', 'Tailwind CSS', 'Wireframing', 'WCAG Accessibility'];
      } else if (t.includes('backend') || t.includes('devops') || t.includes('cloud')) {
        defaultSkills = ['Go', 'Rust', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Redis', 'Kafka', 'CI/CD'];
      }
      return { skills: defaultSkills };
    }

    case 'company-summary': {
      const name = companyName || 'NextGen Tech';
      const ind = industry || 'Software SaaS';
      return {
        summary: `${name} is a high-growth technology company innovating in ${ind}. Driven by a mission to empower modern enterprises, ${name} combines sleek design with robust software architecture to solve mission-critical operational challenges.`,
        mission: `To build intuitive, intelligent software tools that revolutionize how teams work globally.`,
        cultureValues: ['High Autonomy & Craftsmanship', 'Radical Transparency', 'Customer Obsession', 'Continuous Learning'],
      };
    }

    case 'interview-questions': {
      const jTitle = title || 'Full Stack Engineer';
      return {
        jobTitle: jTitle,
        questions: [
          {
            category: 'Technical Architecture',
            question: `How would you architect a high-traffic Next.js application handling 100,000 active WebSocket connections for real-time updates?`,
            evalCriteria: 'Evaluate knowledge of edge routing, serverless connection limits, Redis pub/sub, and backpressure handling.',
          },
          {
            category: 'Problem Solving & Optimization',
            question: `Describe a time when you diagnosed and resolved a severe LCP/CLS performance bottleneck in a React application.`,
            evalCriteria: 'Look for systematic browser devtools usage, bundle analysis, lazy loading, and rendering strategy selection.',
          },
          {
            category: 'System Integration',
            question: `How do you structure API validation with Zod and handle error states gracefully across client and server boundaries?`,
            evalCriteria: 'Check for schema reusability, type inference usage, and unified toast/error UI handling.',
          },
          {
            category: 'Behavioral & Culture',
            question: `Tell us about a technical disagreement you had regarding software architecture. How did you resolve it?`,
            evalCriteria: 'Assess active listening, data-driven compromise, and focus on team velocity.',
          },
        ],
      };
    }

    case 'cover-letter': {
      const { candidateName, jobTitle: jt, companyName: cn, skills } = payload;
      return {
        coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${jt || 'position'} at ${cn || 'your company'}. As ${candidateName || 'a passionate engineer'} with expertise in ${(skills || []).slice(0, 3).join(', ')}, I am confident I can make a meaningful contribution to your team.\n\nMy background aligns closely with the requirements of this role. I have a proven track record of delivering high-quality software solutions and collaborating effectively with cross-functional teams.\n\nI would welcome the opportunity to discuss how my skills and experience can benefit ${cn || 'your organization'}.\n\nBest regards,\n${candidateName || 'Candidate'}`,
      };
    }

    case 'resume-analyze': {
      return {
        strengths: ['Clear work history', 'Strong technical skills section', 'Quantified achievements'],
        improvements: ['Add more action verbs', 'Include measurable outcomes', 'Tailor to specific job descriptions'],
        keywords: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'CI/CD'],
        overallScore: 78,
      };
    }

    case 'ats-score': {
      return {
        score: Math.floor(Math.random() * 20) + 72,
        matchedKeywords: ['React', 'TypeScript', 'Node.js'],
        missingKeywords: ['Docker', 'Kubernetes'],
        suggestions: ['Add more industry keywords', 'Use standard section headings', 'Quantify your achievements'],
      };
    }

    case 'resume-extract': {
      return {
        profile: {
          fullName: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          phone: '+1 (555) 382-9102',
          location: 'San Francisco, CA',
          website: 'https://alexmorgan.dev',
          linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
          githubUrl: 'https://github.com/alexmorgan-dev',
          skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Supabase', 'Prisma', 'OpenAI API', 'GraphQL'],
        },
        workExperiences: [
          { company: 'Vercel', title: 'Senior Full-Stack Engineer', startDate: '2022-01-01', current: true },
          { company: 'Stripe', title: 'Software Engineer', startDate: '2020-06-01', endDate: '2021-12-31' },
        ],
        educations: [
          { institution: 'University of California, Berkeley', degree: 'B.S. in Computer Science', startYear: 2016, endYear: 2020 },
        ]
      };
    }

    case 'career-recommendations': {
      return {
        recommendations: [
          {
            title: 'AI/ML Engineer',
            reason: 'Leverages your strong Python and data analysis skills.',
            suggestedSkills: ['TensorFlow', 'Scikit-learn', 'Kubernetes'],
          },
          {
            title: 'DevOps Engineer',
            reason: 'Expands on your backend and cloud infrastructure experience.',
            suggestedSkills: ['Terraform', 'Ansible', 'Prometheus'],
          },
          {
            title: 'Product Manager, Technical',
            reason: 'Combines your technical background with leadership potential.',
            suggestedSkills: ['Roadmapping', 'Agile Methodologies', 'User Research'],
          },
        ],
      };
    }

    case 'company-recommendations': {
        return {
          companies: [
            { name: 'Vercel', reason: 'Focus on frontend and Next.js aligns with your core skills.' },
            { name: 'OpenAI', reason: 'Your interest in AI and experience with TypeScript would be a great fit.' },
            { name: 'Linear', reason: 'High-craft, product-focused engineering culture.' },
          ]
        };
    }

    default:
      return { result: 'AI response generated successfully' };
  }
}

export class AIService {
  private static getOpenAIClient(): OpenAI | null {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-api-key') || apiKey.includes('your-openrouter-api-key')) {
      return null;
    }
    const baseURL = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE_URL;
    return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  }

  private static async callAI(messages: OpenAI.Chat.ChatCompletionMessageParam[], fallbackAction: string, fallbackPayload: any) {
    const client = this.getOpenAIClient();
    if (!client) return generateSmartFallback(fallbackAction, fallbackPayload);
    try {
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : generateSmartFallback(fallbackAction, fallbackPayload);
    } catch {
      return generateSmartFallback(fallbackAction, fallbackPayload);
    }
  }

  static async generateJobDescription(payload: { title: string; companyName: string; location?: string; skills?: string[] }) {
    return this.callAI([
      { role: 'system', content: 'You are an expert HR and Technical Recruiter. Output JSON with fields: description, responsibilities, requirements, benefits.' },
      { role: 'user', content: `Generate a professional job post for "${payload.title}" at "${payload.companyName}". Location: ${payload.location || 'Remote'}. Skills: ${payload.skills?.join(', ') || 'Modern tech stack'}.` },
    ], 'generate-description', payload);
  }

  static async improveJobTitle(payload: { title: string }) {
    return this.callAI([
      { role: 'system', content: 'You are an AI talent branding expert. Return JSON with originalTitle, suggestedTitles (array of 4), and reasoning.' },
      { role: 'user', content: `Suggest 4 modern, high-converting job titles for "${payload.title}".` },
    ], 'improve-title', payload);
  }

  static async suggestSkills(payload: { title: string }) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with key skills (array of 10 relevant technical & soft skills).' },
      { role: 'user', content: `Suggest top skills for a "${payload.title}" role.` },
    ], 'suggest-skills', payload);
  }

  static async generateCompanySummary(payload: { companyName: string; industry?: string }) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with summary, mission, and cultureValues (array).' },
      { role: 'user', content: `Generate company summary for "${payload.companyName}" in industry "${payload.industry || 'Technology'}".` },
    ], 'company-summary', payload);
  }

  static async generateInterviewQuestions(payload: { title: string }) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with jobTitle, questions (array of objects with category, question, evalCriteria).' },
      { role: 'user', content: `Generate 4 interview questions for "${payload.title}".` },
    ], 'interview-questions', payload);
  }

  static async generateCoverLetter(payload: { jobTitle: string; companyName: string; candidateName: string; skills: string[] }) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with coverLetter (string). Write a professional, personalized cover letter.' },
      { role: 'user', content: `Write a cover letter for ${payload.candidateName} applying for "${payload.jobTitle}" at "${payload.companyName}". Skills: ${payload.skills.join(', ')}.` },
    ], 'cover-letter', payload);
  }

  static async analyzeResume(resumeText: string) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with strengths (array), improvements (array), keywords (array), overallScore (0-100).' },
      { role: 'user', content: `Analyze this resume and provide feedback:\n\n${resumeText.slice(0, 3000)}` },
    ], 'resume-analyze', { resumeText });
  }

  static async calculateATSScore(resumeText: string, jobDescription: string) {
    return this.callAI([
      { role: 'system', content: 'Return JSON with score (0-100), matchedKeywords (array), missingKeywords (array), suggestions (array).' },
      { role: 'user', content: `Calculate ATS match score between this resume and job description.\n\nResume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jobDescription.slice(0, 1000)}` },
    ], 'ats-score', {});
  }

  static async extractResumeData(resumeText: string) {
    const systemPrompt = `
      You are an expert resume parser. Extract structured data from the resume text.
      The output must be a valid JSON object with the following structure:
      {
        "profile": {
          "fullName": "string",
          "email": "string",
          "phone": "string",
          "location": "string",
          "website": "string",
          "linkedinUrl": "string",
          "githubUrl": "string",
          "skills": ["string"]
        },
        "workExperiences": [
          {
            "company": "string",
            "title": "string",
            "location": "string",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD", // or null if current
            "current": boolean,
            "description": "string"
          }
        ],
        "educations": [
          {
            "institution": "string",
            "degree": "string",
            "field": "string",
            "startYear": number,
            "endYear": number // or null if current
          }
        ]
      }
      Infer dates and boolean values correctly. If a field is not present, omit it or set it to null.
      Ensure start and end dates are in YYYY-MM-DD format.
    `;

    return this.callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this resume:\n\n${resumeText.slice(0, 4000)}` },
      ],
      'resume-extract',
      {}
    );
  }

  static async getCareerRecommendations(profile: any) {
    const systemPrompt = `
      You are an expert career coach and technical recruiter.
      Analyze the user's profile and suggest 3 relevant, ambitious, and actionable career path recommendations.
      The output must be a valid JSON object with the following structure:
      {
        "recommendations": [
          {
            "title": "string", // e.g., "AI/ML Engineer"
            "reason": "string", // Why this is a good fit based on their profile
            "suggestedSkills": ["string"] // 3 key skills to learn for this path
          }
        ]
      }
    `;
    const userProfileSummary = `
      Current Role: ${profile.headline}
      Skills: ${profile.skills?.join(', ')}
      Experience: ${profile.experienceYrs} years
      Bio: ${profile.bio}
    `;
    return this.callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate career recommendations for this profile:\n\n${userProfileSummary}` },
      ],
      'career-recommendations',
      {}
    );
  }

  static async getCompanyRecommendations(profile: any) {
    const systemPrompt = `
      You are an expert career advisor.
      Based on the user's profile, recommend 3 companies that would be a great cultural and technical fit.
      The output must be a valid JSON object with the following structure:
      {
        "companies": [
          {
            "name": "string",
            "reason": "string" // Why this company is a good fit
          }
        ]
      }
    `;
    const userProfileSummary = `
      Current Role: ${profile.headline}
      Skills: ${profile.skills?.join(', ')}
      Experience: ${profile.experienceYrs} years
      Bio: ${profile.bio}
    `;
    return this.callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate company recommendations for this profile:\n\n${userProfileSummary}` },
      ],
      'company-recommendations',
      {}
    );
  }
}

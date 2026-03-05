const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.evaluateCodeAnswer = async ({ question, code, language, testResults }) => {
  const prompt = `You are an expert technical interviewer. Evaluate the following coding solution.

Question: ${question}
Language: ${language}
Candidate's Code:
\`\`\`${language}
${code}
\`\`\`

Test Results: ${JSON.stringify(testResults, null, 2)}

Provide a detailed evaluation in the following JSON format:
{
  "score": <0-100>,
  "correctness": <0-100>,
  "codeQuality": <0-100>,
  "efficiency": <0-100>,
  "readability": <0-100>,
  "feedback": "<detailed feedback>",
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};

exports.evaluateOpenEndedAnswer = async ({ question, answer, expectedAnswer }) => {
  const prompt = `You are an expert technical interviewer. Evaluate the following answer to an interview question.

Question: ${question}
Expected Answer Criteria: ${expectedAnswer || 'Use your expertise to evaluate'}
Candidate's Answer: ${answer}

Provide a detailed evaluation in JSON format:
{
  "score": <0-100>,
  "feedback": "<detailed feedback>",
  "keyPointsCovered": ["point1", "point2"],
  "keyPointsMissed": ["point1", "point2"],
  "suggestions": ["suggestion1"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};

exports.generateInterviewSummary = async ({ interview, submissions }) => {
  const submissionSummary = submissions.map((s) => ({
    question: s.question?.text,
    type: s.type,
    score: s.score,
    aiFeedback: s.aiEvaluation?.feedback,
  }));

  const prompt = `You are an expert technical interviewer. Based on the following interview data, provide a comprehensive evaluation summary.

Interview Title: ${interview.title}
Interview Type: ${interview.type}
Submissions: ${JSON.stringify(submissionSummary, null, 2)}

Provide a comprehensive summary in JSON format:
{
  "summary": "<overall performance summary>",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "recommendation": "<strong-hire|hire|neutral|no-hire|strong-no-hire>",
  "overallScore": <0-100>
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};

exports.parseResume = async (resumeText) => {
  const prompt = `You are an expert HR professional and resume parser. Extract structured information from the following resume text.

Resume Text:
${resumeText}

Extract and return a JSON object with:
{
  "name": "<full name>",
  "email": "<email>",
  "phone": "<phone>",
  "summary": "<professional summary>",
  "skills": ["skill1", "skill2", ...],
  "technicalSkills": ["skill1", "skill2", ...],
  "softSkills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<duration>",
      "startDate": "<start date>",
      "endDate": "<end date>",
      "description": "<responsibilities and achievements>"
    }
  ],
  "education": [
    {
      "institution": "<institution name>",
      "degree": "<degree>",
      "field": "<field of study>",
      "year": "<graduation year>",
      "gpa": "<gpa if mentioned>"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "<project name>",
      "description": "<project description>",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "totalExperienceYears": <number>,
  "seniorityLevel": "<junior|mid|senior|lead|principal>"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
};

exports.generateQuestions = async ({ jobRole, skills, difficulty, type, count = 5 }) => {
  const prompt = `You are an expert technical interviewer. Generate ${count} interview questions for a ${jobRole} role.

Skills to assess: ${skills.join(', ')}
Difficulty: ${difficulty}
Question Type: ${type}

Return a JSON array of questions:
{
  "questions": [
    {
      "text": "<question text>",
      "type": "${type}",
      "difficulty": "${difficulty}",
      "category": "<category>",
      "tags": ["tag1", "tag2"],
      "expectedAnswer": "<expected answer or evaluation criteria>",
      "codeTemplate": "<starter code if coding question, otherwise null>",
      "language": "<programming language if coding question>",
      "timeLimit": <minutes>,
      "points": <10-30>
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content).questions;
};

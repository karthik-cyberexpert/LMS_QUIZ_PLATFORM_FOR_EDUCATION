import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const { topic, difficulty, numberOfQuestions, optionsPerQuestion, subject, description, creationMethod } = config;

    const prompt = `
      Create a quiz about "${topic}" in the subject area of "${subject}".
      Context/Description: ${description || 'No additional context provided.'}
      Difficulty: ${difficulty}
      Number of questions: ${numberOfQuestions}
      Options per question: ${optionsPerQuestion}

      Response must be in STRICT VALID JSON format.
      The JSON should be an array of objects where each object represents a question with the following structure:
      {
        "text": "The question text",
        "options": [
          { "text": "Option 1", "isCorrect": true },
          { "text": "Option 2", "isCorrect": false },
          { "text": "Option 3", "isCorrect": false },
          { "text": "Option 4", "isCorrect": false }
        ],
        "explanation": "Brief explanation of the correct answer"
      }

      Ensure only ONE option is correct per question. 
      Make the questions challenging based on the difficulty level.
      Return ONLY the JSON array. No preamble or postscript.
    `;

    const systemPrompt = "You are an expert educator and quiz creator. You must only respond with valid JSON arrays containing quiz questions as requested. Do not include any text outside of the JSON array.";
    
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        system: systemPrompt,
        prompt: prompt,
        stream: false,
        format: 'json'
      }),
    }).catch(err => {
      if (err.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
        throw new Error('Could not connect to Ollama. Please ensure Ollama is running (ollama serve) and accessible at http://127.0.0.1:11434');
      }
      throw err;
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        throw new Error('Ollama model "llama3.2:3b" not found. Please run "ollama pull llama3.2:3b" in your terminal.');
      }
      throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    let content = data.response;

    if (!content) {
      throw new Error('AI returned an empty response. Verify the model is working by running "ollama run llama3.2:3b"');
    }

    try {
      let questionsData = JSON.parse(content);
      
      // Handle the case where the AI might return a single object instead of an array
      if (!Array.isArray(questionsData)) {
        if (questionsData.questions && Array.isArray(questionsData.questions)) {
          questionsData = questionsData.questions;
        } else {
          questionsData = [questionsData];
        }
      }
      
      // Map and add IDs
      const questions = questionsData.map((q: any, i: number) => {
        // Basic validation of question structure
        if (!q.text || !Array.isArray(q.options)) {
          throw new Error(`Question ${i+1} is missing text or options`);
        }

        return {
          id: `gen-q-${Date.now()}-${i}`,
          text: q.text,
          marks: config.marksPerQuestion || 10,
          options: q.options.map((opt: any, j: number) => ({
            id: `gen-o-${Date.now()}-${i}-${j}`,
            text: opt.text || 'Option',
            isCorrect: !!opt.isCorrect
          })),
          explanation: q.explanation || '',
          topic: topic
        };
      });

      const quiz = {
        id: `gen-quiz-${Date.now()}`,
        title: `${topic} Quiz`,
        description: description || `AI-generated quiz about ${topic}`,
        subject: subject,
        topic: topic,
        difficulty: difficulty,
        totalMarks: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        timeLimit: config.timeLimit || 600,
        maxAttempts: 3,
        isPublished: false,
        createdAt: new Date().toISOString(),
        creationMethod: creationMethod || 'ai_topic',
        questions: questions
      };

      return NextResponse.json({ quiz });

    } catch (parseError: any) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error details:', parseError);
      return NextResponse.json({ 
        error: 'The AI model generated invalid data structure.',
        details: parseError.message,
        raw: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Generation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

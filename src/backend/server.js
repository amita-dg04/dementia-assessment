import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  if (req.path === '/store_patient') {
    console.log('Received patient data:', req.body);
  }
  next();
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/assessment_results/')) {
    console.log('Assessment Results Request:', {
      path: req.path,
      method: req.method,
      params: req.params,
      query: req.query
    });
  }
  next();
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// need to create a .env file for this **********
const pool = new Pool({
  user: 'amitasatish',
  host: 'localhost',
  database: 'assessment_db',
  password: 'password',
  port: 5432,
});

// Store patient data: POST #1
app.post('/store_patient', async (req, res) => {
  console.log('\n--- New Patient Registration ---');
  console.log('Raw request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);

  const { patient_type, first_name, last_name, birth_date, sex } = req.body;


  // Validate all required fields
  if (!first_name || typeof first_name !== 'string' || !first_name.trim()) {
    return res.status(400).json({ error: 'First name is required' });
  }

  if (!last_name || typeof last_name !== 'string' || !last_name.trim()) {
    return res.status(400).json({ error: 'Last name is required' });
  }

  if (!patient_type || typeof patient_type !== 'string' || !patient_type.trim()) {
    return res.status(400).json({ error: 'Patient type is required' });
  }

  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
    return res.status(400).json({ error: 'Valid birth date is required (YYYY-MM-DD)' });
  }

  if (!sex || typeof sex !== 'string' || !['Male', 'Female'].includes(sex)) {
    return res.status(400).json({ error: 'Valid sex is required (Male or Female)' });
  }

  try {

    // Use parameterized query with trimmed values
    const result = await pool.query(
      'INSERT INTO assessments (patient_type, first_name, last_name, birth_date, sex) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        patient_type.trim(),
        first_name.trim(),
        last_name.trim(),
        birth_date,
        sex.trim()
      ]
    );

    console.log('Successfully inserted record:', result.rows[0]);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Database error:', {
      error: err,
      errorMessage: err.message,
      errorCode: err.code,
      input: { patient_type, first_name, last_name, birth_date, sex }
    });
    res.status(500).json({ 
      error: 'Error storing patient data',
      details: err.message,
      code: err.code
    });
  }
});

// Store section data: POST #2
app.post('/store_section_response', async (req, res) => {
  console.log('\n--- New Section Response ---');
  console.log('Request body:', req.body);

  const { 
    assessment_id, 
    section_number, 
    question_number, 
    user_response, 
    is_correct,
    response_time 
  } = req.body;

  // Validate required fields
  if (!assessment_id || !Number.isInteger(assessment_id)) {
    return res.status(400).json({ error: 'Valid assessment ID is required' });
  }

  if (!section_number || !Number.isInteger(section_number)) {
    return res.status(400).json({ error: 'Valid section number is required' });
  }

  if (!question_number || !Number.isInteger(question_number)) {
    return res.status(400).json({ error: 'Valid question number is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO section_responses 
       (assessment_id, section_number, question_number, user_response, is_correct, response_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (assessment_id, section_number, question_number)
       DO UPDATE SET 
         user_response = $4,
         is_correct = $5,
         response_time = $6
       RETURNING id`,
      [
        assessment_id,
        section_number,
        question_number,
        user_response ? user_response.toString() : null,
        is_correct,
        response_time || null  // Handle undefined response_time
      ]
    );

    console.log('Successfully stored response:', result.rows[0]);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Database error:', {
      error: err,
      errorMessage: err.message,
      errorCode: err.code,
      input: { assessment_id, section_number, question_number, user_response, is_correct, response_time }
    });
    res.status(500).json({ 
      error: 'Error storing section response',
      details: err.message,
      code: err.code
    });
  }
});

// Sentence validation endpoint
app.post('/validate_sentence', async (req, res) => {
  const { sentence } = req.body;

  if (!sentence) {
    return res.status(400).json({ error: 'Sentence is required' });
  }

  try {
    const response = await axios.post(
      'https://api.languagetool.org/v2/check',
      new URLSearchParams({
        'text': sentence,
        'language': 'en-US',
        'enabledOnly': 'false',
        'level': 'picky',
        'disabledCategories': 'TYPOS,PUNCTUATION,TYPOGRAPHY'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      }
    );

    // API grammar validation
    const apiErrors = response.data.matches.filter(match => 
      match.rule.category.id === 'GRAMMAR' || 
      match.rule.category.id === 'SYNTAX' ||
      match.rule.category.id.includes('VERB')
    );

    // Additional custom validation
    const words = sentence.trim().split(/\s+/);
    const subjectVerbCheck = /^(I|you|he|she|it|we|they)\s+\w+/i.test(sentence);
    
    // Common incorrect patterns
    const incorrectPatterns = [
      /\b(I|you|he|she|it|we|they)\s+\w+ing\b(?!\s+(?:is|are|was|were))/i,  // Catches "I running you"
      /\b(tried|wants|needs|likes)\s+\w+(?!\s+to)\b/i  // Catches "tried sit"
    ];
    
    const hasIncorrectPattern = incorrectPatterns.some(pattern => pattern.test(sentence));

    // Combined validation
    const isValid = apiErrors.length === 0 && !hasIncorrectPattern && subjectVerbCheck;

    console.log('Validation details:', {
      sentence,
      apiErrors,
      hasIncorrectPattern,
      subjectVerbCheck
    });

    res.json({ 
      isValid,
      errors: [
        ...apiErrors.map(e => e.message),
        ...(hasIncorrectPattern ? ['Incorrect sentence structure'] : []),
        ...(!subjectVerbCheck ? ['Invalid subject-verb structure'] : [])
      ],
      source: 'api'
    });
    
  } catch (error) {
    console.error('LanguageTool API error:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Fallback validation if API fails
    const words = sentence.trim().split(/\s+/);
    
    // Basic requirements
    const hasValidLength = words.length >= 2;
    const startsWithCapital = /^[A-Z]/.test(sentence);
    const endsWithPunctuation = /[.!?]$/.test(sentence.trim());
    
    // Basic grammar patterns
    const subjectVerbPattern = /^(I|you|he|she|it|we|they)\s+\w+/i.test(sentence);
    const invalidPattern = /\b(I|you|he|she|it|we|they)\s+\w+ing\b(?!\s+(?:is|are|was|were))/i.test(sentence);
    
    const isValid = hasValidLength && startsWithCapital && endsWithPunctuation && 
                   subjectVerbPattern && !invalidPattern;
    
    res.json({ 
      isValid,
      fallback: true,
      errors: isValid ? [] : ['Sentence may have grammar issues'],
      details: {
        hasValidLength,
        startsWithCapital,
        endsWithPunctuation,
        subjectVerbPattern,
        invalidPattern
      }
    });
  }
});

// Get details by assessment id
// Modified assessment_results endpoint for server.js
app.get('/assessment_results/:id', async (req, res) => {
  console.log('\n--- Fetching Assessment Results ---');
  const assessmentId = parseInt(req.params.id);
  console.log('Requested assessment ID:', assessmentId);
  console.log('Database connection status:', pool.totalCount, 'total connections,', pool.idleCount, 'idle');

  if (!assessmentId || isNaN(assessmentId)) {
    console.log('Invalid assessment ID provided:', req.params.id);
    return res.status(400).json({ error: 'Valid assessment ID is required' });
  }

  try {
    // First verify the assessment exists
    console.log('Querying database for assessment:', assessmentId);
    const assessmentCheck = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [assessmentId]
    );

    console.log('Query result:', {
      rowCount: assessmentCheck.rowCount,
      firstRow: assessmentCheck.rows[0] ? 'Found' : 'Not found'
    });

    if (assessmentCheck.rows.length === 0) {
      console.log('No assessment found with ID:', assessmentId);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Get patient info
    const patientInfo = assessmentCheck.rows[0];

    // Get all responses for this assessment
    const responsesResult = await pool.query(
      `SELECT 
        assessment_id,
        section_number,
        question_number,
        user_response,
        is_correct,
        response_time
       FROM section_responses
       WHERE assessment_id = $1
       ORDER BY section_number, question_number`,
      [assessmentId]
    );

    // Log the query results for debugging
    console.log('Found responses:', {
      assessmentId,
      responseCount: responsesResult.rows.length,
      sampleResponse: responsesResult.rows[0]
    });

    const responses = responsesResult.rows.map(row => ({
      section_number: row.section_number,
      question_number: row.question_number,
      user_response: row.user_response,
      is_correct: row.is_correct,
      response_time: row.response_time
    }));

    res.json({
      patient: {
        first_name: patientInfo.first_name,
        last_name: patientInfo.last_name,
        birth_date: patientInfo.birth_date,
        sex: patientInfo.sex,
        patient_type: patientInfo.patient_type
      },
      responses: responses
    });

  } catch (err) {
    console.error('Database error:', {
      error: err,
      message: err.message,
      stack: err.stack,
      query: err.query,
      connectionDetails: {
        host: pool.options.host,
        database: pool.options.database,
        user: pool.options.user
      }
    });
    
    res.status(500).json({ 
      error: 'Error fetching assessment results',
      details: err.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
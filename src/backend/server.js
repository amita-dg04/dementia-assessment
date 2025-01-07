import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
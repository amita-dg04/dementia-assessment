import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const express = require('express');
const bodyParser = require('body-parser');
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

app.use(bodyParser.json());

// need to create a .env file for this **********
const pool = new Pool({
  user: 'amitasatish',
  host: 'localhost',
  database: 'assessment_db',
  password: 'password',
  port: 5432,
});

// Store patient data
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

// // Store section response
// app.post('/store_response', async (req, res) => {
//   const { 
//     assessment_id, 
//     section_number, 
//     question_number, 
//     user_response, 
//     response_time 
//   } = req.body;

//   try {
//     // Validate the response based on section and question number
//     const is_correct = await validateResponse(section_number, question_number, user_response);

//     const result = await pool.query(
//       `INSERT INTO section_responses 
//        (assessment_id, section_number, question_number, user_response, is_correct, response_time)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        ON CONFLICT (assessment_id, section_number, question_number)
//        DO UPDATE SET user_response = $4, is_correct = $5, response_time = $6
//        RETURNING id`,
//       [assessment_id, section_number, question_number, user_response, is_correct, response_time]
//     );

//     res.json({ 
//       id: result.rows[0].id,
//       is_correct: is_correct
//     });
//   } catch (err) {
//     console.error('Error storing response:', err);
//     res.status(500).json({ error: 'Error storing response' });
//   }
// });

// // Validation function for section 1
// async function validateResponse(section_number, question_number, user_response) {
//   if (section_number === 1) {
//     const currentDate = new Date();
//     const response = user_response.toLowerCase().trim();
    
//     switch (question_number) {
//       case 1: // Year
//         return response === currentDate.getFullYear().toString();
      
//       case 2: // Season
//         const seasons = getValidSeasons(currentDate);
//         return seasons.includes(response);
      
//       case 3: // Month
//         const months = getValidMonths(currentDate);
//         return months.includes(response);
      
//       case 4: // Date
//         const date = currentDate.getDate();
//         return [date - 1, date, date + 1].includes(Number(response));
      
//       case 5: // Day of week
//         return response === currentDate.toLocaleString('default', { weekday: 'long' }).toLowerCase();
      
//       default:
//         return false;
//     }
//   }
//   // Add more section validations here
//   return false;
// }

// // Helper function to determine valid seasons
// function getValidSeasons(date) {
//   const month = date.getMonth();
//   const day = date.getDate();
  
//   // Define season ranges and transition periods
//   const seasons = {
//     winter: [11, 0, 1],
//     spring: [2, 3, 4],
//     summer: [5, 6, 7],
//     fall: [8, 9, 10],
//     autumn: [8, 9, 10] // alternative name
//   };
  
//   const currentSeason = Object.entries(seasons).find(([_, months]) => 
//     months.includes(month)
//   )[0];
  
//   // Check if we're in a transition period (last or first week of a season)
//   const validSeasons = [currentSeason];
  
//   // Add logic for transition periods here based on your specific requirements
//   // This is a simplified version
//   if (day >= 21) {
//     // Add next season
//     const nextMonth = (month + 1) % 12;
//     const nextSeason = Object.entries(seasons).find(([_, months]) => 
//       months.includes(nextMonth)
//     )[0];
//     if (!validSeasons.includes(nextSeason)) {
//       validSeasons.push(nextSeason);
//     }
//   }
  
//   return validSeasons;
// }

// // Helper function to determine valid months
// function getValidMonths(date) {
//   const currentMonth = date.toLocaleString('default', { month: 'long' }).toLowerCase();
//   const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
//     .toLocaleString('default', { month: 'long' }).toLowerCase();
  
//   return [currentMonth, prevMonth];
// }

// // Store section score
// app.post('/store_section_score', async (req, res) => {
//   const { assessment_id, section_number, score, max_possible_score } = req.body;

//   try {
//     const result = await pool.query(
//       `INSERT INTO section_scores 
//        (assessment_id, section_number, score, max_possible_score)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT (assessment_id, section_number)
//        DO UPDATE SET score = $3, max_possible_score = $4
//        RETURNING id`,
//       [assessment_id, section_number, score, max_possible_score]
//     );
//     res.json({ id: result.rows[0].id });
//   } catch (err) {
//     console.error('Error storing section score:', err);
//     res.status(500).json({ error: 'Error storing section score' });
//   }
// });

// // Calculate and store final score
// app.post('/calculate_final_score', async (req, res) => {
//   const { assessment_id } = req.body;

//   try {
//     // Calculate total score from section_scores
//     const scoreResult = await pool.query(
//       `SELECT SUM(score) as total_score, SUM(max_possible_score) as max_possible
//        FROM section_scores 
//        WHERE assessment_id = $1`,
//       [assessment_id]
//     );

//     const totalScore = scoreResult.rows[0].total_score;
//     const maxPossible = scoreResult.rows[0].max_possible;

//     // Generate assessment result and recommendations based on score
//     const { result, recommendations } = generateAssessmentFeedback(totalScore, maxPossible);

//     // Store final score
//     await pool.query(
//       `INSERT INTO final_scores 
//        (assessment_id, total_score, max_possible_score, assessment_result, recommendations)
//        VALUES ($1, $2, $3, $4, $5)
//        ON CONFLICT (assessment_id)
//        DO UPDATE SET 
//          total_score = $2, 
//          max_possible_score = $3, 
//          assessment_result = $4, 
//          recommendations = $5`,
//       [assessment_id, totalScore, maxPossible, result, recommendations]
//     );

//     res.json({
//       total_score: totalScore,
//       max_possible_score: maxPossible,
//       result,
//       recommendations
//     });
//   } catch (err) {
//     console.error('Error calculating final score:', err);
//     res.status(500).json({ error: 'Error calculating final score' });
//   }
// });

// function generateAssessmentFeedback(totalScore, maxPossible) {
//   const percentage = (totalScore / maxPossible) * 100;
  
//   // Define score ranges and corresponding feedback
//   if (percentage >= 90) {
//     return {
//       result: "No significant cognitive impairment detected",
//       recommendations: "Continue regular cognitive health maintenance..."
//     };
//   } else if (percentage >= 70) {
//     return {
//       result: "Mild cognitive challenges detected",
//       recommendations: "Consider follow-up with healthcare provider..."
//     };
//   } else {
//     return {
//       result: "Moderate to significant cognitive challenges detected",
//       recommendations: "Immediate consultation with healthcare provider recommended..."
//     };
//   }
// }

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
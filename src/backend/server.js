import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: 'amitasatish', // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'assessment_db', // Replace with your database name
  password: 'password', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Store patient data
app.post('/store_patient', async (req, res) => {
  const { patient_type, birth_date, sex } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO assessments (patient_type, birth_date, sex) VALUES ($1, $2, $3) RETURNING id',
      [patient_type, birth_date, sex]
    );
    console.log('Received data in backend:', req.body);

    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Error storing patient data:', err);
    res.status(500).json({ error: 'Error storing patient data' });
  }
});

// Retrieve patient data
app.get('/get_patient/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM assessments WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error retrieving patient data:', err);
    res.status(500).json({ error: 'Error retrieving patient data' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

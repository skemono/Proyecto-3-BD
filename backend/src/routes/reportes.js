const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Parser } = require('json2csv');

// Reporte 1: Progreso de Miembros
router.post('/progreso', async (req, res) => {
  const { fecha_inicio, fecha_fin, miembro_id, imc_min } = req.body;
  try {
    const query = `
      SELECT m.Nombre, rp.Fecha, rp.Peso, rp.PorcentajeGrasaCorporal, rp.IMC
      FROM RegistroProgreso rp
      JOIN Miembro m ON rp.MiembroID = m.MiembroID
      WHERE rp.Fecha BETWEEN $1 AND $2
      AND ($3::integer IS NULL OR rp.MiembroID = $3)
      AND rp.IMC >= $4
    `;
    const values = [fecha_inicio, fecha_fin, miembro_id || null, imc_min || 0];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
});

// Reporte 1: Exportar a CSV
router.get('/progreso/export_csv', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.Nombre, rp.Fecha, rp.Peso, rp.PorcentajeGrasaCorporal, rp.IMC
      FROM RegistroProgreso rp
      JOIN Miembro m ON rp.MiembroID = m.MiembroID
    `);
    const parser = new Parser();
    const csv = parser.parse(result.rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_progreso.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar' });
  }
});

// Reporte 2: Frecuencia de Sesiones
router.post('/sesiones', async (req, res) => {
  const { fecha_inicio, fecha_fin, entrenador_id, hora_inicio } = req.body;
  try {
    const query = `
      SELECT e.Nombre AS Entrenador, m.Nombre AS Miembro, COUNT(*) AS Sesiones
      FROM SesiónEntrenamiento se
      JOIN Entrenador e ON se.EntrenadorID = e.EntrenadorID
      JOIN Miembro m ON se.MiembroID = m.MiembroID
      WHERE se.Fecha BETWEEN $1 AND $2
      AND ($3::integer IS NULL OR se.EntrenadorID = $3)
      AND se.Hora >= $4
      GROUP BY e.Nombre, m.Nombre
    `;
    const values = [fecha_inicio, fecha_fin, entrenador_id || null, hora_inicio || '00:00'];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
});

// Reporte 3: Ejercicios Populares
router.post('/ejercicios', async (req, res) => {
  const { fecha_inicio, fecha_fin, tipo_ejercicio, grupo_muscular } = req.body;
  try {
    const query = `
      SELECT ej.Nombre, ej.Tipo, COUNT(*) AS Veces
      FROM DetalleEntrenamiento dt
      JOIN Ejercicio ej ON dt.EjercicioID = ej.EjercicioID
      JOIN SesiónEntrenamiento se ON dt.SesiónID = se.SesiónID
      LEFT JOIN EjercicioGrupoMuscular eg ON ej.EjercicioID = eg.EjercicioID
      WHERE se.Fecha BETWEEN $1 AND $2
      AND ($3 IS NULL OR ej.Tipo = $3)
      AND ($4 IS NULL OR eg.GrupoMuscular = $4)
      GROUP BY ej.Nombre, ej.Tipo
      ORDER BY Veces DESC
    `;
    const values = [fecha_inicio, fecha_fin, tipo_ejercicio || null, grupo_muscular || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
});

// Reporte 4: Carga de Entrenadores
router.post('/entrenadores', async (req, res) => {
  const { fecha_inicio, fecha_fin, especializacion, sesiones_min } = req.body;
  try {
    const query = `
      SELECT e.Nombre, e.Especialización, COUNT(se.SesiónID) AS Sesiones
      FROM Entrenador e
      LEFT JOIN SesiónEntrenamiento se ON e.EntrenadorID = se.EntrenadorID
      WHERE se.Fecha BETWEEN $1 AND $2
      AND ($3 IS NULL OR e.Especialización = $3)
      GROUP BY e.Nombre, e.Especialización
      HAVING COUNT(se.SesiónID) >= $4
    `;
    const values = [fecha_inicio, fecha_fin, especializacion || null, sesiones_min || 0];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
});

// Reporte 5: Tendencias de Membresías
router.post('/membresias', async (req, res) => {
  const { fecha_inicio, fecha_fin, plan_id, duracion_min } = req.body;
  try {
    const query = `
      SELECT pm.Nombre AS Plan, COUNT(m.MembresíaID) AS Membresías
      FROM Membresía m
      JOIN PlanMembresía pm ON m.PlanID = pm.PlanID
      WHERE m.FechaInicio BETWEEN $1 AND $2
      AND ($3::integer IS NULL OR m.PlanID = $3)
      AND pm.Duración >= $4
      GROUP BY pm.Nombre
    `;
    const values = [fecha_inicio, fecha_fin, plan_id || null, duracion_min || 0];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
});

module.exports = router;
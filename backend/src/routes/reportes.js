const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { Parser } = require('json2csv');


const isValidDate = (dateStr) => {
  return dateStr && !isNaN(Date.parse(dateStr));
};


const isValidInteger = (value) => {
  return value !== undefined && Number.isInteger(Number(value)) && Number(value) >= 0;
};


const isValidFloat = (value) => {
  return value !== undefined && !isNaN(Number(value)) && Number(value) >= 0;
};

// Reporte 1: Progreso de Miembros
router.post('/progreso', async (req, res) => {
  const body = req.body || {};
  const { fecha_inicio, fecha_fin, miembro_id, imc_min } = body;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (miembro_id && !isValidInteger(miembro_id)) {
    return res.status(400).json({ error: 'miembro_id must be a positive integer' });
  }
  if (imc_min && !isValidFloat(imc_min)) {
    return res.status(400).json({ error: 'imc_min must be a positive number' });
  }

  try {
    let query = `
      SELECT m.Nombre, rp.Fecha, rp.Peso, rp.PorcentajeGrasaCorporal, rp.IMC
      FROM RegistroProgreso rp
      JOIN Miembro m ON rp.MiembroID = m.MiembroID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;


    if (fecha_inicio || fecha_fin) {
      conditions.push(`rp.Fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (miembro_id) {
      conditions.push(`rp.MiembroID = $${paramIndex}`);
      values.push(Number(miembro_id));
      paramIndex++;
    }
    if (imc_min) {
      conditions.push(`rp.IMC >= $${paramIndex}`);
      values.push(Number(imc_min));
      paramIndex++;
    }


    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte', details: err.message });
  }
});

// Reporte 1: Exportar a CSV
router.get('/progreso/export_csv', async (req, res) => {
  const query = req.query || {};
  const { fecha_inicio, fecha_fin, miembro_id, imc_min } = query;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (miembro_id && !isValidInteger(miembro_id)) {
    return res.status(400).json({ error: 'miembro_id must be a positive integer' });
  }
  if (imc_min && !isValidFloat(imc_min)) {
    return res.status(400).json({ error: 'imc_min must be a positive number' });
  }

  try {
    let query = `
      SELECT m.Nombre, rp.Fecha, rp.Peso, rp.PorcentajeGrasaCorporal, rp.IMC
      FROM RegistroProgreso rp
      JOIN Miembro m ON rp.MiembroID = m.MiembroID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (fecha_inicio || fecha_fin) {
      conditions.push(`rp.Fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (miembro_id) {
      conditions.push(`rp.MiembroID = $${paramIndex}`);
      values.push(Number(miembro_id));
      paramIndex++;
    }
    if (imc_min) {
      conditions.push(`rp.IMC >= $${paramIndex}`);
      values.push(Number(imc_min));
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);
    const parser = new Parser();
    const csv = parser.parse(result.rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('reporte_progreso.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al exportar', details: err.message });
  }
});

// Reporte 2: Frecuencia de Sesiones
router.post('/sesiones', async (req, res) => {
  const body = req.body || {};
  const { fecha_inicio, fecha_fin, entrenador_id, hora_inicio } = body;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';
  const defaultHoraInicio = '00:00';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (entrenador_id && !isValidInteger(entrenador_id)) {
    return res.status(400).json({ error: 'entrenador_id must be a positive integer' });
  }
  if (hora_inicio && !/^\d{2}:\d{2}$/.test(hora_inicio)) {
    return res.status(400).json({ error: 'hora_inicio must be in HH:MM format' });
  }

  try {
    let query = `
      SELECT e.Nombre AS Entrenador, m.Nombre AS Miembro, COUNT(*) AS Sesiones
      FROM SesiónEntrenamiento se
      JOIN Entrenador e ON se.EntrenadorID = e.EntrenadorID
      JOIN Miembro m ON se.MiembroID = m.MiembroID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (fecha_inicio || fecha_fin) {
      conditions.push(`se.Fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (entrenador_id) {
      conditions.push(`se.EntrenadorID = $${paramIndex}`);
      values.push(Number(entrenador_id));
      paramIndex++;
    }
    if (hora_inicio) {
      conditions.push(`se.Hora >= $${paramIndex}`);
      values.push(hora_inicio);
      paramIndex++;
    } else {
      conditions.push(`se.Hora >= $${paramIndex}`);
      values.push(defaultHoraInicio);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY e.Nombre, m.Nombre';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte', details: err.message });
  }
});

// Reporte 3: Ejercicios Populares
router.post('/ejercicios', async (req, res) => {
  const body = req.body || {};
  const { fecha_inicio, fecha_fin, tipo_ejercicio, grupo_muscular } = body;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (tipo_ejercicio && typeof tipo_ejercicio !== 'string') {
    return res.status(400).json({ error: 'tipo_ejercicio must be a string' });
  }
  if (grupo_muscular && typeof grupo_muscular !== 'string') {
    return res.status(400).json({ error: 'grupo_muscular must be a string' });
  }

  try {
    let query = `
      SELECT ej.Nombre, ej.Tipo, COUNT(*) AS Veces
      FROM DetalleEntrenamiento dt
      JOIN Ejercicio ej ON dt.EjercicioID = ej.EjercicioID
      JOIN SesiónEntrenamiento se ON dt.SesiónID = se.SesiónID
      LEFT JOIN EjercicioGrupoMuscular eg ON ej.EjercicioID = eg.EjercicioID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (fecha_inicio || fecha_fin) {
      conditions.push(`se.Fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (tipo_ejercicio) {
      conditions.push(`ej.Tipo = $${paramIndex}`);
      values.push(tipo_ejercicio);
      paramIndex++;
    }
    if (grupo_muscular) {
      conditions.push(`eg.GrupoMuscular = $${paramIndex}`);
      values.push(grupo_muscular);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY ej.Nombre, ej.Tipo
      ORDER BY Veces DESC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte', details: err.message });
  }
});

// Reporte 4: Carga de Entrenadores
router.post('/entrenadores', async (req, res) => {
  const body = req.body || {};
  const { fecha_inicio, fecha_fin, especializacion, sesiones_min } = body;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (especializacion && typeof especializacion !== 'string') {
    return res.status(400).json({ error: 'especializacion must be a string' });
  }
  if (sesiones_min && !isValidInteger(sesiones_min)) {
    return res.status(400).json({ error: 'sesiones_min must be a positive integer' });
  }

  try {
    let query = `
      SELECT e.Nombre, e.Especialización, COUNT(se.SesiónID) AS Sesiones
      FROM Entrenador e
      LEFT JOIN SesiónEntrenamiento se ON e.EntrenadorID = se.EntrenadorID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (fecha_inicio || fecha_fin) {
      conditions.push(`se.Fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (especializacion) {
      conditions.push(`e.Especialización = $${paramIndex}`);
      values.push(especializacion);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY e.Nombre, e.Especialización
    `;

    if (sesiones_min) {
      query += ` HAVING COUNT(se.SesiónID) >= $${paramIndex}`;
      values.push(Number(sesiones_min));
      paramIndex++;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte', details: err.message });
  }
});

// Reporte 5: Tendencias de Membresías
router.post('/membresias', async (req, res) => {
  const body = req.body || {};
  const { fecha_inicio, fecha_fin, plan_id, duracion_min } = body;

  // Default values
  const defaultFechaInicio = '2000-01-01';
  const defaultFechaFin = '2099-12-31';

  // Validate inputs
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({ error: 'Invalid fecha_inicio format' });
  }
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({ error: 'Invalid fecha_fin format' });
  }
  if (plan_id && !isValidInteger(plan_id)) {
    return res.status(400).json({ error: 'plan_id must be a positive integer' });
  }
  if (duracion_min && !isValidInteger(duracion_min)) {
    return res.status(400).json({ error: 'duracion_min must be a positive integer' });
  }

  try {
    let query = `
      SELECT pm.Nombre AS Plan, COUNT(m.MembresíaID) AS Membresías
      FROM Membresía m
      JOIN PlanMembresía pm ON m.PlanID = pm.PlanID
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (fecha_inicio || fecha_fin) {
      conditions.push(`m.FechaInicio BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(fecha_inicio || defaultFechaInicio, fecha_fin || defaultFechaFin);
      paramIndex += 2;
    }
    if (plan_id) {
      conditions.push(`m.PlanID = $${paramIndex}`);
      values.push(Number(plan_id));
      paramIndex++;
    }
    if (duracion_min) {
      conditions.push(`pm.Duración >= $${paramIndex}`);
      values.push(Number(duracion_min));
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY pm.Nombre';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el reporte', details: err.message });
  }
});

// Endpoint para resumen del dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // 1) Total de Miembros
    const membersRes = await pool.query('SELECT COUNT(*) AS count FROM Miembro');
    const members = Number(membersRes.rows[0].count);

    // 2) Total de Sesiones
    const sessionsRes = await pool.query('SELECT COUNT(*) AS count FROM SesiónEntrenamiento');
    const sessions = Number(sessionsRes.rows[0].count);

    // 3) Total de Ejercicios
    const exercisesRes = await pool.query(
      'SELECT COUNT(DISTINCT EjercicioID) AS count FROM DetalleEntrenamiento'
    );
    const exercises = Number(exercisesRes.rows[0].count);

    // 4) Total de Entrenadores
    const trainersRes = await pool.query('SELECT COUNT(*) AS count FROM Entrenador');
    const trainers = Number(trainersRes.rows[0].count);

    // 5) Membresías Activas
    const activeRes = await pool.query(
      'SELECT COUNT(*) AS count FROM Membresía WHERE FechaFin >= CURRENT_DATE'
    );
    const activeMemberships = Number(activeRes.rows[0].count);

    // 6) Retención de Miembros: porcentaje de renovaciones este mes vs mes pasado
    const retentionRes = await pool.query(
      `WITH this_month AS (
          SELECT COUNT(DISTINCT MiembroID) AS c
          FROM Membresía
          WHERE DATE_TRUNC('month', FechaFin) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        last_month AS (
          SELECT COUNT(DISTINCT MiembroID) AS c
          FROM Membresía
          WHERE DATE_TRUNC('month', FechaFin) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        )
      SELECT
        CASE WHEN last_month.c = 0 THEN 0
             ELSE ROUND((this_month.c::decimal / last_month.c) * 100, 1)
        END AS retention,
        CASE WHEN last_month.c = 0 THEN 0
             ELSE ROUND(((this_month.c - last_month.c)::decimal / last_month.c) * 100, 1)
        END AS retention_change
      FROM this_month, last_month;`
    );
    const { retention, retention_change } = retentionRes.rows[0];

    // 7) Tasa de Crecimiento: nuevos miembros este mes vs mes pasado
    const growthRes = await pool.query(
      `WITH new_this AS (
          SELECT COUNT(*) AS c
          FROM Membresía
          WHERE DATE_TRUNC('month', FechaInicio) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        new_last AS (
          SELECT COUNT(*) AS c
          FROM Membresía
          WHERE DATE_TRUNC('month', FechaInicio) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        )
      SELECT
        CASE WHEN new_last.c = 0 THEN 0
             ELSE ROUND((new_this.c::decimal / new_last.c) * 100, 1)
        END AS growth_rate,
        CASE WHEN new_last.c = 0 THEN 0
             ELSE ROUND(((new_this.c - new_last.c)::decimal / new_last.c) * 100, 1)
        END AS growth_change
      FROM new_this, new_last;`
    );
    const { growth_rate, growth_change } = growthRes.rows[0];

    // 8) Ingresos Totales: sumatoria de precios (PlanMembresía) iniciados este mes
    const revenueRes = await pool.query(
      `WITH rev_this AS (
          SELECT COALESCE(SUM(pm.Precio), 0) AS total
          FROM Membresía m
          JOIN PlanMembresía pm ON m.PlanID = pm.PlanID
          WHERE DATE_TRUNC('month', m.FechaInicio) = DATE_TRUNC('month', CURRENT_DATE)
        ),
        rev_last AS (
          SELECT COALESCE(SUM(pm.Precio), 0) AS total
          FROM Membresía m
          JOIN PlanMembresía pm ON m.PlanID = pm.PlanID
          WHERE DATE_TRUNC('month', m.FechaInicio) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        )
      SELECT
        rev_this.total AS revenue,
        CASE WHEN rev_last.total = 0 THEN 0
             ELSE ROUND(((rev_this.total - rev_last.total)::decimal / rev_last.total) * 100, 1)
        END AS revenue_change
      FROM rev_this, rev_last;`
    );
    const { revenue, revenue_change } = revenueRes.rows[0];

    // 9) Duración Promedio de Sesión (minutos)
    const durationRes = await pool.query(
      `WITH dur_this AS (
        SELECT AVG(dt."duración") AS avg_interval
        FROM SesiónEntrenamiento se
        JOIN DetalleEntrenamiento dt USING (SesiónID)
        WHERE DATE_TRUNC('month', se."fecha") = DATE_TRUNC('month', CURRENT_DATE)
      ),
      dur_last AS (
        SELECT AVG(dt."duración") AS avg_interval
        FROM SesiónEntrenamiento se
        JOIN DetalleEntrenamiento dt USING (SesiónID)
        WHERE DATE_TRUNC('month', se."fecha") = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      )
      SELECT
        COALESCE(ROUND(EXTRACT(EPOCH FROM dur_this.avg_interval) / 60.0, 1), 0)        AS avg_duration,
        COALESCE(
          ROUND(
            (EXTRACT(EPOCH FROM dur_this.avg_interval)
          - EXTRACT(EPOCH FROM dur_last.avg_interval)) / 60.0
          , 1)
        , 0) AS duration_change
      FROM dur_this, dur_last;
      `
    );
    const { avg_duration, duration_change } = durationRes.rows[0];

    res.json({
      members,
      sessions,
      exercises,
      trainers,
      activeMemberships,
      retention,
      retention_change,
      growth_rate,
      growth_change,
      revenue,
      revenue_change,
      avg_duration,
      duration_change
    });
  } catch (err) {
    console.error('Error en el resumen del dashboard:', err);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas del dashboard', details: err.message });
  }
});

module.exports = router;

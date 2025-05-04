import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import ExportOptions from '../components/ExportOptions';
import { reportsApi } from '../services/api';

const SessionFrequency = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const filters = [
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date' },
    { key: 'entrenador_id', label: 'ID del Entrenador', type: 'number' },
    { key: 'hora_inicio', label: 'Hora de Inicio', type: 'time' }
  ];

  const columns = [
    { key: 'entrenador', label: 'Entrenador' },
    { key: 'miembro', label: 'Miembro' },
    { key: 'sesiones', label: 'Sesiones' }
  ];

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await reportsApi.getSessionFrequency(filters);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de frecuencia de sesiones:', error);
      toast.error('Error al obtener los datos de frecuencia de sesiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    fetchData(filters);
  };

  // Process data for chart 
  const chartData = data.reduce((acc, item) => {
    const trainerName = item.entrenador;
    const existingTrainer = acc.find(d => d.name === trainerName);
    
    if (existingTrainer) {
      existingTrainer.sessions += parseInt(item.sesiones);
    } else {
      acc.push({
        name: trainerName,
        sessions: parseInt(item.sesiones)
      });
    }
    
    return acc;
  }, []);

  // Sort chart data by sessions count
  chartData.sort((a, b) => b.sessions - a.sessions);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Frecuencia de Sesiones</h1>
      </div>
      
      <FilterPanel filters={filters} onApplyFilters={handleApplyFilters} />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="loader">Cargando...</div>
        </div>
      ) : (
        <>
          {data.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Sesiones por Entrenador</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Número de Sesiones', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#4f46e5" name="Sesiones" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tabla de Datos</h2>
            <ExportOptions 
              data={data} 
              filename="reporte_frecuencia_sesiones" 
              title="Reporte de Frecuencia de Sesiones" 
            />
          </div>
          
          <DataTable 
            data={data} 
            columns={columns} 
          />
        </>
      )}
    </div>
  );
};

export default SessionFrequency;
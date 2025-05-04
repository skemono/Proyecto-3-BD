import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import ExportOptions from '../components/ExportOptions';
import { reportsApi } from '../services/api';

const TrainerWorkload = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const filters = [
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date' },
    { key: 'especializacion', label: 'Especialización', type: 'text' },
    { key: 'sesiones_min', label: 'Sesiones Mínimas', type: 'number' }
  ];

  const columns = [
    { key: 'nombre', label: 'Entrenador' },
    { key: 'especialización', label: 'Especialización' },
    { key: 'sesiones', label: 'Sesiones' }
  ];

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await reportsApi.getTrainerWorkload(filters);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de carga de trabajo de los entrenadores:', error);
      toast.error('Error al obtener los datos de carga de trabajo de los entrenadores');
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

  // Get unique specializations
  const specializations = [...new Set(data.map(item => item.especialización))]
    .filter(spec => spec); // Filter out any null or undefined

  // Group data by specialization
  const chartData = specializations.map(spec => {
    const trainers = data.filter(item => item.especialización === spec);
    const totalSessions = trainers.reduce((sum, trainer) => sum + parseInt(trainer.sesiones || 0), 0);
    
    return {
      name: spec || 'No Especificado',
      sessions: totalSessions,
      trainers: trainers.length
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Carga de Trabajo de Entrenadores</h1>
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
              <h2 className="text-lg font-semibold mb-4">Sesiones por Especialización</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Número de Sesiones', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#8884d8" name="Total de Sesiones" />
                    <Bar dataKey="trainers" fill="#82ca9d" name="Número de Entrenadores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Datos de Entrenadores</h2>
            <ExportOptions 
              data={data} 
              filename="reporte_carga_trabajo_entrenadores" 
              title="Reporte de Carga de Trabajo de Entrenadores" 
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

export default TrainerWorkload;
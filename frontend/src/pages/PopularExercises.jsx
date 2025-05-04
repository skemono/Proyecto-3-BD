import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import ExportOptions from '../components/ExportOptions';
import { reportsApi } from '../services/api';

const PopularExercises = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
  
  const filters = [
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date' },
    { key: 'tipo_ejercicio', label: 'Tipo de Ejercicio', type: 'text' },
    { key: 'grupo_muscular', label: 'Grupo Muscular', type: 'text' }
  ];

  const columns = [
    { key: 'nombre', label: 'Nombre del Ejercicio' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'veces', label: 'Cantidad' }
  ];

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await reportsApi.getPopularExercises(filters);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de ejercicios populares:', error);
      toast.error('Error al obtener los datos de ejercicios populares');
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

  // Process data for chart - top exercises
  const topExercises = [...data]
    .sort((a, b) => parseInt(b.veces) - parseInt(a.veces))
    .slice(0, 10)
    .map(item => ({
      name: item.nombre,
      value: parseInt(item.veces)
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Ejercicios Populares</h1>
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
              <h2 className="text-lg font-semibold mb-4">Ejercicios Más Populares</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topExercises}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {topExercises.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} veces`, 'Frecuencia']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tabla de Datos</h2>
            <ExportOptions 
              data={data} 
              filename="reporte_ejercicios_populares" 
              title="Reporte de Ejercicios Populares" 
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

export default PopularExercises;
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import ExportOptions from '../components/ExportOptions';
import { reportsApi } from '../services/api';

const MembershipTrends = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const filters = [
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date' },
    { key: 'plan_id', label: 'ID del Plan', type: 'number' },
    { key: 'duracion_min', label: 'Duración Mínima (meses)', type: 'number' }
  ];

  const columns = [
    { key: 'plan', label: 'Plan de Membresía' },
    { key: 'membresías', label: 'Número de Membresías' }
  ];

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await reportsApi.getMembershipTrends(filters);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de tendencias de membresías:', error);
      toast.error('Error al obtener los datos de tendencias de membresías');
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
  const chartData = data.map(item => ({
    name: item.plan,
    value: parseInt(item.membresías)
  }));

  // Calculate total memberships
  const totalMemberships = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Tendencias de Membresías</h1>
      </div>
      
      <FilterPanel filters={filters} onApplyFilters={handleApplyFilters} />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="loader">Cargando...</div>
        </div>
      ) : (
        <>
          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Distribución de Membresías</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} membresías`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Estadísticas de Membresías</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total de Membresías</p>
                    <p className="text-3xl font-bold">{totalMemberships}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Planes de Membresía</p>
                    <p className="text-3xl font-bold">{data.length}</p>
                  </div>
                  
                  {data.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Plan Más Popular</p>
                      <p className="text-xl font-bold">
                        {chartData.sort((a, b) => b.value - a.value)[0].name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tabla de Datos</h2>
            <ExportOptions 
              data={data} 
              filename="reporte_tendencias_membresías" 
              title="Reporte de Tendencias de Membresías" 
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

export default MembershipTrends;
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area } from 'recharts';
import { toast } from 'react-hot-toast';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import ExportOptions from '../components/ExportOptions';
import { reportsApi } from '../services/api';

const MemberProgress = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [chartType, setChartType] = useState('aggregate'); // 'aggregate' or 'individual'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  const filters = [
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date' },
    { key: 'miembro_id', label: 'ID del Miembro', type: 'number' },
    { key: 'imc_min', label: 'IMC Mínimo', type: 'number' }
  ];

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'fecha', label: 'Fecha', format: (value) => new Date(value).toLocaleDateString() },
    { key: 'peso', label: 'Peso (kg)' },
    { key: 'porcentajegrasacorporal', label: 'Grasa Corporal (%)' },
    { key: 'imc', label: 'IMC' }
  ];

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await reportsApi.getMemberProgress(filters);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de progreso del miembro:', error);
      toast.error('No se pudo obtener los datos de progreso del miembro');
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

  // Get unique members
  const uniqueMembers = [...new Set(data.map(item => item.nombre))];

  // Process data for aggregated chart
  const processAggregateData = () => {
    // Group data by dates
    const groupedByDate = data.reduce((acc, item) => {
      const date = new Date(item.fecha).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Calculate statistics for each date
    return Object.entries(groupedByDate).map(([date, entries]) => {
      const weightValues = entries.map(e => parseFloat(e.peso) || 0);
      const bmiValues = entries.map(e => parseFloat(e.imc) || 0);
      const bodyFatValues = entries.map(e => parseFloat(e.porcentajegrasacorporal) || 0);
      
      // Filter out zero values before calculating
      const validWeights = weightValues.filter(v => v > 0);
      const validBMIs = bmiValues.filter(v => v > 0);
      const validBodyFats = bodyFatValues.filter(v => v > 0);
      
      return {
        date,
        avgWeight: validWeights.length ? 
          validWeights.reduce((sum, val) => sum + val, 0) / validWeights.length : 0,
        minWeight: validWeights.length ? Math.min(...validWeights) : 0,
        maxWeight: validWeights.length ? Math.max(...validWeights) : 0,
        avgBMI: validBMIs.length ? 
          validBMIs.reduce((sum, val) => sum + val, 0) / validBMIs.length : 0,
        avgBodyFat: validBodyFats.length ? 
          validBodyFats.reduce((sum, val) => sum + val, 0) / validBodyFats.length : 0,
        memberCount: entries.length
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Process data for individual member chart
  const processIndividualData = () => {
    // Filter data for selected members only
    const filteredData = data.filter(item => selectedMembers.includes(item.nombre));
    
    // Group by date
    const chartData = filteredData.reduce((acc, item) => {
      const date = new Date(item.fecha).toLocaleDateString();
      const existingDateIndex = acc.findIndex(d => d.date === date);
      
      if (existingDateIndex >= 0) {
        acc[existingDateIndex][item.nombre] = item.peso;
      } else {
        const newEntry = { date };
        newEntry[item.nombre] = item.peso;
        acc.push(newEntry);
      }
      
      return acc;
    }, []);
    
    // Sort by date
    return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const aggregateData = processAggregateData();
  const individualData = processIndividualData();

  const toggleMemberSelector = () => {
    setShowMemberSelector(!showMemberSelector);
  };

  const handleMemberSelection = (member) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter(m => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Progreso de Miembros</h1>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Progreso a lo Largo del Tiempo</h2>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded text-sm ${chartType === 'aggregate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setChartType('aggregate')}
                  >
                    Vista Agregada
                  </button>
                  <button 
                    className={`px-3 py-1 rounded text-sm ${chartType === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      setChartType('individual');
                      if (selectedMembers.length === 0 && uniqueMembers.length > 0) {
                        // Auto-select up to 5 members if none selected
                        setSelectedMembers(uniqueMembers.slice(0, 5));
                      }
                    }}
                  >
                    Vista Individual
                  </button>
                  {chartType === 'individual' && (
                    <button 
                      className="px-3 py-1 rounded text-sm bg-gray-200"
                      onClick={toggleMemberSelector}
                    >
                      Seleccionar Miembros
                    </button>
                  )}
                </div>
              </div>

              {showMemberSelector && chartType === 'individual' && (
                <div className="mb-4 p-3 border rounded bg-gray-50">
                  <div className="text-sm mb-2 font-medium">Selecciona los miembros a mostrar (máximo 5 recomendado):</div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMembers.map(member => (
                      <button
                        key={member}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedMembers.includes(member) ? 'bg-blue-100 border border-blue-500' : 'bg-white border'
                        }`}
                        onClick={() => handleMemberSelection(member)}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'aggregate' ? (
                    <ComposedChart data={aggregateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} 
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        label={{ value: 'Cantidad', angle: 90, position: 'insideRight' }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="avgWeight" 
                        fill="rgba(75, 192, 192, 0.2)" 
                        stroke="rgb(75, 192, 192)" 
                        name="Peso Promedio" 
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="minWeight" 
                        stroke="#4169E1" 
                        dot={false}
                        name="Peso Mínimo" 
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="#FF6347" 
                        dot={false}
                        name="Peso Máximo" 
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="memberCount" 
                        barSize={20} 
                        fill="#8884d8"
                        opacity={0.3} 
                        name="Cantidad de Miembros" 
                      />
                    </ComposedChart>
                  ) : (
                    <LineChart data={individualData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      {selectedMembers.map((member, index) => (
                        <Line 
                          key={member}
                          type="monotone"
                          dataKey={member}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          activeDot={{ r: 6 }}
                          name={member}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tabla de Datos</h2>
            <ExportOptions 
              data={data} 
              filename="reporte_progreso_miembros" 
              title="Reporte de Progreso de Miembros" 
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

export default MemberProgress;
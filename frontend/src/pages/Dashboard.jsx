import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Activity, Calendar, BarChart, UserCheck, CreditCard, ClipboardList } from 'lucide-react';
import { reportsApi } from '../services/api';

const DashboardCard = ({ title, value, icon, color, path }) => (
  <Link to={path} className="block">
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  </Link>
);

const StatBox = ({ title, main, change, isPercent = true, positiveColor = 'text-green-500', negativeColor = 'text-red-500' }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold">{isPercent ? `${main}${main !== 0 ? '%' : ''}` : main}</p>
    <p className={`text-sm ${change >= 0 ? positiveColor : negativeColor} mt-1`}>  
      {change >= 0 ? '+' : ''}{change}{isPercent ? '%' : ''} desde el mes pasado
    </p>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await reportsApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        toast.error('No se pudieron cargar las estadísticas del panel');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Progreso de Miembros', value: `${stats.members} Miembros`, icon: <Activity size={24} className="text-white" />, color: 'bg-blue-500', path: '/member-progress' },
    { title: 'Sesiones de Entrenamiento', value: `${stats.sessions} Sesiones`, icon: <Calendar size={24} className="text-white" />, color: 'bg-green-500', path: '/session-frequency' },
    { title: 'Ejercicios Populares', value: `${stats.exercises} Ejercicios`, icon: <BarChart size={24} className="text-white" />, color: 'bg-purple-500', path: '/popular-exercises' },
    { title: 'Carga de Trabajo de Entrenadores', value: `${stats.trainers} Entrenadores`, icon: <UserCheck size={24} className="text-white" />, color: 'bg-orange-500', path: '/trainer-workload' },
    { title: 'Tendencias de Membresías', value: `${stats.activeMemberships} Activas`, icon: <CreditCard size={24} className="text-white" />, color: 'bg-red-500', path: '/membership-trends' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Panel</h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Última actualización:</span>
          <span className="text-sm font-medium">{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">...</div>
            ))
          : cards.map((c, i) => <DashboardCard key={i} {...c} />)
        }
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/member-progress" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
            <Activity size={20} className="mr-2 text-blue-500" />
            <span>Ver Progreso de Miembros</span>
          </Link>
          
          <Link to="/session-frequency" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
            <Calendar size={20} className="mr-2 text-green-500" />
            <span>Revisar Frecuencia de Sesiones</span>
          </Link>
          
          <Link to="/popular-exercises" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
            <BarChart size={20} className="mr-2 text-purple-500" />
            <span>Ver Ejercicios Populares</span>
          </Link>

          <Link to="/trainer-workload" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
            <ClipboardList  size={20} className="mr-2 text-orange-500" />
            <span>Ver Carga de Entrenadores</span>
          </Link>

          <Link to="/membership-trends" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition">
            <CreditCard size={20} className="mr-2 text-red-500" />
            <span>Analizar Membresías</span>
          </Link>
        </div>
      </div>
    </div>
    
  );
};

export default Dashboard;
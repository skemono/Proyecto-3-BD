import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Users, 
  Calendar, 
  Activity, 
  UserCheck, 
  CreditCard, 
  Home 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Tablero', path: '/', icon: <Home size={20} /> },
    { name: 'Progreso de Miembros', path: '/member-progress', icon: <Activity size={20} /> },
    { name: 'Frecuencia de Sesiones', path: '/session-frequency', icon: <Calendar size={20} /> },
    { name: 'Ejercicios Populares', path: '/popular-exercises', icon: <BarChart size={20} /> },
    { name: 'Carga de Entrenadores', path: '/trainer-workload', icon: <UserCheck size={20} /> },
    { name: 'Tendencias de Membresía', path: '/membership-trends', icon: <CreditCard size={20} /> }
  ];

  return (
    <div 
      className={`bg-gradient-to-b from-indigo-600 to-indigo-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 shadow-lg`}
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Users size={24} className="text-white" />
          <span className="text-2xl font-semibold text-white">StatLift</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden text-indigo-200 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 transition-colors rounded-md ${
                isActive 
                  ? 'bg-indigo-500 text-indigo-900 font-medium' 
                  : 'text-white hover:bg-indigo-700'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="px-4 mt-auto">
        <div className="border-t border-indigo-500 pt-4 mt-6">
          <div className="bg-indigo-500 bg-opacity-20 rounded-lg p-3 text-center">
            <p className="text-xs text-white">StatLift Analytics v1.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
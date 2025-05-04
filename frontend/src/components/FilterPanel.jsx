import { useState } from 'react';

const FilterPanel = ({ filters, onApplyFilters }) => {
  const [filterValues, setFilterValues] = useState({});

  const handleChange = (key, value) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(filterValues);
  };

  const resetFilters = () => {
    setFilterValues({});
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-1">
              <label htmlFor={filter.key} className="block text-sm font-medium text-gray-700">
                {filter.label}
              </label>
              {filter.type === 'date' ? (
                <input
                  type="date"
                  id={filter.key}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : filter.type === 'number' ? (
                <input
                  type="number"
                  id={filter.key}
                  min="0"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : filter.type === 'select' ? (
                <select
                  id={filter.key}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'time' ? (
                <input
                  type="time"
                  id={filter.key}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <input
                  type="text"
                  id={filter.key}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Restablecer
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Aplicar Filtros
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterPanel;
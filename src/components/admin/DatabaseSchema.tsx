import React, { useState, useEffect } from 'react'
import { Database, Table, Key, FileText, Download, Upload } from 'lucide-react'
import { database } from '../../lib/database'
import Card from '../ui/Card'
import CardHeader from '../ui/CardHeader'
import ChartExportWrapper from '../ui/ChartExportWrapper'

const DatabaseSchema: React.FC = () => {
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchemaInfo()
  }, [])

  const loadSchemaInfo = async () => {
    try {
      await database.init()
      
      // Get table schemas
      const scenarios = await database.getScenarios()
      
      const schemaData = {
        tables: [
          {
            name: 'simulation_scenarios',
            description: 'Stores user simulation scenarios with all input parameters',
            columns: [
              { name: 'id', type: 'TEXT', constraint: 'PRIMARY KEY', description: 'Unique scenario identifier' },
              { name: 'name', type: 'TEXT', constraint: 'NOT NULL', description: 'User-defined scenario name' },
              { name: 'description', type: 'TEXT', constraint: 'NULL', description: 'Optional scenario description' },
              { name: 'inputs', type: 'TEXT', constraint: 'NOT NULL', description: 'JSON string of all simulation parameters' },
              { name: 'created_at', type: 'TEXT', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Creation timestamp' },
              { name: 'updated_at', type: 'TEXT', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Last update timestamp' },
              { name: 'user_id', type: 'TEXT', constraint: "DEFAULT 'local_user'", description: 'User identifier (local auth)' }
            ],
            indexes: [],
            relationships: []
          },
          {
            name: 'simulation_results',
            description: 'Stores calculated results for each scenario and season',
            columns: [
              { name: 'id', type: 'TEXT', constraint: 'PRIMARY KEY', description: 'Unique result identifier' },
              { name: 'scenario_id', type: 'TEXT', constraint: 'FOREIGN KEY', description: 'References simulation_scenarios.id' },
              { name: 'season', type: 'TEXT', constraint: "CHECK (season IN ('high', 'low'))", description: 'Season type: high or low' },
              { name: 'results', type: 'TEXT', constraint: 'NOT NULL', description: 'JSON string of calculated results' },
              { name: 'created_at', type: 'TEXT', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Creation timestamp' }
            ],
            indexes: [],
            relationships: [
              { type: 'FOREIGN KEY', column: 'scenario_id', references: 'simulation_scenarios(id)', onDelete: 'CASCADE' }
            ]
          }
        ]
      }

      const statsData = {
        totalScenarios: scenarios.length,
        totalUsers: 1, // Local user only
        avgScenariosPerUser: scenarios.length,
        oldestScenario: scenarios.length > 0 ? scenarios[scenarios.length - 1]?.created_at : null,
        newestScenario: scenarios.length > 0 ? scenarios[0]?.created_at : null
      }

      setSchemaInfo(schemaData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading schema info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportDatabase = () => {
    try {
      const exportData = database.exportDatabase()
      const blob = new Blob([exportData], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `waste-simulation-db-${new Date().toISOString().split('T')[0]}.db`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting database:', error)
      alert('Error al exportar base de datos: ' + error.message)
    }
  }

  const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string
        await database.importDatabase(base64Data.split(',')[1]) // Remove data:application/octet-stream;base64, prefix
        await loadSchemaInfo()
        alert('Base de datos importada exitosamente')
      } catch (error) {
        console.error('Error importing database:', error)
        alert('Error al importar base de datos: ' + error.message)
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Cargando esquema de base de datos...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <ChartExportWrapper
        title="Esquema de Base de Datos SQLite"
        subtitle="Estructura y estadísticas de la base de datos local SQLite"
        enableExport={true}
      >
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Table className="text-blue-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-blue-600 font-semibold">Tablas</p>
                <p className="text-2xl font-bold text-blue-900">{schemaInfo?.tables.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="text-green-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-green-600 font-semibold">Escenarios</p>
                <p className="text-2xl font-bold text-green-900">{stats?.totalScenarios || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Key className="text-purple-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-purple-600 font-semibold">Usuarios</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Database className="text-orange-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-orange-600 font-semibold">Almacenamiento</p>
                <p className="text-lg font-bold text-orange-900">Local</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={handleExportDatabase}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Exportar DB
          </button>
          
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={16} className="mr-2" />
            Importar DB
            <input
              type="file"
              accept=".db"
              onChange={handleImportDatabase}
              className="hidden"
            />
          </label>
        </div>
      </ChartExportWrapper>

      {/* Table Schemas */}
      {schemaInfo?.tables.map((table: any) => (
        <ChartExportWrapper
          key={table.name}
          title={`Tabla: ${table.name}`}
          subtitle={table.description}
          enableExport={true}
        >
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Columna</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Tipo</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Restricciones</th>
                  <th className="py-3 px-4 text-left font-semibold text-slate-700">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((column: any, index: number) => (
                  <tr key={column.name} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{column.name}</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{column.type}</td>
                    <td className="py-3 px-4 font-mono text-sm text-slate-600">{column.constraint}</td>
                    <td className="py-3 px-4 text-slate-700">{column.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {table.relationships.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Relaciones</h5>
              {table.relationships.map((rel: any, index: number) => (
                <div key={index} className="text-sm text-blue-700">
                  <code>{rel.column}</code> → <code>{rel.references}</code> 
                  {rel.onDelete && <span className="text-blue-600"> (ON DELETE {rel.onDelete})</span>}
                </div>
              ))}
            </div>
          )}
        </ChartExportWrapper>
      ))}

      {/* Data Structure Analysis */}
      <ChartExportWrapper
        title="Análisis de Estructura de Datos"
        subtitle="Detalle de campos JSON y estadísticas de datos almacenados"
        enableExport={true}
      >
        
        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-slate-900 mb-2">Campos JSON en simulation_scenarios.inputs</h5>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <h6 className="font-semibold text-slate-700">General</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• fixedPopulation</li>
                    <li>• highSeasonOccupancy</li>
                    <li>• lowSeasonOccupancy</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-slate-700">Generation</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• hotels (units, rate, sourceSeparationRate)</li>
                    <li>• restaurants (units, rate, sourceSeparationRate)</li>
                    <li>• homes (rate, sourceSeparationRate)</li>
                    <li>• commerce (units, rate, sourceSeparationRate)</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-slate-700">Composition</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• hotels (7 waste types)</li>
                    <li>• restaurants (7 waste types)</li>
                    <li>• homes (7 waste types)</li>
                    <li>• commerce (7 waste types)</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-slate-700">RSU System</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• logistics (vehicles, capacity, trips)</li>
                    <li>• processing (rates, capacities)</li>
                    <li>• separation (efficiencies, rates)</li>
                    <li>• economics (costs, income)</li>
                    <li>• leaks (percentages)</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-slate-700">Special Waste</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• sargassumHigh/Low</li>
                    <li>• construction</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-slate-700">Management</h6>
                  <ul className="text-slate-600 ml-4">
                    <li>• sargassumManagement</li>
                    <li>• rcdManagement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-slate-900 mb-2">Estadísticas de Datos</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Escenario más antiguo:</p>
                <p className="font-mono text-slate-900">{stats?.oldestScenario || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Escenario más reciente:</p>
                <p className="font-mono text-slate-900">{stats?.newestScenario || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </ChartExportWrapper>
    </div>
  )
}

export default DatabaseSchema
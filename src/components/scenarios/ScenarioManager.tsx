import React, { useState } from 'react'
import { Save, FolderOpen, Trash2, Download, Upload } from 'lucide-react'
import { useScenarios } from '../../hooks/useScenarios'
import { useAuth } from '../../hooks/useAuth'
import { exportScenariosToCSV, downloadCSV, parseCSVToScenarios } from '../../utils/csvUtils'
import Card from '../ui/Card'
import CardHeader from '../ui/CardHeader'

interface ScenarioManagerProps {
  currentInputs: any
  onLoadScenario: (inputs: any) => void
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({ currentInputs, onLoadScenario }) => {
  const { user } = useAuth()
  const { scenarios, loading, saveScenario, deleteScenario } = useScenarios()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioDescription, setScenarioDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  if (!user) {
    return (
      <Card>
        <CardHeader title="Gestión de Escenarios" icon={<FolderOpen size={24} />} />
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">Inicia sesión para guardar y cargar escenarios</p>
        </div>
      </Card>
    )
  }

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) return

    setSaving(true)
    try {
      await saveScenario(scenarioName, currentInputs, scenarioDescription)
      setShowSaveModal(false)
      setScenarioName('')
      setScenarioDescription('')
    } catch (error) {
      console.error('Error saving scenario:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteScenario = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este escenario?')) {
      try {
        await deleteScenario(id)
      } catch (error) {
        console.error('Error deleting scenario:', error)
      }
    }
  }

  const handleExportCSV = () => {
    try {
      if (scenarios.length === 0) {
        alert('No hay escenarios para exportar')
        return
      }
      
      const csvContent = exportScenariosToCSV(scenarios)
      const timestamp = new Date().toISOString().split('T')[0]
      downloadCSV(csvContent, `escenarios-residuos-${timestamp}.csv`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error al exportar CSV: ' + error.message)
    }
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string
        const importedScenarios = parseCSVToScenarios(csvContent)
        
        // Save each imported scenario
        let successCount = 0
        let errorCount = 0
        
        for (const scenario of importedScenarios) {
          try {
            await saveScenario(
              scenario.name + ' (Importado)',
              scenario.inputs,
              scenario.description
            )
            successCount++
          } catch (error) {
            console.error('Error saving imported scenario:', error)
            errorCount++
          }
        }
        
        alert(`Importación completada: ${successCount} escenarios importados${errorCount > 0 ? `, ${errorCount} errores` : ''}`)
      } catch (error) {
        console.error('Error importing CSV:', error)
        alert('Error al importar CSV: ' + error.message)
      } finally {
        setImporting(false)
        // Reset file input
        event.target.value = ''
      }
    }
    
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Gestión de Escenarios" icon={<FolderOpen size={24} />} />
        
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-slate-700">Escenarios Guardados</h4>
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={scenarios.length === 0}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={16} className="mr-2" />
              Exportar CSV
            </button>
            
            <label className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
              <Upload size={16} className="mr-2" />
              {importing ? 'Importando...' : 'Importar CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={importing}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} className="mr-2" />
              Guardar Actual
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FolderOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No hay escenarios guardados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-slate-900 truncate">{scenario.name}</h5>
                  <button
                    onClick={() => handleDeleteScenario(scenario.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {scenario.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{scenario.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onLoadScenario(scenario.inputs)}
                    className="flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors text-sm"
                  >
                    <FolderOpen size={14} className="mr-1" />
                    Cargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Guardar Escenario</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Escenario *
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Escenario Base 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descripción del escenario..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveScenario}
                disabled={!scenarioName.trim() || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScenarioManager
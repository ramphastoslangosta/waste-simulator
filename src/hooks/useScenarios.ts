import { useState, useEffect } from 'react'
import { database, SimulationScenario } from '../lib/database'
import { useAuth } from './useAuth'

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchScenarios = async () => {
    if (!user) {
      setScenarios([])
      setLoading(false)
      return
    }

    try {
      const data = await database.getScenarios()
      setScenarios(data || [])
    } catch (error) {
      console.error('Error fetching scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScenarios()
  }, [user])

  const saveScenario = async (name: string, inputs: any, description?: string) => {
    if (!user) throw new Error('User must be authenticated')

    const data = await database.saveScenario(name, inputs, description)
    await fetchScenarios() // Refresh the list
    return data
  }

  const updateScenario = async (id: string, updates: Partial<SimulationScenario>) => {
    if (!user) throw new Error('User must be authenticated')

    const data = await database.updateScenario(id, updates)
    await fetchScenarios() // Refresh the list
    return data
  }

  const deleteScenario = async (id: string) => {
    if (!user) throw new Error('User must be authenticated')

    await database.deleteScenario(id)
    await fetchScenarios() // Refresh the list
  }

  const saveResults = async (scenarioId: string, season: 'high' | 'low', results: any) => {
    if (!user) throw new Error('User must be authenticated')

    const data = await database.saveResults(scenarioId, season, results)
    return data
  }

  return {
    scenarios,
    loading,
    saveScenario,
    updateScenario,
    deleteScenario,
    saveResults,
    refreshScenarios: fetchScenarios,
  }
}
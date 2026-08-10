import React, { useState } from 'react';
import { Sun, Moon, User, LogOut } from 'lucide-react';

// Hooks, constants and refactored components
import { useWasteSimulation } from './hooks/useWasteSimulation';
import { useAuth } from './hooks/useAuth';
import { TABS } from './constants/layoutConstants';
import { STUDY_CASES, DEFAULT_CASE, getStudyCase, getInitialInputs } from './studyCases';
import InputPanel from './components/features/InputPanel.tsx';
import KPIDashboard from './components/features/KPIDashboard.tsx';
import MapView from './components/features/MapView.tsx';
import FinancialAnalysis from './components/features/FinancialAnalysis.tsx';
import FlowDiagram from './components/features/FlowDiagram.tsx';
import ProcessAnalysis from './components/features/ProcessAnalysis.tsx';
import ResultsTable from './components/features/ResultsTable.tsx';
import ScenarioManager from './components/scenarios/ScenarioManager.tsx';
import AuthModal from './components/auth/AuthModal.tsx';
import DatabaseSchema from './components/admin/DatabaseSchema.tsx';
import ComparisonDashboard from './components/features/ComparisonDashboard.tsx';
import ValidationDashboard from './components/features/ValidationDashboard.tsx';
import ValidationTestDashboard from './components/features/ValidationTestDashboard.tsx';

// Placeholder component
const SankeyDiagram = () => (
    <div className="p-4 bg-slate-100 rounded-md text-center text-slate-500">
        The Sankey component needs to be implemented.
    </div>
);

export default function App() {
    const [activeTab, setActiveTab] = useState('kpis');
    const [season, setSeason] = useState('high'); // 'high' or 'low'
    const [studyCaseId, setStudyCaseId] = useState(DEFAULT_CASE);
    const [inputs, setInputs] = useState(() => getInitialInputs(DEFAULT_CASE));

    // Cambiar de caso de estudio recarga los parámetros iniciales de ese caso.
    const handleStudyCaseChange = (id: string) => {
        setStudyCaseId(id);
        setInputs(getInitialInputs(id));
    };
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([]);
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    
    const { user, loading: authLoading, signOut } = useAuth();

    // The custom hook encapsulates all complex calculation logic
    const results = useWasteSimulation(inputs);

    const activeKpis = season === 'high' ? results.high : results.low;
    const activeSeasonLabel = season === 'high' ? 'Temporada Alta' : 'Temporada Baja';

    const handleLoadScenario = (scenarioInputs: any) => {
        setInputs(scenarioInputs);
        setActiveTab('inputs'); // Switch to inputs tab to show loaded scenario
    };

    const handleCompareScenarios = async (scenarioIds: string[]) => {
        setComparisonLoading(true);
        try {
            // Import database to fetch scenario data
            const { database } = await import('./lib/database');
            
            // Fetch scenarios from database
            const allScenarios = await database.getScenarios();
            const selectedScenarios = allScenarios.filter(scenario => 
                scenarioIds.includes(scenario.id)
            );

            setComparisonScenarios(selectedScenarios);
            setIsComparisonMode(true);
            setActiveTab('comparison');
        } catch (error) {
            console.error('Error loading scenarios for comparison:', error);
            alert('Error al cargar escenarios para comparación');
        } finally {
            setComparisonLoading(false);
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'kpis':
                return <KPIDashboard kpis={activeKpis} season={activeSeasonLabel} />;
            case 'map':
                return <MapView geo={getStudyCase(studyCaseId).geo} />;
            case 'financials':
                return <FinancialAnalysis kpis={activeKpis} season={activeSeasonLabel} />;
            case 'flow':
                return <FlowDiagram kpis={activeKpis} season={activeSeasonLabel} />;
            case 'process':
                return <ProcessAnalysis kpis={activeKpis} season={activeSeasonLabel} inputs={inputs} />;
            case 'table':
                return <ResultsTable kpis={activeKpis} season={activeSeasonLabel} inputs={inputs} />;
            case 'validation':
                return <ValidationDashboard kpis={activeKpis} inputs={inputs} season={season} />;
            case 'validation-test':
                return <ValidationTestDashboard />;
            case 'inputs':
                return <InputPanel inputs={inputs} setInputs={setInputs} />;
            case 'scenarios':
                return <ScenarioManager currentInputs={inputs} onLoadScenario={handleLoadScenario} onCompareScenarios={handleCompareScenarios} />;
            case 'comparison':
                if (comparisonLoading) {
                    return (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Cargando comparación de escenarios...</p>
                        </div>
                    );
                }
                
                if (comparisonScenarios.length > 0) {
                    return (
                        <div>
                            <div className="mb-6 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold text-slate-700">Temporada para Comparación:</span>
                                    <button 
                                        onClick={() => setSeason('high')} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${season === 'high' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                    >
                                        <Sun size={16} className="mr-2"/> Temporada Alta
                                    </button>
                                    <button 
                                        onClick={() => setSeason('low')} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${season === 'low' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                    >
                                        <Moon size={16} className="mr-2"/> Temporada Baja
                                    </button>
                                </div>
                                <button 
                                    onClick={() => {setIsComparisonMode(false); setActiveTab('scenarios')}}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Volver a Escenarios
                                </button>
                            </div>
                            <ComparisonDashboard scenarios={comparisonScenarios} season={season} />
                        </div>
                    );
                }
                
                return (
                    <div className="text-center py-8">
                        <p className="text-slate-600 mb-4">No hay escenarios seleccionados para comparar</p>
                        <button 
                            onClick={() => setActiveTab('scenarios')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ir a Escenarios
                        </button>
                    </div>
                );
            case 'sankey':
                 return <SankeyDiagram />;
            case 'schema':
                return <DatabaseSchema />;
            default:
                return <KPIDashboard kpis={activeKpis} season={activeSeasonLabel} />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <div className="container mx-auto p-2 sm:p-4 lg:p-6">
                <div className="bg-slate-100 rounded-2xl shadow-lg overflow-hidden">
                    <header className="bg-gradient-to-br from-blue-900 to-blue-700 text-white p-6 text-center">
                        <div className="flex justify-between items-center">
                            <div className="flex-1 text-left">
                                <h1 className="text-2xl sm:text-4xl font-bold">Simulador de Residuos</h1>
                                <div className="mt-2 flex items-center gap-3 flex-wrap">
                                    <label className="text-sm opacity-90">Caso de estudio:</label>
                                    <select
                                        value={studyCaseId}
                                        onChange={(e) => handleStudyCaseChange(e.target.value)}
                                        className="bg-blue-800 text-white text-sm rounded-md px-3 py-1 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        {STUDY_CASES.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {getStudyCase(studyCaseId).validated && (
                                        <span className="text-xs bg-green-600 rounded-full px-2 py-0.5">validado</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs sm:text-sm opacity-80">
                                    {getStudyCase(studyCaseId).location} — {getStudyCase(studyCaseId).description}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {authLoading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : user ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2">
                                            <User size={20} />
                                            <span className="text-sm">{user.email}</span>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="flex items-center space-x-1 px-3 py-1 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-sm">Salir</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        <User size={20} />
                                        <span>Iniciar Sesión</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="flex flex-wrap border-b border-slate-200 bg-white">
                        {TABS.filter(tab => 
                            // Hide comparison tab unless in comparison mode
                            tab.id !== 'comparison' || isComparisonMode
                        ).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-2 text-xs sm:text-base font-semibold transition-colors duration-300 ${activeTab === tab.id ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    
                    {!isComparisonMode && (
                        <div className="p-4 md:p-6 bg-white border-b border-slate-200">
                            <div className="flex justify-center items-center space-x-2">
                                <span className="font-semibold text-slate-700">Seleccionar Temporada:</span>
                                <button onClick={() => setSeason('high')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${season === 'high' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                    <Sun size={16} className="mr-2"/> Temporada Alta
                                </button>
                                <button onClick={() => setSeason('low')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${season === 'low' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                    <Moon size={16} className="mr-2"/> Temporada Baja
                                </button>
                            </div>
                        </div>
                    )}

                    <main className="p-4 md:p-6 bg-slate-50">
                        {renderActiveTab()}
                    </main>
                    
                    <AuthModal 
                        isOpen={showAuthModal} 
                        onClose={() => setShowAuthModal(false)} 
                    />
                </div>
            </div>
        </div>
    );
}

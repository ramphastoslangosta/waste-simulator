// ========================================================================
// FILE: src/components/features/InputPanel.js
// ========================================================================
import React from 'react';
import { Factory, Package, Warehouse, Recycle, AlertTriangle, Droplets, Wrench, Leaf, Users, Gift } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import InputField from '../ui/InputField.tsx';
import { formatNumber } from '../../utils/formatNumber';

const InputPanel = ({ inputs, setInputs }) => {
    const handleInputChange = (category, field, value) => {
        setInputs(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: parseFloat(value) || 0 }
        }));
    };
    
    const handleNestedInputChange = (cat1, cat2, field, value) => {
        setInputs(prev => ({
            ...prev,
            [cat1]: {
                ...prev[cat1],
                [cat2]: { ...prev[cat1][cat2], [field]: parseFloat(value) || 0 }
            }
        }));
    };
    
    const handleTripleNestedInputChange = (cat1, cat2, cat3, field, value) => {
        setInputs(prev => ({
            ...prev,
            [cat1]: {
                ...prev[cat1] || {},
                [cat2]: {
                    ...prev[cat1]?.[cat2] || {},
                    [cat3]: { 
                        ...prev[cat1]?.[cat2]?.[cat3] || {}, 
                        [field]: field === '' ? value : (parseFloat(value) || 0)
                    }
                }
            }
        }));
    };
    
    const handleBooleanChange = (cat1, cat2, field, value) => {
        setInputs(prev => ({
            ...prev,
            [cat1]: {
                ...prev[cat1] || {},
                [cat2]: { 
                    ...prev[cat1]?.[cat2] || {}, 
                    [field]: value 
                }
            }
        }));
    };
    
    const CompositionWarning = ({ composition }) => {
        const total = Object.values(composition).reduce((sum, val) => sum + val, 0);
        if (Math.round(total) !== 100) {
            return (
                <div className="text-xs text-red-600 font-semibold mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle size={14} className="inline mr-1"/>
                    La suma debe ser 100%. Suma actual: {formatNumber(total, 0)}%
                </div>
            )
        }
        return null;
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Parámetros del Sistema de Gestión Integral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Card>
                    <CardHeader title="Parámetros Generales" icon={<Factory size={24} />} />
                    <div className="space-y-4">
                        <InputField label="Población Fija" value={inputs.general.fixedPopulation} onChange={e => handleInputChange('general', 'fixedPopulation', e.target.value)} unit="hab." />
                        <InputField label="% Ocupación Hotelera (Alta)" value={inputs.general.highSeasonOccupancy} onChange={e => handleInputChange('general', 'highSeasonOccupancy', e.target.value)} unit="%" />
                        <InputField label="% Ocupación Hotelera (Baja)" value={inputs.general.lowSeasonOccupancy} onChange={e => handleInputChange('general', 'lowSeasonOccupancy', e.target.value)} unit="%" />
                    </div>
                </Card>
                {/* RSU Generation Cards */}
                <Card>
                    <CardHeader title="Generación RSU: Hoteles" />
                     <div className="space-y-4">
                        <InputField label="# de Cuartos" value={inputs.generation.hotels.units} onChange={e => handleNestedInputChange('generation', 'hotels', 'units', e.target.value)} unit="cuartos" />
                        <InputField label="Tasa Generación" value={inputs.generation.hotels.rate} onChange={e => handleNestedInputChange('generation', 'hotels', 'rate', e.target.value)} unit="kg/cuarto/día" />
                        <InputField label="% Separación Origen" value={inputs.generation.hotels.sourceSeparationRate} onChange={e => handleNestedInputChange('generation', 'hotels', 'sourceSeparationRate', e.target.value)} unit="%" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Generación RSU: Restaurantes" />
                    <div className="space-y-4">
                        <InputField label="# de Locales" value={inputs.generation.restaurants.units} onChange={e => handleNestedInputChange('generation', 'restaurants', 'units', e.target.value)} unit="locales" />
                        <InputField label="Tasa Generación" value={inputs.generation.restaurants.rate} onChange={e => handleNestedInputChange('generation', 'restaurants', 'rate', e.target.value)} unit="kg/local/día" />
                        <InputField label="% Separación Origen" value={inputs.generation.restaurants.sourceSeparationRate} onChange={e => handleNestedInputChange('generation', 'restaurants', 'sourceSeparationRate', e.target.value)} unit="%" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Generación RSU: Hogares" />
                    <div className="space-y-4">
                        <InputField label="Tasa Generación" value={inputs.generation.homes.rate} onChange={e => handleNestedInputChange('generation', 'homes', 'rate', e.target.value)} unit="kg/hab/día" />
                        <InputField label="% Separación Origen" value={inputs.generation.homes.sourceSeparationRate} onChange={e => handleNestedInputChange('generation', 'homes', 'sourceSeparationRate', e.target.value)} unit="%" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Generación RSU: Comercios" />
                    <div className="space-y-4">
                        <InputField label="# de Locales" value={inputs.generation.commerce.units} onChange={e => handleNestedInputChange('generation', 'commerce', 'units', e.target.value)} unit="locales" />
                        <InputField label="Tasa Generación" value={inputs.generation.commerce.rate} onChange={e => handleNestedInputChange('generation', 'commerce', 'rate', e.target.value)} unit="kg/local/día" />
                        <InputField label="% Separación Origen" value={inputs.generation.commerce.sourceSeparationRate} onChange={e => handleNestedInputChange('generation', 'commerce', 'sourceSeparationRate', e.target.value)} unit="%" />
                    </div>
                </Card>

                {/* RSU System Cards */}
                <Card>
                    <CardHeader title="Sistema RSU: Logística" icon={<Package size={24} />} />
                    <div className="space-y-4">
                        <InputField label="# de Vehículos" value={inputs.rsuSystem.logistics.vehicles} onChange={e => handleNestedInputChange('rsuSystem', 'logistics', 'vehicles', e.target.value)} unit="unidades" />
                        <InputField label="Capacidad Vehículo" value={inputs.rsuSystem.logistics.vehicleCapacity} onChange={e => handleNestedInputChange('rsuSystem', 'logistics', 'vehicleCapacity', e.target.value)} unit="ton" />
                        <InputField label="Viajes/Vehículo/Día" value={inputs.rsuSystem.logistics.tripsPerVehicle} onChange={e => handleNestedInputChange('rsuSystem', 'logistics', 'tripsPerVehicle', e.target.value)} unit="viajes" />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Sistema RSU: Procesamiento" icon={<Warehouse size={24} />} />
                    <div className="space-y-4">
                        <InputField label="Tasa Procesamiento" value={inputs.rsuSystem.processing.transferStationRate} onChange={e => handleNestedInputChange('rsuSystem', 'processing', 'transferStationRate', e.target.value)} unit="ton/día" />
                        <InputField label="Capacidad Almacenamiento" value={inputs.rsuSystem.processing.transferStationCapacity} onChange={e => handleNestedInputChange('rsuSystem', 'processing', 'transferStationCapacity', e.target.value)} unit="ton" />
                        <InputField label="Capacidad Traslado Diario" value={inputs.rsuSystem.processing.finalTransportCapacity} onChange={e => handleNestedInputChange('rsuSystem', 'processing', 'finalTransportCapacity', e.target.value)} unit="ton/día" />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Inventarios Iniciales" icon={<Package size={24} />} />
                    <div className="space-y-4">
                        <InputField 
                            label="Vehículos de Recolección" 
                            value={inputs.rsuSystem.initialInventory?.collectionVehicles || 0} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'initialInventory', 'collectionVehicles', e.target.value)} 
                            unit="ton" 
                        />
                        <InputField 
                            label="Estación de Transferencia" 
                            value={inputs.rsuSystem.initialInventory?.transferStation || 0} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'initialInventory', 'transferStation', e.target.value)} 
                            unit="ton" 
                        />
                        <InputField 
                            label="Vehículos de Traslado Final" 
                            value={inputs.rsuSystem.initialInventory?.finalTransportVehicles || 0} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'initialInventory', 'finalTransportVehicles', e.target.value)} 
                            unit="ton" 
                        />
                        <InputField 
                            label="Sitio de Disposición" 
                            value={inputs.rsuSystem.initialInventory?.disposalSite || 0} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'initialInventory', 'disposalSite', e.target.value)} 
                            unit="ton" 
                        />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Sistema RSU: Separación" icon={<Recycle size={24} />} />
                    <div className="space-y-4">
                        <InputField label="% Captura Diferenciada" value={inputs.rsuSystem.separation.differentiatedCaptureRate} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'differentiatedCaptureRate', e.target.value)} unit="%" />
                        <InputField label="% Rechazo en Origen" value={inputs.rsuSystem.separation.rejectionRateSource} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'rejectionRateSource', e.target.value)} unit="%" />
                        <InputField label="% Rec. Informal (Recolección)" value={inputs.rsuSystem.separation.informalRecoveryRateCollection} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'informalRecoveryRateCollection', e.target.value)} unit="%" />
                        <InputField label="% Rec. Informal (Disp. Final)" value={inputs.rsuSystem.separation.informalRecoveryRateDisposal} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'informalRecoveryRateDisposal', e.target.value)} unit="%" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Sistema RSU: Eficiencia Planta" />
                    <div className="space-y-4">
                        <InputField label="PET" value={inputs.rsuSystem.separation.plantSeparationEfficiency.pet} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'plantSeparationEfficiency', 'pet', e.target.value)} unit="%" />
                        <InputField label="Aluminio" value={inputs.rsuSystem.separation.plantSeparationEfficiency.aluminio} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'plantSeparationEfficiency', 'aluminio', e.target.value)} unit="%" />
                        <InputField label="Cartón/Papel" value={inputs.rsuSystem.separation.plantSeparationEfficiency.carton} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'plantSeparationEfficiency', 'carton', e.target.value)} unit="%" />
                        <InputField label="Vidrio" value={inputs.rsuSystem.separation.plantSeparationEfficiency.vidrio} onChange={e => handleNestedInputChange('rsuSystem', 'separation', 'plantSeparationEfficiency', 'vidrio', e.target.value)} unit="%" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Sistema RSU: Costos" />
                    <div className="space-y-4">
                        <InputField label="Costo Recolección" value={inputs.rsuSystem.economics.collectionCost} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'collectionCost', e.target.value)} unit="MXN/ton" />
                        <InputField label="Costo Transferencia" value={inputs.rsuSystem.economics.transferStationCost} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'transferStationCost', e.target.value)} unit="MXN/ton" />
                        <InputField label="Costo Traslado Final" value={inputs.rsuSystem.economics.finalTransportCost} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'finalTransportCost', e.target.value)} unit="MXN/ton" />
                        <InputField label="Costo Disposición Final" value={inputs.rsuSystem.economics.disposalCost} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'disposalCost', e.target.value)} unit="MXN/ton" />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Sistema RSU: Ingresos" />
                    <div className="space-y-4">
                        <InputField label="PET" value={inputs.rsuSystem.economics.income.pet} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'income', 'pet', e.target.value)} unit="MXN/ton" />
                        <InputField label="Aluminio" value={inputs.rsuSystem.economics.income.aluminio} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'income', 'aluminio', e.target.value)} unit="MXN/ton" />
                        <InputField label="Cartón/Papel" value={inputs.rsuSystem.economics.income.carton} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'income', 'carton', e.target.value)} unit="MXN/ton" />
                        <InputField label="Vidrio" value={inputs.rsuSystem.economics.income.vidrio} onChange={e => handleNestedInputChange('rsuSystem', 'economics', 'income', 'vidrio', e.target.value)} unit="MXN/ton" />
                    </div>
                </Card>
                 <Card>
                    <CardHeader title="Sistema RSU: Fugas" />
                    <div className="space-y-4">
                         <InputField label="% Fuga en Recolección" value={inputs.rsuSystem.leaks.collectionLeak} onChange={e => handleNestedInputChange('rsuSystem', 'leaks', 'collectionLeak', e.target.value)} unit="%" />
                         <InputField label="% Fuga en Transferencia" value={inputs.rsuSystem.leaks.transferStationLeak} onChange={e => handleNestedInputChange('rsuSystem', 'leaks', 'transferStationLeak', e.target.value)} unit="%" />
                         <InputField label="% Fuga en Traslado Final" value={inputs.rsuSystem.leaks.finalTransportLeak} onChange={e => handleNestedInputChange('rsuSystem', 'leaks', 'finalTransportLeak', e.target.value)} unit="%" />
                         <InputField label="% Fuga en Disposición Final" value={inputs.rsuSystem.leaks.disposalLeak} onChange={e => handleNestedInputChange('rsuSystem', 'leaks', 'disposalLeak', e.target.value)} unit="%" />
                    </div>
                </Card>

                {/* Waste Valorization Scenarios */}
                <Card>
                    <CardHeader title="Valorización: Compostaje" icon={<Leaf size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enableComposting"
                                checked={inputs.rsuSystem.valorization?.enableComposting || false}
                                onChange={e => handleBooleanChange('rsuSystem', 'valorization', 'enableComposting', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enableComposting" className="text-sm font-medium text-gray-700">Habilitar Compostaje</label>
                        </div>
                        <InputField 
                            label="Eficiencia de Compostaje" 
                            value={inputs.rsuSystem.valorization?.compostingEfficiency || 80} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'compostingEfficiency', e.target.value)} 
                            unit="%" 
                            disabled={!inputs.rsuSystem.valorization?.enableComposting}
                        />
                        <InputField 
                            label="Costo de Compostaje" 
                            value={inputs.rsuSystem.valorization?.compostingCost || 200} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'compostingCost', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enableComposting}
                        />
                        <InputField 
                            label="Ingresos por Compost" 
                            value={inputs.rsuSystem.valorization?.compostIncome || 500} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'compostIncome', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enableComposting}
                        />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Valorización: Biogás" icon={<Leaf size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enableBiogas"
                                checked={inputs.rsuSystem.valorization?.enableBiogas || false}
                                onChange={e => handleBooleanChange('rsuSystem', 'valorization', 'enableBiogas', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enableBiogas" className="text-sm font-medium text-gray-700">Habilitar Biogás</label>
                        </div>
                        <InputField 
                            label="Eficiencia de Biogás" 
                            value={inputs.rsuSystem.valorization?.biogasEfficiency || 60} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'biogasEfficiency', e.target.value)} 
                            unit="%" 
                            disabled={!inputs.rsuSystem.valorization?.enableBiogas}
                        />
                        <InputField 
                            label="Costo de Biogás" 
                            value={inputs.rsuSystem.valorization?.biogasCost || 300} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'biogasCost', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enableBiogas}
                        />
                        <InputField 
                            label="Ingresos por Biogás" 
                            value={inputs.rsuSystem.valorization?.biogasIncome || 800} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'biogasIncome', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enableBiogas}
                        />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Valorización: Pirólisis Plásticos" icon={<Recycle size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enablePlasticPyrolysis"
                                checked={inputs.rsuSystem.valorization?.enablePlasticPyrolysis || false}
                                onChange={e => handleBooleanChange('rsuSystem', 'valorization', 'enablePlasticPyrolysis', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enablePlasticPyrolysis" className="text-sm font-medium text-gray-700">Habilitar Pirólisis</label>
                        </div>
                        <InputField 
                            label="Eficiencia de Pirólisis" 
                            value={inputs.rsuSystem.valorization?.pyrolysisEfficiency || 70} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'pyrolysisEfficiency', e.target.value)} 
                            unit="%" 
                            disabled={!inputs.rsuSystem.valorization?.enablePlasticPyrolysis}
                        />
                        <InputField 
                            label="Costo de Pirólisis" 
                            value={inputs.rsuSystem.valorization?.pyrolysisCost || 400} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'pyrolysisCost', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enablePlasticPyrolysis}
                        />
                        <InputField 
                            label="Ingresos por Pirólisis" 
                            value={inputs.rsuSystem.valorization?.pyrolysisIncome || 600} 
                            onChange={e => handleNestedInputChange('rsuSystem', 'valorization', 'pyrolysisIncome', e.target.value)} 
                            unit="MXN/ton" 
                            disabled={!inputs.rsuSystem.valorization?.enablePlasticPyrolysis}
                        />
                    </div>
                </Card>

                {/* Special Waste Cards */}
                 <Card>
                    <CardHeader title="Generación Residuos Especiales" icon={<AlertTriangle size={24} />} />
                    <div className="space-y-4">
                        <InputField label="Sargazo (Alta)" value={inputs.specialWasteGeneration.sargassumHigh} onChange={e => handleNestedInputChange('specialWasteGeneration', 'sargassumHigh', '', e.target.value)} unit="ton/día" />
                        <InputField label="Sargazo (Baja)" value={inputs.specialWasteGeneration.sargassumLow} onChange={e => handleNestedInputChange('specialWasteGeneration', 'sargassumLow', '', e.target.value)} unit="ton/día" />
                        <InputField label="RCD" value={inputs.specialWasteGeneration.construction} onChange={e => handleNestedInputChange('specialWasteGeneration', 'construction', '', e.target.value)} unit="ton/día" />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Gestión de Sargazo" icon={<Droplets size={24} />} />
                    <div className="space-y-4">
                        <InputField label="Costo Recolección" value={inputs.sargassumManagement.collectionCost} onChange={e => handleNestedInputChange('sargassumManagement', 'collectionCost', '', e.target.value)} unit="MXN/ton" />
                        <InputField label="Costo Disposición/Trat." value={inputs.sargassumManagement.disposalCost} onChange={e => handleNestedInputChange('sargassumManagement', 'disposalCost', '', e.target.value)} unit="MXN/ton" />
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Gestión de RCD" icon={<Wrench size={24} />} />
                    <div className="space-y-4">
                        <InputField label="Costo Recolección" value={inputs.rcdManagement.collectionCost} onChange={e => handleNestedInputChange('rcdManagement', 'collectionCost', '', e.target.value)} unit="MXN/ton" />
                        <InputField label="Costo Disposición/Trat." value={inputs.rcdManagement.disposalCost} onChange={e => handleNestedInputChange('rcdManagement', 'disposalCost', '', e.target.value)} unit="MXN/ton" />
                    </div>
                </Card>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-6">Escenarios de Separación en Origen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Education Program Card */}
                <Card>
                    <CardHeader title="Programa de Educación" icon={<Users size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enableEducation"
                                checked={inputs.separationScenarios?.educationProgram?.enableEducation || false}
                                onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'enableEducation', '', e.target.checked ? 1 : 0)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enableEducation" className="text-sm font-medium text-gray-700">Habilitar Educación</label>
                        </div>
                        <InputField 
                            label="Impacto Hoteles" 
                            value={inputs.separationScenarios?.educationProgram?.educationImpactHotels || 15} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'educationImpactHotels', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.educationProgram?.enableEducation}
                        />
                        <InputField 
                            label="Impacto Restaurantes" 
                            value={inputs.separationScenarios?.educationProgram?.educationImpactRestaurants || 20} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'educationImpactRestaurants', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.educationProgram?.enableEducation}
                        />
                        <InputField 
                            label="Impacto Hogares" 
                            value={inputs.separationScenarios?.educationProgram?.educationImpactHomes || 25} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'educationImpactHomes', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.educationProgram?.enableEducation}
                        />
                        <InputField 
                            label="Impacto Comercios" 
                            value={inputs.separationScenarios?.educationProgram?.educationImpactCommerce || 10} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'educationImpactCommerce', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.educationProgram?.enableEducation}
                        />
                        <InputField 
                            label="Costo per Cápita" 
                            value={inputs.separationScenarios?.educationProgram?.educationCostPerCapita || 50} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'educationProgram', 'educationCostPerCapita', '', e.target.value)} 
                            unit="MXN/persona/año" 
                            disabled={!inputs.separationScenarios?.educationProgram?.enableEducation}
                        />
                    </div>
                </Card>

                {/* Incentive Program Card */}
                <Card>
                    <CardHeader title="Programa de Incentivos" icon={<Gift size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enableIncentives"
                                checked={inputs.separationScenarios?.incentiveProgram?.enableIncentives || false}
                                onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'enableIncentives', '', e.target.checked ? 1 : 0)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enableIncentives" className="text-sm font-medium text-gray-700">Habilitar Incentivos</label>
                        </div>
                        <InputField 
                            label="Impacto Hoteles" 
                            value={inputs.separationScenarios?.incentiveProgram?.incentiveImpactHotels || 20} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'incentiveImpactHotels', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.incentiveProgram?.enableIncentives}
                        />
                        <InputField 
                            label="Impacto Restaurantes" 
                            value={inputs.separationScenarios?.incentiveProgram?.incentiveImpactRestaurants || 25} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'incentiveImpactRestaurants', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.incentiveProgram?.enableIncentives}
                        />
                        <InputField 
                            label="Impacto Hogares" 
                            value={inputs.separationScenarios?.incentiveProgram?.incentiveImpactHomes || 30} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'incentiveImpactHomes', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.incentiveProgram?.enableIncentives}
                        />
                        <InputField 
                            label="Impacto Comercios" 
                            value={inputs.separationScenarios?.incentiveProgram?.incentiveImpactCommerce || 15} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'incentiveImpactCommerce', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.incentiveProgram?.enableIncentives}
                        />
                        <InputField 
                            label="Costo por Tonelada" 
                            value={inputs.separationScenarios?.incentiveProgram?.incentiveCostPerTon || 200} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'incentiveProgram', 'incentiveCostPerTon', '', e.target.value)} 
                            unit="MXN/ton separada" 
                            disabled={!inputs.separationScenarios?.incentiveProgram?.enableIncentives}
                        />
                    </div>
                </Card>

                {/* Container Program Card */}
                <Card>
                    <CardHeader title="Programa de Contenedores" icon={<Package size={24} />} />
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="enableContainers"
                                checked={inputs.separationScenarios?.containerProgram?.enableContainers || false}
                                onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'enableContainers', '', e.target.checked ? 1 : 0)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="enableContainers" className="text-sm font-medium text-gray-700">Habilitar Contenedores</label>
                        </div>
                        <InputField 
                            label="Impacto Hoteles" 
                            value={inputs.separationScenarios?.containerProgram?.containerImpactHotels || 10} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'containerImpactHotels', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.containerProgram?.enableContainers}
                        />
                        <InputField 
                            label="Impacto Restaurantes" 
                            value={inputs.separationScenarios?.containerProgram?.containerImpactRestaurants || 15} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'containerImpactRestaurants', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.containerProgram?.enableContainers}
                        />
                        <InputField 
                            label="Impacto Hogares" 
                            value={inputs.separationScenarios?.containerProgram?.containerImpactHomes || 20} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'containerImpactHomes', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.containerProgram?.enableContainers}
                        />
                        <InputField 
                            label="Impacto Comercios" 
                            value={inputs.separationScenarios?.containerProgram?.containerImpactCommerce || 8} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'containerImpactCommerce', '', e.target.value)} 
                            unit="% adicional" 
                            disabled={!inputs.separationScenarios?.containerProgram?.enableContainers}
                        />
                        <InputField 
                            label="Costo por Unidad" 
                            value={inputs.separationScenarios?.containerProgram?.containerCostPerUnit || 300} 
                            onChange={e => handleTripleNestedInputChange('separationScenarios', 'containerProgram', 'containerCostPerUnit', '', e.target.value)} 
                            unit="MXN/set" 
                            disabled={!inputs.separationScenarios?.containerProgram?.enableContainers}
                        />
                    </div>
                </Card>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-6">Composición de Residuos Sólidos Urbanos (%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(inputs.composition).map(sector => (
                    <Card key={sector}>
                        <CardHeader title={sector.charAt(0).toUpperCase() + sector.slice(1)} />
                        <div className="space-y-4">
                            <InputField label="Orgánicos" value={inputs.composition[sector].organicos} onChange={e => handleNestedInputChange('composition', sector, 'organicos', e.target.value)} unit="%" />
                            <InputField label="PET" value={inputs.composition[sector].pet} onChange={e => handleNestedInputChange('composition', sector, 'pet', e.target.value)} unit="%" />
                            <InputField label="Aluminio" value={inputs.composition[sector].aluminio} onChange={e => handleNestedInputChange('composition', sector, 'aluminio', e.target.value)} unit="%" />
                            <InputField label="Cartón/Papel" value={inputs.composition[sector].carton} onChange={e => handleNestedInputChange('composition', sector, 'carton', e.target.value)} unit="%" />
                            <InputField label="Vidrio" value={inputs.composition[sector].vidrio} onChange={e => handleNestedInputChange('composition', sector, 'vidrio', e.target.value)} unit="%" />
                            <InputField label="Rechazo" value={inputs.composition[sector].rechazo} onChange={e => handleNestedInputChange('composition', sector, 'rechazo', e.target.value)} unit="%" />
                            <InputField label="Peligrosos" value={inputs.composition[sector].peligrosos} onChange={e => handleNestedInputChange('composition', sector, 'peligrosos', e.target.value)} unit="%" />
                            <CompositionWarning composition={inputs.composition[sector]} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default InputPanel;
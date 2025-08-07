// ========================================================================
// FILE: src/components/features/InputPanel.js
// ========================================================================
import React from 'react';
import { Factory, Package, Warehouse, Recycle, AlertTriangle, Droplets, Wrench } from 'lucide-react';
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
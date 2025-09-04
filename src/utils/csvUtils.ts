// Utility functions for CSV export/import of simulation scenarios

// Helper function to format numbers for export
const formatNumber = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  return Number(value).toFixed(decimals);
};
export const exportScenariosToCSV = (scenarios: any[]) => {
  if (scenarios.length === 0) {
    throw new Error('No scenarios to export');
  }

  // Define CSV headers
  const headers = [
    'name',
    'description',
    'created_at',
    // General parameters
    'general_fixedPopulation',
    'general_highSeasonOccupancy',
    'general_lowSeasonOccupancy',
    // Generation - Hotels
    'generation_hotels_units',
    'generation_hotels_rate',
    'generation_hotels_sourceSeparationRate',
    // Generation - Restaurants
    'generation_restaurants_units',
    'generation_restaurants_rate',
    'generation_restaurants_sourceSeparationRate',
    // Generation - Homes
    'generation_homes_rate',
    'generation_homes_sourceSeparationRate',
    // Generation - Commerce
    'generation_commerce_units',
    'generation_commerce_rate',
    'generation_commerce_sourceSeparationRate',
    // Composition - Hotels
    'composition_hotels_organicos',
    'composition_hotels_pet',
    'composition_hotels_aluminio',
    'composition_hotels_carton',
    'composition_hotels_vidrio',
    'composition_hotels_rechazo',
    'composition_hotels_peligrosos',
    // Composition - Restaurants
    'composition_restaurants_organicos',
    'composition_restaurants_pet',
    'composition_restaurants_aluminio',
    'composition_restaurants_carton',
    'composition_restaurants_vidrio',
    'composition_restaurants_rechazo',
    'composition_restaurants_peligrosos',
    // Composition - Homes
    'composition_homes_organicos',
    'composition_homes_pet',
    'composition_homes_aluminio',
    'composition_homes_carton',
    'composition_homes_vidrio',
    'composition_homes_rechazo',
    'composition_homes_peligrosos',
    // Composition - Commerce
    'composition_commerce_organicos',
    'composition_commerce_pet',
    'composition_commerce_aluminio',
    'composition_commerce_carton',
    'composition_commerce_vidrio',
    'composition_commerce_rechazo',
    'composition_commerce_peligrosos',
    // RSU System - Logistics
    'rsuSystem_logistics_vehicles',
    'rsuSystem_logistics_vehicleCapacity',
    'rsuSystem_logistics_tripsPerVehicle',
    // RSU System - Processing
    'rsuSystem_processing_transferStationRate',
    'rsuSystem_processing_transferStationCapacity',
    'rsuSystem_processing_finalTransportCapacity',
    // RSU System - Separation
    'rsuSystem_separation_differentiatedCaptureRate',
    'rsuSystem_separation_rejectionRateSource',
    'rsuSystem_separation_informalRecoveryRateCollection',
    'rsuSystem_separation_informalRecoveryRateDisposal',
    'rsuSystem_separation_plantSeparationEfficiency_pet',
    'rsuSystem_separation_plantSeparationEfficiency_aluminio',
    'rsuSystem_separation_plantSeparationEfficiency_carton',
    'rsuSystem_separation_plantSeparationEfficiency_vidrio',
    // RSU System - Economics
    'rsuSystem_economics_collectionCost',
    'rsuSystem_economics_transferStationCost',
    'rsuSystem_economics_finalTransportCost',
    'rsuSystem_economics_disposalCost',
    'rsuSystem_economics_income_pet',
    'rsuSystem_economics_income_aluminio',
    'rsuSystem_economics_income_carton',
    'rsuSystem_economics_income_vidrio',
    // RSU System - Leaks
    'rsuSystem_leaks_collectionLeak',
    'rsuSystem_leaks_transferStationLeak',
    'rsuSystem_leaks_finalTransportLeak',
    'rsuSystem_leaks_disposalLeak',
    // Special Waste Generation
    'specialWasteGeneration_sargassumHigh',
    'specialWasteGeneration_sargassumLow',
    'specialWasteGeneration_construction',
    // Sargassum Management
    'sargassumManagement_collectionCost',
    'sargassumManagement_disposalCost',
    // RCD Management
    'rcdManagement_collectionCost',
    'rcdManagement_disposalCost',
    // RSU System - Initial Inventory
    'rsuSystem_initialInventory_collectionVehicles',
    'rsuSystem_initialInventory_transferStation',
    'rsuSystem_initialInventory_finalTransportVehicles',
    'rsuSystem_initialInventory_disposalSite',
    // RSU System - Valorization
    'rsuSystem_valorization_enableComposting',
    'rsuSystem_valorization_compostingEfficiency',
    'rsuSystem_valorization_compostingCost',
    'rsuSystem_valorization_compostIncome',
    'rsuSystem_valorization_enableBiogas',
    'rsuSystem_valorization_biogasEfficiency',
    'rsuSystem_valorization_biogasCost',
    'rsuSystem_valorization_biogasIncome',
    'rsuSystem_valorization_enablePlasticPyrolysis',
    'rsuSystem_valorization_pyrolysisEfficiency',
    'rsuSystem_valorization_pyrolysisCost',
    'rsuSystem_valorization_pyrolysisIncome',
    // Separation Scenarios
    'separationScenarios_enableEnhancedSeparation',
    'separationScenarios_educationProgram_enableEducation',
    'separationScenarios_educationProgram_educationImpactHotels',
    'separationScenarios_educationProgram_educationImpactRestaurants',
    'separationScenarios_educationProgram_educationImpactHomes',
    'separationScenarios_educationProgram_educationImpactCommerce',
    'separationScenarios_educationProgram_educationCostPerCapita',
    'separationScenarios_incentiveProgram_enableIncentives',
    'separationScenarios_incentiveProgram_incentiveImpactHotels',
    'separationScenarios_incentiveProgram_incentiveImpactRestaurants',
    'separationScenarios_incentiveProgram_incentiveImpactHomes',
    'separationScenarios_incentiveProgram_incentiveImpactCommerce',
    'separationScenarios_incentiveProgram_incentiveCostPerTon',
    'separationScenarios_containerProgram_enableContainers',
    'separationScenarios_containerProgram_containerImpactHotels',
    'separationScenarios_containerProgram_containerImpactRestaurants',
    'separationScenarios_containerProgram_containerImpactHomes',
    'separationScenarios_containerProgram_containerImpactCommerce',
    'separationScenarios_containerProgram_containerCostPerUnit'
  ];

  // Convert scenarios to CSV rows
  const rows = scenarios.map(scenario => {
    const inputs = scenario.inputs;
    return [
      `"${scenario.name}"`,
      `"${scenario.description || ''}"`,
      scenario.created_at,
      // General
      inputs.general.fixedPopulation,
      inputs.general.highSeasonOccupancy,
      inputs.general.lowSeasonOccupancy,
      // Generation - Hotels
      inputs.generation.hotels.units,
      inputs.generation.hotels.rate,
      inputs.generation.hotels.sourceSeparationRate,
      // Generation - Restaurants
      inputs.generation.restaurants.units,
      inputs.generation.restaurants.rate,
      inputs.generation.restaurants.sourceSeparationRate,
      // Generation - Homes
      inputs.generation.homes.rate,
      inputs.generation.homes.sourceSeparationRate,
      // Generation - Commerce
      inputs.generation.commerce.units,
      inputs.generation.commerce.rate,
      inputs.generation.commerce.sourceSeparationRate,
      // Composition - Hotels
      inputs.composition.hotels.organicos,
      inputs.composition.hotels.pet,
      inputs.composition.hotels.aluminio,
      inputs.composition.hotels.carton,
      inputs.composition.hotels.vidrio,
      inputs.composition.hotels.rechazo,
      inputs.composition.hotels.peligrosos,
      // Composition - Restaurants
      inputs.composition.restaurants.organicos,
      inputs.composition.restaurants.pet,
      inputs.composition.restaurants.aluminio,
      inputs.composition.restaurants.carton,
      inputs.composition.restaurants.vidrio,
      inputs.composition.restaurants.rechazo,
      inputs.composition.restaurants.peligrosos,
      // Composition - Homes
      inputs.composition.homes.organicos,
      inputs.composition.homes.pet,
      inputs.composition.homes.aluminio,
      inputs.composition.homes.carton,
      inputs.composition.homes.vidrio,
      inputs.composition.homes.rechazo,
      inputs.composition.homes.peligrosos,
      // Composition - Commerce
      inputs.composition.commerce.organicos,
      inputs.composition.commerce.pet,
      inputs.composition.commerce.aluminio,
      inputs.composition.commerce.carton,
      inputs.composition.commerce.vidrio,
      inputs.composition.commerce.rechazo,
      inputs.composition.commerce.peligrosos,
      // RSU System - Logistics
      inputs.rsuSystem.logistics.vehicles,
      inputs.rsuSystem.logistics.vehicleCapacity,
      inputs.rsuSystem.logistics.tripsPerVehicle,
      // RSU System - Processing
      inputs.rsuSystem.processing.transferStationRate,
      inputs.rsuSystem.processing.transferStationCapacity,
      inputs.rsuSystem.processing.finalTransportCapacity,
      // RSU System - Separation
      inputs.rsuSystem.separation.differentiatedCaptureRate,
      inputs.rsuSystem.separation.rejectionRateSource,
      inputs.rsuSystem.separation.informalRecoveryRateCollection,
      inputs.rsuSystem.separation.informalRecoveryRateDisposal,
      inputs.rsuSystem.separation.plantSeparationEfficiency.pet,
      inputs.rsuSystem.separation.plantSeparationEfficiency.aluminio,
      inputs.rsuSystem.separation.plantSeparationEfficiency.carton,
      inputs.rsuSystem.separation.plantSeparationEfficiency.vidrio,
      // RSU System - Economics
      inputs.rsuSystem.economics.collectionCost,
      inputs.rsuSystem.economics.transferStationCost,
      inputs.rsuSystem.economics.finalTransportCost,
      inputs.rsuSystem.economics.disposalCost,
      inputs.rsuSystem.economics.income.pet,
      inputs.rsuSystem.economics.income.aluminio,
      inputs.rsuSystem.economics.income.carton,
      inputs.rsuSystem.economics.income.vidrio,
      // RSU System - Leaks
      inputs.rsuSystem.leaks.collectionLeak,
      inputs.rsuSystem.leaks.transferStationLeak,
      inputs.rsuSystem.leaks.finalTransportLeak,
      inputs.rsuSystem.leaks.disposalLeak,
      // Special Waste Generation
      inputs.specialWasteGeneration.sargassumHigh,
      inputs.specialWasteGeneration.sargassumLow,
      inputs.specialWasteGeneration.construction,
      // Sargassum Management
      inputs.sargassumManagement.collectionCost,
      inputs.sargassumManagement.disposalCost,
      // RCD Management
      inputs.rcdManagement.collectionCost,
      inputs.rcdManagement.disposalCost,
      // RSU System - Initial Inventory
      inputs.rsuSystem.initialInventory?.collectionVehicles || 0,
      inputs.rsuSystem.initialInventory?.transferStation || 0,
      inputs.rsuSystem.initialInventory?.finalTransportVehicles || 0,
      inputs.rsuSystem.initialInventory?.disposalSite || 0,
      // RSU System - Valorization
      inputs.rsuSystem.valorization?.enableComposting || false,
      inputs.rsuSystem.valorization?.compostingEfficiency || 0,
      inputs.rsuSystem.valorization?.compostingCost || 0,
      inputs.rsuSystem.valorization?.compostIncome || 0,
      inputs.rsuSystem.valorization?.enableBiogas || false,
      inputs.rsuSystem.valorization?.biogasEfficiency || 0,
      inputs.rsuSystem.valorization?.biogasCost || 0,
      inputs.rsuSystem.valorization?.biogasIncome || 0,
      inputs.rsuSystem.valorization?.enablePlasticPyrolysis || false,
      inputs.rsuSystem.valorization?.pyrolysisEfficiency || 0,
      inputs.rsuSystem.valorization?.pyrolysisCost || 0,
      inputs.rsuSystem.valorization?.pyrolysisIncome || 0,
      // Separation Scenarios
      inputs.separationScenarios?.enableEnhancedSeparation || false,
      inputs.separationScenarios?.educationProgram?.enableEducation || false,
      inputs.separationScenarios?.educationProgram?.educationImpactHotels || 0,
      inputs.separationScenarios?.educationProgram?.educationImpactRestaurants || 0,
      inputs.separationScenarios?.educationProgram?.educationImpactHomes || 0,
      inputs.separationScenarios?.educationProgram?.educationImpactCommerce || 0,
      inputs.separationScenarios?.educationProgram?.educationCostPerCapita || 0,
      inputs.separationScenarios?.incentiveProgram?.enableIncentives || false,
      inputs.separationScenarios?.incentiveProgram?.incentiveImpactHotels || 0,
      inputs.separationScenarios?.incentiveProgram?.incentiveImpactRestaurants || 0,
      inputs.separationScenarios?.incentiveProgram?.incentiveImpactHomes || 0,
      inputs.separationScenarios?.incentiveProgram?.incentiveImpactCommerce || 0,
      inputs.separationScenarios?.incentiveProgram?.incentiveCostPerTon || 0,
      inputs.separationScenarios?.containerProgram?.enableContainers || false,
      inputs.separationScenarios?.containerProgram?.containerImpactHotels || 0,
      inputs.separationScenarios?.containerProgram?.containerImpactRestaurants || 0,
      inputs.separationScenarios?.containerProgram?.containerImpactHomes || 0,
      inputs.separationScenarios?.containerProgram?.containerImpactCommerce || 0,
      inputs.separationScenarios?.containerProgram?.containerCostPerUnit || 0
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');
  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCalculationsToCSV = (kpis: any, inputs: any, season: string) => {
  const rsuKpis = kpis.rsu;
  const data = rsuKpis.calculations;
  const rsuInputs = inputs.rsuSystem;

  // Access generation by source
  const genBySource = rsuKpis.genBySource || data.genBySource || {
    hotels: 0,
    restaurants: 0,
    homes: 0,
    commerce: 0
  };

  // Create the calculations data array
  const calculationsData = [
    // Header information
    ['Tabla de Cálculos Detallados', season, '', ''],
    ['Concepto', 'Valor', 'Unidad', 'Inputs y Desglose del Cálculo'],
    ['', '', '', ''],
    
    // GENERACIÓN
    ['ETAPA 1: GENERACIÓN DE RSU', '', '', ''],
    ['Generación Total de RSU', rsuKpis.totalGeneration.toFixed(2), 'ton/día', 'Suma de todas las fuentes'],
    ['  Generado por Hoteles', genBySource.hotels.toFixed(2), 'ton/día', `${inputs.generation.hotels.units} cuartos × ${season === 'Temporada Alta' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy}% ocup. × ${inputs.generation.hotels.rate} kg/cuarto/día ÷ 1000`],
    ['  Generado por Restaurantes', genBySource.restaurants.toFixed(2), 'ton/día', `${inputs.generation.restaurants.units} locales × ${inputs.generation.restaurants.rate} kg/local/día ÷ 1000`],
    ['  Generado por Hogares', genBySource.homes.toFixed(2), 'ton/día', `${inputs.general.fixedPopulation} hab. × ${inputs.generation.homes.rate} kg/hab/día ÷ 1000`],
    ['  Generado por Comercios', genBySource.commerce.toFixed(2), 'ton/día', `${inputs.generation.commerce.units} locales × ${inputs.generation.commerce.rate} kg/local/día ÷ 1000`],
    ['', '', '', ''],
    
    // RECOLECCIÓN
    ['ETAPA 2: RECOLECCIÓN Y LOGÍSTICA PRIMARIA', '', '', ''],
    ['Capacidad de Recolección', data.collectionCapacity.toFixed(2), 'ton/día', `${rsuInputs.logistics.vehicles} veh. × ${rsuInputs.logistics.vehicleCapacity} ton × ${rsuInputs.logistics.tripsPerVehicle} viajes`],
    ['Déficit de Recolección (Fuga)', rsuKpis.collectionDeficit.toFixed(2), 'ton/día', 'MAX(0, Generación RSU - Capacidad)'],
    ['Total Recolectado', data.collectedWasteTotal.toFixed(2), 'ton/día', 'Generación RSU - Déficit'],
    ['  Recuperación Informal (en ruta)', data.informalRecoveryCollection.toFixed(2), 'ton/día', `Total Recolectado × ${rsuInputs.separation.informalRecoveryRateCollection}%`],
    ['  Fuga en Recolección (derrame)', data.leakCollection.toFixed(2), 'ton/día', `(Recolectado - Rec. Informal) × ${rsuInputs.leaks.collectionLeak}%`],
    ['Entrada a Sitio de Transferencia', data.toTransferStationTotal.toFixed(2), 'ton/día', 'Recolectado - Rec. Informal - Fuga'],
    ['', '', '', ''],
    
    // PROCESAMIENTO
    ['ETAPA 3: SITIO DE TRANSFERENCIA Y VALORIZACIÓN', '', '', ''],
    ['Tasa de Procesamiento de la Planta', rsuInputs.processing.transferStationRate.toFixed(2), 'ton/día', 'Input: Capacidad de la maquinaria'],
    ['Material Procesado (Promedio diario)', data.materialProcessedToday.toFixed(2), 'ton/día', 'MIN(Material Disponible, Tasa de Proc.)'],
    ['Inventario Acumulado (Día 30)', rsuKpis.finalInventory.toFixed(2), 'ton', 'Acumulación diaria limitada por capacidad'],
    ['Recuperación Formal Total', data.totalRecoveredAtStation.toFixed(2), 'ton/día', 'Suma de Alta y Baja Calidad'],
    ['    Recuperado Alta Calidad (Origen)', rsuKpis.recoveryByStage.source.toFixed(2), 'ton/día', ''],
    ['    Recuperado Baja Calidad (Planta)', rsuKpis.recoveryByStage.plant.toFixed(2), 'ton/día', ''],
    ['  Fuga en Planta (pérdida de proceso)', data.leakTransferStation.toFixed(2), 'ton/día', `Material Procesado × ${rsuInputs.leaks.transferStationLeak}%`],
    ['Material para Traslado Final', data.toFinalTransport.toFixed(2), 'ton/día', 'Procesado - Recuperado - Fuga'],
    ['', '', '', ''],
    
    // DISPOSICIÓN FINAL
    ['ETAPA 4: TRASLADO Y DISPOSICIÓN FINAL', '', '', ''],
    ['Capacidad de Traslado Final', rsuInputs.processing.finalTransportCapacity.toFixed(2), 'ton/día', 'Input: Capacidad de camiones de carga'],
    ['Material Efectivamente Trasladado', data.actualFinalTransport.toFixed(2), 'ton/día', 'MIN(Material para Traslado, Capacidad)'],
    ['  Material No Trasladado (acum. en planta)', data.untransportedMaterial.toFixed(2), 'ton/día', 'Material para Traslado - Trasladado'],
    ['  Fuga en Traslado Final', data.leakFinalTransport.toFixed(2), 'ton/día', `Trasladado × ${rsuInputs.leaks.finalTransportLeak}%`],
    ['Entrada a Disposición Final', data.toDisposalSite.toFixed(2), 'ton/día', 'Trasladado - Fuga en Traslado'],
    ['  Recuperación Informal (en sitio)', data.informalRecoveryDisposal.toFixed(2), 'ton/día', `Entrada a Disp. × % Valorizables × ${rsuInputs.separation.informalRecoveryRateDisposal}%`],
    ['  Fuga en Disposición Final', data.leakDisposal.toFixed(2), 'ton/día', `Entrada a Disp. × ${rsuInputs.leaks.disposalLeak}%`],
    ['Residuo Final Enterrado', rsuKpis.toDisposal.toFixed(2), 'ton/día', 'Entrada a Disp. - Rec. Informal - Fuga'],
    ['', '', '', ''],
    
    // FINANZAS
    ['ANÁLISIS FINANCIERO (SOLO RSU)', '', '', ''],
    ['Ingresos Totales por Venta', rsuKpis.totalRsuIncome.toFixed(2), 'MXN/día', 'Suma de venta de materiales'],
    ['Costos Totales de Operación', rsuKpis.totalRsuCosts.toFixed(2), 'MXN/día', 'Suma de costos de todas las etapas'],
    ['  Costo de Recolección', data.totalCollectionCost.toFixed(2), 'MXN/día', `Total Recolectado × ${rsuInputs.economics.collectionCost} MXN/ton`],
    ['  Costo de Transferencia', data.totalTransferCost.toFixed(2), 'MXN/día', `Material Procesado × ${rsuInputs.economics.transferStationCost} MXN/ton`],
    ['  Costo de Traslado Final', data.totalFinalTransportCost.toFixed(2), 'MXN/día', `Material Trasladado × ${rsuInputs.economics.finalTransportCost} MXN/ton`],
    ['  Costo de Disposición Final', data.totalDisposalCost.toFixed(2), 'MXN/día', `Entrada a Disp. × ${rsuInputs.economics.disposalCost} MXN/ton`],
    ['Costo Neto del Sistema RSU', rsuKpis.netCostPerDay.toFixed(2), 'MXN/día', 'Costos Totales - Ingresos Totales']
  ];

  // Convert to CSV format
  const csvContent = calculationsData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  return csvContent;
};

// Enhanced CSV export for thesis - detailed comparison analysis
export const exportComparisonAnalysisToCSV = (scenarioResults: any[], season: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const seasonLabel = season === 'high' ? 'Temporada Alta' : 'Temporada Baja';
  
  // Document metadata section
  let csvContent = '# ANÁLISIS COMPARATIVO DE ESCENARIOS - SISTEMA DE GESTIÓN DE RESIDUOS SÓLIDOS\n';
  csvContent += `# Isla Holbox, Quintana Roo, México\n`;
  csvContent += `# Temporada: ${seasonLabel}\n`;
  csvContent += `# Fecha de Exportación: ${timestamp}\n`;
  csvContent += `# Número de Escenarios: ${scenarioResults.length}\n\n`;
  
  // Scenario overview section
  csvContent += 'RESUMEN DE ESCENARIOS\n';
  csvContent += 'ID,Nombre,Descripción\n';
  scenarioResults.forEach((scenario, index) => {
    csvContent += `E${index + 1},"${scenario.name}","${scenario.description || 'Sin descripción'}"\n`;
  });
  csvContent += '\n';

  // Detailed technical analysis section
  csvContent += 'ANÁLISIS TÉCNICO DETALLADO\n';
  csvContent += 'Categoría,Subcategoría,Concepto,';
  csvContent += scenarioResults.map((s, i) => `E${i + 1}_${s.name.replace(/[,\s]/g, '_')}`).join(',');
  csvContent += ',Unidad,Fórmula/Cálculo,Notas\n';

  // Helper function to add metric rows
  const addMetricRow = (category: string, subcategory: string, concept: string, values: number[], unit: string, formula: string = '', notes: string = '') => {
    csvContent += `"${category}","${subcategory}","${concept}",`;
    csvContent += values.map(v => formatNumber(v, 4)).join(',');
    csvContent += `,"${unit}","${formula}","${notes}"\n`;
  };

  // GENERATION ANALYSIS
  scenarioResults.forEach((scenario, index) => {
    const kpis = season === 'high' ? scenario.results.high : scenario.results.low;
    const data = kpis.rsu.calculations;
    const genBySource = kpis.rsu.genBySource || data.genBySource || { hotels: 0, restaurants: 0, homes: 0, commerce: 0 };
    
    if (index === 0) {
      // Generation metrics
      addMetricRow('Generación', 'Total', 'Generación Total de RSU', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.totalGeneration),
        'ton/día', 'Suma de todas las fuentes de generación', 'Baseline para dimensionamiento del sistema');
        
      addMetricRow('Generación', 'Por Fuente', 'Hoteles', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const genBySource = kpis.rsu.genBySource || kpis.rsu.calculations.genBySource || { hotels: 0 };
          return genBySource.hotels;
        }),
        'ton/día', 'Unidades × Ocupación × Tasa × Factor Conversión', 'Variable por temporada turística');
        
      addMetricRow('Generación', 'Por Fuente', 'Restaurantes', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const genBySource = kpis.rsu.genBySource || kpis.rsu.calculations.genBySource || { restaurants: 0 };
          return genBySource.restaurants;
        }),
        'ton/día', 'Establecimientos × Tasa Generación', 'Relativamente constante entre temporadas');
        
      addMetricRow('Generación', 'Por Fuente', 'Hogares', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const genBySource = kpis.rsu.genBySource || kpis.rsu.calculations.genBySource || { homes: 0 };
          return genBySource.homes;
        }),
        'ton/día', 'Población Fija × Tasa per Cápita', 'Base poblacional permanente');
        
      addMetricRow('Generación', 'Por Fuente', 'Comercios', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const genBySource = kpis.rsu.genBySource || kpis.rsu.calculations.genBySource || { commerce: 0 };
          return genBySource.commerce;
        }),
        'ton/día', 'Locales Comerciales × Tasa Generación', 'Incluye pequeño comercio local');

      // Collection and logistics metrics
      addMetricRow('Recolección', 'Capacidad', 'Capacidad Total de Recolección', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.calculations.collectionCapacity),
        'ton/día', 'Vehículos × Capacidad × Viajes por Día', 'Limitante operacional crítico');
        
      addMetricRow('Recolección', 'Déficit', 'Déficit de Recolección', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.collectionDeficit),
        'ton/día', 'MAX(0, Generación - Capacidad)', 'Indicador de saturación del sistema');
        
      addMetricRow('Recolección', 'Eficiencia', 'Porcentaje de Cobertura', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const coverage = ((kpis.rsu.totalGeneration - kpis.rsu.collectionDeficit) / kpis.rsu.totalGeneration) * 100;
          return coverage;
        }),
        '%', '(Generación - Déficit) / Generación × 100', 'KPI de cobertura del servicio');

      // Processing metrics
      addMetricRow('Procesamiento', 'Capacidad', 'Tasa de Procesamiento Diaria', 
        scenarioResults.map(s => s.inputs.rsuSystem.processing.transferStationRate),
        'ton/día', 'Capacidad de Maquinaria/Equipos', 'Parámetro de diseño de la planta');
        
      addMetricRow('Procesamiento', 'Inventario', 'Inventario Acumulado (Día 30)', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.finalInventory),
        'ton', 'Acumulación diaria limitada por capacidad', 'Indicador de saturación de la planta');
        
      addMetricRow('Procesamiento', 'Valorización', 'Recuperación en Origen (Alta Calidad)', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.recoveryByStage.source),
        'ton/día', 'Material Separado × Eficiencia × Tasa Captura', 'Material de mayor valor comercial');
        
      addMetricRow('Procesamiento', 'Valorización', 'Recuperación en Planta (Baja Calidad)', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.recoveryByStage.plant),
        'ton/día', 'Material Procesado × Eficiencia Separación', 'Material contaminado pero recuperable');
        
      addMetricRow('Procesamiento', 'Valorización', 'Recuperación Informal Total', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.recoveryByStage.informal),
        'ton/día', 'Rec. en Recolección + Rec. en Disposición', 'Sector informal organizado');

      // Environmental impact metrics
      addMetricRow('Impacto Ambiental', 'Fugas', 'Fuga Total del Sistema', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.totalLeak),
        'ton/día', 'Suma de todas las fugas por etapa', 'Impacto ambiental directo');
        
      addMetricRow('Impacto Ambiental', 'Disposición', 'Residuo a Disposición Final', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.toDisposal),
        'ton/día', 'Material Final - Recuperación - Fugas', 'Carga al relleno sanitario');
        
      addMetricRow('Impacto Ambiental', 'Desviación', 'Tasa de Desviación de Relleno', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const totalRecovery = kpis.rsu.recoveryByStage.source + kpis.rsu.recoveryByStage.plant + kpis.rsu.recoveryByStage.informal;
          const diversionRate = (totalRecovery / kpis.rsu.totalGeneration) * 100;
          return diversionRate;
        }),
        '%', 'Recuperación Total / Generación Total × 100', 'Meta de sostenibilidad ambiental');

      // Economic analysis
      addMetricRow('Análisis Económico', 'Costos', 'Costo Total del Sistema', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).totalSystemCost),
        'MXN/día', 'Suma de costos RSU + Sargazo + RCD', 'Costo operacional total');
        
      addMetricRow('Análisis Económico', 'Costos', 'Costo Sistema RSU', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.totalRsuCosts),
        'MXN/día', 'Recolección + Transferencia + Transporte + Disposición', 'Componente principal del costo');
        
      addMetricRow('Análisis Económico', 'Ingresos', 'Ingresos por Venta de Materiales', 
        scenarioResults.map(s => (season === 'high' ? s.results.high : s.results.low).rsu.totalRsuIncome),
        'MXN/día', 'Suma de ingresos por material recuperado', 'Potencial de autofinanciamiento');
        
      addMetricRow('Análisis Económico', 'Eficiencia', 'Costo Neto por Tonelada', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const netCostPerTon = kpis.rsu.netCostPerDay / kpis.rsu.totalGeneration;
          return netCostPerTon;
        }),
        'MXN/ton', 'Costo Neto del Sistema / Generación Total', 'Indicador de eficiencia económica');
        
      addMetricRow('Análisis Económico', 'Sostenibilidad', 'Ratio Autofinanciamiento', 
        scenarioResults.map(s => {
          const kpis = season === 'high' ? s.results.high : s.results.low;
          const selfFinancingRatio = (kpis.rsu.totalRsuIncome / kpis.rsu.totalRsuCosts) * 100;
          return selfFinancingRatio;
        }),
        '%', 'Ingresos / Costos × 100', 'Capacidad de sostenibilidad financiera');
    }
  });

  // Special waste analysis section
  csvContent += '\nANÁLISIS DE RESIDUOS ESPECIALES\n';
  csvContent += 'Tipo,Concepto,';
  csvContent += scenarioResults.map((s, i) => `E${i + 1}_${s.name.replace(/[,\s]/g, '_')}`).join(',');
  csvContent += ',Unidad,Observaciones\n';
  
  // Sargassum analysis
  const sargassumGeneration = season === 'high' ? 'sargassumHigh' : 'sargassumLow';
  csvContent += `"Sargazo","Generación","Generación Sargazo",`;
  csvContent += scenarioResults.map(s => formatNumber(s.inputs.specialWasteGeneration[sargassumGeneration], 2)).join(',');
  csvContent += `,"ton/día","Variable estacional crítica para Holbox"\n`;
    
  csvContent += `"Sargazo","Costo","Costo de Gestión",`;
  csvContent += scenarioResults.map(s => formatNumber((season === 'high' ? s.results.high : s.results.low).sargassumCost, 2)).join(',');
  csvContent += `,"MXN/día","Desafío específico de ecosistemas costeros"\n`;

  // RCD analysis  
  csvContent += `"RCD","Generación","Generación RCD",`;
  csvContent += scenarioResults.map(s => formatNumber(s.inputs.specialWasteGeneration.construction, 2)).join(',');
  csvContent += `,"ton/día","Residuos de construcción y demolición"\n`;
    
  csvContent += `"RCD","Costo","Costo de Gestión",`;
  csvContent += scenarioResults.map(s => formatNumber((season === 'high' ? s.results.high : s.results.low).rcdCost, 2)).join(',');
  csvContent += `,"MXN/día","Gestión especializada requerida"\n`;

  // Input parameters comparison section
  csvContent += '\nPARÁMETROS DE ENTRADA - COMPARACIÓN\n';
  csvContent += 'Categoría,Parámetro,';
  csvContent += scenarioResults.map((s, i) => `E${i + 1}_${s.name.replace(/[,\s]/g, '_')}`).join(',');
  csvContent += ',Unidad,Descripción\n';
  
  // Key input parameters for thesis analysis
  const inputParams = [
    ['Población', 'Población Fija', scenarioResults.map(s => s.inputs.general.fixedPopulation), 'habitantes', 'Base poblacional permanente'],
    ['Turismo', 'Ocupación Temporada Alta', scenarioResults.map(s => s.inputs.general.highSeasonOccupancy), '%', 'Factor de variabilidad estacional'],
    ['Turismo', 'Ocupación Temporada Baja', scenarioResults.map(s => s.inputs.general.lowSeasonOccupancy), '%', 'Nivel base de ocupación'],
    ['Infraestructura', 'Cuartos de Hotel', scenarioResults.map(s => s.inputs.generation.hotels.units), 'cuartos', 'Capacidad hotelera total'],
    ['Infraestructura', 'Establecimientos Gastronómicos', scenarioResults.map(s => s.inputs.generation.restaurants.units), 'locales', 'Infraestructura gastronómica'],
    ['Logística', 'Vehículos de Recolección', scenarioResults.map(s => s.inputs.rsuSystem.logistics.vehicles), 'vehículos', 'Flota de recolección disponible'],
    ['Logística', 'Capacidad por Vehículo', scenarioResults.map(s => s.inputs.rsuSystem.logistics.vehicleCapacity), 'ton', 'Capacidad de carga unitaria'],
    ['Procesamiento', 'Capacidad de Planta', scenarioResults.map(s => s.inputs.rsuSystem.processing.transferStationRate), 'ton/día', 'Capacidad de procesamiento diario'],
    ['Valorización', 'Eficiencia Separación PET', scenarioResults.map(s => s.inputs.rsuSystem.separation.plantSeparationEfficiency.pet), '%', 'Eficiencia de recuperación PET'],
    ['Valorización', 'Eficiencia Separación Aluminio', scenarioResults.map(s => s.inputs.rsuSystem.separation.plantSeparationEfficiency.aluminio), '%', 'Eficiencia de recuperación aluminio']
  ];
  
  inputParams.forEach(([category, param, values, unit, description]) => {
    csvContent += `"${category}","${param}",`;
    csvContent += (values as number[]).map(v => formatNumber(v, 2)).join(',');
    csvContent += `,"${unit}","${description}"\n`;
  });

  // Performance indicators summary
  csvContent += '\nINDICADORES DE DESEMPEÑO - RESUMEN EJECUTIVO\n';
  csvContent += 'KPI,';
  csvContent += scenarioResults.map((s, i) => `E${i + 1}_${s.name.replace(/[,\s]/g, '_')}`).join(',');
  csvContent += ',Unidad,Meta/Benchmark,Evaluación\n';
  
  // Key performance indicators for decision making
  const kpis = [
    ['Cobertura de Recolección', scenarioResults.map(s => {
      const kpis = season === 'high' ? s.results.high : s.results.low;
      return ((kpis.rsu.totalGeneration - kpis.rsu.collectionDeficit) / kpis.rsu.totalGeneration) * 100;
    }), '%', '>95%', 'Cobertura universal del servicio'],
    ['Tasa de Desviación de Relleno', scenarioResults.map(s => {
      const kpis = season === 'high' ? s.results.high : s.results.low;
      const totalRecovery = kpis.rsu.recoveryByStage.source + kpis.rsu.recoveryByStage.plant + kpis.rsu.recoveryByStage.informal;
      return (totalRecovery / kpis.rsu.totalGeneration) * 100;
    }), '%', '>30%', 'Meta de aprovechamiento de residuos'],
    ['Eficiencia Económica', scenarioResults.map(s => {
      const kpis = season === 'high' ? s.results.high : s.results.low;
      return kpis.rsu.netCostPerDay / kpis.rsu.totalGeneration;
    }), 'MXN/ton', '<500', 'Costo competitivo de gestión'],
    ['Autofinanciamiento', scenarioResults.map(s => {
      const kpis = season === 'high' ? s.results.high : s.results.low;
      return (kpis.rsu.totalRsuIncome / kpis.rsu.totalRsuCosts) * 100;
    }), '%', '>20%', 'Sostenibilidad financiera parcial']
  ];
  
  kpis.forEach(([indicator, values, unit, target, evaluation]) => {
    csvContent += `"${indicator}",`;
    csvContent += (values as number[]).map(v => formatNumber(v, 2)).join(',');
    csvContent += `,"${unit}","${target}","${evaluation}"\n`;
  });

  // Metadata footer
  csvContent += '\n# METADATOS DEL ANÁLISIS\n';
  csvContent += `# Software: Simulador de Gestión de Residuos - Isla Holbox\n`;
  csvContent += `# Versión: 2.0.0 - Thesis Enhanced\n`;
  csvContent += `# Modelo: 30 días de simulación, promedios de últimos 7 días\n`;
  csvContent += `# Metodología: Análisis de flujo de materiales (MFA)\n`;
  csvContent += `# Alcance: Sistema integral RSU + Residuos especiales\n`;
  csvContent += `# Autor: [Nombre del Tesista]\n`;
  csvContent += `# Institución: [Universidad]\n`;
  csvContent += `# Fecha: ${timestamp}\n`;

  return csvContent;
};

export const parseCSVToScenarios = (csvContent: string): any[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',');
  const scenarios: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
    }

    const scenario: any = {
      name: values[0].replace(/"/g, ''),
      description: values[1].replace(/"/g, ''),
      inputs: {
        general: {
          fixedPopulation: parseFloat(values[3]) || 0,
          highSeasonOccupancy: parseFloat(values[4]) || 0,
          lowSeasonOccupancy: parseFloat(values[5]) || 0
        },
        generation: {
          hotels: {
            units: parseFloat(values[6]) || 0,
            rate: parseFloat(values[7]) || 0,
            sourceSeparationRate: parseFloat(values[8]) || 0
          },
          restaurants: {
            units: parseFloat(values[9]) || 0,
            rate: parseFloat(values[10]) || 0,
            sourceSeparationRate: parseFloat(values[11]) || 0
          },
          homes: {
            rate: parseFloat(values[12]) || 0,
            sourceSeparationRate: parseFloat(values[13]) || 0
          },
          commerce: {
            units: parseFloat(values[14]) || 0,
            rate: parseFloat(values[15]) || 0,
            sourceSeparationRate: parseFloat(values[16]) || 0
          }
        },
        composition: {
          hotels: {
            organicos: parseFloat(values[17]) || 0,
            pet: parseFloat(values[18]) || 0,
            aluminio: parseFloat(values[19]) || 0,
            carton: parseFloat(values[20]) || 0,
            vidrio: parseFloat(values[21]) || 0,
            rechazo: parseFloat(values[22]) || 0,
            peligrosos: parseFloat(values[23]) || 0
          },
          restaurants: {
            organicos: parseFloat(values[24]) || 0,
            pet: parseFloat(values[25]) || 0,
            aluminio: parseFloat(values[26]) || 0,
            carton: parseFloat(values[27]) || 0,
            vidrio: parseFloat(values[28]) || 0,
            rechazo: parseFloat(values[29]) || 0,
            peligrosos: parseFloat(values[30]) || 0
          },
          homes: {
            organicos: parseFloat(values[31]) || 0,
            pet: parseFloat(values[32]) || 0,
            aluminio: parseFloat(values[33]) || 0,
            carton: parseFloat(values[34]) || 0,
            vidrio: parseFloat(values[35]) || 0,
            rechazo: parseFloat(values[36]) || 0,
            peligrosos: parseFloat(values[37]) || 0
          },
          commerce: {
            organicos: parseFloat(values[38]) || 0,
            pet: parseFloat(values[39]) || 0,
            aluminio: parseFloat(values[40]) || 0,
            carton: parseFloat(values[41]) || 0,
            vidrio: parseFloat(values[42]) || 0,
            rechazo: parseFloat(values[43]) || 0,
            peligrosos: parseFloat(values[44]) || 0
          }
        },
        rsuSystem: {
          logistics: {
            vehicles: parseFloat(values[45]) || 0,
            vehicleCapacity: parseFloat(values[46]) || 0,
            tripsPerVehicle: parseFloat(values[47]) || 0
          },
          processing: {
            transferStationRate: parseFloat(values[48]) || 0,
            transferStationCapacity: parseFloat(values[49]) || 0,
            finalTransportCapacity: parseFloat(values[50]) || 0
          },
          separation: {
            differentiatedCaptureRate: parseFloat(values[51]) || 0,
            rejectionRateSource: parseFloat(values[52]) || 0,
            informalRecoveryRateCollection: parseFloat(values[53]) || 0,
            informalRecoveryRateDisposal: parseFloat(values[54]) || 0,
            plantSeparationEfficiency: {
              pet: parseFloat(values[55]) || 0,
              aluminio: parseFloat(values[56]) || 0,
              carton: parseFloat(values[57]) || 0,
              vidrio: parseFloat(values[58]) || 0
            }
          },
          economics: {
            collectionCost: parseFloat(values[59]) || 0,
            transferStationCost: parseFloat(values[60]) || 0,
            finalTransportCost: parseFloat(values[61]) || 0,
            disposalCost: parseFloat(values[62]) || 0,
            income: {
              pet: parseFloat(values[63]) || 0,
              aluminio: parseFloat(values[64]) || 0,
              carton: parseFloat(values[65]) || 0,
              vidrio: parseFloat(values[66]) || 0
            }
          },
          leaks: {
            collectionLeak: parseFloat(values[67]) || 0,
            transferStationLeak: parseFloat(values[68]) || 0,
            finalTransportLeak: parseFloat(values[69]) || 0,
            disposalLeak: parseFloat(values[70]) || 0
          }
        },
        specialWasteGeneration: {
          sargassumHigh: parseFloat(values[71]) || 0,
          sargassumLow: parseFloat(values[72]) || 0,
          construction: parseFloat(values[73]) || 0
        },
        sargassumManagement: {
          collectionCost: parseFloat(values[74]) || 0,
          disposalCost: parseFloat(values[75]) || 0
        },
        rcdManagement: {
          collectionCost: parseFloat(values[76]) || 0,
          disposalCost: parseFloat(values[77]) || 0
        }
      }
    };

    // Add missing fields: Initial Inventory
    scenario.inputs.rsuSystem.initialInventory = {
      collectionVehicles: parseFloat(values[78]) || 0,
      transferStation: parseFloat(values[79]) || 0,
      finalTransportVehicles: parseFloat(values[80]) || 0,
      disposalSite: parseFloat(values[81]) || 0
    };

    // Add missing fields: Valorization
    scenario.inputs.rsuSystem.valorization = {
      enableComposting: values[82] === 'TRUE' || values[82] === 'true' || values[82] === '1',
      compostingEfficiency: parseFloat(values[83]) || 0,
      compostingCost: parseFloat(values[84]) || 0,
      compostIncome: parseFloat(values[85]) || 0,
      enableBiogas: values[86] === 'TRUE' || values[86] === 'true' || values[86] === '1',
      biogasEfficiency: parseFloat(values[87]) || 0,
      biogasCost: parseFloat(values[88]) || 0,
      biogasIncome: parseFloat(values[89]) || 0,
      enablePlasticPyrolysis: values[90] === 'TRUE' || values[90] === 'true' || values[90] === '1',
      pyrolysisEfficiency: parseFloat(values[91]) || 0,
      pyrolysisCost: parseFloat(values[92]) || 0,
      pyrolysisIncome: parseFloat(values[93]) || 0
    };

    // Add missing fields: Separation Scenarios
    scenario.inputs.separationScenarios = {
      enableEnhancedSeparation: values[94] === 'TRUE' || values[94] === 'true' || values[94] === '1',
      educationProgram: {
        enableEducation: values[95] === 'TRUE' || values[95] === 'true' || values[95] === '1',
        educationImpactHotels: parseFloat(values[96]) || 0,
        educationImpactRestaurants: parseFloat(values[97]) || 0,
        educationImpactHomes: parseFloat(values[98]) || 0,
        educationImpactCommerce: parseFloat(values[99]) || 0,
        educationCostPerCapita: parseFloat(values[100]) || 0
      },
      incentiveProgram: {
        enableIncentives: values[101] === 'TRUE' || values[101] === 'true' || values[101] === '1',
        incentiveImpactHotels: parseFloat(values[102]) || 0,
        incentiveImpactRestaurants: parseFloat(values[103]) || 0,
        incentiveImpactHomes: parseFloat(values[104]) || 0,
        incentiveImpactCommerce: parseFloat(values[105]) || 0,
        incentiveCostPerTon: parseFloat(values[106]) || 0
      },
      containerProgram: {
        enableContainers: values[107] === 'TRUE' || values[107] === 'true' || values[107] === '1',
        containerImpactHotels: parseFloat(values[108]) || 0,
        containerImpactRestaurants: parseFloat(values[109]) || 0,
        containerImpactHomes: parseFloat(values[110]) || 0,
        containerImpactCommerce: parseFloat(values[111]) || 0,
        containerCostPerUnit: parseFloat(values[112]) || 0
      }
    };

    scenarios.push(scenario);
  }

  return scenarios;
};

// Helper function to parse CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};
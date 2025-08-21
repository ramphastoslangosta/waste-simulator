# 🔧 Análisis y Corrección: Importación CSV Incompleta

## 🎯 Problema Identificado

La función `parseCSVToScenarios` en `src/utils/csvUtils.ts` está **incompleta** y no mapea varios campos críticos del sistema, causando que los escenarios importados no activen correctamente:

1. **Programas de Valorización** (`valorization`)
2. **Programas de Separación Mejorada** (`separationScenarios`) 
3. **Inventarios Iniciales** (`initialInventory`)

## 📊 Campos Faltantes en CSV Import

### **❌ 1. Valorización (líneas 64-77 en initialState.js)**
```javascript
valorization: {
    enableComposting: false,         // FALTA EN CSV
    compostingEfficiency: 80,        // FALTA EN CSV
    compostingCost: 200,             // FALTA EN CSV
    compostIncome: 500,              // FALTA EN CSV
    enableBiogas: false,             // FALTA EN CSV
    biogasEfficiency: 60,            // FALTA EN CSV
    biogasCost: 300,                 // FALTA EN CSV
    biogasIncome: 800,               // FALTA EN CSV
    enablePlasticPyrolysis: false,   // FALTA EN CSV
    pyrolysisEfficiency: 70,         // FALTA EN CSV
    pyrolysisCost: 400,              // FALTA EN CSV
    pyrolysisIncome: 600,            // FALTA EN CSV
}
```

### **❌ 2. Programas de Separación (líneas 13-39 en initialState.js)**
```javascript
separationScenarios: {
    enableEnhancedSeparation: false, // FALTA EN CSV
    educationProgram: {
        enableEducation: false,          // FALTA EN CSV
        educationImpactHotels: 15,       // FALTA EN CSV
        educationImpactRestaurants: 20,  // FALTA EN CSV
        educationImpactHomes: 25,        // FALTA EN CSV
        educationImpactCommerce: 10,     // FALTA EN CSV
        educationCostPerCapita: 50,      // FALTA EN CSV
    },
    incentiveProgram: {
        enableIncentives: false,         // FALTA EN CSV
        incentiveImpactHotels: 20,       // FALTA EN CSV
        // ... más campos
    },
    containerProgram: {
        enableContainers: false,         // FALTA EN CSV
        // ... más campos
    }
}
```

### **❌ 3. Inventarios Iniciales (líneas 50-55 en initialState.js)**
```javascript
initialInventory: {
    collectionVehicles: 0,           // FALTA EN CSV
    transferStation: 0,              // FALTA EN CSV
    finalTransportVehicles: 0,       // FALTA EN CSV
    disposalSite: 0                  // FALTA EN CSV
}
```

## 🎯 Campos Que SÍ Existen Actualmente

El CSV actual incluye correctamente:
- ✅ `general` (población, ocupación)
- ✅ `generation` (hoteles, restaurantes, hogares, comercio)
- ✅ `composition` (composición de residuos)
- ✅ `rsuSystem.logistics` (vehículos, capacidad)
- ✅ `rsuSystem.processing` (capacidad de planta, transporte)
- ✅ `rsuSystem.separation` (eficiencias de separación)
- ✅ `rsuSystem.economics` (costos e ingresos)
- ✅ `rsuSystem.leaks` (fugas del sistema)
- ✅ `specialWasteGeneration` (sargazo, RCD)
- ✅ `sargassumManagement` y `rcdManagement`

## 🔧 Solución Propuesta

### **Paso 1: Actualizar Headers de Export CSV**
Agregar campos faltantes a `exportScenariosToCSV` en líneas 104-108:

```javascript
// AGREGAR DESPUÉS DE LA LÍNEA 103:
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
```

### **Paso 2: Actualizar Mapeo de Export**
Agregar valores correspondientes al export en las líneas 107-206.

### **Paso 3: Actualizar Parser de Import**
Agregar campos faltantes a `parseCSVToScenarios` después de línea 707:

```javascript
// AGREGAR DESPUÉS DE rcdManagement:
scenario.inputs.rsuSystem.initialInventory = {
    collectionVehicles: parseFloat(values[78]) || 0,
    transferStation: parseFloat(values[79]) || 0,
    finalTransportVehicles: parseFloat(values[80]) || 0,
    disposalSite: parseFloat(values[81]) || 0
};

scenario.inputs.rsuSystem.valorization = {
    enableComposting: values[82] === 'TRUE' || values[82] === 'true',
    compostingEfficiency: parseFloat(values[83]) || 0,
    compostingCost: parseFloat(values[84]) || 0,
    compostIncome: parseFloat(values[85]) || 0,
    enableBiogas: values[86] === 'TRUE' || values[86] === 'true',
    biogasEfficiency: parseFloat(values[87]) || 0,
    biogasCost: parseFloat(values[88]) || 0,
    biogasIncome: parseFloat(values[89]) || 0,
    enablePlasticPyrolysis: values[90] === 'TRUE' || values[90] === 'true',
    pyrolysisEfficiency: parseFloat(values[91]) || 0,
    pyrolysisCost: parseFloat(values[92]) || 0,
    pyrolysisIncome: parseFloat(values[93]) || 0
};

scenario.inputs.separationScenarios = {
    enableEnhancedSeparation: values[94] === 'TRUE' || values[94] === 'true',
    educationProgram: {
        enableEducation: values[95] === 'TRUE' || values[95] === 'true',
        educationImpactHotels: parseFloat(values[96]) || 0,
        educationImpactRestaurants: parseFloat(values[97]) || 0,
        educationImpactHomes: parseFloat(values[98]) || 0,
        educationImpactCommerce: parseFloat(values[99]) || 0,
        educationCostPerCapita: parseFloat(values[100]) || 0
    },
    incentiveProgram: {
        enableIncentives: values[101] === 'TRUE' || values[101] === 'true',
        incentiveImpactHotels: parseFloat(values[102]) || 0,
        incentiveImpactRestaurants: parseFloat(values[103]) || 0,
        incentiveImpactHomes: parseFloat(values[104]) || 0,
        incentiveImpactCommerce: parseFloat(values[105]) || 0,
        incentiveCostPerTon: parseFloat(values[106]) || 0
    },
    containerProgram: {
        enableContainers: values[107] === 'TRUE' || values[107] === 'true',
        containerImpactHotels: parseFloat(values[108]) || 0,
        containerImpactRestaurants: parseFloat(values[109]) || 0,
        containerImpactHomes: parseFloat(values[110]) || 0,
        containerImpactCommerce: parseFloat(values[111]) || 0,
        containerCostPerUnit: parseFloat(values[112]) || 0
    }
};
```

## 📋 Pasos de Implementación

1. **🔧 Corregir csvUtils.ts** - Actualizar export e import functions
2. **📊 Regenerar CSV mejorado** - Con todos los campos necesarios  
3. **🧪 Validar importación** - Comprobar que escenarios se cargan correctamente
4. **✅ Probar activación** - Verificar que valorización y programas se activan
5. **📈 Ejecutar escenarios corregidos** - Obtener resultados válidos

## 🎯 Resultado Esperado

Después de la corrección:
- ✅ Escenarios con valorización se importan correctamente
- ✅ Programas de separación se activan automáticamente 
- ✅ Inventarios iniciales se configuran correctamente
- ✅ Conservación de masa debe pasar en escenarios mejorados
- ✅ Resultados de simulación serán válidos y comparables

¿Procedemos con la implementación de estas correcciones?
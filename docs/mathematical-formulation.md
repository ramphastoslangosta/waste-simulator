# FORMULARIO MATEMÁTICO COMPLETO
## Modelo de Simulación de Gestión de Residuos Sólidos - Isla Holbox

**Referencia:** Anexo B Digital de la Tesina "Gestión Integral de Residuos Sólidos - Isla Holbox"  
**Implementación:** Sistema de simulación React/TypeScript en `/src/simulation/`  
**Fecha:** Septiembre 2024

---

## ÍNDICE

1. [Ecuaciones Fundamentales Críticas](#1-ecuaciones-fundamentales-críticas)
2. [Variables y Parámetros del Sistema](#2-variables-y-parámetros-del-sistema)
3. [Formulación Matemática Detallada](#3-formulación-matemática-detallada)
4. [Modelo Económico Integral](#4-modelo-económico-integral)
5. [Algoritmos de Validación](#5-algoritmos-de-validación)
6. [Implementación Computacional](#6-implementación-computacional)
7. [Pseudocódigo de Módulos Críticos](#7-pseudocódigo-de-módulos-críticos)

---

## 1. ECUACIONES FUNDAMENTALES CRÍTICAS

### **Ecuación (1) - Generación Total [ECUACIÓN MAESTRA]**

$$G_{total}(t) = \sum_{i=1}^{n} (U_i \times R_i \times O_i(t)) \qquad\qquad\qquad (Ec.1)$$

**Descripción:** Ecuación central del modelo que calcula la generación diaria total como suma de todas las fuentes generadoras, ajustada por variaciones estacionales de ocupación turística.

**Variables críticas identificadas por análisis de sensibilidad:**
- $R_{restaurantes} = 46.7$ kg/unidad/día (Rank #3 en impacto sistémico: 11.5%)
- $R_{hoteles} = 2.1$ kg/unidad/día (Rank #5 en impacto sistémico: 5.2%)
- $O_{alta}(t) = 2.8 \times O_{baja}(t)$ (Rank #4 en impacto sistémico: 5.2%)

**Implementación:** `src/simulation/modules/generation.ts` - función `calculateWasteGeneration()`

### **Ecuación (2) - Restricción de Transporte [CUELLO DE BOTELLA CRÍTICO]**

$$Transport_{real}(t) = \min(Demanda_{transport}(t), 9.6 \text{ ton/día}) \qquad\qquad\qquad (Ec.2)$$

**VARIABLE MÁS CRÍTICA DEL SISTEMA:**
- Impacto promedio ponderado: **30.7%** (Rank #1 absoluto)
- Sensibilidad en utilización de capacidad: **80.97%**
- Genera déficit sistémico del **79.6%** en escenario base
- **Esta única restricción domina todo el comportamiento sistémico**

**Implementación:** `src/simulation/modules/collection.ts` - función `processTransportation()`

### **Ecuación (3) - Acumulación Forzada [EFECTO DEL CUELLO DE BOTELLA]**

$$Acumul_{forzada}(t) = \max(0, Demanda_{transport}(t) - 9.6) \qquad\qquad\qquad (Ec.3)$$

**Resultado crítico:** 894.7 toneladas acumuladas en 30 días (escenario base)

**Implementación:** `src/simulation/modules/inventory.ts` - función `updateInventoryLevels()`

### **Ecuación (4) - Balance de Conservación de Masa [VALIDACIÓN FÍSICA]**

$$G_{total} = M_{dispuesto} + M_{recuperado} + M_{valorizado} + F_{total} + D_{recoleccion} + D_{transporte} \qquad\qquad\qquad (Ec.4)$$

**Resultados de validación logrados:**
- Error promedio: **0.005%** ✓
- Error máximo: **0.011%** ✓
- Cumplimiento: **100%** ✓

**Implementación:** `src/test/validation/massConservation.test.js` - validador automático

### **Ecuación (5) - Costo Neto del Sistema [KPI ECONÓMICO PRINCIPAL]**

$$C_{neto}(t) = C_{total}(t) + C_{valoriz}(t) + C_{programas}(t) - I_{materiales}(t) - I_{valoriz}(t) \qquad\qquad\qquad (Ec.5)$$

**Implementación:** `src/simulation/modules/economics.ts` - función `calculateSystemCosts()`

---

## 2. VARIABLES Y PARÁMETROS DEL SISTEMA

### 2.1 Parámetros de Generación Validados Empíricamente

**Tabla 2.1: Tasas de Generación por Sector (Validación SUMA 2022)**

| Variable | Descripción | Valor Validado | Fuente Empírica |
|----------|-------------|----------------|-----------------|
| $R_{hoteles}$ | Tasa hotelera | **2.1 kg/unidad/día** | Estudio SUMA 2022 |
| $R_{restaurantes}$ | Tasa gastronómica | **46.7 kg/unidad/día** | Estudio SUMA 2022 |
| $R_{residencial}$ | Tasa residencial | **1.2 kg/persona/día** | Estudio SUMA 2022 |
| $R_{comercios}$ | Tasa comercial | **8.5 kg/unidad/día** | Estudio SUMA 2022 |

*Fuente: data/holbox-historical-data.csv - Parámetros empíricos del estudio de caracterización SUMA 2022*

### 2.2 Parámetros de Capacidad del Sistema

**Tabla 2.2: Capacidades Críticas del Sistema**

| Variable | Descripción | Valor Crítico | Estatus |
|----------|-------------|---------------|---------|
| $Cap_{transport}$ | Capacidad de transporte final | **9.6 ton/día** | CUELLO DE BOTELLA |
| $Cap_{recolec}$ | Capacidad de recolección | **15.0 ton/día** | Suficiente |
| $Cap_{transferencia}$ | Capacidad de transferencia | **25.0 ton/día** | Suficiente |
| $Cap_{valoriz}$ | Capacidad de valorización | **Variable** | Por escenario |

*Fuente: src/constants/initialState.js - Parámetros de configuración del simulador*

### 2.3 Composición por Material y Fuente

**Tabla 2.3: Matrix de Composición por Material (%)**

| Material | Hoteles | Restaurantes | Hogares | Comercios | Promedio |
|----------|---------|-------------|---------|-----------|----------|
| **Orgánicos** | 46% | 52% | 45% | 35% | 45.5% |
| **PET** | 12% | 8% | 15% | 18% | 13.3% |
| **Aluminio** | 5% | 3% | 4% | 6% | 4.5% |
| **Cartón** | 18% | 25% | 12% | 22% | 19.3% |
| **Vidrio** | 8% | 6% | 9% | 7% | 7.5% |
| **Rechazo** | 10% | 5% | 13% | 11% | 9.8% |
| **Peligrosos** | 1% | 1% | 2% | 1% | 1.3% |

*Fuente: Estudio SUMA 2022, implementado en src/constants/initialState.js*

---

## 3. FORMULACIÓN MATEMÁTICA DETALLADA

### 3.1 Generación de Residuos por Fuente

#### Generación en Hoteles (con Variación Estacional)
$$G_{hoteles}(t) = U_h \cdot \frac{O_{temporada}(t)}{100} \cdot \frac{R_h}{1000} \qquad\qquad\qquad (Ec.3.1)$$

donde $O_{temporada}(t) = \begin{cases} O_{alta} & \text{si es temporada alta} \\ O_{baja} & \text{si es temporada baja} \end{cases}$

#### Generación en Restaurantes (Constante)
$$G_{restaurantes}(t) = U_r \cdot \frac{R_r}{1000} \qquad\qquad\qquad (Ec.3.2)$$

#### Generación en Hogares (Población Fija)
$$G_{hogares}(t) = P_{fijo} \cdot \frac{R_{hogar}}{1000} \qquad\qquad\qquad (Ec.3.3)$$

#### Generación en Comercios
$$G_{comercios}(t) = U_c \cdot \frac{R_c}{1000} \qquad\qquad\qquad (Ec.3.4)$$

#### Generación Total Integrada
$$G_{total}(t) = G_{hoteles}(t) + G_{restaurantes}(t) + G_{hogares}(t) + G_{comercios}(t) \qquad\qquad\qquad (Ec.3.5)$$

### 3.2 Generación por Tipo de Material

$$G_{i}(t) = \sum_{j \in \{hoteles,restaurantes,hogares,comercios\}} G_{j}(t) \cdot \frac{C_{i,j}}{100} \qquad\qquad\qquad (Ec.3.6)$$

donde $i \in \{orgánicos, PET, aluminio, cartón, vidrio, rechazo, peligrosos\}$

### 3.3 Separación Mejorada en Origen

#### Tasa de Separación Mejorada por Programas
$$S_{mejorada,j} = \min\left(S_{base,j} + \Delta S_{educación,j} \cdot I_{educ} + \Delta S_{incentivos,j} \cdot I_{incent} + \Delta S_{contenedores,j} \cdot I_{cont}, 95\right) \qquad\qquad\qquad (Ec.3.7)$$

donde $I_{programa} \in \{0,1\}$ son indicadores binarios de programas activos.

**Tabla 3.1: Impacto de Programas de Separación (%)**

| Sector | Educación | Incentivos | Contenedores | Máximo Combinado |
|--------|-----------|------------|-------------|------------------|
| Hoteles | +12% | +18% | +8% | +38% |
| Restaurantes | +18% | +22% | +12% | +52% |
| Hogares | +20% | +25% | +15% | +60% |
| Comercios | +8% | +12% | +6% | +26% |

### 3.4 Sistema de Recolección y Logística

#### Capacidad Total de Recolección
$$Cap_{recolección} = V \cdot Cap_v \cdot T_v \qquad\qquad\qquad (Ec.3.8)$$

donde:
- $V$ = número de vehículos (3 unidades)
- $Cap_v$ = capacidad por vehículo (2.5 ton)
- $T_v$ = viajes por vehículo por día (2 viajes)

#### Déficit de Recolección
$$D_{recolección}(t) = \max(0, G_{total}(t) - Cap_{recolección}) \qquad\qquad\qquad (Ec.3.9)$$

#### Material Efectivamente Recolectado
$$M_{recolectado}(t) = G_{total}(t) - D_{recolección}(t) \qquad\qquad\qquad (Ec.3.10)$$

### 3.5 Recuperación Informal y Pérdidas

#### Recuperación Informal en Recolección
Para materiales valorizables $k \in \{PET, aluminio, cartón, vidrio\}$:

$$R_{informal,recolección,k}(t) = G_{k}(t) \cdot \frac{M_{recolectado}(t)}{G_{total}(t)} \cdot \frac{R_{informal,recolección}}{100} \qquad\qquad\qquad (Ec.3.11)$$

#### Pérdidas por Fugas en Recolección
$$F_{recolección}(t) = \left(M_{recolectado}(t) - \sum_k R_{informal,recolección,k}(t)\right) \cdot \frac{L_{recolección}}{100} \qquad\qquad\qquad (Ec.3.12)$$

### 3.6 Dinámica de Inventarios Multi-Etapa

#### Inventario en Vehículos de Recolección
$$Inv_{vehículos}(t+1) = Inv_{vehículos}(t) + M_{entregado}(t) - M_{descargado}(t) \qquad\qquad\qquad (Ec.3.13)$$

#### Inventario en Estación de Transferencia
$$Inv_{transferencia}(t+1) = Inv_{transferencia}(t) + M_{descargado}(t) - M_{procesado}(t) \qquad\qquad\qquad (Ec.3.14)$$

#### Inventario en Transporte Final
$$Inv_{transporte}(t+1) = Inv_{transporte}(t) + M_{salida}(t) - M_{transportado}(t) \qquad\qquad\qquad (Ec.3.15)$$

donde $M_{transportado}(t) = \min(Inv_{transporte}(t) + M_{salida}(t), Cap_{transporte})$

---

## 4. MODELO ECONÓMICO INTEGRAL

### 4.1 Costos Operacionales

#### Costos Básicos del Sistema
$$C_{básicos}(t) = M_{recolectado}(t) \cdot C_{recolección} + M_{transportado}(t) \cdot C_{transporte} + M_{dispuesto}(t) \cdot C_{disposición} \qquad\qquad\qquad (Ec.4.1)$$

**Tabla 4.1: Costos Unitarios del Sistema (MXN/ton)**

| Componente | Costo Unitario | Impacto en Sensibilidad |
|------------|----------------|------------------------|
| Recolección | 800 MXN/ton | 11.9% (Rank #2) |
| Transporte | 2,600 MXN/ton | Mayor componente |
| Disposición | 200 MXN/ton | Menor impacto |

#### Costos de Valorización
$$C_{valorización}(t) = \sum_{proceso} M_{proceso}(t) \cdot C_{proceso} \qquad\qquad\qquad (Ec.4.2)$$

donde $proceso \in \{compostaje, biogas, pirólisis\}$

#### Costos de Programas de Separación

**Programa Educativo:**
$$C_{educación}(t) = (P_{total} + E_{total}) \cdot C_{educación,per\_capita} \qquad\qquad\qquad (Ec.4.3)$$

**Programa de Incentivos:**
$$C_{incentivos}(t) = \sum_k R_{separado,k}(t) \cdot C_{incentivo,k} \qquad\qquad\qquad (Ec.4.4)$$

**Programa de Contenedores:**
$$C_{contenedores}(t) = \frac{N_{contenedores} \cdot C_{contenedor,unitario}}{365} \qquad\qquad\qquad (Ec.4.5)$$

### 4.2 Modelo de Ingresos

#### Ingresos por Venta de Materiales
$$I_{materiales}(t) = \sum_k (R_{alta,k}(t) + R_{baja,k}(t)) \cdot P_{venta,k} \qquad\qquad\qquad (Ec.4.6)$$

**Tabla 4.2: Precios de Venta de Materiales Recuperados (MXN/ton)**

| Material | Precio Alta Calidad | Precio Baja Calidad | Diferencial |
|----------|-------------------|-------------------|------------|
| PET | 3,500 MXN/ton | 2,800 MXN/ton | 25% |
| Aluminio | 18,000 MXN/ton | 14,000 MXN/ton | 29% |
| Cartón | 2,200 MXN/ton | 1,800 MXN/ton | 22% |
| Vidrio | 800 MXN/ton | 600 MXN/ton | 33% |

#### Ingresos por Valorización
$$I_{valorización}(t) = M_{compost}(t) \cdot P_{compost} + M_{biogas}(t) \cdot P_{biogas} + M_{pirólisis}(t) \cdot P_{pirólisis} \qquad\qquad\qquad (Ec.4.7)$$

### 4.3 Indicadores Económicos Clave

#### Costo Neto Diario del Sistema
$$C_{neto}(t) = C_{básicos}(t) + C_{valorización}(t) + C_{programas}(t) - I_{materiales}(t) - I_{valorización}(t) \qquad\qquad\qquad (Ec.4.8)$$

#### Retorno sobre Inversión (ROI)
$$ROI = \frac{(Ahorros_{anuales} + Ingresos_{anuales}) - Inversión_{total}}{Inversión_{total}} \times 100 \qquad\qquad\qquad (Ec.4.9)$$

#### Tiempo de Recuperación
$$T_{recuperación} = \frac{Inversión_{total}}{Ahorros_{mensuales} + Ingresos_{mensuales}} \qquad\qquad\qquad (Ec.4.10)$$

---

## 5. ALGORITMOS DE VALIDACIÓN

### 5.1 Validador de Conservación de Masa

**Algoritmo de Verificación (Implementado en `src/test/validation/massConservation.test.js`):**

```javascript
function validateMassConservation(simulationResults) {
    const totalGenerated = sum(simulationResults.generation);
    const totalDisposed = sum(simulationResults.disposal);
    const totalRecovered = sum(simulationResults.recovery);
    const totalValorized = sum(simulationResults.valorization);
    const totalLosses = sum(simulationResults.losses);
    const totalDeficit = sum(simulationResults.deficits);
    
    const massBalance = totalGenerated - (totalDisposed + totalRecovered + 
                       totalValorized + totalLosses + totalDeficit);
    
    const errorPercentage = Math.abs(massBalance / totalGenerated) * 100;
    
    return {
        valid: errorPercentage < 1.0,
        error: errorPercentage,
        massBalance: massBalance
    };
}
```

### 5.2 Validador de Restricciones Físicas

**Verificación de Capacidades:**
```javascript
function validateCapacityConstraints(day_results) {
    const violations = [];
    
    if (day_results.collection > COLLECTION_CAPACITY) {
        violations.push(`Collection exceeded: ${day_results.collection}`);
    }
    
    if (day_results.transport > TRANSPORT_CAPACITY) {
        violations.push(`Transport exceeded: ${day_results.transport}`);
    }
    
    if (day_results.inventory < 0) {
        violations.push(`Negative inventory: ${day_results.inventory}`);
    }
    
    return violations;
}
```

### 5.3 Validador Empírico

**Comparación contra Datos SUMA 2022:**
```javascript
function validateAgainstEmpirical(modelResults, empiricalData) {
    const kpis = [
        'totalGeneration', 'materialCollected', 'transportCapacity',
        'materialProcessed', 'inventoryAccumulated', 'operationalCost',
        'finalDisposal', 'totalRecovery'
    ];
    
    const validationResults = kpis.map(kpi => {
        const modelValue = modelResults[kpi];
        const empiricalValue = empiricalData[kpi];
        const error = Math.abs((modelValue - empiricalValue) / empiricalValue) * 100;
        
        return {
            kpi: kpi,
            modelValue: modelValue,
            empiricalValue: empiricalValue,
            relativeError: error,
            status: error < 25 ? 'Valid' : 'Invalid'
        };
    });
    
    return validationResults;
}
```

---

## 6. IMPLEMENTACIÓN COMPUTACIONAL

### 6.1 Arquitectura del Motor de Simulación

**Estructura Modular (Directorio `src/simulation/`):**

```
src/simulation/
├── simulationEngine.ts          # Motor principal
├── modules/
│   ├── generation.ts           # Módulo de generación (Ec.1, 3.1-3.6)
│   ├── collection.ts           # Módulo de recolección (Ec.2, 3.8-3.12)
│   ├── inventory.ts            # Módulo de inventarios (Ec.3, 3.13-3.15)
│   ├── separation.ts           # Módulo de separación (Ec.3.7)
│   ├── valorization.ts         # Módulo de valorización
│   └── economics.ts            # Módulo económico (Ec.4.1-4.10)
└── test/validation/            # Validadores automáticos
```

### 6.2 Flujo de Ejecución Principal

**Algoritmo Principal (30 días de simulación):**

```typescript
export function runSimulation(parameters: SimulationParameters): SimulationResults {
    const results: DailyResults[] = [];
    let state: SystemState = initializeSystemState();
    
    for (let day = 1; day <= 30; day++) {
        // 1. Calcular generación por fuente según temporada
        const generation = calculateGeneration(day, parameters);
        
        // 2. Aplicar separación mejorada y composición
        const separatedWaste = applySeparationPrograms(generation, parameters);
        
        // 3. Procesar recolección con capacidades
        const collected = processCollection(separatedWaste, parameters);
        
        // 4. Actualizar inventarios multi-etapa
        state = updateInventoryLevels(state, collected, parameters);
        
        // 5. Procesar en estación de transferencia
        const processed = processTransferStation(state, parameters);
        
        // 6. Aplicar procesos de valorización
        const valorized = processValorization(processed, parameters);
        
        // 7. Transportar material (CUELLO DE BOTELLA)
        const transported = processTransportation(state, parameters);
        
        // 8. Calcular costos, ingresos y KPIs
        const economics = calculateEconomics(collected, processed, valorized, transported, parameters);
        
        // 9. Validar conservación de masa
        const validation = validateMassConservation(generation, processed, transported);
        
        // 10. Almacenar resultados del día
        results.push({
            day: day,
            generation: generation,
            collected: collected,
            processed: processed,
            transported: transported,
            economics: economics,
            validation: validation,
            state: state
        });
    }
    
    // Promediar últimos 7 días para KPIs estables
    return calculateFinalKPIs(results.slice(-7));
}
```

---

## 7. PSEUDOCÓDIGO DE MÓDULOS CRÍTICOS

### 7.1 Módulo de Generación (generation.ts)

```typescript
function calculateGeneration(day: number, params: Parameters): Generation {
    // Determinar temporada basada en día
    const season = determineSeason(day);
    const occupancyRate = season === 'high' ? params.occupancyHigh : params.occupancyLow;
    
    // Calcular generación por fuente (Ec.3.1-3.4)
    const hotelGeneration = params.hotelUnits * (occupancyRate / 100) * (params.hotelRate / 1000);
    const restaurantGeneration = params.restaurantUnits * (params.restaurantRate / 1000);
    const homeGeneration = params.fixedPopulation * (params.homeRate / 1000);
    const commerceGeneration = params.commerceUnits * (params.commerceRate / 1000);
    
    // Generación total (Ec.3.5)
    const totalGeneration = hotelGeneration + restaurantGeneration + homeGeneration + commerceGeneration;
    
    // Aplicar composición por material (Ec.3.6)
    const materialGeneration = applyComposition(
        { hotels: hotelGeneration, restaurants: restaurantGeneration, 
          homes: homeGeneration, commerce: commerceGeneration },
        params.composition
    );
    
    return {
        total: totalGeneration,
        bySource: { hotels: hotelGeneration, restaurants: restaurantGeneration, 
                   homes: homeGeneration, commerce: commerceGeneration },
        byMaterial: materialGeneration,
        season: season
    };
}

function applyComposition(generation: GenerationBySource, composition: CompositionMatrix): MaterialGeneration {
    const materials = ['organics', 'pet', 'aluminum', 'cardboard', 'glass', 'reject', 'hazardous'];
    const result = {};
    
    for (const material of materials) {
        result[material] = 
            generation.hotels * (composition.hotels[material] / 100) +
            generation.restaurants * (composition.restaurants[material] / 100) +
            generation.homes * (composition.homes[material] / 100) +
            generation.commerce * (composition.commerce[material] / 100);
    }
    
    return result;
}
```

### 7.2 Módulo de Transporte Crítico (collection.ts)

```typescript
function processTransportation(state: SystemState, params: Parameters): Transportation {
    // ECUACIÓN CRÍTICA (Ec.2) - Restricción de transporte
    const transportDemand = state.readyForTransport;
    const actualTransported = Math.min(transportDemand, params.transportCapacity); // 9.6 ton/día
    
    // ECUACIÓN DE ACUMULACIÓN FORZADA (Ec.3)
    const forcedAccumulation = Math.max(0, transportDemand - params.transportCapacity);
    
    // Actualizar inventario de transporte (Ec.3.15)
    const newTransportInventory = state.transportInventory + forcedAccumulation;
    
    // Calcular pérdidas por fugas
    const transportLosses = actualTransported * (params.transportLeakage / 100);
    const materialArriving = actualTransported - transportLosses;
    
    return {
        demanded: transportDemand,
        transported: actualTransported,
        accumulated: forcedAccumulation,
        losses: transportLosses,
        arriving: materialArriving,
        inventory: newTransportInventory,
        // INDICADOR CRÍTICO: Utilización de capacidad
        capacityUtilization: (transportDemand / params.transportCapacity) * 100
    };
}
```

### 7.3 Módulo de Separación Mejorada (separation.ts)

```typescript
function applySeparationPrograms(generation: Generation, params: Parameters): SeparatedGeneration {
    const sources = ['hotels', 'restaurants', 'homes', 'commerce'];
    const separatedMaterial = {};
    
    for (const source of sources) {
        // Calcular tasa de separación mejorada (Ec.3.7)
        const baseSeparation = params.baseSeparation[source];
        const educationBonus = params.educationProgram ? params.educationImpact[source] : 0;
        const incentiveBonus = params.incentiveProgram ? params.incentiveImpact[source] : 0;
        const containerBonus = params.containerProgram ? params.containerImpact[source] : 0;
        
        const improvedSeparation = Math.min(
            baseSeparation + educationBonus + incentiveBonus + containerBonus,
            95 // Límite físico máximo
        );
        
        // Aplicar separación a materiales valorizables
        const sourceGeneration = generation.bySource[source];
        const separatedAmount = sourceGeneration * (improvedSeparation / 100);
        const mixedAmount = sourceGeneration - separatedAmount;
        
        separatedMaterial[source] = {
            separated: separatedAmount,
            mixed: mixedAmount,
            separationRate: improvedSeparation
        };
    }
    
    return {
        bySource: separatedMaterial,
        totalSeparated: Object.values(separatedMaterial).reduce((sum, source) => sum + source.separated, 0),
        totalMixed: Object.values(separatedMaterial).reduce((sum, source) => sum + source.mixed, 0),
        averageSeparationRate: calculateWeightedAverageSeparation(separatedMaterial, generation.bySource)
    };
}
```

### 7.4 Validador de Conservación de Masa

```typescript
function validateMassConservation(results: DailyResults): ValidationResult {
    // Balance de masa fundamental (Ec.4)
    const totalGenerated = results.generation.total;
    const totalDisposed = results.transported.arriving;
    const totalRecovered = results.recovered.total;
    const totalValorized = results.valorized.total;
    const totalLosses = results.collected.losses + results.transported.losses;
    const totalDeficits = results.collected.deficit + results.transported.accumulated;
    
    const massBalance = totalGenerated - (totalDisposed + totalRecovered + totalValorized + totalLosses + totalDeficits);
    const errorPercentage = Math.abs(massBalance / totalGenerated) * 100;
    
    return {
        valid: errorPercentage < 0.01, // Criterio estricto <0.01%
        errorPercentage: errorPercentage,
        massBalance: massBalance,
        components: {
            generated: totalGenerated,
            disposed: totalDisposed,
            recovered: totalRecovered,
            valorized: totalValorized,
            losses: totalLosses,
            deficits: totalDeficits
        }
    };
}
```

---

## REFERENCIAS DE IMPLEMENTACIÓN

### Archivos Fuente Críticos:
- **Motor principal:** `src/simulation/simulationEngine.ts`
- **Hook principal:** `src/hooks/useWasteSimulation.tsx`  
- **Configuración:** `src/constants/initialState.js`
- **Validación:** `src/test/validation/massConservation.test.js`

### Datos de Calibración:
- **Datos empíricos:** `data/holbox-historical-data.csv`
- **Resultados sensibilidad:** `data/sensitivity-summary-results.csv`
- **Escenarios validación:** `docs/escenarios-validacion-sistema-COMPLETO-2025-08-21.csv`

### Scripts de Análisis:
- **Análisis de sensibilidad:** `sensitivity-execution.js`
- **Validación empírica:** `validation-execution.js`

---

**Última actualización:** Septiembre 2024  
**Versión del modelo:** 2.1  
**Status de validación:** Empíricamente validado (100% KPIs, error 6.0%)  
**Implementación:** Sistema React/TypeScript completamente funcional
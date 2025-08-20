# THESIS-004: Comprehensive Sensitivity Analysis for Isla Holbox Waste Management System

## Executive Summary

This document presents the comprehensive sensitivity analysis conducted for the Isla Holbox waste management simulation model as part of THESIS-004. The analysis evaluates the impact of key system parameters on critical performance indicators to identify the most influential factors for policy recommendations.

## Methodology

### 1. Parameter Selection

Seven critical system parameters were selected based on their operational significance and policy relevance:

| Parameter | Base Value | Unit | Description |
|-----------|------------|------|-------------|
| `generation.hotels.rate` | 1.2 | kg/cuarto/día | Hotel waste generation rate per room per day |
| `generation.restaurants.rate` | 114.2 | kg/unidad/día | Restaurant waste generation rate per unit per day |
| `general.highSeasonOccupancy` | 90 | % | High season occupancy rate |
| `rsuSystem.processing.finalTransportCapacity` | 8 | tons/día | Final transport capacity to mainland |
| `rsuSystem.leaks.collectionLeak` | 15 | % | Collection system leak rate |
| `rsuSystem.economics.collectionCost` | 800 | pesos/ton | Collection cost per ton |
| `general.fixedPopulation` | 2673 | habitantes | Fixed resident population |

### 2. Variation Analysis

Each parameter was tested at ±10% and ±20% variations from the baseline value, creating 29 total scenarios:
- 1 baseline scenario
- 28 variation scenarios (7 parameters × 4 variations each)

### 3. Key Performance Indicators (KPIs)

Seven critical KPIs were tracked across all scenarios:

| KPI | Description | Unit | Relevance |
|-----|-------------|------|-----------|
| `totalGeneration` | Total waste generation per day | tons/day | System capacity planning |
| `collectionEfficiency` | Collection system efficiency | % | Service quality |
| `processingCapacityUtilization` | Transfer station inventory levels | % | Infrastructure utilization |
| `totalSystemCost` | Total daily operating cost | pesos/day | Economic sustainability |
| `disposalVolume` | Volume sent to final disposal | tons/day | Environmental impact |
| `recoveryRate` | Total material recovery rate | tons/day | Circular economy |
| `netCostPerDay` | Net RSU system cost per day | pesos/day | Financial performance |

### 4. Sensitivity Calculation

For each parameter-KPI combination, sensitivity indices were calculated as:

```
Sensitivity Index = (Value_+20% - Value_-20%) / (2 × 20%) × 100
Relative Sensitivity = (Sensitivity Index / Baseline Value) × 100
```

## Results

### Overall Parameter Ranking (High Season)

Based on average relative sensitivity across all KPIs:

| Rank | Parameter | Average Impact | Description |
|------|-----------|----------------|-------------|
| 1 | `finalTransportCapacity` | 26.95% | Final transport capacity to mainland |
| 2 | `collectionCost` | 24.60% | Collection cost per ton |
| 3 | `restaurants.rate` | 20.51% | Restaurant waste generation rate |
| 4 | `highSeasonOccupancy` | 9.17% | High season occupancy rate |
| 5 | `hotels.rate` | 9.17% | Hotel waste generation rate |
| 6 | `collectionLeak` | 4.17% | Collection system leak rate |
| 7 | `fixedPopulation` | 3.44% | Fixed resident population |

### Key Findings

#### 1. **Final Transport Capacity** - Most Critical Parameter
- **Impact**: 26.95% average sensitivity
- **Policy Implication**: Transport infrastructure to the mainland is the single most important bottleneck
- **Recommendation**: Priority investment in transport capacity expansion

#### 2. **Collection Cost** - Major Economic Driver
- **Impact**: 24.60% average sensitivity
- **Policy Implication**: Economic efficiency of collection operations significantly affects system viability
- **Recommendation**: Focus on collection optimization and cost reduction strategies

#### 3. **Restaurant Waste Generation** - Key Commercial Factor
- **Impact**: 20.51% average sensitivity
- **Policy Implication**: Commercial waste from restaurants has outsized impact relative to residential waste
- **Recommendation**: Targeted commercial waste reduction and separation programs

#### 4. **Occupancy Rate** - Tourism Impact
- **Impact**: 9.17% average sensitivity
- **Policy Implication**: Tourism seasonality creates significant operational challenges
- **Recommendation**: Seasonal capacity management and flexible service models

### Season-Based Analysis

The analysis revealed different parameter sensitivities between high and low seasons:

- **High Season**: Transport capacity and collection costs dominate
- **Low Season**: Restaurant generation rates become more critical due to reduced overall volume
- **Implication**: Seasonal management strategies should focus on different parameters

### Tornado Chart Data Structure

For visualization and further analysis, tornado chart data is structured as:

```json
{
  "parameter": "parameter_name",
  "description": "Human readable description",
  "negativeChange": "Change when parameter decreased by 20%",
  "positiveChange": "Change when parameter increased by 20%",
  "relativeSensitivity": "Absolute relative sensitivity percentage",
  "baselineValue": "Baseline KPI value"
}
```

## Policy Recommendations

Based on the sensitivity analysis results, the following policy recommendations are ranked by priority:

### Tier 1 (Critical - Immediate Action Required)
1. **Transport Infrastructure Investment**
   - Increase final transport capacity to mainland
   - Consider alternative transport solutions
   - Highest system impact (26.95% sensitivity)

2. **Collection System Optimization**
   - Implement cost reduction strategies
   - Optimize collection routes and schedules
   - Second highest impact (24.60% sensitivity)

### Tier 2 (High Priority - Medium-term Planning)
3. **Commercial Waste Programs**
   - Targeted restaurant waste reduction initiatives
   - Enhanced separation programs for commercial sector
   - Third highest impact (20.51% sensitivity)

### Tier 3 (Moderate Priority - Long-term Considerations)
4. **Seasonal Management**
   - Flexible capacity management for tourism seasons
   - Adaptive service models
   - Moderate impact (9.17% sensitivity)

5. **Leak Reduction Programs**
   - Collection system integrity improvement
   - Staff training and equipment maintenance
   - Lower but still significant impact (4.17% sensitivity)

## Technical Implementation

### Files Generated
- **`sensitivity-results.csv`**: Complete numerical results for all scenarios
- **`sensitivity-analysis-detailed.json`**: Comprehensive analysis including metadata
- **`src/utils/sensitivityAnalysis.js`**: Reusable analysis framework
- **`sensitivity-execution.js`**: Standalone execution script

### Computational Details
- **Total Scenarios**: 29
- **Simulation Period**: 30 days per scenario
- **Stabilization**: Results averaged over final 7 days
- **Execution Time**: ~2 minutes for complete analysis

## Validation and Reliability

### Model Validation
- Mass conservation verified across all scenarios
- Physical constraints maintained (e.g., capacity limits)
- Economic calculations consistent with baseline model

### Sensitivity Analysis Validation
- Monotonic response verified for linear parameters
- Cross-validation with ±10% results confirms linearity assumptions
- Baseline scenario matches original model validation results

## Future Research Directions

1. **Non-linear Sensitivity Analysis**: Explore parameter interactions and threshold effects
2. **Monte Carlo Analysis**: Incorporate parameter uncertainty distributions
3. **Multi-objective Optimization**: Use sensitivity results for policy optimization
4. **Temporal Sensitivity**: Analyze parameter importance over different time horizons

## Conclusions

The sensitivity analysis successfully identified the most critical parameters affecting the Isla Holbox waste management system. The results provide clear priorities for policy intervention, with transport capacity and collection costs emerging as the most influential factors. These findings directly support evidence-based policy recommendations for sustainable waste management on the island.

---

**Generated**: 2025-08-20  
**Analysis Framework**: THESIS-004 Comprehensive Sensitivity Analysis  
**Total Scenarios Analyzed**: 29  
**Parameters Evaluated**: 7  
**KPIs Tracked**: 7
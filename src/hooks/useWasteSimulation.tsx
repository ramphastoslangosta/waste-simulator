import { useMemo } from 'react';

// Este hook personalizado contiene toda la lógica de cálculo de la simulación.
// Recibe los inputs del usuario y devuelve los resultados calculados.
export const useWasteSimulation = (inputs: any) => {
    const results = useMemo(() => {
        const calculateKpisForSeason = (currentSeason) => {
            const SIMULATION_DAYS = 30;
            const dailyResults: any[] = [];
            
            // Initialize inventories from input parameters
            let rsuInventory = inputs.rsuSystem.initialInventory?.transferStation || 0;
            let collectionVehicleInventory = inputs.rsuSystem.initialInventory?.collectionVehicles || 0;
            let finalTransportInventory = inputs.rsuSystem.initialInventory?.finalTransportVehicles || 0;
            let disposalSiteInventory = inputs.rsuSystem.initialInventory?.disposalSite || 0;
            
            const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
            const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

            for (let day = 0; day < SIMULATION_DAYS; day++) {
                const occupancy = currentSeason === 'high' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy;
                
                // --- ENHANCED SEPARATION SCENARIOS ---
                // Calculate enhanced separation rates based on active programs
                const getEnhancedSeparationRate = (baseRate, source) => {
                    let enhancedRate = baseRate;
                    
                    // Education Program Impact
                    if (inputs.separationScenarios?.educationProgram?.enableEducation) {
                        const educationImpact = inputs.separationScenarios.educationProgram[`educationImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                        enhancedRate += educationImpact;
                    }
                    
                    // Incentive Program Impact
                    if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
                        const incentiveImpact = inputs.separationScenarios.incentiveProgram[`incentiveImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                        enhancedRate += incentiveImpact;
                    }
                    
                    // Container Program Impact
                    if (inputs.separationScenarios?.containerProgram?.enableContainers) {
                        const containerImpact = inputs.separationScenarios.containerProgram[`containerImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                        enhancedRate += containerImpact;
                    }
                    
                    return Math.min(enhancedRate, 95); // Cap at 95% maximum separation rate
                };
                
                // Apply enhanced separation rates
                const enhancedSeparationRates = {
                    hotels: getEnhancedSeparationRate(inputs.generation.hotels.sourceSeparationRate, 'hotels'),
                    restaurants: getEnhancedSeparationRate(inputs.generation.restaurants.sourceSeparationRate, 'restaurants'),
                    homes: getEnhancedSeparationRate(inputs.generation.homes.sourceSeparationRate, 'homes'),
                    commerce: getEnhancedSeparationRate(inputs.generation.commerce.sourceSeparationRate, 'commerce'),
                };
                
                // --- FLOW 1: RSU (Residuos Sólidos Urbanos) ---
                const genBySource = {
                    hotels: (inputs.generation.hotels.units * occupancy / 100) * inputs.generation.hotels.rate / 1000,
                    restaurants: (inputs.generation.restaurants.units * inputs.generation.restaurants.rate) / 1000,
                    homes: (inputs.general.fixedPopulation * inputs.generation.homes.rate) / 1000,
                    commerce: (inputs.generation.commerce.units * inputs.generation.commerce.rate) / 1000,
                };
                const genByMaterial = { organicos: 0, pet: 0, aluminio: 0, carton: 0, vidrio: 0, rechazo: 0, peligrosos: 0 };
                for (const source in genBySource) {
                    for (const material of materialTypes) {
                        genByMaterial[material] += genBySource[source] * (inputs.composition[source][material] / 100);
                    }
                }
                const genRSU = Object.values(genByMaterial).reduce((a, b) => a + b, 0);

                const collectionCapacity = inputs.rsuSystem.logistics.vehicles * inputs.rsuSystem.logistics.vehicleCapacity * inputs.rsuSystem.logistics.tripsPerVehicle;
                const collectionDeficit = Math.max(0, genRSU - collectionCapacity);
                const collectedWasteTotal = genRSU - collectionDeficit;
                
                const collectedRatio = genRSU > 0 ? collectedWasteTotal / genRSU : 0;
                const collectedByMaterial: any = {};
                materialTypes.forEach(m => collectedByMaterial[m] = genByMaterial[m] * collectedRatio);

                const informalRecoveryCollectionByMaterial: any = {};
                const wasteAfterInformalRec1: any = {};
                valorizableTypes.forEach(m => {
                    const recovered = collectedByMaterial[m] * (inputs.rsuSystem.separation.informalRecoveryRateCollection / 100);
                    informalRecoveryCollectionByMaterial[m] = recovered;
                    wasteAfterInformalRec1[m] = collectedByMaterial[m] - recovered;
                });
                ['organicos', 'rechazo', 'peligrosos'].forEach(m => wasteAfterInformalRec1[m] = collectedByMaterial[m]);
                const informalRecoveryCollection = Object.values(informalRecoveryCollectionByMaterial).reduce((a, b) => a + b, 0);

                const wasteBeforeLeak = Object.values(wasteAfterInformalRec1).reduce((a, b) => a + b, 0);
                const leakCollection = wasteBeforeLeak * (inputs.rsuSystem.leaks.collectionLeak / 100);
                const leakRatio = wasteBeforeLeak > 0 ? leakCollection / wasteBeforeLeak : 0;
                
                const toTransferStationByMaterial: any = {};
                materialTypes.forEach(m => toTransferStationByMaterial[m] = wasteAfterInformalRec1[m] * (1 - leakRatio));
                const toTransferStationTotal = Object.values(toTransferStationByMaterial).reduce((a, b) => a + b, 0);

                // Update collection vehicle inventory (waste collected but not yet delivered to transfer station)
                collectionVehicleInventory += toTransferStationTotal;
                
                // Deliver from collection vehicles to transfer station (based on vehicle capacity and trips)
                const maxDeliveryCapacity = inputs.rsuSystem.logistics.vehicles * inputs.rsuSystem.logistics.vehicleCapacity * inputs.rsuSystem.logistics.tripsPerVehicle;
                const actualDelivery = Math.min(collectionVehicleInventory, maxDeliveryCapacity);
                collectionVehicleInventory -= actualDelivery;
                
                const materialAvailableInStation = rsuInventory + actualDelivery;
                const materialProcessedToday = Math.min(materialAvailableInStation, inputs.rsuSystem.processing.transferStationRate);
                
                const recoveredHighQuality: any = {};
                const recoveredLowQualityPlant: any = {};
                
                const processedRatio = toTransferStationTotal > 0 ? materialProcessedToday / toTransferStationTotal : 0;
                const processedByMaterial: any = {};
                materialTypes.forEach(m => processedByMaterial[m] = toTransferStationByMaterial[m] * processedRatio);

                valorizableTypes.forEach(m => {
                    let sourceSeparatedAmount = 0;
                    for (const source in genBySource) {
                        // Use enhanced separation rates instead of base rates
                        sourceSeparatedAmount += (genBySource[source] * (inputs.composition[source][m] / 100)) * (enhancedSeparationRates[source] / 100);
                    }
                    const captured = sourceSeparatedAmount * (inputs.rsuSystem.separation.differentiatedCaptureRate / 100) * collectedRatio * processedRatio;
                    recoveredHighQuality[m] = captured * (1 - inputs.rsuSystem.separation.rejectionRateSource / 100);
                });

                valorizableTypes.forEach(m => {
                    const availableInMixed = Math.max(0, processedByMaterial[m] - (recoveredHighQuality[m] || 0));
                    recoveredLowQualityPlant[m] = availableInMixed * (inputs.rsuSystem.separation.plantSeparationEfficiency[m] / 100);
                });

                const totalRecoveredAtStation = Object.values(recoveredHighQuality).reduce((a,b)=>a+b,0) + Object.values(recoveredLowQualityPlant).reduce((a,b)=>a+b,0);
                
                // --- VALORIZATION PROCESSES AT TRANSFER STATION ---
                let valorizedMaterials = {
                    composted: 0,
                    biogas: 0,
                    pyrolyzed: 0
                };
                let valorizationCosts = 0;
                let valorizationIncomes = 0;
                
                const availableOrganics = processedByMaterial.organicos || 0;
                const availablePlastics = (processedByMaterial.pet || 0);
                
                // Composting Process
                if (inputs.rsuSystem.valorization?.enableComposting && availableOrganics > 0) {
                    const organicsToCompost = availableOrganics * (inputs.rsuSystem.valorization.compostingEfficiency / 100);
                    valorizedMaterials.composted = organicsToCompost;
                    valorizationCosts += organicsToCompost * inputs.rsuSystem.valorization.compostingCost;
                    valorizationIncomes += organicsToCompost * inputs.rsuSystem.valorization.compostIncome;
                }
                
                // Biogas Process (can't overlap with composting for same organics)
                if (inputs.rsuSystem.valorization?.enableBiogas && availableOrganics > 0) {
                    const remainingOrganics = availableOrganics - valorizedMaterials.composted;
                    if (remainingOrganics > 0) {
                        const organicsForBiogas = remainingOrganics * (inputs.rsuSystem.valorization.biogasEfficiency / 100);
                        valorizedMaterials.biogas = organicsForBiogas;
                        valorizationCosts += organicsForBiogas * inputs.rsuSystem.valorization.biogasCost;
                        valorizationIncomes += organicsForBiogas * inputs.rsuSystem.valorization.biogasIncome;
                    }
                }
                
                // Plastic Pyrolysis Process
                if (inputs.rsuSystem.valorization?.enablePlasticPyrolysis && availablePlastics > 0) {
                    const plasticsForPyrolysis = availablePlastics * (inputs.rsuSystem.valorization.pyrolysisEfficiency / 100);
                    valorizedMaterials.pyrolyzed = plasticsForPyrolysis;
                    valorizationCosts += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisCost;
                    valorizationIncomes += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisIncome;
                }
                
                const totalValorizedMaterials = valorizedMaterials.composted + valorizedMaterials.biogas + valorizedMaterials.pyrolyzed;
                
                const leakTransferStation = materialProcessedToday * (inputs.rsuSystem.leaks.transferStationLeak / 100);
                const materialLeavingStation = materialProcessedToday - totalRecoveredAtStation - totalValorizedMaterials - leakTransferStation;

                // Update final transport inventory
                finalTransportInventory += materialLeavingStation;
                const actualFinalTransport = Math.min(finalTransportInventory, inputs.rsuSystem.processing.finalTransportCapacity);
                finalTransportInventory -= actualFinalTransport;
                const untransportedMaterial = materialLeavingStation - actualFinalTransport;
                
                const leakFinalTransport = actualFinalTransport * (inputs.rsuSystem.leaks.finalTransportLeak / 100);
                const arrivedAtDisposal = actualFinalTransport - leakFinalTransport;
                
                // Update disposal site inventory
                disposalSiteInventory += arrivedAtDisposal;
                const toDisposalSite = arrivedAtDisposal; // For compatibility with existing calculations
                
                let valorizablesToDisposal = 0;
                if(materialLeavingStation > 0) {
                    const proportionOfValorizablesLeaving = valorizableTypes.reduce((sum, m) => sum + processedByMaterial[m], 0) / materialProcessedToday;
                    valorizablesToDisposal = toDisposalSite * proportionOfValorizablesLeaving;
                }
                const informalRecoveryDisposal = valorizablesToDisposal * (inputs.rsuSystem.separation.informalRecoveryRateDisposal / 100);
                
                const leakDisposal = toDisposalSite * (inputs.rsuSystem.leaks.disposalLeak / 100);
                const finalDisposal = toDisposalSite - informalRecoveryDisposal - leakDisposal;

                rsuInventory = materialAvailableInStation - materialProcessedToday + untransportedMaterial;
                rsuInventory = Math.min(rsuInventory, inputs.rsuSystem.processing.transferStationCapacity);

                const totalCollectionCost = collectedWasteTotal * inputs.rsuSystem.economics.collectionCost;
                const totalTransferCost = materialProcessedToday * inputs.rsuSystem.economics.transferStationCost;
                const totalFinalTransportCost = actualFinalTransport * inputs.rsuSystem.economics.finalTransportCost;
                const totalDisposalCost = toDisposalSite * inputs.rsuSystem.economics.disposalCost;
                const totalRsuCosts = totalCollectionCost + totalTransferCost + totalFinalTransportCost + totalDisposalCost + valorizationCosts;

                const incomeByMaterial: any = {};
                valorizableTypes.forEach(m => {
                    incomeByMaterial[m] = ((recoveredHighQuality[m] || 0) + (recoveredLowQualityPlant[m] || 0)) * inputs.rsuSystem.economics.income[m];
                });
                const totalRsuIncome = Object.values(incomeByMaterial).reduce((a, b) => a + b, 0) + valorizationIncomes;
                const netRsuCost = totalRsuCosts - totalRsuIncome;

                const rsuLeaks = collectionDeficit + leakCollection + leakTransferStation + leakFinalTransport + leakDisposal;
                const rsuRecovery = {
                    source: Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0),
                    plant: Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0),
                    informal: informalRecoveryCollection + informalRecoveryDisposal,
                };
                
                // --- SEPARATION SCENARIO COSTS ---
                let separationProgramCosts = 0;
                
                // Education Program Costs
                if (inputs.separationScenarios?.educationProgram?.enableEducation) {
                    const annualEducationCost = inputs.general.fixedPopulation * inputs.separationScenarios.educationProgram.educationCostPerCapita;
                    const touristPopulation = (inputs.generation.hotels.units * occupancy / 100) + 
                                            inputs.generation.restaurants.units * 3 + // Estimate 3 people per restaurant
                                            inputs.generation.commerce.units * 2; // Estimate 2 people per commerce
                    const totalEducationCost = (inputs.general.fixedPopulation + touristPopulation) * inputs.separationScenarios.educationProgram.educationCostPerCapita;
                    separationProgramCosts += totalEducationCost / 365; // Convert annual to daily cost
                }
                
                // Incentive Program Costs
                if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
                    const totalSeparatedMaterial = Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0);
                    separationProgramCosts += totalSeparatedMaterial * inputs.separationScenarios.incentiveProgram.incentiveCostPerTon;
                }
                
                // Container Program Costs (one-time cost amortized over 5 years)
                if (inputs.separationScenarios?.containerProgram?.enableContainers) {
                    const totalUnits = inputs.generation.hotels.units + inputs.generation.restaurants.units + 
                                     inputs.generation.commerce.units + Math.ceil(inputs.general.fixedPopulation / 100);
                    const annualContainerCost = totalUnits * inputs.separationScenarios.containerProgram.containerCostPerUnit / 5; // 5-year amortization
                    separationProgramCosts += annualContainerCost / 365; // Convert annual to daily cost
                }
                
                // --- FLOW 2 & 3: Special Wastes (Sargassum & RCD) ---
                const sargassumGeneration = currentSeason === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
                const rcdGeneration = inputs.specialWasteGeneration.construction;
                const sargassumCost = sargassumGeneration * (inputs.sargassumManagement.collectionCost + inputs.sargassumManagement.disposalCost);
                const rcdCost = rcdGeneration * (inputs.rcdManagement.collectionCost + inputs.rcdManagement.disposalCost);

                // --- FINAL CONSOLIDATION ---
                const totalSystemCost = netRsuCost + sargassumCost + rcdCost + separationProgramCosts;
                
                dailyResults.push({
                    totalGeneration: genRSU + sargassumGeneration + rcdGeneration,
                    sargassumGeneration, rcdGeneration, sargassumCost, rcdCost, totalSystemCost,
                    valorization: valorizedMaterials,
                    valorizationCosts,
                    valorizationIncomes,
                    separationProgramCosts,
                    enhancedSeparationRates,
                    rsu: {
                        totalGeneration: genRSU,
                        collectionDeficit,
                        totalLeak: rsuLeaks,
                        finalInventory: rsuInventory,
                        inventoryWaitTime: materialProcessedToday > 0 ? rsuInventory / materialProcessedToday : 0,
                        inventoryLevels: {
                            collectionVehicles: collectionVehicleInventory,
                            transferStation: rsuInventory,
                            finalTransportVehicles: finalTransportInventory,
                            disposalSite: disposalSiteInventory
                        },
                        recoveryByStage: rsuRecovery,
                        toDisposal: finalDisposal,
                        totalRsuIncome,
                        totalRsuCosts,
                        netCostPerDay: netRsuCost,
                        incomeByMaterial,
                        // Store genBySource at the top level for easy access
                        genBySource,
                        calculations: {
                            genBySource,
                            collectionCapacity, collectedWasteTotal, informalRecoveryCollection, leakCollection, toTransferStationTotal,
                            materialProcessedToday, totalRecoveredAtStation, leakTransferStation, toFinalTransport: materialLeavingStation, 
                            actualFinalTransport, untransportedMaterial, leakFinalTransport, toDisposalSite, informalRecoveryDisposal, leakDisposal,
                            totalCollectionCost, totalTransferCost, totalFinalTransportCost, totalDisposalCost
                        }
                    }
                });
            }

            // --- Averaging results for stability ---
            const stablePeriodResults = dailyResults.slice(Math.max(0, SIMULATION_DAYS - 7));
            const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            const avgObj = (arrOfObjs) => {
                const sums = arrOfObjs.reduce((acc, obj) => {
                    for (const key in obj) {
                        acc[key] = (acc[key] || 0) + obj[key];
                    }
                    return acc;
                }, {});
                if (arrOfObjs.length > 0) {
                    for (const key in sums) {
                        sums[key] /= arrOfObjs.length;
                    }
                }
                return sums;
            };

            const finalKpis = {
                totalGeneration: avg(stablePeriodResults.map(r => r.totalGeneration)),
                sargassumGeneration: avg(stablePeriodResults.map(r => r.sargassumGeneration)),
                rcdGeneration: avg(stablePeriodResults.map(r => r.rcdGeneration)),
                sargassumCost: avg(stablePeriodResults.map(r => r.sargassumCost)),
                rcdCost: avg(stablePeriodResults.map(r => r.rcdCost)),
                totalSystemCost: avg(stablePeriodResults.map(r => r.totalSystemCost)),
                valorization: avgObj(stablePeriodResults.map(r => r.valorization)),
                valorizationCosts: avg(stablePeriodResults.map(r => r.valorizationCosts)),
                valorizationIncomes: avg(stablePeriodResults.map(r => r.valorizationIncomes)),
                separationProgramCosts: avg(stablePeriodResults.map(r => r.separationProgramCosts)),
                enhancedSeparationRates: avgObj(stablePeriodResults.map(r => r.enhancedSeparationRates)),
                rsu: {
                    totalGeneration: avg(stablePeriodResults.map(r => r.rsu.totalGeneration)),
                    collectionDeficit: avg(stablePeriodResults.map(r => r.rsu.collectionDeficit)),
                    totalLeak: avg(stablePeriodResults.map(r => r.rsu.totalLeak)),
                    finalInventory: rsuInventory,
                    inventoryWaitTime: avg(stablePeriodResults.map(r => r.rsu.inventoryWaitTime)),
                    inventoryLevels: avgObj(stablePeriodResults.map(r => r.rsu.inventoryLevels)),
                    recoveryByStage: avgObj(stablePeriodResults.map(r => r.rsu.recoveryByStage)),
                    toDisposal: avg(stablePeriodResults.map(r => r.rsu.toDisposal)),
                    netCostPerDay: avg(stablePeriodResults.map(r => r.rsu.netCostPerDay)),
                    totalRsuIncome: avg(stablePeriodResults.map(r => r.rsu.totalRsuIncome)),
                    totalRsuCosts: avg(stablePeriodResults.map(r => r.rsu.totalRsuCosts)),
                    incomeByMaterial: avgObj(stablePeriodResults.map(r => r.rsu.incomeByMaterial)),
                    // Add genBySource to the final results
                    genBySource: avgObj(stablePeriodResults.map(r => r.rsu.genBySource)),
                    calculations: avgObj(stablePeriodResults.map(r => r.rsu.calculations)),
                }
            };
            return finalKpis;
        };
        
        return {
            high: calculateKpisForSeason('high'),
            low: calculateKpisForSeason('low'),
        };
    }, [inputs]);

    return results;

};
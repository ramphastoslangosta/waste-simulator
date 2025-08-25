import { useMemo } from 'react';
import { calculateGeneration } from '../simulation/modules/generation';
import { processCollection } from '../simulation/modules/collection';
import { processSeparation } from '../simulation/modules/separation';
import { processValorization } from '../simulation/modules/valorization';

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
                
                // --- GENERATION MODULE ---
                const generationResults = calculateGeneration(inputs, occupancy);
                const { genBySource, genByMaterial, genRSU, enhancedSeparationRates } = generationResults;

                // --- COLLECTION MODULE ---
                const collectionResults = processCollection(generationResults, inputs);
                const {
                    collectionCapacity,
                    collectionDeficit,
                    collectedWasteTotal,
                    collectedRatio,
                    collectedByMaterial,
                    informalRecoveryCollectionByMaterial,
                    wasteAfterInformalRec1,
                    informalRecoveryCollection,
                    leakCollection,
                    toTransferStationByMaterial,
                    toTransferStationTotal,
                } = collectionResults;

                // Update collection vehicle inventory (waste collected but not yet delivered to transfer station)
                collectionVehicleInventory += toTransferStationTotal;
                
                // --- SEPARATION MODULE ---
                const separationData = processSeparation(
                    generationResults, 
                    collectionResults, 
                    inputs,
                    { collectionVehicleInventory, rsuInventory }
                );
                const {
                    maxDeliveryCapacity,
                    actualDelivery,
                    materialAvailableInStation,
                    materialProcessedToday,
                    processedRatio,
                    processedByMaterial,
                    recoveredHighQuality,
                    recoveredLowQualityPlant,
                    totalRecoveredAtStation,
                } = separationData.results;
                
                // Update inventories from separation module
                collectionVehicleInventory = separationData.updatedInventory.collectionVehicleInventory;
                rsuInventory = separationData.updatedInventory.rsuInventory;
                
                // --- VALORIZATION MODULE ---
                const valorizationResults = processValorization(
                    processedByMaterial,
                    materialProcessedToday,
                    totalRecoveredAtStation,
                    inputs
                );
                const {
                    valorizedMaterials,
                    valorizationCosts,
                    valorizationIncomes,
                    totalValorizedMaterials,
                    availableOrganics,
                    availablePlastics,
                    leakTransferStation,
                    materialLeavingStation,
                } = valorizationResults;

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
                    const proportionOfValorizablesLeaving = valorizableTypes.reduce((sum, m) => sum + (processedByMaterial[m] || 0), 0) / materialProcessedToday;
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
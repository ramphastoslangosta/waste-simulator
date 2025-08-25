import { useMemo } from 'react';
import { calculateGeneration } from '../simulation/modules/generation';
import { processCollection } from '../simulation/modules/collection';
import { processSeparation } from '../simulation/modules/separation';
import { processValorization } from '../simulation/modules/valorization';
import { updateInventoriesAndFlows } from '../simulation/modules/inventory';
import { calculateEconomics } from '../simulation/modules/economics';

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

                // --- INVENTORY & FINAL DISPOSAL MODULE ---
                let valorizablesToDisposal = 0;
                if(materialLeavingStation > 0) {
                    const proportionOfValorizablesLeaving = valorizableTypes.reduce((sum, m) => sum + (processedByMaterial[m] || 0), 0) / materialProcessedToday;
                    valorizablesToDisposal = materialLeavingStation * proportionOfValorizablesLeaving;
                }
                
                const inventoryResults = updateInventoriesAndFlows(
                    { 
                        collectionVehicleInventory: collectionVehicleInventory,
                        rsuInventory: rsuInventory, 
                        finalTransportInventory: finalTransportInventory, 
                        disposalSiteInventory: disposalSiteInventory 
                    },
                    {
                        materialLeavingStation,
                        materialProcessedToday,
                        materialAvailableInStation,
                        valorizablesToDisposal
                    },
                    inputs
                );
                
                // Update inventory variables from results
                collectionVehicleInventory = inventoryResults.inventoryLevels.collectionVehicleInventory;
                rsuInventory = inventoryResults.inventoryLevels.rsuInventory;
                finalTransportInventory = inventoryResults.inventoryLevels.finalTransportInventory;
                disposalSiteInventory = inventoryResults.inventoryLevels.disposalSiteInventory;
                
                // Extract flow results for compatibility
                const { actualFinalTransport, untransportedMaterial, leakFinalTransport, arrivedAtDisposal, toDisposalSite } = inventoryResults.finalTransportFlows;
                const { informalRecoveryDisposal, leakDisposal, finalDisposal } = inventoryResults.disposalFlows;

                // --- ECONOMICS MODULE ---
                const economicsResults = calculateEconomics(
                    collectionResults,
                    separationData.results,
                    valorizationResults,
                    inventoryResults,
                    { materialProcessedToday, occupancy },
                    inputs,
                    currentSeason
                );
                
                // Extract economic values for compatibility
                const { totalCollectionCost, totalTransferCost, totalFinalTransportCost, totalDisposalCost, totalRsuCosts } = economicsResults.rsuCosts;
                const { incomeByMaterial, totalRsuIncome } = economicsResults.rsuIncome;
                const { netRsuCost } = economicsResults.netCosts;

                const rsuLeaks = collectionDeficit + leakCollection + leakTransferStation + leakFinalTransport + leakDisposal;
                const rsuRecovery = {
                    source: Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0),
                    plant: Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0),
                    informal: informalRecoveryCollection + informalRecoveryDisposal,
                };
                
                const { separationProgramCosts } = economicsResults.programCosts;
                const { sargassumCost, rcdCost } = economicsResults.specialWasteCosts;
                const { totalSystemCost } = economicsResults;
                
                // Extract special waste generations for compatibility
                const sargassumGeneration = currentSeason === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
                const rcdGeneration = inputs.specialWasteGeneration.construction;
                
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
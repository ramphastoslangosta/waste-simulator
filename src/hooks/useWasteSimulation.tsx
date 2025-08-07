import { useMemo } from 'react';

// Este hook personalizado contiene toda la lógica de cálculo de la simulación.
// Recibe los inputs del usuario y devuelve los resultados calculados.
export const useWasteSimulation = (inputs) => {
    const results = useMemo(() => {
        const calculateKpisForSeason = (currentSeason) => {
            const SIMULATION_DAYS = 30;
            let dailyResults = [];
            let rsuInventory = 0;
            const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
            const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

            for (let day = 0; day < SIMULATION_DAYS; day++) {
                const occupancy = currentSeason === 'high' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy;
                
                // --- FLOW 1: RSU (Residuos Sólidos Urbanos) ---
                let genBySource = {
                    hotels: (inputs.generation.hotels.units * occupancy / 100) * inputs.generation.hotels.rate / 1000,
                    restaurants: (inputs.generation.restaurants.units * inputs.generation.restaurants.rate) / 1000,
                    homes: (inputs.general.fixedPopulation * inputs.generation.homes.rate) / 1000,
                    commerce: (inputs.generation.commerce.units * inputs.generation.commerce.rate) / 1000,
                };
                let genByMaterial = { organicos: 0, pet: 0, aluminio: 0, carton: 0, vidrio: 0, rechazo: 0, peligrosos: 0 };
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
                let collectedByMaterial = {};
                materialTypes.forEach(m => collectedByMaterial[m] = genByMaterial[m] * collectedRatio);

                let informalRecoveryCollectionByMaterial = {};
                let wasteAfterInformalRec1 = {};
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
                
                let toTransferStationByMaterial = {};
                materialTypes.forEach(m => toTransferStationByMaterial[m] = wasteAfterInformalRec1[m] * (1 - leakRatio));
                const toTransferStationTotal = Object.values(toTransferStationByMaterial).reduce((a, b) => a + b, 0);

                let materialAvailableInStation = rsuInventory + toTransferStationTotal;
                const materialProcessedToday = Math.min(materialAvailableInStation, inputs.rsuSystem.processing.transferStationRate);
                
                let recoveredHighQuality = {};
                let recoveredLowQualityPlant = {};
                
                const processedRatio = toTransferStationTotal > 0 ? materialProcessedToday / toTransferStationTotal : 0;
                let processedByMaterial = {};
                materialTypes.forEach(m => processedByMaterial[m] = toTransferStationByMaterial[m] * processedRatio);

                valorizableTypes.forEach(m => {
                    let sourceSeparatedAmount = 0;
                    for (const source in genBySource) {
                        sourceSeparatedAmount += (genBySource[source] * (inputs.composition[source][m] / 100)) * (inputs.generation[source].sourceSeparationRate / 100);
                    }
                    const captured = sourceSeparatedAmount * (inputs.rsuSystem.separation.differentiatedCaptureRate / 100) * collectedRatio * processedRatio;
                    recoveredHighQuality[m] = captured * (1 - inputs.rsuSystem.separation.rejectionRateSource / 100);
                });

                valorizableTypes.forEach(m => {
                    const availableInMixed = Math.max(0, processedByMaterial[m] - (recoveredHighQuality[m] || 0));
                    recoveredLowQualityPlant[m] = availableInMixed * (inputs.rsuSystem.separation.plantSeparationEfficiency[m] / 100);
                });

                const totalRecoveredAtStation = Object.values(recoveredHighQuality).reduce((a,b)=>a+b,0) + Object.values(recoveredLowQualityPlant).reduce((a,b)=>a+b,0);
                const leakTransferStation = materialProcessedToday * (inputs.rsuSystem.leaks.transferStationLeak / 100);
                const materialLeavingStation = materialProcessedToday - totalRecoveredAtStation - leakTransferStation;

                const actualFinalTransport = Math.min(materialLeavingStation, inputs.rsuSystem.processing.finalTransportCapacity);
                const untransportedMaterial = materialLeavingStation - actualFinalTransport;
                const leakFinalTransport = actualFinalTransport * (inputs.rsuSystem.leaks.finalTransportLeak / 100);
                const toDisposalSite = actualFinalTransport - leakFinalTransport;
                
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
                const totalRsuCosts = totalCollectionCost + totalTransferCost + totalFinalTransportCost + totalDisposalCost;

                let incomeByMaterial = {};
                valorizableTypes.forEach(m => {
                    incomeByMaterial[m] = ((recoveredHighQuality[m] || 0) + (recoveredLowQualityPlant[m] || 0)) * inputs.rsuSystem.economics.income[m];
                });
                const totalRsuIncome = Object.values(incomeByMaterial).reduce((a, b) => a + b, 0);
                const netRsuCost = totalRsuCosts - totalRsuIncome;

                const rsuLeaks = collectionDeficit + leakCollection + leakTransferStation + leakFinalTransport + leakDisposal;
                const rsuRecovery = {
                    source: Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0),
                    plant: Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0),
                    informal: informalRecoveryCollection + informalRecoveryDisposal,
                };
                
                // --- FLOW 2 & 3: Special Wastes (Sargassum & RCD) ---
                const sargassumGeneration = currentSeason === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
                const rcdGeneration = inputs.specialWasteGeneration.construction;
                const sargassumCost = sargassumGeneration * (inputs.sargassumManagement.collectionCost + inputs.sargassumManagement.disposalCost);
                const rcdCost = rcdGeneration * (inputs.rcdManagement.collectionCost + inputs.rcdManagement.disposalCost);

                // --- FINAL CONSOLIDATION ---
                const totalSystemCost = netRsuCost + sargassumCost + rcdCost;
                
                dailyResults.push({
                    totalGeneration: genRSU + sargassumGeneration + rcdGeneration,
                    sargassumGeneration, rcdGeneration, sargassumCost, rcdCost, totalSystemCost,
                    rsu: {
                        totalGeneration: genRSU,
                        collectionDeficit,
                        totalLeak: rsuLeaks,
                        finalInventory: rsuInventory,
                        inventoryWaitTime: materialProcessedToday > 0 ? rsuInventory / materialProcessedToday : 0,
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
                rsu: {
                    totalGeneration: avg(stablePeriodResults.map(r => r.rsu.totalGeneration)),
                    collectionDeficit: avg(stablePeriodResults.map(r => r.rsu.collectionDeficit)),
                    totalLeak: avg(stablePeriodResults.map(r => r.rsu.totalLeak)),
                    finalInventory: rsuInventory,
                    inventoryWaitTime: avg(stablePeriodResults.map(r => r.rsu.inventoryWaitTime)),
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
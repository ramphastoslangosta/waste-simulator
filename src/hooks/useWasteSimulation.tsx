import { useMemo } from 'react';
import { runSimulation } from '../simulation/simulationEngine';

// React hook that serves as client interface to the simulation engine
// Handles input changes and requests new simulations from the central engine
export const useWasteSimulation = (inputs: any) => {
    const results = useMemo(() => {
        return {
            high: runSimulation(inputs, 'high'),
            low: runSimulation(inputs, 'low'),
        };
    }, [inputs]);

    return results;
};
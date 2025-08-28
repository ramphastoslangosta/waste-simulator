/**
 * Real-time Scientific Validation Dashboard
 * 
 * Provides live validation of mass conservation and physical constraints as users modify simulation parameters.
 * Critical for ensuring scientific credibility and detecting model issues immediately.
 */

import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity, Info, Gauge, Settings } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { validateMassConservation } from '../../utils/validation/massValidator.js';
import { validatePhysicalConstraints } from '../../utils/validation/constraintValidator.js';
import { formatNumber } from '../../utils/formatNumber';

interface ValidationDashboardProps {
  kpis: any;
  inputs: any;
  season: 'high' | 'low';
  enableRealTimeValidation?: boolean;
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ 
  kpis, 
  inputs, 
  season,
  enableRealTimeValidation = true 
}) => {
  // Run validation analysis
  const validation = useMemo(() => {
    if (!enableRealTimeValidation || !kpis || !inputs) {
      return null;
    }
    
    try {
      const massValidation = validateMassConservation(kpis, inputs, season);
      const constraintsValidation = validatePhysicalConstraints(kpis, inputs, season);
      
      // Combine validations
      return {
        massConservation: massValidation,
        physicalConstraints: constraintsValidation,
        isValid: massValidation.isValid && constraintsValidation.overallValid,
        errors: [...(massValidation.errors || []), ...(constraintsValidation.errors || [])],
        warnings: [...(massValidation.warnings || []), ...(constraintsValidation.warnings || [])],
        timestamp: new Date().toISOString(),
        season
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        errors: [`Validation error: ${error.message}`]
      };
    }
  }, [kpis, inputs, season, enableRealTimeValidation]);

  if (!validation) {
    return null;
  }

  const getStatusIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <XCircle className="text-red-500" size={20} />;
  };

  const getStatusColor = () => {
    if (validation.isValid) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getErrorColor = () => {
    if (!validation.massBalance) return 'text-gray-500';
    
    const errorPercent = validation.massBalance.percentageError || 0;
    if (errorPercent < 1) return 'text-green-600';
    if (errorPercent < 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="mb-4">
        <CardHeader 
          title="Estado General de Validación Científica" 
          subtitle={`Verificación automática completa - ${season === 'high' ? 'Temporada Alta' : 'Temporada Baja'}`}
          icon={<Activity size={18} />}
        />
        
        <div className={`flex items-center p-4 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <div className="ml-3">
            <div className="font-semibold text-lg">
              {validation.isValid ? 'TODAS LAS VALIDACIONES EXITOSAS' : 'VALIDACIONES FALLIDAS'}
            </div>
            <div className="text-sm">
              {validation.isValid 
                ? 'El modelo cumple con todos los principios científicos y restricciones físicas'
                : 'Se detectaron violaciones en los principios científicos o restricciones físicas'
              }
            </div>
          </div>
        </div>
      </Card>

      {/* Mass Conservation Validation */}
      <Card className="mb-4">
        <CardHeader 
          title="Validación de Conservación de Masa" 
          subtitle="Principio físico fundamental: la masa no se crea ni se destruye"
          icon={<Activity size={18} />}
        />
      
      {/* Mass Conservation Status */}
      <div className={`flex items-center p-3 rounded-lg border mb-4 ${validation.massConservation?.isValid ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
        {validation.massConservation?.isValid ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <div className="ml-3">
          <div className="font-semibold">
            {validation.massConservation?.isValid ? 'Conservación de Masa: EXITOSA' : 'Conservación de Masa: FALLIDA'}
          </div>
          <div className="text-sm">
            {validation.massConservation?.isValid 
              ? 'La conservación de masa se mantiene dentro de los límites aceptables'
              : 'Se detectaron violaciones en la conservación de masa'
            }
          </div>
        </div>
      </div>

      {/* Mass Balance Equation */}
      {validation.massConservation?.massBalance && (
        <div className="mb-4">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
            <Info size={16} className="mr-2" />
            Ecuación de Balance de Masa
          </h4>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm">
            <div className="text-center mb-2 font-semibold">
              G<sub>total</sub> = Material<sub>dispuesto</sub> + Material<sub>recuperado</sub> + Material<sub>valorizado</sub> + Fugas<sub>total</sub> + Déficit<sub>recolección</sub> + Material<sub>acumulado</sub>
            </div>
            <div className="text-center text-lg">
              <span className="text-blue-600 font-bold">
                {formatNumber(validation.massConservation.massBalance.totalGenerated, 3)}
              </span>
              <span className="mx-2">=</span>
              <span className="text-slate-600">
                {formatNumber(validation.massConservation.massBalance.totalAccounted, 3)}
              </span>
            </div>
            <div className={`text-center text-sm mt-1 ${validation.massConservation.massBalance.percentageError < 1 ? 'text-green-600' : validation.massConservation.massBalance.percentageError < 2 ? 'text-yellow-600' : 'text-red-600'}`}>
              Error: {formatNumber(Math.abs(validation.massConservation.massBalance.equation?.difference || 0), 6)} ton/día 
              ({formatNumber(validation.massConservation.massBalance.percentageError || 0, 4)}%)
            </div>
          </div>
        </div>
      )}

      {/* Component Breakdown */}
      {validation.massConservation?.components && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {formatNumber(validation.massConservation.components.generated, 2)}
            </div>
            <div className="text-xs text-slate-600">Generado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-600">
              {formatNumber(validation.massConservation.components.disposed, 2)}
            </div>
            <div className="text-xs text-slate-600">Dispuesto (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {formatNumber(validation.massConservation.components.recovered, 2)}
            </div>
            <div className="text-xs text-slate-600">Recuperado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {formatNumber(validation.massConservation.components.valorized, 2)}
            </div>
            <div className="text-xs text-slate-600">Valorizado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {formatNumber(validation.massConservation.components.leaked, 2)}
            </div>
            <div className="text-xs text-slate-600">Fugas (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">
              {formatNumber(validation.massConservation.components.collectionDeficit, 2)}
            </div>
            <div className="text-xs text-slate-600">Déficit Recolección</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">
              {formatNumber(validation.massConservation.components.materialAccumulated || 0, 2)}
            </div>
            <div className="text-xs text-slate-600">Material Acumulado</div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {validation.massConservation?.components?.valorizationBreakdown && (
        <div className="mb-4">
          <h5 className="font-semibold text-slate-700 mb-2">Desglose de Valorización</h5>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="font-bold text-green-700">
                {formatNumber(validation.massConservation.components.valorizationBreakdown.composted, 3)}
              </div>
              <div className="text-xs">Compostaje</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="font-bold text-blue-700">
                {formatNumber(validation.massConservation.components.valorizationBreakdown.biogas, 3)}
              </div>
              <div className="text-xs">Biogás</div>
            </div>
            <div className="text-center p-2 bg-orange-100 rounded">
              <div className="font-bold text-orange-700">
                {formatNumber(validation.massConservation.components.valorizationBreakdown.pyrolyzed, 3)}
              </div>
              <div className="text-xs">Pirólisis</div>
            </div>
          </div>
        </div>
      )}
      </Card>

      {/* Physical Constraints Validation */}
      <Card className="mb-4">
        <CardHeader 
          title="Validación de Restricciones Físicas" 
          subtitle="Verificación de capacidades y límites físicos del sistema"
          icon={<Gauge size={18} />}
        />
        
        {/* Physical Constraints Status */}
        <div className={`flex items-center p-3 rounded-lg border mb-4 ${validation.physicalConstraints?.overallValid ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
          {validation.physicalConstraints?.overallValid ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <div className="ml-3">
            <div className="font-semibold">
              {validation.physicalConstraints?.overallValid ? 'Restricciones Físicas: EXITOSAS' : 'Restricciones Físicas: FALLIDAS'}
            </div>
            <div className="text-sm">
              {validation.physicalConstraints?.overallValid 
                ? 'Todas las capacidades y límites físicos son respetados'
                : 'Se detectaron violaciones en capacidades o límites físicos'
              }
            </div>
          </div>
        </div>

        {/* Capacity Utilization Overview */}
        {validation.physicalConstraints && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Collection Capacity */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-blue-700">Recolección</h5>
                <div className={`text-xs px-2 py-1 rounded ${validation.physicalConstraints.collectionConstraints?.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {validation.physicalConstraints.collectionConstraints?.isValid ? 'OK' : 'EXCEDIDO'}
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatNumber((validation.physicalConstraints.collectionConstraints?.utilizationRate || 0) * 100, 1)}%
              </div>
              <div className="text-xs text-slate-600">
                Utilización: {formatNumber(validation.physicalConstraints.collectionConstraints?.totalGeneration || 0, 1)} / {formatNumber(validation.physicalConstraints.collectionConstraints?.collectionCapacity || 0, 1)} ton/día
              </div>
            </div>

            {/* Transfer Station Capacity */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-orange-700">Estación Transferencia</h5>
                <div className={`text-xs px-2 py-1 rounded ${validation.physicalConstraints.transferStationConstraints?.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {validation.physicalConstraints.transferStationConstraints?.isValid ? 'OK' : 'EXCEDIDO'}
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatNumber((validation.physicalConstraints.transferStationConstraints?.utilizationRate || 0) * 100, 1)}%
              </div>
              <div className="text-xs text-slate-600">
                Inventario: {formatNumber(validation.physicalConstraints.transferStationConstraints?.transferStationInventory || 0, 1)} / {formatNumber(validation.physicalConstraints.transferStationConstraints?.transferStationCapacity || 0, 1)} ton
              </div>
            </div>

            {/* Final Transport Capacity */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-purple-700">Transporte Final</h5>
                <div className={`text-xs px-2 py-1 rounded ${validation.physicalConstraints.finalTransportConstraints?.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {validation.physicalConstraints.finalTransportConstraints?.isValid ? 'OK' : 'EXCEDIDO'}
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatNumber((validation.physicalConstraints.finalTransportConstraints?.utilizationRate || 0) * 100, 1)}%
              </div>
              <div className="text-xs text-slate-600">
                Necesidad: {formatNumber(validation.physicalConstraints.finalTransportConstraints?.dailyTransportNeed || 0, 1)} / {formatNumber(validation.physicalConstraints.finalTransportConstraints?.finalTransportCapacity || 0, 1)} ton/día
              </div>
            </div>
          </div>
        )}

        {/* Bottleneck Analysis */}
        {validation.physicalConstraints?.bottleneckAnalysis?.hasBottlenecks && (
          <div className="mb-4">
            <h5 className="font-semibold text-red-700 mb-2 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              Análisis de Cuellos de Botella
            </h5>
            <div className="space-y-2">
              {validation.physicalConstraints.bottleneckAnalysis.identifiedBottlenecks?.map((bottleneck, index) => (
                <div key={index} className={`text-sm p-2 rounded border-l-4 ${bottleneck.severity === 'critical' ? 'text-red-700 bg-red-50 border-red-400' : 'text-yellow-700 bg-yellow-50 border-yellow-400'}`}>
                  <div className="font-semibold">{bottleneck.type.charAt(0).toUpperCase() + bottleneck.type.slice(1)}</div>
                  <div>{bottleneck.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Combined Errors and Warnings */}
      {validation.errors && validation.errors.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold text-red-700 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Errores Detectados
          </h5>
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border-l-4 border-red-400">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {validation.warnings && validation.warnings.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold text-yellow-700 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Advertencias
          </h5>
          <div className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <Card className="mb-4">
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold mb-2">Detalles Técnicos de Validación</summary>
          <div className="bg-slate-50 p-3 rounded font-mono">
            <div>Timestamp: {validation.timestamp}</div>
            <div>Temporada: {validation.season}</div>
            <div className="mt-2">
              <strong>Conservación de Masa:</strong>
              {validation.massConservation?.massBalance && (
                <>
                  <div>Error Absoluto: {formatNumber(validation.massConservation.massBalance.absoluteError, 6)} ton/día</div>
                  <div>Error Relativo: {formatNumber(validation.massConservation.massBalance.relativeError * 100, 4)}%</div>
                  <div>Umbral Aceptable: 2.0%</div>
                </>
              )}
            </div>
            <div className="mt-2">
              <strong>Restricciones Físicas:</strong>
              {validation.physicalConstraints && (
                <>
                  <div>Estrés del Sistema: {formatNumber((validation.physicalConstraints.bottleneckAnalysis?.systemStress || 0) * 100, 1)}%</div>
                  <div>Cuellos de Botella: {validation.physicalConstraints.bottleneckAnalysis?.bottleneckCount || 0}</div>
                  <div>Validación General: {validation.physicalConstraints.overallValid ? 'EXITOSA' : 'FALLIDA'}</div>
                </>
              )}
            </div>
          </div>
        </details>
      </Card>
    </div>
  );
};

export default ValidationDashboard;
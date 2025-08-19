/**
 * Real-time Mass Conservation Validation Dashboard
 * 
 * Provides live validation of mass conservation as users modify simulation parameters.
 * Critical for ensuring scientific credibility and detecting model issues immediately.
 */

import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity, Info } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { validateMassConservation } from '../../utils/validation/massValidator.js';
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
      return validateMassConservation(kpis, inputs, season);
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
    <Card className="mb-4">
      <CardHeader 
        title="Validación de Conservación de Masa" 
        subtitle={`Verificación científica automática - ${season === 'high' ? 'Temporada Alta' : 'Temporada Baja'}`}
        icon={<Activity size={18} />}
      />
      
      {/* Status Summary */}
      <div className={`flex items-center p-3 rounded-lg border mb-4 ${getStatusColor()}`}>
        {getStatusIcon()}
        <div className="ml-3">
          <div className="font-semibold">
            {validation.isValid ? 'Validación EXITOSA' : 'Validación FALLIDA'}
          </div>
          <div className="text-sm">
            {validation.isValid 
              ? 'La conservación de masa se mantiene dentro de los límites aceptables'
              : 'Se detectaron violaciones en la conservación de masa'
            }
          </div>
        </div>
      </div>

      {/* Mass Balance Equation */}
      {validation.massBalance && (
        <div className="mb-4">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
            <Info size={16} className="mr-2" />
            Ecuación de Balance de Masa
          </h4>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm">
            <div className="text-center mb-2 font-semibold">
              G<sub>total</sub> = Material<sub>dispuesto</sub> + Material<sub>recuperado</sub> + Material<sub>valorizado</sub> + Fugas<sub>total</sub>
            </div>
            <div className="text-center text-lg">
              <span className="text-blue-600 font-bold">
                {formatNumber(validation.massBalance.totalGenerated, 3)}
              </span>
              <span className="mx-2">=</span>
              <span className="text-slate-600">
                {formatNumber(validation.massBalance.totalAccounted, 3)}
              </span>
            </div>
            <div className={`text-center text-sm mt-1 ${getErrorColor()}`}>
              Error: {formatNumber(Math.abs(validation.massBalance.equation?.difference || 0), 6)} ton/día 
              ({formatNumber(validation.massBalance.percentageError || 0, 4)}%)
            </div>
          </div>
        </div>
      )}

      {/* Component Breakdown */}
      {validation.components && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {formatNumber(validation.components.generated, 2)}
            </div>
            <div className="text-xs text-slate-600">Generado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-600">
              {formatNumber(validation.components.disposed, 2)}
            </div>
            <div className="text-xs text-slate-600">Dispuesto (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {formatNumber(validation.components.recovered, 2)}
            </div>
            <div className="text-xs text-slate-600">Recuperado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {formatNumber(validation.components.valorized, 2)}
            </div>
            <div className="text-xs text-slate-600">Valorizado (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {formatNumber(validation.components.leaked, 2)}
            </div>
            <div className="text-xs text-slate-600">Fugas (ton/día)</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">
              {formatNumber(validation.components.collectionDeficit, 2)}
            </div>
            <div className="text-xs text-slate-600">Déficit Recolección</div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {validation.components?.valorizationBreakdown && (
        <div className="mb-4">
          <h5 className="font-semibold text-slate-700 mb-2">Desglose de Valorización</h5>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-green-100 rounded">
              <div className="font-bold text-green-700">
                {formatNumber(validation.components.valorizationBreakdown.composted, 3)}
              </div>
              <div className="text-xs">Compostaje</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded">
              <div className="font-bold text-blue-700">
                {formatNumber(validation.components.valorizationBreakdown.biogas, 3)}
              </div>
              <div className="text-xs">Biogás</div>
            </div>
            <div className="text-center p-2 bg-orange-100 rounded">
              <div className="font-bold text-orange-700">
                {formatNumber(validation.components.valorizationBreakdown.pyrolyzed, 3)}
              </div>
              <div className="text-xs">Pirólisis</div>
            </div>
          </div>
        </div>
      )}

      {/* Errors and Warnings */}
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
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold mb-2">Detalles Técnicos</summary>
        <div className="bg-slate-50 p-3 rounded font-mono">
          <div>Timestamp: {validation.timestamp}</div>
          <div>Temporada: {validation.season}</div>
          {validation.massBalance && (
            <>
              <div>Error Absoluto: {formatNumber(validation.massBalance.absoluteError, 6)} ton/día</div>
              <div>Error Relativo: {formatNumber(validation.massBalance.relativeError * 100, 4)}%</div>
              <div>Umbral Aceptable: 2.0%</div>
            </>
          )}
        </div>
      </details>
    </Card>
  );
};

export default ValidationDashboard;
import React from 'react';
import Card from './Card.tsx';
import ExportButton from './ExportButton.tsx';
import { useExportRef } from '../../hooks/useExportRef';

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  description?: string;
  color?: string;
  enableExport?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  unit, 
  description, 
  color = 'text-blue-600',
  enableExport = false 
}) => {
  const { elementRef, getExportElement } = useExportRef();

  return (
    <div ref={elementRef} className="relative">
      <Card>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{title}</p>
            <p className={`text-4xl font-bold mt-1 ${color}`}>
              {value}
              <span className="text-2xl ml-1">{unit}</span>
            </p>
            {description && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
            )}
          </div>
          
          {enableExport && (
            <div className="ml-2 mt-1">
              <ExportButton
                targetElement={getExportElement()}
                exportName={title}
                exportType="kpi"
                size="sm"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default KPICard;
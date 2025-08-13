import React from 'react';
import Card from './Card.tsx';
import CardHeader from './CardHeader.tsx';
import ExportButton from './ExportButton.tsx';
import { useExportRef } from '../../hooks/useExportRef';

interface ChartExportWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  enableExport?: boolean;
  className?: string;
}

const ChartExportWrapper: React.FC<ChartExportWrapperProps> = ({
  title,
  subtitle,
  children,
  enableExport = false,
  className = ''
}) => {
  const { elementRef } = useExportRef();

  return (
    <div ref={elementRef} className={`relative ${className}`} data-export-name={title}>
      <Card>
        <div className="flex justify-between items-start mb-4">
          <CardHeader title={title} subtitle={subtitle} />
          
          {enableExport && (
            <div className="ml-4">
              <ExportButton
                targetElement={elementRef.current}
                exportName={title}
                exportType="chart"
                size="sm"
                showLabel={true}
              />
            </div>
          )}
        </div>
        
        {/* Chart content */}
        <div className="chart-content">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default ChartExportWrapper;
import React, { useState } from 'react';
import { Download, Image, FileText, ChevronDown } from 'lucide-react';
import { exportElementAsImage, ExportOptions } from '../../utils/exportUtils';

interface ExportButtonProps {
  targetElement: HTMLElement | null;
  exportName: string;
  exportType?: 'kpi' | 'chart' | 'dashboard';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  targetElement,
  exportName,
  exportType = 'chart',
  className = '',
  size = 'sm',
  showLabel = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (format: 'png' | 'svg', dpi: number = 300) => {
    // Find the target element at the time of export
    const element = targetElement || document.querySelector(`[data-export-name="${exportName}"]`) as HTMLElement;
    
    if (!element) {
      alert('No se pudo encontrar el elemento para exportar');
      console.error('Target element not found:', { targetElement, exportName });
      return;
    }

    setIsExporting(true);
    setShowOptions(false);

    try {
      const options: ExportOptions = {
        format,
        dpi,
        filename: `${exportType}-${exportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
        backgroundColor: '#ffffff'
      };

      await exportElementAsImage(element, options);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(`Error al exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;
  const buttonSize = size === 'sm' ? 'p-1' : size === 'md' ? 'p-2' : 'p-3';
  
  return (
    <div className={`relative ${className}`}>
      {/* Simple export button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className={`
          ${buttonSize} bg-white border border-slate-200 rounded-lg shadow-sm
          hover:bg-slate-50 hover:border-slate-300 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-1 text-slate-600 hover:text-slate-700
        `}
        title={`Exportar ${exportName}`}
      >
        {isExporting ? (
          <div className="animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" 
               style={{ width: iconSize, height: iconSize }} />
        ) : (
          <Download size={iconSize} />
        )}
        
        {showLabel && (
          <span className="text-xs font-medium">
            {isExporting ? 'Exportando...' : 'Exportar'}
          </span>
        )}
        
        {!isExporting && <ChevronDown size={iconSize - 2} />}
      </button>

      {/* Export options dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <p className="text-xs font-semibold text-slate-700 mb-2">Formato de Exportación</p>
            
            {/* PNG Options */}
            <div className="space-y-1 mb-3">
              <p className="text-xs text-slate-500">PNG (Imagen)</p>
              <button
                onClick={() => handleExport('png', 300)}
                className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 rounded flex items-center gap-2"
              >
                <Image size={12} />
                <span>PNG 300 DPI (Thesis)</span>
              </button>
              <button
                onClick={() => handleExport('png', 150)}
                className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 rounded flex items-center gap-2"
              >
                <Image size={12} />
                <span>PNG 150 DPI (Web)</span>
              </button>
            </div>

            {/* SVG Option */}
            <div className="space-y-1 border-t border-slate-100 pt-2">
              <p className="text-xs text-slate-500">Vector</p>
              <button
                onClick={() => handleExport('svg')}
                className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 rounded flex items-center gap-2"
              >
                <FileText size={12} />
                <span>SVG (Escalable)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
// High-resolution export utilities for charts and KPI cards
import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'png' | 'svg';
  dpi?: number;
  filename?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

// Export any DOM element as high-resolution image
export const exportElementAsImage = async (
  element: HTMLElement,
  options: ExportOptions = { format: 'png' }
): Promise<void> => {
  const {
    format = 'png',
    dpi = 300,
    filename = `export-${Date.now()}`,
    backgroundColor = '#ffffff'
  } = options;

  try {
    if (format === 'svg') {
      await exportElementAsSVG(element, filename);
    } else {
      await exportElementAsPNG(element, { dpi, filename, backgroundColor });
    }
  } catch (error) {
    console.error('Error exporting element:', error);
    throw new Error(`Failed to export as ${format.toUpperCase()}: ${error.message}`);
  }
};

// Export element as high-resolution PNG
const exportElementAsPNG = async (
  element: HTMLElement,
  options: { dpi: number; filename: string; backgroundColor: string }
): Promise<void> => {
  const { dpi, filename, backgroundColor } = options;
  
  // Calculate scale factor for high DPI (300 DPI = 4.17x scale from 72 DPI)
  const scale = dpi / 72;
  
  // Get element dimensions
  const rect = element.getBoundingClientRect();
  const width = rect.width * scale;
  const height = rect.height * scale;

  // Wait a moment for any animations or renders to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Configure html2canvas for high resolution with better content capture
  const canvas = await html2canvas(element, {
    scale: scale,
    width: rect.width,
    height: rect.height,
    backgroundColor: backgroundColor,
    useCORS: true,
    allowTaint: true,  // Allow tainted canvas for better content capture
    logging: true,     // Enable logging to debug issues
    imageTimeout: 5000, // Longer timeout for image loading
    removeContainer: true,
    foreignObjectRendering: false,  // Disable for better SVG/chart capture
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    onclone: (clonedDoc, element) => {
      // Ensure all stylesheets are properly applied
      const allStyles = Array.from(document.styleSheets);
      allStyles.forEach(styleSheet => {
        try {
          const clonedStyleSheet = clonedDoc.createElement('style');
          if (styleSheet.cssRules) {
            Array.from(styleSheet.cssRules).forEach(rule => {
              clonedStyleSheet.appendChild(clonedDoc.createTextNode(rule.cssText));
            });
          }
          clonedDoc.head.appendChild(clonedStyleSheet);
        } catch (e) {
          console.warn('Could not clone stylesheet:', e);
        }
      });

      // Force visibility on the cloned element
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      
      // Ensure fonts render properly
      element.style.fontSmooth = 'antialiased';
      element.style.webkitFontSmoothing = 'antialiased';
    }
  });

  // Debug: Check if canvas has content
  const context = canvas.getContext('2d');
  const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
  const hasContent = imageData && Array.from(imageData.data).some(pixel => pixel !== 255 && pixel !== 0);
  
  console.log('Canvas debug:', {
    width: canvas.width,
    height: canvas.height,
    hasContent,
    elementRect: rect,
    scale
  });

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${filename}.png`);
    } else {
      console.error('Failed to create blob from canvas');
      throw new Error('Failed to create image blob');
    }
  }, 'image/png', 1.0);
};

// Export element as SVG (vector format for infinite scaling)
const exportElementAsSVG = async (element: HTMLElement, filename: string): Promise<void> => {
  // Create SVG from DOM element
  const rect = element.getBoundingClientRect();
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  
  svg.setAttribute('width', rect.width.toString());
  svg.setAttribute('height', rect.height.toString());
  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute('xmlns', svgNS);

  // Convert HTML to SVG foreignObject (preserves styling)
  const foreignObject = document.createElementNS(svgNS, 'foreignObject');
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  
  // Clone the element to avoid modifying original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Convert all computed styles to inline styles for SVG compatibility
  await inlineStyles(clonedElement);
  
  foreignObject.appendChild(clonedElement);
  svg.appendChild(foreignObject);

  // Convert SVG to string and download
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  downloadBlob(blob, `${filename}.svg`);
};

// Convert all computed styles to inline styles for SVG export
const inlineStyles = async (element: HTMLElement): Promise<void> => {
  const computedStyle = window.getComputedStyle(element);
  const cssText = Array.from(computedStyle).reduce((css, property) => {
    return css + `${property}:${computedStyle.getPropertyValue(property)};`;
  }, '');
  
  element.style.cssText = cssText;
  
  // Recursively process child elements
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    await inlineStyles(child);
  }
};

// Download blob as file
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Specialized export functions for specific components

// Export KPI Card with optimized settings
export const exportKPICard = async (
  element: HTMLElement,
  title: string,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const defaultOptions: ExportOptions = {
    format: 'png',
    dpi: 300,
    filename: `kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    backgroundColor: '#ffffff'
  };

  const exportOptions = { ...defaultOptions, ...options };
  
  // Add export identifier for cloning
  element.dataset.exportId = `kpi-card-${Date.now()}`;
  
  await exportElementAsImage(element, exportOptions);
};

// Export Chart with optimized settings for data visualization
export const exportChart = async (
  element: HTMLElement,
  chartTitle: string,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const defaultOptions: ExportOptions = {
    format: 'png',
    dpi: 300,
    filename: `chart-${chartTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    backgroundColor: '#ffffff'
  };

  const exportOptions = { ...defaultOptions, ...options };
  
  // Add export identifier for cloning
  element.dataset.exportId = `chart-${Date.now()}`;
  
  // Wait for chart to fully render (important for Recharts)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Special handling for Recharts SVG elements
  const svgElements = element.querySelectorAll('svg');
  svgElements.forEach(svg => {
    // Ensure SVG has proper dimensions
    if (!svg.getAttribute('width') || !svg.getAttribute('height')) {
      const bbox = svg.getBBox();
      svg.setAttribute('width', bbox.width.toString());
      svg.setAttribute('height', bbox.height.toString());
    }
    
    // Ensure SVG is visible
    svg.style.display = 'block';
    svg.style.visibility = 'visible';
  });
  
  await exportElementAsImage(element, exportOptions);
};

// Export entire dashboard section
export const exportDashboardSection = async (
  element: HTMLElement,
  sectionName: string,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const defaultOptions: ExportOptions = {
    format: 'png',
    dpi: 300,
    filename: `dashboard-${sectionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    backgroundColor: '#f8fafc' // Light background for dashboard sections
  };

  const exportOptions = { ...defaultOptions, ...options };
  
  // Add export identifier for cloning
  element.dataset.exportId = `dashboard-${Date.now()}`;
  
  await exportElementAsImage(element, exportOptions);
};

// Batch export multiple elements
export const exportMultipleElements = async (
  elements: { element: HTMLElement; name: string; type: 'kpi' | 'chart' | 'dashboard' }[],
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const timestamp = Date.now();
  
  for (const { element, name, type } of elements) {
    const filename = `${type}-${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    const exportOptions = { ...options, filename };
    
    try {
      switch (type) {
        case 'kpi':
          await exportKPICard(element, name, exportOptions);
          break;
        case 'chart':
          await exportChart(element, name, exportOptions);
          break;
        case 'dashboard':
          await exportDashboardSection(element, name, exportOptions);
          break;
      }
      
      // Small delay between exports to prevent browser overwhelm
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to export ${type} "${name}":`, error);
    }
  }
};
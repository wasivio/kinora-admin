import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeSVGProps {
  value: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 42,
  displayValue = false,
  fontSize = 10,
  margin = 0,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          margin,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  return <svg ref={svgRef} className={className} />;
};

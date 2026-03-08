import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeGenerator = ({ value, width = 2, height = 50, fontSize = 14 }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        width,
        height,
        displayValue: true,
        fontSize,
      });
    }
  }, [value, width, height, fontSize]);

  if (!value) return null;

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <svg ref={barcodeRef} id={`barcode-${value}`}></svg>
    </div>
  );
};

export default BarcodeGenerator;

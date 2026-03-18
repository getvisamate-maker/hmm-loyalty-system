"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCodeGenerator({ url }: { url: string }) {
  return (
    <QRCodeSVG 
      value={url} 
      size={200}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"Q"}
      includeMargin={false}
    />
  );
}
"use client"

import { Document, Page, pdfjs } from "react-pdf";
import React from "react";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// THIS FILE IS FROM THE NODE_MODULES FROM THE PDFJS-DIST/BUILD/PDF.WORKER.MJS we just moved it to the public folder cause that just what worked.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


const PdfRenderer = ({ url }: { url:string }) => {
  console.log(url);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          top bar
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document
            file={url}
            className='max-h-full'
            onLoadError={error => alert(`PDF load error ${error}`)}
          >
            <Page pageNumber={1} />
          </Document>
        </div>
      </div>
    </div>
  )
}

export default PdfRenderer
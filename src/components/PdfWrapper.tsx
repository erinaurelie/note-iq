"use client"


import dynamic from "next/dynamic";


const PdfRenderer = dynamic(() => import("./PdfRenderer"), {
  ssr: false,
});


const PdfWrapper = ({ url }: { url:string }) => {
  return <PdfRenderer url={url} />
}

export default PdfWrapper
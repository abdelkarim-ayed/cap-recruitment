import { useEffect, useState } from 'react';
import { errorMessage } from './api';
import { Notice, Loading } from './ui';

// Reuse authorized, integrity-checked attachment endpoint; no untrusted inline HTML.
export function PdfPreview({applicationId,document,documentBase,onClose}:{applicationId:string;document:{id:string;filename:string};documentBase?:string;onClose:()=>void}) {
  const [url,setUrl]=useState(''),[error,setError]=useState('');
  useEffect(()=>{
    let active=true,objectUrl='';const controller=new AbortController();
    (async()=>{
      try{
        const response=await fetch(`/api/${documentBase??`applications/${applicationId}/documents`}/${document.id}`,{credentials:'include',signal:controller.signal});
        if(!response.ok)throw new Error(`Preview failed (${response.status}). Please retry or sign in again.`);
        const bytes=await response.arrayBuffer();
        if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('This file is not a PDF. Download it to view in an appropriate application.');
        if(!active)return;objectUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));setUrl(objectUrl);
      }catch(e){if(active)setError(errorMessage(e));}
    })();
    return()=>{active=false;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[applicationId,document.id,documentBase]);
  return <section className="card pdf-preview" aria-label="Document preview"><div className="section-heading"><div><h2>CV preview</h2><p>{document.filename}</p></div><button onClick={onClose}>Close preview</button></div><Notice message={error}/>{url?<iframe title={`PDF: ${document.filename}`} src={url} className="pdf-frame"/>:!error&&<Loading/>}</section>;
}

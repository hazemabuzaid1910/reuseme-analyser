import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import formatSize from '../lib/formatSize';

interface FileUploaderProps{
    onFileSelect?:(file:File|null)=>void;
}


function FileUploader({onFileSelect}:FileUploaderProps) {
      const onDrop = useCallback((acceptedFiles:File[]) => {
        const file=acceptedFiles[0] ||null;
        onFileSelect?.(file);
  }, [onFileSelect])
      const maxFileSize = 20 * 1024 * 1024;
            const {getRootProps, getInputProps, isDragActive,acceptedFiles} = useDropzone({
                onDrop: (files) => {
                    console.debug('FileUploader onDrop', files);
                    onDrop(files as File[]);
                },
                multiple: false,
                accept:{'application/pdf':['.pdf']},
                maxSize: maxFileSize
        })
const file= acceptedFiles[0]||null;
  return (
    <div className='gradient-border w-full'>
    <div  {...getRootProps()}>
      <input {...getInputProps()} />
  <div className='space-y-4 cursor-pointer '>

    {file ?(
        <div className='uploader-selected-file'>
                        <img src="/images/pdf.png" alt="" className='size-10'/>

        <div className='flex space-x-3 text-center'>
           <div>
            <p className='text-lg text-gray-700 font-medium truncate'>{file.name}</p>
            <p className='text-gray-500'>{formatSize(file.size)}</p>
            </div> 
        </div>
        <button className='p-2 cursor-pointer' onClick={(e)=>{
            onFileSelect?.(null);
        }}>
            <img src="/icons/cross.svg" alt="remove" className='w-4 h-4' />
        </button>
        </div>
    ):(
    <div>
            <div className='mx-auto w-16 flex items-center  justify-center'>
        <img src="/icons/info.svg" alt="" />
    </div>
        <p className='text-lg text-gray-500'>
            <span className='font-semibold'>
                Click to Upload
            </span>or drag and drop
        </p>
        <p className='text-lg text-gray-500 '>PDF (max {formatSize(maxFileSize)})</p>
    </div>)
    }
  </div>
    </div>
    </div>  )
}

export default FileUploader
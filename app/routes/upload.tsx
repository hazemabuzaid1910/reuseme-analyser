import { prepareInstructions } from '../../constants/index';
import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader'
import Navbar from '~/components/Navbar'
import { generateUUID } from '~/lib/formatSize';
import { usePuterStore } from '~/lib/puter'


function Upload() {
  const {auth,isLoading,ai,kv,fs}=usePuterStore();
  console.log("Auth State:", auth.isAuthenticated);
  const navigate=useNavigate();
   const[isProcessing,setIsProcessing]= useState(false)
   const[statusText,setStatusText]= useState('')
  const [file,setFile]=useState<File|null>(null)

const handleAnalyse=async({companyName,jobTitle,jobDescription,file}:{companyName:string,jobTitle:string,jobDescription:string,file:File})=>{
    setIsProcessing(true);
      setStatusText('Analyzing your resume...');
      const uploadFile=await fs.upload([file]);
      setStatusText('Generating ATS score...');
if(!uploadFile) {
  setIsProcessing(false);
  return setStatusText('File upload failed. Please try again.');
}
setStatusText('Converting to image ...');

let imageFile;
try {
  // Dynamically import the client-only pdf converter so SSR / dev server
  // doesn't try to resolve pdfjs on the server and fail.
  const mod = await import('../lib/pdf2image');
  imageFile = await mod.convertPdfToImage(file);

} catch (err) {
  console.error('PDF conversion/import failed', err);
  setIsProcessing(false);
  return setStatusText('PDF to image conversion failed. Please try again.');
}   
if(!imageFile || !imageFile.file) {
console.log("Image file conversion result:", imageFile);
setStatusText('Uploading the image...');
  return setStatusText('PDF to image conversion failed. Please try again.');
}

const uploadImage=await fs.upload([imageFile.file]);
if(!uploadImage) {
  setIsProcessing(false);
  return setStatusText('Image upload failed. Please try again.');
} 

const uuid=generateUUID();
const data={
  id:uuid,
  resumePath:uploadFile.path,
  imagePath:uploadImage.path,
  companyName,
  jobTitle,
  feedback:''
}
await kv.set(`resume-${uuid}`,JSON.stringify(data));
setStatusText('Analysing ...');


let feedback;
try {
  console.log("Calling AI feedback with path:", uploadFile.path);
  feedback = await ai.feedback(
    uploadFile.path,
    prepareInstructions({ jobTitle, jobDescription })
  );
  console.log("Raw AI feedback:", feedback);
} catch (err) {
  console.error("AI feedback error:", err);
  setIsProcessing(false);
  setStatusText("AI feedback failed. Check console for details.");
  return;
}

if (!feedback) {
  setIsProcessing(false);
  return setStatusText("Feedback generation failed. Please try again.");
}

console.log("AI feedback done ✅");

  const feedbackText= typeof feedback.message.content === 'string' 
  ? feedback.message.content
  :feedback.message.content[0].text;
  data.feedback=JSON.parse(feedbackText);
  await kv.set(`resume-${uuid}`,JSON.stringify(data));
  setStatusText('Analysis Completed!');
  console.log(data);
  setIsProcessing(false);
}


    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
           event.preventDefault();
           const form=event.currentTarget.closest('form');
           if(!form) return;
           const formData=new FormData(form);
           const companyName=formData.get('company-name') as string;
            const jobTitle=formData.get('job-title') as string;
            const jobDescription=formData.get('job-discrption') as string;
           if(!file) return;
          handleAnalyse({companyName,jobTitle,jobDescription,file});
      
        }
const handleFileSelect=(file:File|null)=>{
setFile(file);
}
  return (
    <main className="bg-[url('/images/bg-auth.svg')]  bg-cover">
    <Navbar/>
    <section className="main-section">

    <div className='page-heading py-16'>
        <h1>Smart feedback for your dream job</h1>
        {isProcessing?(
            <>
            <h2>{statusText}</h2>
            <img src="/images/resume-scan.gif" alt="" className='w-full' />
            </>
        ):(
            <h2>Drop your resume for an ATS score </h2>
        )}
        {!isProcessing  && (
               <form action="" id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                 <div className='form-div'>
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name='company-name' placeholder='Company Name' id='company-name'/>
                 </div>
                    <div className='form-div'>
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name='job-title' placeholder='Job title' id='job-title'/>
                 </div>
                         <div className='form-div'>
                <label htmlFor="job-description">Job Discrebtion</label>
                <textarea rows={5} name='job-discrption' placeholder='Job Discrption' id='job-discription'></textarea>
                 </div>
                     <div className='form-div'>
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect}/>
                 </div>
                 <button className='primary-button' type='submit'>Analyse Resume</button>
               </form>
        )}
    </div>
    </section>

  

</main>
)}

export default Upload
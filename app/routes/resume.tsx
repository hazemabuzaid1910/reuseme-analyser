import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ATS from '~/components/ATS'
import Details from '~/components/Details'
import Summary from '~/components/Summary'
import { usePuterStore } from '~/lib/puter'

export const meta=()=>([
    {title:'Resumind | Review'},
    {name:'description',content:'Detailed overview of your resume'},

])
function resume() {
    const {id}=useParams()
    const {auth, kv,isLoading,fs}=usePuterStore()
   const [imageURl,setImageURL]=useState('')
   const [resumeURl,setResumeURL]=useState('')
   const [feedback,setFeedback]=useState<Feedback| null>(null)
   const navigate=useNavigate()

useEffect(()=>{
    const loadResume=async()=>{
        const resume=await kv.get(`resume:${id}`);
        if(!resume) return;
        const data=JSON.parse(resume)
        const resumeBlob= await fs.read(data.resumePath);
        if(!resumeBlob) return;
        const pdfBlob= new Blob([resumeBlob], {type:'application/pdf'});
        const resumeURL=URL.createObjectURL(pdfBlob);
        setResumeURL(resumeURL);

        const imageBlob= await fs.read(data.imagePath);
        if(!imageBlob) return;
        const imageURL=URL.createObjectURL(imageBlob);
        setImageURL(imageURL);

        setFeedback(data.feedback ||'No feedback available');


    }
    loadResume();
},[id])
   useEffect(()=>{
        if(!isLoading&&!auth.isAuthenticated){
          console.log(auth.isAuthenticated)
            navigate(`/auth?next=/resume/${id}`)}
    },[auth.isAuthenticated])
  return (
   
    <main className='!pt-0'>
        <nav className='resume-nav'>
            <Link to='/' className='back-button'>
            <img src="/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
            <span className='text-gray-800 text-sm font-semibold'>Back to Homepage</span>
            </Link>
        </nav>
        <div className='flex flex-row w-full max-lg:flex-col-reverse'>
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[90vh] sticky top-0 flex items-center justify-center animate-in fade-in duration-1000 gradient-border max-sm:m-0">
    {imageURl && resumeURl && (
      <div className="animate-in fade-in duration-1000 gradient-border">
        <a href={resumeURl} target='_blank' rel="noopener noreferrer">
          <img
            src={imageURl}
            alt=""
            className="h-full w-full object-contain rounded-2xl"
            title="resume"
          />
        </a>
      </div>)}</section>
<section className='feedback-section'>
    <h2 className='text-xl !text-black font-bold'>Resume Review</h2>
    {feedback ?(
        <div className='flex flex-col gap-8 animate-in duration-1000 fade-in'>
            <Summary feedback={feedback}/>
            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips ||[]}/>
             <Details feedback={feedback}/>
        </div>
    ):(
        <img src="/images/resume-scan-2.gif" alt="" />
    )}
</section>
        </div>

    </main>
  )
}

export default resume
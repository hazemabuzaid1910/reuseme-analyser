import React from 'react'

function ScoreBadge({score}:{score:number}) {
let badgeText='';
let badgeColor='';
if(score>=70){
    badgeText='Strong';
    badgeColor='bg-green-100 text-green-800';
}
else if(score>=50){
    badgeText='Good start';
    badgeColor='bg-yellow-100 text-yellow-800';
}
else{
    badgeColor='bg-red-100 text-red-800';
    badgeText='Needs Work';
}
  return (
    <div className={`${badgeColor} rounded-full px-3 py-1 inline-block`}>
        <p className='text-sm font-medium'>{badgeText}</p>
    </div>
  )
}

export default ScoreBadge
import React from 'react'
import { IoArrowBackOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const BckButton = () => {

    const navigate = useNavigate();

  return (
    <div onClick={()=> navigate(-1)} className='bg-[#f6b100] p-3 text-xl font-bold rounded-full'>
        <IoArrowBackOutline/>
    </div>
  )
}

export default BckButton
import React from 'react';

const MiniCard = ({ title, icon, number = 0, footerNum = 0 }) => {
  const isRevenue = title === "Total Pendapatan";
  const formattedNumber = isRevenue
    ? `Rp ${Number(number).toLocaleString("id-ID")}`
    : Number(number).toLocaleString("id-ID");

  const isPositive = footerNum >= 0;
  

  return (
    <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg flex-1 min-w-[280px]'>
      <div className='flex items-start justify-between'>
        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>{title}</h1>
        <button
          className={`${
            isRevenue ? 'bg-[#02ca3a]' : 'bg-[#f6b100]'
          } p-3 rounded-lg text-[#f5f5f5] text-2xl`}
        >
          {icon}
        </button>
      </div>
      <div>
        <h1 className='text-[#f5f5f5] text-4xl font-bold mt-5'>{formattedNumber}</h1>
        <h1 className='text-[#f5f5f5] text-lg mt-2'>
          <span className={isPositive ? 'text-[#02ca3a]' : 'text-red-500'}>
            {footerNum}%
          </span>{" "}
          Dibandingkan kemarin
        </h1>
      </div>
    </div>
  );
};

export default MiniCard;

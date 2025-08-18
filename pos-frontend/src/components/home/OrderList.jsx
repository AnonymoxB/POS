import React from 'react'
import { FaCheckDouble, FaCircle } from 'react-icons/fa'

const OrderList = ({ order }) => {
  const { customerDetails, items, table, orderStatus } = order

  return (
    <div className='flex items-center gap-5 mb-3'>
      <button className='bg-[#f6b100] p-3 text-xl font-bold rounded-lg'>
        {customerDetails?.name?.slice(0, 2).toUpperCase()}
      </button>

      <div className='grid grid-cols-3 w-full items-center'>
        {/* Kiri: Nama dan jumlah item */}
        <div className='flex flex-col items-start gap-1'>
          <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>
            {customerDetails?.name || 'Tanpa Nama'}
          </h1>
          <p className='text-[#ababab] text-sm'>
            {Array.isArray(items) ? items.length : 0} Item
          </p>
        </div>

        {/* Tengah: Meja */}
        <div className='flex justify-center'>
          <h1 className='text-[#f6b100] text-center font-semibold border border-[#f6b100] rounded-lg p-1'>
             {table?.tableNo ? `Meja No: ${table.tableNo}` : 'Takeaway'}
          </h1>
        </div>

        {/* Kanan: Status */}
        <div className='flex flex-col items-end gap-2'>
          <p className={orderStatus === 'In Progress' ? 'text-yellow-500' : 'text-green-600'}>
            <FaCheckDouble className='inline mr-2' />
            {orderStatus === 'In Progress' ? 'Diproses' : 'Siap'}
          </p>
          <p className='text-[#ababab] text-sm'>
            <FaCircle
              className={`inline mr-2 ${orderStatus === 'In Progress' ? 'text-yellow-500' : 'text-green-600'}`}
            />
            {orderStatus === 'In Progress' ? 'Segera Disajikan' : 'Siap Disajikan'}
          </p>
        </div>
      </div>
    </div>

  )
}

export default OrderList

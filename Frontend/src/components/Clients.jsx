import React from 'react'


const Clients = ({username}) => {
  return (
    <div className='flex flex-col gap-1 items-center text-white font-semibold text-center'>
      <img className='w-11 rounded-3xl' src='https://tse1.mm.bing.net/th?id=OIP.dYzV3WJBupvstuD6cJILSAHaHa&pid=Api'  />
      <span className='w-24 font-medium text-sm'>{username}</span>
     
    </div>
  )
}

export default Clients


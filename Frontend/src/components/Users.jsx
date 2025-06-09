import React from 'react'
import Clients from './Clients'

const Users = ({users}) => {
  return (
    <div>
      <div className="flex items-center gap-4 mr-8 my-2">
        
        <div className="flex gap-2 -space-x-2">
          {users.length > 0 ? (
            users.map((client) => (
              <Clients key={client.socketId} username={client.username} />
            ))
          ) : (
            <p>No Clients</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Users

{/* <button className="bg-gray-700 px-3 py-1 rounded">🌙</button> */}
import { getServerSession } from 'next-auth'
import { getSession } from 'next-auth/react'
import React from 'react'

const page = async() => {
  // user data from session
  const {user} = await getServerSession()
  console.log("user data from session:", user)  
  return (
    <div>
      {user ? `Welcome back, ${user?.name}!` : "Please log in."}
    </div>
  )
}

export default page
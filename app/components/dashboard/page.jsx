'use client'
import React from 'react'
import { useSelector } from 'react-redux'
import StudentOverviewCharts from './student-overview-charts'

const MasterDashboard = () => {
     const authUser = useSelector((state) => state.auth?.user);
 console.log(authUser, "authUser in useStudentData");
 const checkDoctor = authUser?.account_type === "doctor"
 const isAdmin = authUser?.role === "admin";
 console.log({isAdmin, checkDoctor});
 
  return (
    <>
    {checkDoctor && <StudentOverviewCharts user={authUser}/>  }
    {isAdmin && <StudentOverviewCharts/>}
    {!checkDoctor && !isAdmin && <div>Welcome, user</div>}
    
    {/* <div>page</div> */}
    </>
  )
}
    
export default MasterDashboard
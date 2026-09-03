import DashboardSidebar from "../components/DashboardSidebar"
import DashboardProfile from "../components/DashboardProfile"
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import AllBlogs from '../components/AllBlogs';
import AllUsers from "../components/AllUsers";
import AllComments from "../components/AllComments";
import DashBaordComp from "../components/DashBaordComp";

const Dashboard = () => {


    const location = useLocation();
    const [tab, setTab] = useState('');



    useEffect(() => {

        const urlParams = new URLSearchParams(location.search);
        const getTab = urlParams.get('tab');
        setTab(getTab)

    }, [location.search]);


    return (
        <>
            <div className="flex md:flex-row flex-col ">
                {/* Sidebar  */}
                <div>
                    <DashboardSidebar />
                </div>


                {/* DashTab */}
                <div className={`${tab === 'dash' && 'flex w-full'}`}>
                    {tab === 'dash' && <DashBaordComp />}
            </div>

                {/* Profile */}
                <div className={`${tab === 'profile' && 'flex justify-center w-full'}`}>
                    {tab === 'profile' && <DashboardProfile />}
                </div>

                {/* All blog  */}
                <div className={`${tab === 'blogs' && 'flex w-full'}`}>
                    {tab === 'blogs' && <AllBlogs />}
                </div>

                {/* All users   */}
                <div className={`${tab === 'users' && 'flex w-full'}`}>
                    {tab === 'users' && <AllUsers />}
                </div>

                <div className={`${tab === 'comments' && 'flex w-full'}`}>
                    {tab === 'comments' && <AllComments />}
                </div>
            </div>
        </>
    )
}
export default Dashboard
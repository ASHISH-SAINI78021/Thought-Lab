import React from "react";
import { Outlet } from "react-router-dom";
import New from "../New/New";


const AdminLayout = () => {
  return (
    <div>
        <New>
            <Outlet />
        </New>
    </div>
  );
};

export default AdminLayout;

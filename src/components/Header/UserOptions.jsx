import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Backdrop from "@mui/material/Backdrop";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const UserOptions = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const options = [
    {
      icon: <HomeIcon />,
      name: "Home/upload",
      func: () => navigate("/"),
    },
    {
      icon: <DashboardIcon />,
      name: "Dashboard",
      func: () => navigate("/dashboard"),
    },
    {
      icon: <PersonIcon />,
      name: "Profile",
      func: () => navigate("/profile"),
    },
    
    {
      icon: <ExitToAppIcon />,
      name: "Logout",
      func: () => {
        logout();
        toast.success("Logged out");
        navigate("/login");
      },
    },
  ];

  return (
    <>
      <Backdrop open={open} style={{ zIndex: 10 }} />
      <SpeedDial
        ariaLabel="User Options"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="down"
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 11,
          "& .MuiFab-primary": {
            width: 48,
            height: 48,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          },
        }}
        icon={
          <img
            src={user?.avatar?.url || "/defaultAvatar.png"}
            alt="avatar"
            className="rounded-full w-10 h-10 object-cover border border-gray-300"
          />
        }
      >
        {options.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.func}
            tooltipOpen
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default UserOptions;
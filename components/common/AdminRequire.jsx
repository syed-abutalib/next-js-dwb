import React, { useContext } from "react";
import { AuthContext } from "../context/Auth";
import { Navigate } from "react-router-dom";

const AdminRequire = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  if (!user || !token || user.role !== "admin") {
    return <Navigate to={`/login`} />;
  }
  return children;
};

export default AdminRequire;

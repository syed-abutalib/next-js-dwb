import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RedirectUser = ({ children }) => {
  const { user, token } = useAuth();
  if (user && token) {
    return <Navigate to={`/`} />;
  }
  return children;
};
export default RedirectUser;

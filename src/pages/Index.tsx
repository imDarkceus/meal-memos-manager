
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const redirectUser = async () => {
      if (session) {
        navigate("/", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    };
    
    redirectUser();
  }, [navigate, session]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">
        <span className="text-primary font-bold">Redirecting...</span>
      </div>
    </div>
  );
};

export default Index;

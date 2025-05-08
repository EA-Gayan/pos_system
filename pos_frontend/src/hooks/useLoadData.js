import { useEffect, useState } from "react";
import { getUserData } from "../https";
import { useDispatch } from "react-redux";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserData();
        dispatch(setUser(data.data.data));
      } catch (error) {
        dispatch(removeUser());
        navigate("/auth");
        console.error("Error parsing user data from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  return isLoading;
};

export default useLoadData;

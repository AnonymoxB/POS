import { useEffect, useState } from "react";
import { getUserData } from "../https";
import { useDispatch } from "react-redux";
import { setUser, removeUser } from "../redux/slices/userSlices";
import { useNavigate } from "react-router-dom";

const useLoadData = () => {
  const [user, setUserState] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [IsLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }
        const { data } = await getUserData();
        console.log(data);
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
        setUserState(data.data);
        
      } catch (error) {
        dispatch(removeUser());
        navigate("/auth");
        console.error("Gagal fetch user:", error?.response?.data?.message || error.message);
      }finally{
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
        
      }
    };

    fetchUser();
  }, [dispatch, navigate]);

  return {user, IsLoading};
};

export default useLoadData;

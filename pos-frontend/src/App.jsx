import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu } from "./pages";
import Header  from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import Dashboard from "./pages/Dashboard";
import 'react-datepicker/dist/react-datepicker.css';


function Layout(){

  const location = useLocation();
  const{ IsLoading} = useLoadData();
  const hideHeaderRoutes = ["/auth"];
  const {isAuth} = useSelector(state => state.user);

  if(IsLoading) return <FullScreenLoader/>

  return (
    <>
        {!hideHeaderRoutes.includes(location.pathname)&& <Header/>}
        <Routes>
          <Route path="/" element={
            <ProtectedRoutes>
              <Home/>
            </ProtectedRoutes>
          } />
          <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth/>} />
          <Route path="/orders" element={
            <ProtectedRoutes>
              <Orders/>
            </ProtectedRoutes>
          } />
          <Route path="/tables" element={
            <ProtectedRoutes>
              <Tables/>
            </ProtectedRoutes>
          } />
          <Route path="/menu" element={
            <ProtectedRoutes>
              <Menu/>
            </ProtectedRoutes>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoutes>
              <Dashboard/>
            </ProtectedRoutes>
          } />
          <Route path="*" element={<div>Not found</div>}/>
        </Routes>
    </>
  )

}


function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector(state => state.user);
  return isAuth ? children : <Navigate to="/auth" />;
}


function App() {

  return(
    <Router>
      <Layout/>
    </Router>
  )

}

export default App

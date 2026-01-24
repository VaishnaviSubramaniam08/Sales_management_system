import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/frontpage/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddClothes from "./pages/crud/AddClothes";
import EditClothes from "./pages/crud/EditClothes";
import Sales from "./pages/Sales";
import ClothesList from "./pages/crud/ClothesList";
import Collections from "./pages/frontpage/Collections";
import Brands from "./pages/frontpage/Brands";
import About from "./pages/frontpage/About";

// Private Route Component
const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddClothes />
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />
         <Route
  path="/sales"
  element={
    <PrivateRoute>
      <Sales />
    </PrivateRoute>
  }
/>

<Route
  path="/edit/:id"
  element={
    <PrivateRoute>
      <EditClothes />
    </PrivateRoute>
  }
/>
<Route
  path="/sales"
  element={
    <PrivateRoute>
      <Sales />
    </PrivateRoute>
  }
/>


      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/frontpage/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddClothes from "./pages/crud/AddClothes";
import EditClothes from "./pages/crud/EditClothes";
import Sales from "./pages/Sales";
import Collections from "./pages/frontpage/Collections";
import Brands from "./pages/frontpage/Brands";
import About from "./pages/frontpage/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Transactions from "./pages/admin/Transactions";
import AddStaff from "./pages/admin/AddStaff";
import Reports from "./pages/Reports";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/about" element={<About />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-staff"
          element={
            <PrivateRoute adminOnly={true}>
              <AddStaff />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute adminOnly={true}>
              <Transactions />
            </PrivateRoute>
          }
        />

        <Route
          path="/add"
          element={
            <PrivateRoute adminOnly={true}>
              <AddClothes />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <PrivateRoute adminOnly={true}>
              <EditClothes />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute adminOnly={true}>
              <Reports />
            </PrivateRoute>
          }
        />

        {/* Staff */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
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

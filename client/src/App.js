import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/frontpage/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InventoryContent from "./pages/InventoryContent";
import AddClothes from "./pages/crud/AddClothes";
import EditClothes from "./pages/crud/EditClothes";
import Sales from "./pages/Sales";
import Collections from "./pages/frontpage/Collections";
import Brands from "./pages/frontpage/Brands";
import About from "./pages/frontpage/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import Transactions from "./pages/admin/Transactions";
import SalesOversight from "./pages/admin/SalesOversight";
import StaffManagement from "./pages/admin/StaffManagement";
import AddStaff from "./pages/admin/AddStaff";
import ReviewStaff from "./pages/admin/ReviewStaff";
import SupplierManagement from "./pages/admin/SupplierManagement";
import GeneralSettings from "./pages/admin/GeneralSettings";
import ExpenseTracker from "./pages/admin/ExpenseTracker";
import ProfitLossReport from "./pages/admin/ProfitLossReport";
import Reports from "./pages/Reports";
import Returns from "./pages/Returns";
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
        >
          <Route index element={<AdminHome />} />
          <Route path="inventory" element={<InventoryContent />} />
          <Route path="sales" element={<Sales />} />
          <Route path="returns" element={<Returns />} />
          <Route path="add" element={<AddClothes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="sales-oversight" element={<SalesOversight />} />
          <Route path="review-staff" element={<ReviewStaff />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="settings" element={<GeneralSettings />} />
          <Route path="expenses" element={<ExpenseTracker />} />
          <Route path="profit-loss" element={<ProfitLossReport />} />
          <Route path="edit/:id" element={<EditClothes />} />
        </Route>
        <Route
          path="/add-staff"
          element={
            <PrivateRoute adminOnly={true}>
              <AddStaff />
            </PrivateRoute>
          }
        />
        <Route
          path="/review-staff"
          element={
            <PrivateRoute adminOnly={true}>
              <ReviewStaff />
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
          path="/admin/staff"
          element={
            <PrivateRoute adminOnly={true}>
              <StaffManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/sales-oversight"
          element={
            <PrivateRoute adminOnly={true}>
              <SalesOversight />
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

        <Route
          path="/returns"
          element={
            <PrivateRoute>
              <Returns />
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
        >
          <Route index element={<InventoryContent />} />
          <Route path="sales" element={<Sales />} />
          <Route path="returns" element={<Returns />} />
        </Route>

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

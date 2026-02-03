import { Outlet } from "react-router-dom";
import BackButton from "./components/BackButton";

export default function PublicLayout() {
  return (
    <div>
      <BackButton />
      <Outlet />
    </div>
  );
}

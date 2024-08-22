import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
  return (
    <div>
      <Appbar />
      <div className="flex justify-center">
        <div className="m-8 border rounded w-[600px] p-5 shadow-sm">
          <Balance value={"10,000"} />
          <Users />
        </div>
      </div>
    </div>
  );
};

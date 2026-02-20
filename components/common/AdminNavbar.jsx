// components/layout/Navbar.jsx
import { useState } from "react";
import { Search, Bell, ChevronDown, Home, MoveLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const AdminNavbar = ({ setSidebarOpen }) => {
  // const [notifications] = useState([
  //   { id: 1, text: 'New comment on "Getting Started with React"' },
  //   { id: 2, text: "3 new users registered today" },
  //   { id: 3, text: "Your blog post has been published" },
  // ]);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="max-w-md flex-1">
            <div className="relative flex items-center gap-3">
              <MoveLeft className=" text-gray-400" size={20} />
              <Link
                to={`/`}
                className="hidden lg:text-lg text-blue-700 hover:text-black transition-all duration-300"
              >
                Go back to home{" "}
              </Link>
              <div className="lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h3 className="font-semibold">Notifications</h3>
                <div className="mt-2 space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-lg p-3 hover:bg-gray-50"
                    >
                      <p className="text-sm">{notification.text}</p>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600">
                <button onClick={logout}>Logout</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  User,
  Tag,
  FolderTree,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Add Blog", href: "/admin/create-blog", icon: PlusCircle },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
];

const SidebarContent = ({ onLinkClick }) => (
  <>
    {/* Logo */}
    <div className="flex h-16 items-center justify-between px-4 lg:justify-center border-b">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <span className="ml-3 text-lg font-semibold text-gray-900 hidden lg:block">
          Daily World Blog
        </span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="mt-8 px-3">
      <div className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  </>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r lg:hidden shadow-lg"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 bg-white border-r shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
};

export default Sidebar;

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, User, Filter, ChevronLeft, ChevronRight, 
  UserCheck, UserX, Shield, ShieldOff, RotateCcw, 
  ExternalLink, UserCog
} from "lucide-react";

// Define user interface
interface User {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: "ADMIN" | "STUDENT";
  hasOnboarded: boolean;
  createdAt?: string;
}

// To use API route instead of direct Prisma in client component
export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, admin, student, onboarded, not-onboarded
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    students: 0,
    onboarded: 0,
    notOnboarded: 0
  });
  
  const usersPerPage = 8;

  // Check admin access
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchUsers();
      }
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json() as User[];
      setUsers(data);
      setFilteredUsers(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        admins: data.filter(u => u.role === "ADMIN").length,
        students: data.filter(u => u.role === "STUDENT").length,
        onboarded: data.filter(u => u.hasOnboarded).length,
        notOnboarded: data.filter(u => !u.hasOnboarded).length
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoading(false);
    }
  };

  // Handle search and filtering
  useEffect(() => {
    let result = [...users];
    
    // Apply role/status filter
    if (filter === "admin") {
      result = result.filter(user => user.role === "ADMIN");
    } else if (filter === "student") {
      result = result.filter(user => user.role === "STUDENT");
    } else if (filter === "onboarded") {
      result = result.filter(user => user.hasOnboarded);
    } else if (filter === "not-onboarded") {
      result = result.filter(user => !user.hasOnboarded);
    }
    
    // Apply search filter (case insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [search, filter, users]);

  // Get current page users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Actions
  const handleToggleRole = async (userId: string, currentRole: "ADMIN" | "STUDENT") => {
    const newRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole })
        });
        
        if (response.ok) {
          // Update local state
          setUsers(users.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          ));
        }
      } catch (error) {
        console.error("Failed to update user role", error);
      }
    }
  };

  const handleResetOnboarding = async (userId: string) => {
    if (confirm("Are you sure you want to reset this user's onboarding status?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/onboarding`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hasOnboarded: false })
        });
        
        if (response.ok) {
          // Update local state
          setUsers(users.map(user => 
            user.id === userId ? { ...user, hasOnboarded: false, username: null } : user
          ));
        }
      } catch (error) {
        console.error("Failed to reset onboarding", error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Total Users</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Admins</div>
          <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Students</div>
          <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Onboarded</div>
          <div className="text-2xl font-bold text-green-600">{stats.onboarded}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Not Onboarded</div>
          <div className="text-2xl font-bold text-orange-600">{stats.notOnboarded}</div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="student">Students</option>
            <option value="onboarded">Onboarded</option>
            <option value="not-onboarded">Not Onboarded</option>
          </select>
        </div>
      </div>
      
      {/* No results */}
      {currentUsers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400">No users found matching your criteria</p>
        </div>
      )}
      
      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className={`h-2 w-full ${user.role === "ADMIN" ? "bg-purple-600" : "bg-blue-600"}`}></div>
            <div className="p-4">
              <div className="font-medium mb-1 truncate">{user.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
              <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-3 truncate">@{user.username || "no-username"}</div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.role === "ADMIN" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}>
                  {user.role}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.hasOnboarded 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                }`}>
                  {user.hasOnboarded ? "Onboarded" : "Not Onboarded"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {user.username && (
                  <Link 
                    href={`/profile/${user.username}`} 
                    className="p-1.5 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/40"
                    title="View Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                
                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className="p-1.5 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-100 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/40"
                  title={user.role === "ADMIN" ? "Demote to Student" : "Promote to Admin"}
                >
                  {user.role === "ADMIN" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </button>
                
                {user.hasOnboarded && (
                  <button
                    onClick={() => handleResetOnboarding(user.id)}
                    className="p-1.5 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-100 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-orange-900/40"
                    title="Reset Onboarding"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
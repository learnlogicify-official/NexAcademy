import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, User, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function EnrollUsersModal({ open, onOpenChange, courseId, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Keep selections when modal closes
      setError(null);
    } else {
      setSearch("");
      setRole("STUDENT");
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchUsers(1);
    }
  }, [open]);

  // Fetch users when search, role, or page changes
  useEffect(() => {
    if (!open) return;
    const handler = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, role, open]);

  // Fetch users based on search, role, and page
  const fetchUsers = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        q: search,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(role && role !== 'ALL' ? { role } : {})
      });
      
      const res = await fetch(`/api/users?${query}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchUsers(newPage);
  };

  // Add user to selection
  const addUser = (user: User) => {
    if (!selected.find(u => u._id === user._id)) {
      setSelected(sel => [...sel, user]);
    }
  };

  // Remove user from selection
  const removeUser = (userId: string) => {
    setSelected(sel => sel.filter(u => u._id !== userId));
  };

  // Select all users in current search
  const selectAll = () => {
    setSelected(sel => [
      ...sel,
      ...users.filter(u => !sel.find(su => su._id === u._id))
    ]);
  };

  // Clear all selections
  const clearAll = () => setSelected([]);

  // Enroll selected users
  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selected.map(u => u._id) }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll users');
      }
      
      onSuccess();
      onOpenChange(false);
      setSelected([]);
    } catch (error: any) {
      setError(error.message || "Failed to enroll users. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Enroll Users</DialogTitle>
        </DialogHeader>

        {/* Stats bar */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {selected.length > 0 ? 
              `${selected.length} user${selected.length > 1 ? 's' : ''} selected` : 
              'Select users to enroll'}
          </div>
          {pagination.total > 0 && (
            <div className="text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'user' : 'users'} found
            </div>
          )}
        </div>
        
        {/* Search and filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative col-span-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-9"
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>
          <Select 
            value={role}
            onValueChange={setRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STUDENT">Students Only</SelectItem>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="INSTRUCTOR">Instructors</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Selected users */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] border-b pb-3">
            {selected.map(user => (
              <span key={user._id} className="flex items-center bg-primary/10 rounded-full px-3 py-1 text-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full mr-2" />
                ) : (
                  <User className="w-4 h-4 mr-1.5 text-muted-foreground" />
                )}
                <span className="max-w-[150px] truncate">{user.name || user.email}</span>
                <button
                  className="ml-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeUser(user._id)}
                  aria-label="Remove"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {selected.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll} 
                className="text-xs text-muted-foreground hover:text-destructive px-2 h-6"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md p-2 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* User search results */}
        <div className="border rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {search ? `No users found matching "${search}"` : "No users found"}
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-primary/5 ${
                    selected.find(u => u._id === user._id) ? "bg-primary/10" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => addUser(user)}
                    className="flex items-center flex-1 text-left"
                    disabled={!!selected.find(u => u._id === user._id)}
                  >
                    <div className="flex-shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="ml-2 flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name || "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    {user.role && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </button>
                  {selected.find(u => u._id === user._id) && (
                    <button
                      className="text-muted-foreground hover:text-destructive p-1 rounded-full"
                      onClick={() => removeUser(user._id)}
                      aria-label="Remove"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
        
        {/* Bulk actions and submit button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={selectAll} 
              disabled={users.length === 0 || loading}
            >
              Select All on Page
            </Button>
          </div>
          <DialogFooter className="sm:space-x-2">
            <Button 
              variant="default" 
              onClick={handleEnroll} 
              disabled={enrolling || selected.length === 0}
              className={`${selected.length > 0 ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {enrolling ? "Enrolling..." : `Enroll ${selected.length} User${selected.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
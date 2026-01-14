import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import AttendancePage from "./pages/Attendance";
import WorkHoursPage from "./pages/WorkHours";
import LeavePage from "./pages/Leave";
import LeaveRequestsPage from "./pages/LeaveRequests";
import EmployeesPage from "./pages/Employees";
import EmployeeDetailPage from "./pages/EmployeeDetail";
import ReportsPage from "./pages/Reports";
import AttendanceReportPage from "./pages/AttendanceReport";
import PoliciesPage from "./pages/Policies";
import HolidaysPage from "./pages/Holidays";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/work-hours" element={<WorkHoursPage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/leave-requests" element={<LeaveRequestsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employee/:id" element={<EmployeeDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/attendance-report" element={<AttendanceReportPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/holidays" element={<HolidaysPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

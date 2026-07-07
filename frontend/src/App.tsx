
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Dashboard from "@/pages/Dashboard"
import CrewManagement from "@/pages/CrewManagement"
import BuildingManagement from "@/pages/BuildingManagement"
import LoginPage from "@/pages/LoginPage"
import UserManagement from "@/pages/UserManagement"
import SchedulesCalendar from "@/pages/SchedulesCalendar"
import JobManagement from "@/pages/JobManagement"
import AddSchedule from "@/pages/AddSchedule"
import EditSchedule from "@/pages/EditSchedule"
import Services from "./pages/Services"
import AddEnquiry from "@/pages/AddEnquiry"
import AllEnquiries from "@/pages/AllEnquiries"
// Using relative path to force resolve
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { UserRole } from "@/types"

// Clean up legacy local storage services data
localStorage.removeItem("osool_services");

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/crews" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CrewManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/buildings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BuildingManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />


            <Route path="/users" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedules/calendar" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SchedulesCalendar />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedules/jobs" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedules/add" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddSchedule />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedules/edit" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditSchedule />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/enquiries/add" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddEnquiry />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/enquiries/all" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllEnquiries />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/services" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Services />
                </DashboardLayout>
              </ProtectedRoute>
            } />

          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

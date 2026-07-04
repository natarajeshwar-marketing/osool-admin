
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Dashboard from "@/pages/Dashboard"
import CrewManagement from "@/pages/CrewManagement"
import BuildingManagement from "@/pages/BuildingManagement"
import DailyLogEntry from "@/pages/DailyLogEntry"
import AllLogEntries from "@/pages/AllLogEntries"
import LoginPage from "@/pages/LoginPage"
import UserManagement from "@/pages/UserManagement"
import SchedulesCalendar from "@/pages/SchedulesCalendar"
import JobManagement from "@/pages/JobManagement"
import AddSchedule from "@/pages/AddSchedule"
import Services from "./pages/Services"
// Using relative path to force resolve
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { UserRole } from "@/types"

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

            <Route path="/daily-log" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DailyLogEntry />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/all-logs" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllLogEntries />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
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

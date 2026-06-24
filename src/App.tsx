import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ResidentHome } from './resident/ResidentHome'
import { RepairRequestForm } from './resident/RepairRequestForm'
import { Confirmation } from './resident/Confirmation'
import { TrackRepair } from './resident/TrackRepair'
import { PublicPerformance } from './resident/PublicPerformance'
import { CaseworkerDashboard } from './caseworker/CaseworkerDashboard'
import { RepairsQueue } from './caseworker/RepairsQueue'
import { CaseDetail } from './caseworker/CaseDetail'
import { PerformanceDashboard } from './caseworker/PerformanceDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Resident view */}
        <Route path="/" element={<ResidentHome />} />
        <Route path="/report" element={<RepairRequestForm />} />
        <Route path="/report/confirmation/:ref" element={<Confirmation />} />
        <Route path="/track" element={<TrackRepair />} />
        <Route path="/track/:ref" element={<TrackRepair />} />
        <Route path="/performance" element={<PublicPerformance />} />

        {/* Caseworker view */}
        <Route path="/officer" element={<CaseworkerDashboard />} />
        <Route path="/officer/queue" element={<RepairsQueue />} />
        <Route path="/officer/case/:ref" element={<CaseDetail />} />
        <Route path="/officer/performance" element={<PerformanceDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

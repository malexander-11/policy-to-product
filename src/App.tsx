import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ResidentView } from './resident/ResidentView'
import { OpsView } from './ops/OpsView'
import { PublicDashboard } from './public/PublicDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ResidentView />} />
        <Route path="/ops" element={<OpsView />} />
        <Route path="/performance" element={<PublicDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

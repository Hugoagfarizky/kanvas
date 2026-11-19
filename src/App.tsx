import { Route, Routes } from "react-router-dom"

import { BoardPage } from "@/pages/board"
import { DashboardPage } from "@/pages/dashboard"
import { NotFoundPage } from "@/pages/not-found"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/board/:id" element={<BoardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

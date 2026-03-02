import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Edit, Play, Zap, Clock, Eye, Loader2 } from 'lucide-react'
import { ProjectTypeProps } from '@/services/project/ProjectService'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/stores'
import { useRouter } from 'next/navigation'
import { toastSuccess, showError, showInfo } from '@/lib/utils'
import { fetchProjects } from '@/stores/ProjectSlice'


export type projectListProps = ProjectTypeProps & { _id: string }

const ProjectList = ({ projects }: { projects: projectListProps[] }) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [runningId, setRunningId] = useState<string | null>(null)

  const handleRunNow = async (id: string, name: string) => {
    if (runningId) return
    
    setRunningId(id)
    showInfo(`Initiating execution: ${name}...`)
    
    try {
      const res = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        toastSuccess(`✓ Execution complete for ${name}`)
        // Industrial Refresh: Sync dashboard with the newly 'Active' status
        dispatch(fetchProjects({ page: 1, search: "" }))
      } else {
        showError(`✗ Execution failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      showError(`✗ Connection error during execution`)
    } finally {
      setRunningId(null)
    }
  }
  
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects?.length > 0 ? (
        projects.map((wf) => (
          <div
            key={wf?._id}
            className="group relative bg-white rounded-3xl border border-[var(--border)] p-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 block overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2.5 group-hover:bg-[var(--accent)] transition-colors duration-500">
                  <Zap className="h-full w-full text-[var(--primary)] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${
                  wf?.status === 'Active' 
                    ? 'bg-green-50 text-green-600 border border-green-100 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {wf?.status || 'Unknown'}
                </div>
              </div>

              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors duration-300 truncate">
                {wf?.name}
              </h3>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Modified {wf?.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'recently'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Eye className="h-4 w-4" />
                  <span>{wf.trigger || 'Manual trigger'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push(`/workflows?id=${wf._id}`)}
                  className="rounded-2xl bg-[var(--primary)] hover:bg-blue-700 shadow-md shadow-blue-500/10 h-11 font-bold tracking-tight"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Flow
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRunNow(wf._id, wf.name)}
                  disabled={runningId === wf._id}
                  className={`rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 h-11 font-bold transition-all duration-300 ${runningId === wf._id ? 'opacity-50 scale-95' : ''}`}
                >
                  {runningId === wf._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Now
                </Button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {wf._id.slice(-6).toUpperCase()}</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 animate-bounce">
            <Zap className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Zero Workflows Detected</h3>
          <p className="text-slate-500 max-w-xs text-center leading-relaxed">
            Your automation journey starts here. Create your first intelligent workflow and watch the magic happen.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectList
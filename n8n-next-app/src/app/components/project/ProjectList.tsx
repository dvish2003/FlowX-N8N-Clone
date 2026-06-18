import React, { useState } from 'react'
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
            className="group relative bg-neutral-950/55 rounded-2xl border border-neutral-800 p-1 hover:border-neutral-500 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:-translate-y-1 block overflow-hidden backdrop-blur-md"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-neutral-200 via-white to-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2.5 group-hover:bg-neutral-800 group-hover:border-neutral-600 transition-all duration-500">
                  <Zap className="h-full w-full text-white group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${
                  wf?.status === 'Active' 
                    ? 'bg-neutral-900 text-white border border-neutral-700 shadow-[0_0_10px_rgba(255,255,255,0.05)]' 
                    : 'bg-neutral-950/20 text-neutral-600 border border-neutral-900'
                }`}>
                  {wf?.status || 'Inactive'}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neutral-300 transition-colors duration-300 truncate">
                {wf?.name}
              </h3>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4 text-neutral-600" />
                  <span className="font-medium">Modified {wf?.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'recently'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Eye className="h-4 w-4 text-neutral-650" />
                  <span>{wf.trigger || 'Manual trigger'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push(`/workflows?id=${wf._id}`)}
                  className="rounded-xl bg-white hover:bg-neutral-200 text-black shadow-md shadow-white/5 h-11 font-bold tracking-tight border border-white cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Flow
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRunNow(wf._id, wf.name)}
                  disabled={runningId === wf._id}
                  className={`rounded-xl border-neutral-800 bg-neutral-900/40 hover:bg-neutral-850 text-white h-11 font-bold transition-all duration-300 cursor-pointer ${runningId === wf._id ? 'opacity-50 scale-95' : ''}`}
                >
                  {runningId === wf._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Now
                </Button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-neutral-900/30 border-t border-neutral-950/45 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">ID: {wf._id.slice(-6).toUpperCase()}</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-neutral-900 bg-neutral-850" />
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-neutral-950/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-neutral-800">
          <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 animate-bounce">
            <Zap className="h-10 w-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Zero Workflows Detected</h3>
          <p className="text-neutral-400 max-w-xs text-center leading-relaxed font-light">
            Your automation journey starts here. Create your first intelligent workflow and watch the magic happen.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectList
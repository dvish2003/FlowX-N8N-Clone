"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { Loader2, Calendar, Link as LinkIcon, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

type LoadWorkflowModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (workflow: any) => void
}

export function LoadWorkflowModal({ isOpen, onClose, onSelect }: LoadWorkflowModalProps) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workflows/list')
      const data = await res.json()
      if (res.status === 401) {
        toast.error('Identity required. Please sign in.')
        onClose()
        return
      }
      if (data.success) {
        setWorkflows(data.workflows)
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (workflowId: string, workflowName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(workflowId)
    try {
      const res = await fetch('/api/workflows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: workflowId })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Workflow "${workflowName}" deleted successfully`)
        setWorkflows(prev => prev.filter(wf => wf._id !== workflowId))
      } else {
        toast.error(data.error || 'Failed to delete workflow')
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      toast.error('Failed to delete workflow')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWorkflows()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-[500px] rounded-[2rem] shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-slate-900 font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[var(--primary)] rounded-full" />
            Saved Projects Area
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 max-h-[450px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                <div className="absolute inset-0 w-8 h-8 rounded-full border-4 border-[var(--primary)]/10" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing with Registry...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No workflows detected</p>
            </div>
          ) : (
            workflows.map((wf) => (
              <div
                key={wf._id}
                onClick={() => onSelect(wf)}
                className="w-full flex flex-col gap-2 p-5 rounded-2xl border-2 border-slate-50 bg-white hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left group relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <span className="text-lg font-black text-slate-800 tracking-tight group-hover:text-[var(--primary)] transition-colors">
                      {wf.name}
                    </span>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span>ID: {wf.projectId || wf._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                      {wf.nodes?.length || 0} UNITS
                    </div>
                    <button
                      onClick={(e) => handleDelete(wf._id, wf.name, e)}
                      disabled={deleting === wf._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 disabled:opacity-50"
                      title="Delete workflow"
                    >
                      {deleting === wf._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-5 transition-opacity group-hover:opacity-10">
                   <LinkIcon className="w-24 h-24 -mr-6 -mb-6 rotate-12" />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

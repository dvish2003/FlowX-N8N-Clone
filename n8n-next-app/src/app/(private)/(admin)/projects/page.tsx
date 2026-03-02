'use client'

import React, { useCallback, useEffect } from 'react'
import { Plus, Search, Zap, Clock } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/stores'
import TopNav from '@/app/components/topnav/TopNav'
import { useSession } from 'next-auth/react'
import { ProjectModal } from '@/app/components/project/ProjectModal'
import { fetchProjects, openCreateModal } from '@/stores/ProjectSlice'
import ProjectList from '@/app/components/project/ProjectList'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { debounce } from 'lodash'
import HandlePagination from '@/app/components/general/HandlePagination'

const ProjectsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { data: session } = useSession()
  const {projects,pagination} = useSelector((state:RootState)=>state.project)
  const [page,setPage] = useState(1);
  const [search,setSearch] = useState('');
  const totalPages = pagination?.totalPages ?? 1;

  const fetchProjectsWithDebounce = useCallback(
    (page: number, search: string) => {
      debounce(() => {
        dispatch(fetchProjects({ page, search }));
      }, 500)();
    },
    [dispatch]
  );

  const searchProjects = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setSearch(title);
    setPage(1);
  };

  useEffect(() => {
    fetchProjectsWithDebounce(page, search);
  }, [ page, search, fetchProjectsWithDebounce]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopNav />
      <ProjectModal session={session} />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
              <Zap className="w-3 h-3" /> Dashboard
            </div>
            <h1 className="text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
              Welcome back, <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {session?.user?.name || 'Explorer'}
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-lg">
              Manage your high-performance automation pipelines with precision and intelligence.
            </p>
          </div>
          
          <Button 
            onClick={() => dispatch(openCreateModal())}
            className="rounded-2xl bg-[var(--primary)] hover:bg-blue-700 text-white px-8 h-14 text-lg font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Workflow
          </Button>
        </header>

        <div className="mb-12 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="relative flex-1 w-full translate-z-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
             <input
              type="text"
              placeholder="Filter workflows by name..."
              value={search}
              onChange={searchProjects}
              className="w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm pl-12 pr-6 h-14 text-base placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            {['All', 'Active', 'Archived'].map((tab) => (
              <button key={tab} className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${tab === 'All' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <ProjectList projects={projects} />
        </section>
       
        <footer className="mt-16 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <HandlePagination page={page} setPage={setPage} totalPages={totalPages} />
        </footer>
      </main>
    </div>
  )
}

export default ProjectsPage
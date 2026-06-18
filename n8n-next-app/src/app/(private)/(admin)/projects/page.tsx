'use client'

import React, { useCallback, useEffect } from 'react'
import { Plus, Search, Zap } from 'lucide-react'
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
import AnimatedGrid from '@/app/components/general/AnimatedGrid'

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
    <div className="min-h-screen bg-black relative overflow-hidden text-slate-100 font-sans">
      {/* MONOCHROME ANIMATED GRID BACKDROP */}
      <AnimatedGrid />

      <TopNav />
      <ProjectModal session={session} />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 text-[10px] font-bold uppercase tracking-widest border border-neutral-800">
              <Zap className="w-3 h-3 text-white" /> Dashboard
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
              Welcome back, <br />
              <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                {session?.user?.name || 'Explorer'}
              </span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-lg font-light">
              Manage your high-performance automation pipelines with precision and intelligence.
            </p>
          </div>
          
          <Button 
            onClick={() => dispatch(openCreateModal())}
            className="rounded-xl bg-white hover:bg-neutral-200 text-black px-8 h-14 text-base font-bold shadow-xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-white cursor-pointer"
          >
            <Plus className="w-5 h-5" /> New Workflow
          </Button>
        </header>

        <div className="mb-12 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="relative flex-1 w-full translate-z-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
             <input
              type="text"
              placeholder="Filter workflows by name..."
              value={search}
              onChange={searchProjects}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm pl-12 pr-6 h-14 text-base text-white placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/5 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-neutral-950/50 backdrop-blur-sm p-1.5 rounded-2xl border border-neutral-800 shadow-sm shrink-0">
            {['All', 'Active', 'Archived'].map((tab) => (
              <button 
                key={tab} 
                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'All' 
                    ? 'bg-white text-black border border-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
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
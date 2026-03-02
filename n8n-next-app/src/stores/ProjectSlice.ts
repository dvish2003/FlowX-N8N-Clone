import {createSlice,createAsyncThunk,type PayloadAction} from '@reduxjs/toolkit';
import { getProjects, ProjectServerData } from '../app/client/api/project';

export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async({
        page = 1,
        search = "",
    }:{
        page?:number,
        search?:string,
    })=>getProjects(page,search)
)

interface ProjectState extends ProjectServerData{
    loading:boolean;
    error:string | null;
    modal?:boolean;
    currentProject?:{
        id?:string;
        name?:string;
        edit?:boolean;
    } | null;
    
}

const initialState:ProjectState = {
    projects:[],
    loading:false,
    error:null,
    modal:false,
}

const projectSlice = createSlice({
    name:'projectSlice',
    initialState:{
        ...initialState,
        modal:false,
    },
    reducers:{
        openCreateModal: (state) => {
            state.currentProject = null;
            state.modal = true;
        },
        closeModal: (state) => {
            state.modal = false;
            state.currentProject = null;
        },
        tongleModel: state => {
            state.modal = !state.modal;
            state.currentProject = {edit: false};
            if (!state.modal) state.currentProject = null;
        },
        setCurrentProject:(state,action:PayloadAction<{id?:string;name?:string;edit?:boolean} | null>)=>{
            if (!action.payload) {
                state.currentProject = null;
            } else {
                state.currentProject = { ...action.payload, edit: action.payload.edit ?? true };
            }
            state.modal = true;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchProjects.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProjects.fulfilled,(state,action:PayloadAction<ProjectServerData>)=>{
            state.loading = false;
            state.projects = action.payload.projects;
            state.pagination = action.payload.pagination;
        })
        .addCase(fetchProjects.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch projects';
        })
    }
})

export const {openCreateModal,closeModal,tongleModel,setCurrentProject} = projectSlice.actions;

export default projectSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import projectSlice from "./ProjectSlice";
import flowSlice from "./FlowSlice";

export const store = configureStore({
  reducer: {
    project: projectSlice,
    flow: flowSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
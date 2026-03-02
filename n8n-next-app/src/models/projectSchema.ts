import { stat } from "fs";
import mongoose from "mongoose";


const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId :{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status:{
    type:String,
    required:false,
  },
  trigger:{
    type:String,
    required:false,
  },
},{timestamps:true});


const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

export { Project };
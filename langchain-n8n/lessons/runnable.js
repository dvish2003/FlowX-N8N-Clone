import { RunnableSequence, RunnableLambda, RunnableParallel } from "@langchain/core/runnables";

const function_1 = (x) => x.toString();
const function_2 = (x) => x.toString().toUpperCase();
const function_3 = (x) => x.slice(0, 2);

const runnable_1 = RunnableLambda.from(function_1);
//const runnable_2 = RunnableLambda.from((x) => x.toLocaleUpperCase());
const runnable_2 = RunnableLambda.from(function_2);
//const runnable_3 = RunnableLambda.from((x) => x.slice(0, 2));
const runnable_3 = RunnableLambda.from(function_3);

  //const result= await runnable_1.invoke(123);
  //const result= await runnable_2.invoke('hello');
  // const result= await runnable_2.invoke(hello);


   //chain use 3 runnables in sequence
   const chain = runnable_1.pipe(runnable_2).pipe(runnable_3);
   const result= await chain.invoke('hello');


  console.log("✅ Result:", result);
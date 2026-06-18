type HttpVerb = "GET" | "POST" | "PUT" | "DELETE";

export function makeHttpsReq<T>(verb:HttpVerb,endPoint: string, input?: T) {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const res = fetch(`${baseUrl}/api/${endPoint}`,
        {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            method: verb,
            body: input ? JSON.stringify(input) : undefined
        }
      );
      if(!(await res).ok) throw new Error('Request failed');
      const data = await (await res).json();
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

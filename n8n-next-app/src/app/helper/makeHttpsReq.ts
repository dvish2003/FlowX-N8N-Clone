type HttpVerb = "GET" | "POST" | "PUT" | "DELETE";

export function makeHttpsReq<T>(verb:HttpVerb,endPoint: string, input?: T) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/${endPoint}`,
        {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: verb,
            body: JSON.stringify(input)
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

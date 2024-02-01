const backendUrl = "http://localhost:3000"

export async function getAllCourts() {
    //console.log("trigger")
    const res = await fetch(`${backendUrl}/courts/allcourts`)
    const data = await res?.json()
    return data;
  } 

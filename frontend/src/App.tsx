import { useState } from "react"
import Room from "./components/Room"

function App() {
  const [name, setName] = useState("")
  const [join, setJoin] = useState(false)


  if (!join) {
    return (
      <>
        <h1>Welcome To Omegle</h1>
        <input type="text" id="name" name="name" onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name " />
        <button onClick={() => setJoin(true)}>Join</button>
      </>
    )
  }
  return <Room name={name} />
}

export default App

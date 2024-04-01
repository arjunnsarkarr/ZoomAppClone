import { useEffect, useRef, useState } from "react"
import Room from "./components/Room"
import "./App.css"

function App() {

  const [name, setName] = useState("")
  const [join, setJoin] = useState(false)

  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const streams = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    const audioTrack = streams.getAudioTracks()[0];
    const videoTrack = streams.getVideoTracks()[0];
    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack])
    videoRef.current.play();
  }

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam()
    }
  }, [videoRef])


  if (!join) {
    return (
      <>
        <h1>Welcome To Omegle</h1>
        <video height={300} width={300} autoPlay ref={videoRef}></video>
        <input type="text" id="name" name="name" onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name " />
        <button onClick={() => setJoin(true)}>Join</button>
      </>
    )
  }
  return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
}

export default App

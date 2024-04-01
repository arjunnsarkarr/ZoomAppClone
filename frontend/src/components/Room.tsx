import { useEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"

const URL = "http://localhost:3000";

const Room = ({
    name,
    localAudioTrack,
    localVideoTrack,
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {

    const [lobby, setLobby] = useState(true)
    const [sockett, setSocket] = useState<null | Socket>(null)

    const [sendingPc, setSendPc] = useState<null | RTCPeerConnection>(null)
    const [recievingPc, setRecievingPc] = useState<null | RTCPeerConnection>(null)


    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null)
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null)

    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>();
    const localVideoRef = useRef<HTMLVideoElement>();

    useEffect(() => {
        const socket = io(URL);
        socket.on("send-offer", async ({ roomId }) => {
            setLobby(false);

            const pc = new RTCPeerConnection();
            setSendPc(pc);
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack);
            }
            if (localVideoTrack) {
                pc.addTrack(localVideoTrack);
            }

            pc.onicecandidate = async (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId
                    })
                }
            }

            pc.onnegotiationneeded = async () => {
                const sdp = await pc.createOffer();
                pc.setLocalDescription(sdp);
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        })

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            setLobby(false);

            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp);

            const sdp = await pc.createAnswer();
            pc.setLocalDescription(sdp);

            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setRemoteMediaStream(stream);
            setRecievingPc(pc);
            // @ts-ignore 
            window.pcr = pc;

            // pc.ontrack = (({ track, type }) => {
            //     if (type == "audio") {
            //         // setRemoteAudioTrack(track)
            //         // @ts-ignore
            //         remoteVideoRef.current?.srcObject.addTrack(track);
            //     } else {
            //         // setRemoteVideoTrack(track)
            //         // @ts-ignore
            //         remoteVideoRef.current?.srcObject.addTrack(track);
            //     }
            //     // @ts-ignore
            //     remoteVideoRef.current?.play();
            // })


            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "reciever",
                        roomId
                    })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            })


            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                if (track1.kind === "video") {
                    setRemoteVideoTrack(track1);
                    setRemoteAudioTrack(track2)
                } else {
                    setRemoteVideoTrack(track2);
                    setRemoteAudioTrack(track1)
                }
                // @ts-ignore
                remoteVideoRef.current?.srcObject.addTrack(track1)
                // @ts-ignore
                remoteVideoRef.current?.srcObject.addTrack(track2)
                remoteVideoRef.current?.play();
            }, 2000);

        })

        socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
            setLobby(false);

            setSendPc(pc => {
                pc?.setRemoteDescription(remoteSdp);
                return pc;
            })
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            if (type == "sender") {
                setRecievingPc(pc => {
                    if (!pc) {
                        console.error("recieving pc not found menn")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            } else {
                setSendPc(pc => {
                    if (!pc) {
                        console.error("sending pc not found menn")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            }
        })

        setSocket(socket)
    }, [name])


    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])




    return (
        <>
            hi {name}

            <div className="myCams">
                <video autoPlay height={300} width={300} ref={localVideoRef} />     
                <video autoPlay height={300} width={300} ref={remoteVideoRef} />
            </div>
            {lobby ? <h2>Waiting you to someone to connect</h2> : null}
        </>
    )
}

export default Room



import { useEffect, useState } from "react"
import { Socket, io } from "socket.io-client"


const URL = "http://localhost:3000"

const Room = ({ name }: { name: string }) => {
    const [sockett, setSocket] = useState<null | Socket>(null)

    useEffect(() => {
        const socket = io(URL);

        socket.on("send-new-room", (roomID) => {
            alert("send new room offer");
            socket.emit("offer", {
                sdp: "",
                roomID
            })
        })
        socket.on("offer", (roomId, offer) => {
            alert("new offer");
            socket.emit("answer", {
                sdp: "",
                roomId
            })
        })
        socket.on("answer", (roomId, answer) => {
            alert("Connection Established");
        })
        setSocket(socket)

    }, [name])




    return (
        <>
            hi {name}
        </>
    )
}

export default Room
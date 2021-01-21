import React,{ useState, useEffect } from 'react'
import { Redirect } from 'react-router'
import io from 'socket.io-client'
import queryString from 'query-string'


let socket = io("http://localhost:8000", {
  withCredentials: true,
});
const WaitingRoom = ({ location }) => {
    const [users, setUsers] = useState('');
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [flag, setFlag] = useState(0);
    const [xPlayer, setXPlayer] = useState('')
    const [oPlayer, setOPlayer] = useState('');
    const ENDPOINT = "http://localhost:8000";

    useEffect(() => {
        socket = io.connect(ENDPOINT);
        const { name, room } = queryString.parse(location.search);
        setRoom(room);
        setName(name);
        socket.emit("join", { name, room }, (error) => {
            if (error) {
            setFlag(1);
            alert(error);
            }
        });
        

    }, [ENDPOINT, location.search])

    useEffect(() => {
        socket.on('roomData', ({ users }) => {
            setUsers(users);
            //setXPlayer(users[0].name);
            //setOPlayer(users[1].name)
            console.log(users);
        })
    }, [])

    return (
        <div className = "joinOuterContainer">
            <form className = 'joinInnerContainer' >
                <h1 className = 'heading'>Waiting for Second Player...</h1>
                {(users.length === 2) && 
                <Redirect to={`/game/${room}?room=${room}&name=${name}`}/>}
            </form>
            
        </div>
    )
    
}

export default WaitingRoom;
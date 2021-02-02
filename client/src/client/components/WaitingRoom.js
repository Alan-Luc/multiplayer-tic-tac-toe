import React,{ useState, useEffect } from 'react'
import { Redirect } from 'react-router'
import io from 'socket.io-client'
import queryString from 'query-string'


let socket = io("https://alan-tic-tac-toe.herokuapp.com/", {
  withCredentials: true,
});

/*let socket = io("http://localhost:8000", {
  withCredentials: true,
}); testing usage*/
const WaitingRoom = ({ location }) => {
    const [users, setUsers] = useState('');
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [flag, setFlag] = useState(0);
    const [xPlayer, setXPlayer] = useState('')
    const [oPlayer, setOPlayer] = useState('');
    const [count, setCount] = useState(0);
    const ENDPOINT = "https://alan-tic-tac-toe.herokuapp.com/";
    // for testing const ENDPOINT = "http://localhost:8000";

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
        socket.on('roomData', ({ pp }) => {
            pp.slice(0,2);
            setUsers('');
            setUsers(pp);
            //setXPlayer(users[0].name);
            //setOPlayer(users[1].name);
            //console.log(pp);
        });
        socket.on('playAgain', () => {
            setUsers('');
        })

        //socket.to(users[0].id).emit('turn', {turn});
    }, [])
    //(users.length%2 === 0) && setUsers('');

    return (
        <div className = "joinOuterContainer">
            <form className = 'joinInnerContainer' >
                <h1 className = 'heading'>Waiting for Second Player...</h1>
                {(users && users.length%2 === 0) && 
                <Redirect to={`/game/${room}?room=${room}&name=${name}&turn=${users[1].name === name ? '2' : '1'}`}/>}
            </form>
            
        </div>
    )
    
}

export default WaitingRoom;
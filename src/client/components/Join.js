import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import './Join.css'

//Make connection
//const socket = io.connect('http://localhost:3000');
//to={`/game/${room}?room=${room}&name=${name}`}

//Emit events
const Join  = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');

    return (
        <div className = "joinOuterContainer">
            <form className = 'joinInnerContainer' >
                <h1 className = 'heading'>Play Tic Tac Toe!</h1>
                <div>
                    <input 
                    type ='text'
                    placeholder = 'Name'
                    autoComplete = 'off'
                    onChange={(e)=> setName(e.target.value)}
                    className = 'joinInput'
                    required/>
                </div>
                <div>
                    <input
                    type='text'
                    placeholder='Room' 
                    autoComplete='off'
                    onChange={(e)=>setRoom(e.target.value)}
                    className ='joinInput mt-20'
                    required/>
                </div>
                {(name.trim() && room.trim()) && 
                <Link to={`/waitingRoom/${room}?name=${name}&room=${room}`} >
                    <button className ={'button mt-20'}>Join</button>
                </Link>}
            </form>
            
        </div>
    )
}

export default Join;
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import io from 'socket.io-client'

import Board from '../components/Board'
import './Game.css'

let socket;

const Game = ({ location }) => {
    const [playerXTurn, setPlayerXTurn] = useState(true);
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [stepNumber, setStepNumber] = useState(0);
    const [status, setStatus] = useState("It is X's turn");
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [flag, setFlag] = useState(0);
    const [moves, setMoves] = useState(undefined);
    const ENDPOINT = 'http://localhost:3000/';

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        socket = io(ENDPOINT);

        setRoom(room);
        setName(name);

        socket.emit('join', { name, room }, (error) => {
            if(error) {
                setFlag(1);
                alert(error);
            }
        });
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('roomData', ({ users }) => {
            setUsers(users);
        })
    }, []);

    const handleClick = (i) => {
        const square = squares.slice()
        const win = winner(square)
        const tie = stepNumber===8

        if(win || squares[i]) {
            return;
        }
        
        if(squares[i] === null) {
            square[i] = playerXTurn ? 'X' : 'O'; 
            setSquares(square);
            setPlayerXTurn(!playerXTurn);
            setStepNumber(stepNumber + 1);
            !playerXTurn ? setStatus("It is X's turn") : setStatus("It is O's turn");
        }
        //squares[i] === null ? (squares[i] = this.state.playerXTurn ? 'X' : 'O';) : this.setState({status: 'Please select another tile'});
        //squares[i] === 'X' ? this.setState({playerXTurn: !playerXTurn}) : this.setState({playerXTurn: }) 
        
        if(win) {
            setStatus('');
        }
        else if(tie)  {
            setStatus('Tie');
        }

        socket.emit('move', squares);
    }

    const handleReset = () => {
        setPlayerXTurn(true);
        setSquares(Array(9).fill(null));
        setStepNumber(0);
        setStatus("It is X's turn");
    }
    
    const winner = (squares) => {
        const win = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ]
    
        for(let i = 0; i<win.length; i++) {
            const [a,b,c] = win[i]
            if(squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
                return squares[a]
            }
        }
        return null
    }

    let victory;
    const win = winner(squares);
    if(win) {
        victory = 'The winner is ' + (playerXTurn? 'O' : 'X')
    }

    return (
        <div className = 'body'>
                <div className = 'game'>
                <div>
                    <Board
                    onClick = {(i)=>handleClick(i)}
                    squares = {squares}
                    />
                    <br />
                    {win? <div id = 'feedback' className = 'status'>{victory}</div> : <div className = 'status'>{status}</div>}
                    <br />

                    <div className = 'win'>
                        {(win || stepNumber === 9) && <button  className = 'reset' onClick = {()=>handleReset()}>Play Again?</button>}
                        <br></br><br></br>{(win || stepNumber === 9) && <Link to={'/'}>
                        <button className = 'button2'>Exit</button>
                        </Link>}
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Game;
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";

import Board from "../components/Board";
import "./Game.css";

let socket = io("http://localhost:8000", {
  withCredentials: true,
});
//const socket = io.connect('http://localhost:3000');

const Game = ({ location }) => {
  const [yourTurn, setYourTurn] = useState((queryString.parse(location.search).turn === '1' ? true : false));
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [stepNumber, setStepNumber] = useState(0);
  const [xPlayer, setXPlayer] = useState('');
  const [oPlayer, setOPlayer] = useState('');
  const [status, setStatus] = useState('');
  const [name, setName] = useState(queryString.parse(location.search).name);
  const [room, setRoom] = useState(queryString.parse(location.search).room);
  const [users, setUsers] = useState('');
  //const users = useRef();
  const [flag, setFlag] = useState(0);
  const [moves, setMoves] = useState(undefined);
  const ENDPOINT = "http://localhost:8000";
  //const users2 = users.slice();

  useEffect(() => {
    //const { name, room } = queryString.parse(location.search);

    socket = io.connect(ENDPOINT);
    const square = squares.slice();
    
    //setName(queryString.parse(location.search).name);
    
    console.log(yourTurn);

    socket.emit(
      "join",
      {
        name: queryString.parse(location.search).name,
        room: queryString.parse(location.search).room,
      },
      (error) => {
        if (error) {
          setFlag(1);
          alert(error);
        }
      }
    );
    /*socket.on("move", (data) => {
      console.log(data.move);
    });*/
    //setRoom(room);

    socket.on('move', ({ move, location }) => {
        square[location] = move;
        setSquares(move);
        //setStepNumber(stepNumber + 1);
        
         
        //stepNumber === 8 && setStatus("Tie");
        /*for(let m = 0; m<9; m++) {
          move[m] !== null && setStatus('Tie');
        }*/
        console.log(squares);
        console.log(move);
        //console.log(turn);
        console.log(name);
        console.log(users.length);
        //console.log(stepNumber);
    });

    socket.on('turn', (turn) => {
      setYourTurn(true); 
      setStatus('It is your turn');
      console.log(yourTurn);
      
    });
    

    socket.on('roomData', ({ pp }) => {
      const userList = pp.slice(0,2);
      setUsers('');
      setUsers(userList);
      //console.log(userList);
      setStatus(`It is ${userList[0].name}'s turn`)
      setXPlayer(userList[0].name);
      setOPlayer(userList[1].name);
      //console.log(pp[1].name);
      //console.log(pp[0].name);
      //console.log(socket.id);
        
    });

  }, [ENDPOINT, location.search]);

    /*useEffect(() => {
        socket.on('roomData', ({ users }) => {
            setUsers(users);
            console.log(users);
        })
    }, []);*/

  const handleClick = (i) => {
    const square = squares.slice();
    const win = winner(square);
    

    if (win || squares[i]) {
      return;
    }

    if (yourTurn && (squares[i] === null)) {
      square[i] = (queryString.parse(location.search).turn === '1') ? 'X' : 'O'
      setSquares(square);
      //setStepNumber(stepNumber + 1);
      setYourTurn(false);
      //!playerXTurn ? setStatus("It is X's turn") : setStatus("It is O's turn");
    }
    //squares[i] === null ? (squares[i] = this.state.playerXTurn ? 'X' : 'O';) : this.setState({status: 'Please select another tile'});
    //squares[i] === 'X' ? this.setState({playerXTurn: !playerXTurn}) : this.setState({playerXTurn: })

    if (win) {
      setStatus("");
    }

    socket.emit("move",  {
      room: queryString.parse(location.search).room,
      move: square,
      location: i,
      stepNumber: stepNumber
    });

    socket.emit('turn', {
      room: room,
    });
    
    //set status after sending move to be other player's name
    if(name === users[0].name){
      setStatus(`It is ${users[1].name}'s turn`)
    }
    else if(name === users[1].name) {
      setStatus(`It is ${users[0].name}'s turn`)
    }
  };

  const handleReset = () => {
    socket.emit('playAgain', {
      room: room,
      name: name,
      id: socket.id
    })
  };

  const winner = (squares) => {
    const win = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < win.length; i++) {
      const [a, b, c] = win[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  let victory;
  const win = winner(squares);
  if (win) {
    victory = "The winner is pp";
  }

  //console.log(queryString.parse(location.search).room);

  return (
    <div className='body'>
      <div className='game'>
        <div>
          <Board onClick={(i) => handleClick(i)} squares={squares} />
          <br />
          {win ? (
            <div id='feedback' className='status'>
              {victory}
            </div>
          ) : (
            <div className='status'>{status}</div>
          )}
          <br />

          <div className='win'>
            {(win || stepNumber === 9) && (
              <Link onClick={handleReset()} to={`/waitingRoom/${room}?name=${name}&room=${room}`} >
                    <button className ={'button mt-20'}>Play Again?</button>
              </Link>
            )}
            <br></br>
            <br></br>
            {(win || stepNumber === 9) && (
              <Link to={"/"}>
                <button className='button2'>Exit</button>
              </Link>
            )}
          </div>
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default Game;
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
  const [playerXTurn, setPlayerXTurn] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState("It is X's turn");
  const [name, setName] = useState([]);
  const [room, setRoom] = useState("");
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
    
    setName(queryString.parse(location.search).name);

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
    setRoom(room);

    socket.on('move', ({ move, location, turn, name }) => {
        square[location] = move;
        setSquares(move);
        setPlayerXTurn(turn);
        turn ? setStatus(`It is ${name}'s turn`) : setStatus(`It is ${name}'s turn`);
        console.log(squares);
        console.log(move);
        console.log(turn);
        console.log(name);
        console.log(users.length);
    });

    socket.on('roomData', ({ users }) => {
        setUsers(users);
        console.log(users);
    })
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
    const tie = stepNumber === 8;

    if (win || squares[i]) {
      return;
    }

    if (squares[i] === null) {
      square[i] = playerXTurn ? "X" : "O";
      setSquares(square);
      setPlayerXTurn(!playerXTurn);
      setStepNumber(stepNumber + 1);
      //!playerXTurn ? setStatus("It is X's turn") : setStatus("It is O's turn");
    }
    //squares[i] === null ? (squares[i] = this.state.playerXTurn ? 'X' : 'O';) : this.setState({status: 'Please select another tile'});
    //squares[i] === 'X' ? this.setState({playerXTurn: !playerXTurn}) : this.setState({playerXTurn: })

    if (win) {
      setStatus("");
    } else if (tie) {
      setStatus("Tie");
    }

    socket.emit("move",  {
      name: queryString.parse(location.search).name,
      room: queryString.parse(location.search).room,
      move: square,
      location: i,
      turn: !playerXTurn

    });

    
  };

  const handleReset = () => {
    setPlayerXTurn(true);
    setSquares(Array(9).fill(null));
    setStepNumber(0);
    setStatus("It is X's turn");
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
    victory = "The winner is " + (playerXTurn ? "O" : "X");
  }

  console.log(queryString.parse(location.search).room);

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
              <button className='reset' onClick={() => handleReset()}>
                Play Again?
              </button>
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
import React, { useState, useEffect, useRef } from "react";
import { Link, Redirect } from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";

import Board from "./Board";
import "./Game.css";


//production
let socket = io("https://alan-tic-tac-toe.herokuapp.com/", {
  withCredentials: true,
});

//testing
/*let socket = io("http://localhost:8000", {
  withCredentials: true,
});*/
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
  const ENDPOINT = "https://alan-tic-tac-toe.herokuapp.com/";
  //const ENDPOINT = "http://localhost:8000";
  //^testing
  //const users2 = users.slice();
  const [count, setCount] = useState(9);
  const [socketId, setSocketId] = useState('');
  const [executeTimeout, setExecuteTimeout] = useState(true);

  useEffect(() => {
    //const { name, room } = queryString.parse(location.search);

    socket = io.connect(ENDPOINT);
    
    
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

    
    setCount(count-1);
    console.log(count);

  }, [ENDPOINT, location.search]);

    useEffect(() => {
      const square = squares.slice();
      socket.on('turn', (turn) => {
        
        console.log(square);
        setYourTurn(true);
        if(tie(square) === true) {
          setStatus('Tie');
          console.log('pp2')
        }
        else if(status !== 'Tie') {
          setStatus('It is your turn');
          console.log('pp3');
        } 
        console.log(yourTurn);
        console.log(tie(square));
        
      });


      

      socket.on('move', ({ move, location, stepNumber }) => {
        square[location] = move;
        setSquares(move);
        //setStepNumber(stepNumber + 1);
        console.log(tie(move));
        if(tie(move) === true) {
          console.log('pp');
          setStatus('Tie')
        }
        
        //stepNumber === 8 && setStatus("Tie");
        /*for(let m = 0; m<9; m++) {
          move[m] !== null && setStatus('Tie');
        }*/
        console.log(squares);
        console.log(move);
        //console.log(turn);
        console.log(name);
        console.log(users);
        console.log(socketId);
        //console.log(stepNumber);
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
        if(name === xPlayer) {
          setSocketId(users[0].id)
        }
        else if(name === oPlayer) {
          setSocketId(users[1].id)
        }
      });
      socket.on('warning', () => {
        setStatus('Click play again within 10s to play again')
        setTimeout(() =>{
          if(executeTimeout){
          return(<Redirect to={'/'}></Redirect>)
          }
        }, 10000)
      });

    }, []);

  const handleClick = (i) => {
    const square = squares.slice();
    const win = winner(square);
    const pp = tie(square);
    

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
    if(pp === true) {
      setStatus('Tie');
    }

    socket.emit("move",  {
      room: queryString.parse(location.search).room,
      move: square,
      location: i,
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
      id: socketId
    })
    setExecuteTimeout(false);
  };

  const handleExit = () => {
    socket.emit('exit', {
      id: socketId,
      room: room
    });
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

  const tie = (squares) => {
    for(let m = 0; m<9 ; m++) {
      if(squares[m] === null ) {
        return false;
      }
    }
    return true;
  }

  let victory;
  const win = winner(squares);
  const pp = tie(squares);
  if (win) {
    victory = (win === 'X') ? `The winner is ${xPlayer}` : `The winner is ${oPlayer}`
  }
  else if(pp === true) {
    victory = 'Tie'
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
            {(win || pp === true) && (
              <Link onClick={() => handleReset()} to={`/waitingRoom/${room}?name=${name}&room=${room}`} >
                    <button onClick={() => handleReset()} className ={'button mt-20'}>Play Again?</button>
              </Link>
            )}
            <br></br>
            <br></br>
            {(win || pp === true) && (
              <Link onClick={() => handleExit()} to={"/"}>
                <button onClick={() => handleExit()}className='button2'>Exit</button>
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
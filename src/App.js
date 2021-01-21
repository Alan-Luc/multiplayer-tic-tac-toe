import React from 'react'
import './App.css'
import { Switch, Route } from 'react-router-dom'

import Game from './client/components/Game.js'
import Join from './client/components/Join.js'
import WaitingRoom from './client/components/WaitingRoom'


//Use previous tutorial's join screen/code 


const App = () => {
  return(
    <Switch>
      <Route exact path='/' component={Join}/>
      <Route exact path = '/waitingRoom/:wait' component={WaitingRoom} />
      <Route exact path='/game/:room' component={Game}/>
    </Switch>
  )
  
}

export default App;
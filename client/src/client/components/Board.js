import React, { Component } from 'react'
import Square from './Square'

const Board = (props) => {
    const renderSquare = (i) => {
        return (
            <Square 
                onClick = {() => props.onClick(i)}
                value = {props.squares[i]}
            />
        )
    }

    return (
        <div>
            <div className = 'row'>
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className = 'row'>
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className = 'row'>
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    )
}

export default Board;



/*export default class Board extends Component {
    renderSquare(i) {
        return(
            <Square 
           onClick = {()=>this.props.onClick(i)}
           value = {this.props.squares[i]}
            />
        )  
    }
    
    render() {
        return (
            <div>
                <div className = 'row'>
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className = 'row'>
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className = 'row'>
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        )
    }
}*/
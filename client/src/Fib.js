import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    //Fetch data from back end API
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndexes(){
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({ seenIndexes: seenIndexes.data });
    }

    // needs to be a bound function
    handleSubmit = async (event) => {
        event.preventDefault();

        //make the request to the express API
        await axios.post('/api/values', {
            index: this.state.index
        });

        //clear form after submission
        this.setState({ index: '' });
    }

    renderSeenIndexes(){
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }

    renderValues(){
        const entries = [];

        for(let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated { this.state.values[key] }
                </div>
            );
        }

        return entries;
    }

    render(){
       return (
           <div>
               <form onSubmit={this.handleSubmit}>
                   <label>Endter your index:</label>
                   <input 
                    value={this.state.index}
                    onChange={event => this.setState({ index: event.target.value })}
                   />
                   <button>Submit</button>
               </form>
               
               <h3>Indexes I have seen:</h3>
               {this.renderSeenIndexes()}
               
               <h3>Calculated Values</h3>
               {this.renderValues()}
           </div>
       ); 
    }
}



export default Fib;
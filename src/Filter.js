import React, {Component} from 'react';

class Filter extends Component {

    state = {
        min  : 0,
        max  : 0,
        param: '',
    };

    handleChange(event) {
        const {name, value} = event.target;

        if(name === 'param') {
            this.setState({
                min: this.props.minmax[value].min,
                max: this.props.minmax[value].max,
            });
        }

        this.setState({
            [name]: value,
        });
    }

    handleSubmit() {
        if (this.state.param !== '') {
            this.props.onSubmit(
                this.state.param,
                parseInt(this.state.min),
                parseInt(this.state.max),
            );
        }
    }

    render() {
        return (
            <div>
                <select name={'param'} onChange={this.handleChange.bind(this)}>
                    <option selected={this.state.param === ''}>[Parameter]</option>
                    {
                        this.props.params.map((o) => (<option value={o} selected={o === this.state.param}>{o}</option>))
                    }
                </select>
                From
                <input type={'text'} onChange={this.handleChange.bind(this)} name={'min'} value={this.state.min}/>
                To
                <input type={'text'} onChange={this.handleChange.bind(this)} name={'max'} value={this.state.max}/>
                <button onClick={this.handleSubmit.bind(this)}>Apply</button>
            </div>
        );
    }

}

export default Filter;

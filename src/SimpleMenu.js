import React from 'react';
import Button from 'material-ui/Button';
import Menu, {MenuItem} from 'material-ui/Menu';

class SimpleMenu extends React.Component {
    state = {
        anchorEl: null,
        open    : false,
    };

    handleClick = event => {
        this.setState({open: true, anchorEl: event.currentTarget});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    handleSelect = (choice) => {
        this.handleRequestClose();
        this.props.onSelect(choice);
    };

    render() {
        const {items, label} = this.props;

        return (
            <div>
                <Button
                    raised
                    aria-owns={this.state.open ? 'simple-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    {label}
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    open={this.state.open}
                    onRequestClose={this.handleRequestClose}
                >
                    {items.map(i => (<MenuItem key={i} onClick={() => this.handleSelect(i)}>{i}</MenuItem>))}
                </Menu>
            </div>
        );
    }
}

export default SimpleMenu;

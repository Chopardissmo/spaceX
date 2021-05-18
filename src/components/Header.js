import React, { Component } from "react";
import starlinkLogo from "../assets/image/Starlink_Logo.svg";

export default class Header extends Component {
    render() {
        return (
            <header className="App-header">
                <img src={starlinkLogo} className="App-logo" alt="logo" />
                <p className="title">StarLink Tracker</p>
            </header>
        );
    }
}

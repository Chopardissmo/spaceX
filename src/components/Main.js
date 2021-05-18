import React, { Component } from "react";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";

export default class Main extends Component {
    render() {
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting />
                    <SatelliteList />
                </div>
                <div className="right-side">right</div>
            </div>
        );
    }
}

import React, { Component } from "react";
import Axios from "axios";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import { NEARBY_SATELLITE, STARLINK_CATEGORY, SAT_API_KEY } from "../constant";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            satInfo: null,
            settings: null,
        };
    }

    showNearbySatellite = (setting) => {
        this.setState({
            settings: setting,
        });
        this.fetchSatellite(setting);
    };

    fetchSatellite = (setting) => {
        const { observerLat, observerLong, observerAlt, radius } = setting;
        const url = `/api${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerAlt}/${radius}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        Axios.get(url)
            .then((response) => {
                this.setState({
                    satInfo: response.data,
                });
            })
            .catch((error) => {
                console.log("err in fetch satellite -> ", error);
            });
    };

    render() {
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite} />
                    <SatelliteList satInfo={this.state.satInfo} />
                </div>
                <div className="right-side">right</div>
            </div>
        );
    }
}

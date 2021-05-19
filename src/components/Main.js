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
            loadingSatellites: false,
            selected: [],
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

        // before send the request, display loading animation
        this.setState({
            loadingSatellites: true,
        });

        Axios.get(url)
            .then((response) => {
                this.setState({
                    satInfo: response.data,
                    loadingSatellites: false,
                    selected: [],
                });
            })
            .catch((error) => {
                console.log("err in fetch satellite -> ", error);
                this.setState({
                    loadingSatellites: false,
                });
            });
    };

    trackOnClick = () => {
        console.log(`tracking ${this.state.selected}`);
    };

    addOrRemove = (item, status) => {
        let { selected: list } = this.state;
        const found = list.some((entry) => entry.satid === item.satid);

        if (status && !found) {
            list.push(item);
        }

        if (!status && found) {
            list = list.filter((entry) => {
                return entry.satid !== item.satid;
            });
        }

        console.log(list);
        this.setState({
            selected: list,
        });
    };

    render() {
        const { satInfo, loadingSatellites } = this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite} />
                    <SatelliteList
                        satInfo={satInfo}
                        loading={loadingSatellites}
                        onSelectionChange={this.addOrRemove}
                        disableTrack={this.state.selected.length === 0}
                        trackOnclick={this.trackOnClick}
                    />
                </div>
                <div className="right-side">right</div>
            </div>
        );
    }
}

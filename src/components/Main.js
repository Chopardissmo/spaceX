import React, { Component } from "react";
import Axios from "axios";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import {
    NEARBY_SATELLITE,
    STARLINK_CATEGORY,
    SAT_API_KEY,
    SATELLITE_POSITION_URL,
} from "../constant";

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            satInfo: null,
            settings: undefined,
            loadingSatellites: false,
            selected: [],

            loadingSatPositions: false,
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

    // get selected Satellites' movement info to display on the map
    trackOnClick = (duration) => {
        console.log(`tracking ${this.state.selected}`);

        const { observerLat, observerLong, observerAlt } = this.state.settings;
        const endTime = duration * 60;

        // configure loading animation flag
        this.setState({ loadingSatPositions: true });

        //! for each satellite, send request to get its predicted position
        const urls = this.state.selected.map((sat) => {
            const { satid } = sat;
            const url = `/api${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${observerAlt}/${endTime}/&apiKey=${SAT_API_KEY}`;
            return Axios.get(url);
        });

        Axios.all(urls)
            .then(
                Axios.spread((...args) => {
                    return args.map((item) => item.data);
                })
            )
            .then((res) => {
                this.setState({
                    satPositions: res,
                    loadingSatPositions: false,
                });
            })
            .catch((e) => {
                console.log("err in fetch satellite position -> ", e.message);
            });
    };

    // maintain the selected list for Satellites
    addOrRemove = (item, status) => {
        let { selected: list } = this.state;
        const found = list.some((entry) => entry.satid === item.satid);

        // selected new item
        if (status && !found) {
            list.push(item);
        }

        // unselect an item
        if (!status && found) {
            list = list.filter((entry) => {
                return entry.satid !== item.satid;
            });
        }

        //console.log(list);
        this.setState({
            selected: list,
        });
    };

    render() {
        const { satInfo, loadingSatellites, selected, loadingSatPositions } =
            this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite} />
                    <SatelliteList
                        satInfo={satInfo}
                        loading={loadingSatellites}
                        onSelectionChange={this.addOrRemove}
                        disableTrack={selected.length === 0}
                        trackOnclick={this.trackOnClick}
                    />
                </div>
                <div className="right-side">
                    <WorldMap loading={loadingSatPositions} />
                </div>
            </div>
        );
    }
}

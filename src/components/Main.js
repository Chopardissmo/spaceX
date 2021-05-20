import React, { Component } from "react";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";

import Axios from "axios";
import * as d3Scale from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { select as d3Select } from "d3-selection";
import { geoKavrayskiy7 } from "d3-geo-projection";

import {
    NEARBY_SATELLITE,
    STARLINK_CATEGORY,
    SAT_API_KEY,
    SATELLITE_POSITION_URL,
} from "../constant";

const width = 960;
const height = 600;

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
        this.refTrack = React.createRef();
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
        this.setState({ loadingSatPositions: true, duration: duration });

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
                //! after get all data, draw position
                this.track();
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

    track = () => {
        const data = this.state.satPositions;

        const len = data[0].positions.length;
        const startTime = this.state.duration;

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);
        const context2 = canvas2.node().getContext("2d");

        let now = new Date();
        let i = startTime;

        let timer = setInterval(() => {
            let timePassed = Date.now() - now;
            if (i === startTime) {
                now.setSeconds(now.getSeconds() + startTime * 60);
            }

            let time = new Date(now.getTime() + 60 * timePassed);
            context2.clearRect(0, 0, width, height);
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }
            data.forEach((sat) => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i], context2);
            });

            i += 60;
        }, 1000);
    };

    drawSat = (sat, pos, context2) => {
        const { satlongitude, satlatitude } = pos;
        if (!satlongitude || !satlatitude) return;
        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(0.1);

        const xy = projection([satlongitude, satlatitude]);
        context2.fillStyle =
            d3Scale.scaleOrdinal(schemeCategory10)(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
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
                    <WorldMap
                        refTrack={this.refTrack}
                        loading={loadingSatPositions}
                    />
                </div>
            </div>
        );
    }
}

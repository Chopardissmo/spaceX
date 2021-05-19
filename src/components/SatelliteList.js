import React, { Component } from "react";
import { List, Avatar, Button, Checkbox, Spin } from "antd";
import Satellite from "../assets/image/satellite.svg";

export default class SatelliteList extends Component {
    onChange = (e) => {
        const { dataInfo, checked } = e.target;
        this.props.onSelectionChange(dataInfo, checked);
    };

    render() {
        const { satInfo, loading } = this.props;
        const satList = satInfo ? satInfo.above : [];

        return (
            <div className="sat-list-box">
                <Button
                    className="sat-list-btn"
                    size="large"
                    disabled={this.props.disableTrack}
                    onClick={() => this.props.trackOnclick()}
                >
                    Track on the map
                </Button>

                <hr />

                {loading ? (
                    <Spin tip="Loading Satellites..." />
                ) : (
                    <List
                        className="sat-list"
                        itemLayout="horizontal"
                        size="small"
                        dataSource={satList}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Checkbox
                                        dataInfo={item}
                                        onChange={this.onChange}
                                    />,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar size={50} src={Satellite} />
                                    }
                                    title={<p>{item.satname}</p>}
                                    description={`Launch Date: ${item.launchDate}`}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        );
    }
}

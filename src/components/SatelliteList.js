import React, { Component } from "react";
import { List, Avatar, Button, Checkbox } from "antd";
import Satellite from "../assets/image/satellite.svg";

export default class SatelliteList extends Component {
    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];

        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn" size="large">
                    Track on the map
                </Button>

                <hr />

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
                                avatar={<Avatar size={50} src={Satellite} />}
                                title={<p>{item.satname}</p>}
                                description={`Launch Date: ${item.launchDate}`}
                            />
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

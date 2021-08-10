import React from 'react';
import {Button, Spin, List, Avatar, Checkbox} from 'antd';
import satellite from '../assets/images/satellite.png'

class SatelliteList extends React.Component {
    constructor() {
        super();
        this.state = {
            selected: [],
            isLoad: false
        }
    }

    onChange = e => {
        console.log(e.target);      //指向返回事件的目标节点(触发该事件的节点)
        const { dataInfo, checked } = e.target;
        const { selected } = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);
        this.setState( {
            selected: list
        })
    }

    addOrRemove = (item, status, list) => {
        const found = list.some(entry => entry.satid === item.satid);       // some(): pick all valid items
        // if sat is not in the list -> add to the list
        // else -> do nothing
        if (status && !found) list.push(item);
        if (!status && found) {
            list = list.filter( entry => { return entry.satid !== item.satid; });
        }
        return list;
    }

    // pass selected sat list to Main component (child -> parent)
    onShowSatMap = () => {
        this.props.onShowMap(this.state.selected);
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const {isLoad} = this.props.isLoading;

        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn"
                        style={{
                            textAlign: "center",
                            background: "linear-gradient(to left, #282c34, #1b528d)",
                            color: "#fff",
                            margin: "10px"}}
                        onClick={this.onShowSatMap}>
                    Track that Satellite on the Map
                </Button>

                <hr color="#0a2a56" size="1" width="150px"/>

                <br />

                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large"/>
                        </div>
                        :
                        <List className="sat-list"
                              itemLayout="horizontal"
                              size="small"
                              dataSource={satList}
                              renderItem={(item) => (
                                  <List.Item actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}>
                                      <List.Item.Meta
                                          avatar={<Avatar size={50} src={satellite}/>}
                                          title={<p>{item.satname}</p>}
                                          description={`Launch Date: ${item.launchDate}`}
                                      />
                                  </List.Item>
                              )}
                        />
                }
            </div>
        );
    }
}

export default SatelliteList;
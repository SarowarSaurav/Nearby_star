import React from 'react';
import axios from 'axios';
import {WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY} from "../constants";
import {Spin} from 'antd';
import {feature} from 'topojson-client';
import {geoEckert4} from 'd3-geo-projection';
import {geoGraticule, geoPath} from 'd3-geo';
import {select as d3Select} from 'd3-selection';
import {schemeTableau10} from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import {timeFormat as d3TimeFormat} from "d3-time-format";

// set canva
const width = 1180;
const height = 760;

class WorldMap extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            isDrawing: false
        }
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeTableau10);
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const {data} = res;
                console.log(data);
                // convert data to UI
                const land = feature(data, data.objects.countries).features;
                console.log(land);
                this.generateMap(land);
            })
            .catch(err => {
                console.log(`err in fetch world map data: `, err);
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            // fetch satellite positions
            const {
                latitude,
                longitude,
                elevation,
                duration
            } = this.props.observerData;
            const endTime = duration * 60;
            this.setState({
                isLoading: true
            });

            const urls = this.props.satData.map(sat => {
                const {satid} = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });

            // use promise to deal with multiple requests
            Promise.all(urls)
                .then(results => {
                    console.log(results);
                    const arr = results.map(sat => sat.data);
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });

                    // tracking satellite
                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName('hint')[0];
                        oHint.innerHTML = "We are collecting information .Please wait before adding new one";
                    }
                })
                .catch(err => {
                    console.log(`err in fetch satellite position: `, err.message);
                })
        }
    }

    track = data => {
        // check if there has position
        if (data.length === 0 || !data[0].hasOwnProperty("positions")) {
            throw new Error(`no position data`);
        }

        const len = data[0].positions.length;
        const {context2} = this.map;
        let now = new Date();
        let i = 0;

        let timer = setInterval(() => {
            // get current time
            let currentTime = new Date();
            let timePassed = i === 0 ? 0 : currentTime - now;
            // convert time
            let time = new Date(now.getTime() + 60 * timePassed);

            context2.clearRect(0, 0, width, height);

            context2.font = "bold 12px 'PT Sans Caption', sans-serif";
            context2.marginTop = "100px";
            context2.fillStyle = "#282c34";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 80);

            // when to clear timer
            if (i >= len) {
                clearInterval(timer);
                this.setState({isDrawing: false});
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            // for ea
            // ch satellite
            data.forEach( sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);       // pass current positions
            });

            i += 60;
        }, 1000);
    };

    drawSat = ( sat, pos ) => {
        const {satlongitude, satlatitude} = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const {projection, context2} = this.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();

        context2.font = "bold 12px 'PT Sans Caption' sans-serif";
        context2.textAlign = "center";
        context2.marginTop = "100px";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    }

    generateMap(land) {
        // step1: create projection
        const projection = geoEckert4()
            .scale(200)
            .translate([width / 2, height / 2])
            .precision(.1);

        const graticule = geoGraticule();

        // step2: get canvas via ref
        const canvas = d3Select(this.refMap.current)
            .attr('width', width)
            .attr('height', height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr('width', width)
            .attr('height', height);

        const context = canvas.node().getContext("2d");
        const context2 = canvas2.node().getContext("2d");

        // step3: show data via path
        let path = geoPath()
            .projection(projection)
            .context(context);

        console.log(path);

        land.forEach(ele => {
            context.fillStyle = '#020c1c';
            context.strokeStyle = '#fff';
            context.globalAlpha = 0.8;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();
            context.strokeStyle = 'rgba(220, 220, 220, 0.8)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            // 头尾
            context.beginPath();
            context.lineWidth = 0.1;
            path(graticule.outline());
            context.stroke();
        });

        this.map = {
            context: context,
            context2: context2,
            projection: projection,
            graticule: graticule
        }
    }

    render() {
        const {isLoading} = this.state;

        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large"/>
                    </div>
                ) : null}
                <canvas className="map" ref={this.refMap}/>
                <canvas className="track" ref={this.refTrack}/>
                <div className="hint"/>
            </div>
        )
    }
}

export default WorldMap;
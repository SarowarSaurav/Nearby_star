import React from 'react';
import {Form, Button, InputNumber} from 'antd';

class SatSetting extends React.Component {
    render() {
        // get form object from props.form
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            // responsive
            labelCol: {
                xs: {span: 24},
                sm: {span: 11},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 13},
            }
        };

        return (
            <Form {...formItemLayout} className="sat-setting" onSubmit={this.showSatellite}>
                <div className="setting-fields">
                    <Form.Item label="Longitude(degrees)">
                        {getFieldDecorator("longitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your longitude"
                                }
                            ],
                        })(<InputNumber min={-180} max={180}
                                        style={{width: "100%"}}
                                        placeholder="Please input longitude"
                        />)
                        }
                    </Form.Item>
                    <Form.Item label="Latitude(degrees)">
                        {getFieldDecorator("latitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your latitude"
                                }
                            ],
                        })(<InputNumber min={-90} max={90}
                                        style={{width: "100%"}}
                                        placeholder="Please input latitude"
                        />)
                        }
                    </Form.Item>
                    <Form.Item label="Elevation(degrees)">
                        {getFieldDecorator("elevation", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your elevation"
                                }
                            ],
                        })(<InputNumber min={-413} max={8850}
                                        style={{width: "100%"}}
                                        placeholder="Please input elevation"
                        />)
                        }
                    </Form.Item>
                    <Form.Item label="Altitude(degrees)">
                        {getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your altitude"
                                }
                            ],
                        })(<InputNumber min={0} max={90}
                                        style={{width: "100%"}}
                                        placeholder="Please input altitude"
                        />)
                        }
                    </Form.Item>
                    <Form.Item label="Duration(secs)">
                        {getFieldDecorator("duration", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your duration"
                                }
                            ],
                        })(<InputNumber min={0} max={90}
                                        style={{width: "100%"}}
                                        placeholder="Please input duration"
                        />)
                        }
                    </Form.Item>
                </div>
                <Form.Item className="show-nearby">
                    <Button style={{
                        marginLeft: 100,
                        textAlign: "center",
                        background: "linear-gradient(to left, #282c34, #1b528d)",
                        color: "#fff",
                        marginBottom: "10px"
                    }}
                            htmlType="submit">
                        Find Your Nearby Satellites!
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    showSatellite = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                // pass to parent component
                this.props.onShow(values);
            }
        })
    }
}

const SatSetting1 = Form.create({name: 'satellite-setting'})(SatSetting);
export default SatSetting1;
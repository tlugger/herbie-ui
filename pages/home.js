import React, { Component } from 'react';
import { Card, CardBody, Chart, Col, Loader, Row, ToggleButton } from '@nio/ui-kit';
import { withPubkeeper } from '../providers/pubkeeper';

class Page extends Component {
  state = {
    soilMoisture: 0.0,
    temperature: 0.0,
    historicalTemperature: Array(30).fill(0.0),
    humidity: 0.0,
    historicalHumidity: Array(30).fill(0.0),
    chartLabels: Array(30).fill(''),
    last_watered: [],
    pump_status: false,
  };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron('herbert.soil.value', patron => patron.on('message', this.handleSoil));
    pkClient.addPatron('herbert.ht.value', patron => patron.on('message', this.handleHT));
    pkClient.addPatron('herbert.pump.value', patron => patron.on('message', this.handlePump));
    pkClient.addPatron('herbert.pump.status', patron => patron.on('message', this.handlePumpStatus));
  };

  handleSoil = (data) => {
    const json = new TextDecoder().decode(data);
    const { soil_moist: isMoist } = JSON.parse(json)[0];

    this.setState({ soilMoisture: parseFloat(isMoist) });
  };

  handleHT = (data) => {
    const { historicalTemperature, historicalHumidity, chartLabels } = this.state;
    const json = new TextDecoder().decode(data);
    const { temperature: temp, humidity: humid } = JSON.parse(json)[0];

    historicalHumidity.shift();
    historicalTemperature.shift();

    historicalTemperature.push(temp.toFixed(4));
    historicalHumidity.push(humid.toFixed(4));

    this.setState({ temperature: temp, humidity: humid, historicalTemperature, historicalHumidity });
  };

  handlePump = (data) => {
    const json = new TextDecoder().decode(data);
    const { last_watered: watered } = JSON.parse(json)[0];
    const water_time = new Date(watered);
    this.setState({ last_watered: water_time.toLocaleString() });
  };

  handlePumpStatus = (data) => {
    const json = new TextDecoder().decode(data);
    const { status: val } = JSON.parse(json)[0];
    this.setState({ pump_status: val });
  };

  render() {
    const { soilMoisture, temperature, humidity, historicalHumidity, historicalTemperature, chartLabels, last_watered, pump_status } = this.state;

    return (
      <Card>
        <CardBody className="p-3">
          <h2 className="m-0">Herb(ert) the Automated Desk Plant</h2>
          A Pubkeeper powered dashboard for the status of Tyler's connected desk plant with automated irrigation.
          <hr />
          <Row>
            <Col md="3" className="text-center mb-3 text-nowrap">
              <b>Plant Health</b>
            </Col>
            <Col md="5" className="text-center mb-3 text-nowrap">
              <b>Plant Habitat</b>
            </Col>
            <Col xs="12" className="d-inline-block d-md-none">
              <hr />
            </Col>
            <Col md="1" className="text-center mb-3 text-nowrap">
              <b>Soil Moisture</b>
            </Col>
            <Col xs="12" className="d-inline-block d-md-none">
              <hr />
            </Col>
            <Col md="3" className="text-center mb-3 text-nowrap">
              <b>Plant Irrigation</b>
            </Col>
          </Row>
          <hr className="my-3" />
          <Row>
            <Col md="3" sm="6" className="text-center mb-3 text-nowrap">
              <p>
                <br />
              </p>
              <img src={soilMoisture >= 2.5 ? "/images/plant.svg" : "/images/plant-wilt.svg"} />
            </Col>
            <Col md="5" sm="6" className="text-center mb-3 text-nowrap">
              <p>
                <b>Temperature:</b> {temperature.toFixed(2)}&ordm;C <b>Humidty:</b> {humidity.toFixed(2)}%
              </p>
              <Chart
                title=""
                type="line"
                data={{ "labels": chartLabels, "datasets": [{ "values": historicalHumidity }, { "values": historicalTemperature }] }}
                show_dots={false}
                heatline
                region_fill
              />
            </Col>
            <Col xs="12" className="d-inline-block d-md-none">
              <hr />
            </Col>
            <Col md="1" sm="6" className="text-center mb-3 text-nowrap">
              <p>
                <b>Moisture Value: </b>{soilMoisture.toFixed(3)}
              </p>
              <br />
              <br />
              <div className="loader-div">
                <Loader color={soilMoisture >= 2.5 ? 'success' : 'warning'} />
              </div>
            </Col>
            <Col md="3" sm="6" className="text-center mb-3 text-nowrap">
              <p>
                <b>Last Watered: </b>{last_watered}
              </p>
              <br />
              <br />
              <div>
                <ToggleButton
                  inactiveLabel={<b>Off</b>}
                  activeLabel={<b>On</b>}
                  value={pump_status}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

export default withPubkeeper(Page);

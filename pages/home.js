import React, { Component } from 'react';
import { Card, CardBody, Chart, Col, Loader, Progress, Row } from '@nio/ui-kit';
import { withPubkeeper } from '../providers/pubkeeper';

class Page extends Component {
  state = {
    soilMoisture: false,
    temperature: 0.0,
    historicalTemperature: [],
    humidity: 0.0,
    historicalHumidity: [],
    chartLabels: [],
    last_watered: new Date(),
  };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron('herbert.soil.value', patron => patron.on('message', this.handleSoil));
    pkClient.addPatron('herbert.ht.value', patron => patron.on('message', this.handleHT));
    pkClient.addPatron('herbert.pump.value', patron => patron.on('message', this.handlePump));
  };

  handleSoil = (data) => {
    const json = new TextDecoder().decode(data);
    const { soil_moist: isMoist } = JSON.parse(json)[0];
    this.setState({ soilMoisture: isMoist });
  };

  handleHT = (data) => {
    const { historicalTemperature, historicalHumidity, chartLabels } = this.state;
    const json = new TextDecoder().decode(data);
    const { temperature: temp, humidity: humid } = JSON.parse(json)[0];
    historicalTemperature.push(temp.toFixed(4));
    historicalHumidity.push(humid.toFixed(4));
    chartLabels.push('');
    this.setState({ temperature: temp, humidity: humid, historicalTemperature, historicalHumidity, chartLabels });
  };

  handlePump = (data) => {
    const json = new TextDecoder().decode(data);
    const { last_watered: watered } = JSON.parse(json)[0];
    const water_time = new Date(watered);
    this.setState({ last_watered: water_time });
  };

  // brewCurrentTimestamp = () => {
  //   this.brewer.brewJSON([{ newBrewedTime: new Date() }]);
  // };

  render() {
    const { soilMoisture, temperature, humidity, historicalHumidity, historicalTemperature, chartLabels, last_watered } = this.state;

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
              <img src={soilMoisture ? "/images/plant.svg" : "/images/plant-wilt.svg"} />
            </Col>
            <Col md="5" sm="6" className="text-center mb-3 text-nowrap">
              <p>
                <b>Temperature:</b> {temperature.toFixed(2)}&ordm;F <b>Humidty:</b> {humidity.toFixed(2)}%
              </p>
              <Chart
                title=""
                type="line"
                data={{ "labels": chartLabels, "datasets": [{ "values": historicalTemperature }, { "values": historicalHumidity }] }}
                show_dots={false}
                heatline
                region_fill
              />
            </Col>
            <Col xs="12" className="d-inline-block d-md-none">
              <hr />
            </Col>
            <Col md="1" sm="6" className="text-center mb-3 text-nowrap">
              <Loader color={soilMoisture ? 'success' : 'warning'} />
            </Col>
            <Col md="3" sm="6" className="text-center mb-3 text-nowrap">
              <div>
                <b>Last Watered: </b>{last_watered.toLocaleString()}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

export default withPubkeeper(Page);

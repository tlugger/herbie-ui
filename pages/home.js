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
    count: 0,
    state: 'red',
    tweet: '',
  };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron('herbert.soil.value', patron => patron.on('message', this.handleSoil));
    pkClient.addPatron('herbert.ht.value', patron => patron.on('message', this.handleHT));
    pkClient.addPatron('herbert.pump.value', patron => patron.on('message', this.handlePump));
    pkClient.addPatron('herbert.pump.status', patron => patron.on('message', this.handlePumpStatus));
    pkClient.addPatron('pine.christmas.count', patron => patron.on('message', this.handleChristmas));
    pkClient.addPatron('handle_blink', patron => patron.on('message', this.handleSpotify));
  };

  handleSoil = (data) => {
    const json = new TextDecoder().decode(data);
    const { soil_moist: isMoist } = JSON.parse(json)[0];

    this.setState({ soilMoisture: parseFloat(isMoist) });
  };

  handleHT = (data) => {
    const { historicalTemperature, historicalHumidity } = this.state;
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

  handleChristmas = (data) => {
    const json = new TextDecoder().decode(data);
    const { count: total, state: color, tweet: text } = JSON.parse(json)[0];
    this.setState({ count: total, state: color, tweet: text });
  }

  handleSpotify = (data) => {
    const json = new TextDecoder().decode(data);
    const { device, album } = JSON.parse(json)[0];
    this.setState({ device: device.name, art: album.url });
  }

  render() {
    const { 
      soilMoisture,
      temperature,
      humidity,
      historicalHumidity,
      historicalTemperature,
      chartLabels,
      last_watered,
      pump_status,
      count,
      state,
      tweet,
      device,
      art,
    } = this.state;

    return (
      <div>
        <Card>
          <CardBody className="p-3">
            <Row>
              <Col md="11">
                <h2 className="m-0">Herb(ert) the Automated Desk Plant</h2>
                <p>
                  A Pubkeeper powered dashboard for the status of Tyler's connected desk plant with automated irrigation.
                </p>
              </Col>
              <Col md="1" className="text-center">
                <img className="card-image" src="/images/cilantro.svg" alt="" />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md="2" className="text-center mb-3">
                <Card className="plant-card">
                  <CardBody>
                    <b>Plant Health</b>
                    <hr />
                    <p>
                      <br />
                    </p>
                    <img className="plant-image" src={soilMoisture >= 2.601 ? '/images/plant.svg' : '/images/plant-wilt.svg'} alt="" />
                  </CardBody>
                </Card>
              </Col>
              <Col md="5" className="text-center mb-3">
                <Card className="plant-card">
                  <CardBody>
                    <b>Plant Habitat</b>
                    <hr />
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
                  </CardBody>
                </Card>
              </Col>
              <Col md="2" className="text-center mb-3">
                <Card className="plant-card">
                  <CardBody>
                    <b>Soil Moisture</b>
                    <hr />
                    <b>Value: </b>{soilMoisture.toFixed(3)}
                    <br />
                    <div className="loader-div">
                      <Loader color={soilMoisture >= 2.601 ? 'success' : 'warning'} />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md="3" className="text-center mb-3">
                <Card className="plant-card">
                  <CardBody>
                    <b>Plant Irrigation</b>
                    <hr />
                    <b>Last Watered: </b>{last_watered}
                    <br />
                    <br />
                    <br />
                    <div>
                      <ToggleButton
                        inactiveLabel={<b>Off</b>}
                        activeLabel={<b>On</b>}
                        value={pump_status}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <hr />
        <Card>
          <CardBody className="p-3">
            <Row>
              <Col md="11">
                <h2 className="m-0">#Christmas Counter</h2>
                <p>
                  A live display of the number of counted tweets containing '#Christmas'. This number controls a connected LED on Tyler's desk.
                </p>
              </Col>
              <Col md="1" className="text-center">
                <img className="card-image" src="/images/santa.svg" alt="" />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md="3" className="text-center">
                <Card className="plant-card">
                  <CardBody>
                    <b>Count</b>
                    <hr />
                    <h3>{count}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md="6" className="text-center">
                <Card className="plant-card">
                  <CardBody>
                    <b>Tweet</b>
                    <hr />
                    <h6>{tweet}</h6>
                  </CardBody>
                </Card>
              </Col>
              <Col md="3" className="text-center">
                <Card className="plant-card">
                  <CardBody>
                    <b>Color</b>
                    <hr />
                    <img className="light-image" src={state === 'red' ? '/images/red-light.svg' : '/images/green-light.svg'} alt="" />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <hr />
        <Card>
          <CardBody className="p-3">
            <Row>
              <Col md="11">
                <h2 className="m-0">Spotify Authoirzation Monitor</h2>
                <p>
                  Tyler's Spotify usage including devices currently accessing my account.
                </p>
              </Col>
              <Col md="1" className="text-center">
                <img className="card-image" src="/images/spotify.svg" alt="" />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md="6" className="text-center">
                <Card className="plant-card">
                  <CardBody>
                    <b>Device</b>
                    <hr />
                    <h3>{device || 'None'}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md="6" className="text-center">
                <Card className="plant-card">
                  <CardBody>
                    <b>Album</b>
                    <hr />
                    <img className="card-image" src={art} alt="" />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withPubkeeper(Page);

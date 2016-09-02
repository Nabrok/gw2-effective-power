import React from 'react';
import {render} from 'react-dom';
import {Panel, FormGroup, ControlLabel, FormControl, Checkbox, Grid, Row, Col, Table, Button, DropdownButton, MenuItem, InputGroup, PageHeader} from 'react-bootstrap';
import Slider from 'react-bootstrap-native-slider';

function calculatePower(props) {
	var fury_add = (props.double_fury) ? 0.4 : 0.2;
	var power = props.power;
	var precision = props.precision;
	var ferocity = props.ferocity;
	var fury = props.fury / 100;

	if (props.extra_power) power += 150;
	if (props.extra_precision) precision += 150;
	if (props.extra_ferocity) ferocity += 150;

	var powerWithMight = power + (props.might * 30);
	var effective_power = getEffectivePower(power, precision, ferocity, props.might, fury, fury_add);
	var more_power = getEffectivePower(power + 1, precision, ferocity, props.might, fury, fury_add) - effective_power;
	var more_precision = getEffectivePower(power, precision + 1, ferocity, props.might, fury, fury_add) - effective_power;
	var more_ferocity = getEffectivePower(power, precision, ferocity + 1, props.might, fury, fury_add) - effective_power;
	var newState = {
		avg_power_noncrit: powerWithMight,
		avg_power_crit: getCriticalPower(powerWithMight, ferocity).toFixed(0),
		crit_chance: (getCriticalChance(precision, fury, fury_add) * 100).toFixed(0)+'%',
		effective_power: effective_power.toFixed(0),
		more_power: more_power.toFixed(2),
		more_precision: more_precision.toFixed(2),
		more_ferocity: more_ferocity.toFixed(2)
	};
	return newState;
}

function getEffectivePower(power, precision, ferocity, might, fury, fury_add) {
	if (! fury_add) fury_add = 0.20;
	var powerWithMight = power + (might * 30);
	var criticalChance = getCriticalChance(precision, fury, fury_add);
	var criticalPower = getCriticalPower(powerWithMight, ferocity);
	return (1 - criticalChance) * powerWithMight + criticalChance * criticalPower;
}

function getCriticalPower(power, ferocity) {
	var multiplier = 1.5 + ferocity / 1500;
	return power * multiplier;
}

function getCriticalChance(precision, fury, fury_add) {
	if (! fury_add) fury_add = 0.20;
	var noFury = limit0to1((precision - 916) / 2100);
	var withFury = limit0to1(noFury + fury_add);
	return (1 - fury) * noFury + fury * withFury;
}

function limit0to1(x) {
	x = Math.min(x,1);
	x = Math.max(x,0);
	return x;
}

class Form extends React.Component {
	render() {
		return <form>
			<Attributes {...this.props} />
			<Traits {...this.props} />
		</form>;
	}
}

class Attributes extends React.Component {
	constructor(props) {
		super(props);

		this._handleChange = this._handleChange.bind(this);
	}

	_handleChange(e) {
		var newState = {};
		newState[e.target.id] = parseInt(e.target.value);
		this.props.onChange(newState); // Parent will change state and pass in new props
	}

	render() {
		return <Panel header="Attributes">
			<FormGroup controlId="power">
				<ControlLabel>Power</ControlLabel>
				<FormControl type="number" min="1000" placeholder="Power" value={this.props.power} onChange={this._handleChange} />
				<FormControl.Feedback />
			</FormGroup>
			<FormGroup controlId="precision">
				<ControlLabel>Precision</ControlLabel>
				<FormControl type="number" min="1000" placeholder="Precision" value={this.props.precision} onChange={this._handleChange} />
				<FormControl.Feedback />
			</FormGroup>
			<FormGroup controlId="ferocity">
				<ControlLabel>Ferocity</ControlLabel>
				<FormControl type="number" min="0" placeholder="Ferocity" value={this.props.ferocity} onChange={this._handleChange} />
				<FormControl.Feedback />
			</FormGroup>
		</Panel>;
	}
}

class Traits extends React.Component {
	constructor(props) {
		super(props);

		this._handleChange = this._handleChange.bind(this);
	}

	_handleChange(e) {
		var newState = {};
		newState[e.target.id] = (e.target.type === 'checkbox') ? e.target.checked : parseInt(e.target.value);
		this.props.onChange(newState);
	}

	render() {
		return <Panel header="Traits">
			<FormGroup>
				<Checkbox id="double_fury" checked={this.props.double_fury} onChange={this._handleChange} title="Double fury effectiveness">Roiling Mists</Checkbox>
				<Checkbox id="extra_power" checked={this.props.extra_power} onChange={this._handleChange} title="+150 power">Empower Allies</Checkbox>
				<Checkbox id="extra_precision" checked={this.props.extra_precision} onChange={this._handleChange} title="+150 precision">Spotter</Checkbox>
				<Checkbox id="extra_ferocity" checked={this.props.extra_ferocity} onChange={this._handleChange} title="+150 ferocity">Assassin's Presence</Checkbox>
			</FormGroup>
		</Panel>;
	}
}

class Boons extends React.Component {
	constructor(props) {
		super(props);

		this._handleChange = this._handleChange.bind(this);
		this._slideMight = this._slideMight.bind(this);
		this._slideFury = this._slideFury.bind(this);
	}

	_handleChange(e) {
		var newState = {};
		newState[e.target.id] = (e.target.type === 'checkbox') ? e.target.checked : parseInt(e.target.value);
		this.props.onChange(newState);
	}

	_slideMight(e) {
		this.props.onChange({ might: e.target.value });
	}

	_slideFury(e) {
		this.props.onChange({ fury: e.target.value });
	}

	render() {
		return <Panel header="Boons">
			<FormGroup controlId="might">
				<Col xs={2} componentClass={ControlLabel}>Avg. Might</Col>
				<Col xs={8}><Slider value={this.props.might} step={1} min={0} max={25} handleChange={this._slideMight} /></Col>
				<Col xs={2}><FormControl type="number" min="0" max="25" value={this.props.might} onChange={this._handleChange} /></Col>
			</FormGroup>
			<FormGroup controlId="fury">
				<Col xs={2} componentClass={ControlLabel}>Avg. Fury (%)</Col>
				<Col xs={8}><Slider value={this.props.fury} step={1} min={0} max={100} handleChange={this._slideFury} /></Col>
				<Col xs={2}><FormControl type="number" min="0" max="100" value={this.props.fury} onChange={this._handleChange} /></Col>
			</FormGroup>
		</Panel>;
	}
}

class Results extends React.Component {
	constructor(props) {
		super(props);

		this.state = calculatePower(props);
	}

	componentWillReceiveProps(newProps) {
		this.setState(calculatePower(newProps));
	}

	render() {
		return <Panel header="Results">
			<Table striped>
				<tbody>
					<tr><td>Average power (non-critical)</td><td style={{ textAlign: 'right' }}>{this.state.avg_power_noncrit}</td></tr>
					<tr><td>Average power (critical)</td><td style={{ textAlign: 'right' }}>{this.state.avg_power_crit}</td></tr>
					<tr><td>Average critical chance</td><td style={{ textAlign: 'right' }}>{this.state.crit_chance}</td></tr>
					<tr style={{ fontWeight: 'bold' }}><td>Overall effective power</td><td style={{ textAlign: 'right' }}>{this.state.effective_power}</td></tr>
				</tbody>
			</Table>
			<p>Effect of adding:</p>
			<Table striped>
				<tbody>
					<tr><td>1 point of power</td><td style={{ textAlign: 'right' }}>+{this.state.more_power}</td></tr>
					<tr><td>1 point of precision</td><td style={{ textAlign: 'right' }}>+{this.state.more_precision}</td></tr>
					<tr><td>1 point of ferocity</td><td style={{ textAlign: 'right' }}>+{this.state.more_ferocity}</td></tr>
				</tbody>
			</Table>

			<Button bsStyle="primary" block onClick={this.props.onSave}>Compare</Button>
		</Panel>;
	}
}

class Calculator extends React.Component {
	constructor(props) {
		super(props);

		var initialState = {
			power: 1000,
			precision: 1000,
			ferocity: 0,
			might: props.might,
			fury: props.fury,
			double_fury: false,
			extra_power: false,
			extra_precision: false,
			extra_ferocity: false
		};
		this.state = initialState;

		this._handleChange = this._handleChange.bind(this);
		this._save = this._save.bind(this);
	}

	componentWillReceiveProps(newProps) {
		var newState = {};
		if (newProps.might !== this.state.might) newState.might = newProps.might;
		if (newProps.fury !== this.state.fury) newState.fury = newProps.fury;
		if (newProps.init.power) ['power', 'precision', 'ferocity', 'double_fury', 'extra_power', 'extra_precision', 'extra_ferocity'].forEach(f => {
			newState[f] = newProps.init[f];
		});
		if (Object.keys(newState).length > 0) this.setState(newState);
	}

	_handleChange(changes) {
		this.setState(changes);
	}

	_save() {
		var title = prompt('Enter a name:');
		if (! title || title === "") return;
		this.props.onSave(Object.assign(this.state, { title: title }));
	}

	render() {
		return <Row>
			<Col sm={6}>
				<Form {...this.state} onChange={this._handleChange} />
			</Col>
			<Col sm={6}>
				<Results {...this.state} onSave={this._save} />
			</Col>
		</Row>;
	}
}

class Saved extends React.Component {
	render() {
		var might = this.props.might;
		var fury = this.props.fury / 100;
		var list = this.props.list.map((v, i) => {
			var fury_add = (v.double_fury) ? 0.4 : 0.2;
			var power = v.power;
			var precision = v.precision;
			var ferocity = v.ferocity;
			if (v.extra_power) power += 150;
			if (v.extra_precision) precision += 150;
			if (v.extra_ferocity) ferocity += 150;
			v.index = i;
			v.eff_power = getEffectivePower(power, precision, ferocity, might, fury, fury_add);
			return v;
		}).sort((a,b) => (b.eff_power - a.eff_power));
		return <Row>
			<Col xs={12}>
				<Panel header="Comparisons">
					<Table striped bordered condensed hover>
						<thead>
							<tr>
								<th>Name</th>
								<th>Power</th>
								<th>Precision</th>
								<th>Ferocity</th>
								<th>Traits</th>
								<th colSpan={2}>Effective Power</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{ list.map((v, i) => 
								<tr key={v.index}>
									<td>{v.title}</td>
									<td>{v.power}</td>
									<td>{v.precision}</td>
									<td>{v.ferocity}</td>
									<td>
									{ v.double_fury && <img src="images/Roiling_Mists.png" height="25px" title="Roiling Mists" /> }
									{ v.extra_power && <img src="images/Empower_Allies.png" height="25px" title="Empower Allies" /> }
									{ v.extra_precision && <img src="images/Spotter.png" height="25px" title="Spotter" /> }
									{ v.extra_ferocity && <img src="images/Assassin's_Presence.png" height="25px" title="Assassin's Presence" /> }
									</td>
									<td>{v.eff_power.toFixed(0)}</td>
									<td>{ list[i + 1] && '(+'+(((v.eff_power / list[i+1].eff_power) - 1) * 100).toFixed(1)+'%)' }</td>
									<td><DropdownButton title="" bsStyle="default" id="dd-{i}" onSelect={this.props.onSelect}>
										<MenuItem eventKey={{index: v.index, action: 'load'}}>Load</MenuItem>
										<MenuItem eventKey={{index: v.index, action: 'delete'}}>Remove</MenuItem>
									</DropdownButton></td>
								</tr>
							) }
						</tbody>
					</Table>
				</Panel>
			</Col>
		</Row>;
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			might: 10,
			fury: 50,
			saved: [],
			initCalc: {}
		};

		this._save = this._save.bind(this);
		this._action = this._action.bind(this);
		this._changeBoons = this._changeBoons.bind(this);
	}

	_save(stats) {
		var saved = this.state.saved;
		saved.push({
			title: stats.title,
			power: stats.power,
			precision: stats.precision,
			ferocity: stats.ferocity,
			double_fury: stats.double_fury,
			extra_power: stats.extra_power,
			extra_precision: stats.extra_precision,
			extra_ferocity: stats.extra_ferocity
		});
		this.setState({ saved: saved, initCalc: {} });
	}

	_action(key) {
		var saved = this.state.saved.slice();
		if (key.action === 'delete') {
			saved.splice(key.index, 1);
			this.setState({ saved: saved });
		}
		if (key.action === 'load') {
			var item = saved.splice(key.index, 1)[0];
			this.setState({ initCalc: item });
		}
	}

	_changeBoons(stats) {
		this.setState(Object.assign(stats, { initCalc: {} }));
	}

	render() {
		return <div className="container">
			<PageHeader>Guild Wars 2 <small>Effective Power Calculator</small></PageHeader>
			<Grid>
				<Calculator onSave={this._save} might={this.state.might} fury={this.state.fury} init={this.state.initCalc} />
				<Row><Col xs={12}><Boons might={this.state.might} fury={this.state.fury} onChange={this._changeBoons} /></Col></Row>
				{ this.state.saved.length > 0 && <Saved list={this.state.saved} might={this.state.might} fury={this.state.fury} onSelect={this._action} /> }
			</Grid>
			<hr />
			<small>Inspired by the work done at <a href="http://gw2tools.net/effective-power" target="_new">http://gw2tools.net/effective-power</a></small>
		</div>;
	}
}

render(<App/>, document.getElementById('app'));

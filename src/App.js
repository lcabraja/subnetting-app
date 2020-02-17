import React, { Component } from 'react'
import './App.css'

class App extends Component {

	// State
	state = {
		major: '',
		value: '',
		subnets: [ {name: '', hosts: ''} ],
		origin: [ {ip: '', prefix: '', mask: '', maskMode: false} ],
		binary: [ {decimal: '', binary: '', statebinary: false} ],
		state: 'vlsm',
		switchbuttons: [ 'origin', 'binary' ],
		vlsmResults: 
			[ {index: 0, name: '', network: '', mask: '', first: '', last: '', broadcast: ''} ],
		originResults:
			[ {index: 0, first: '', last: '', broadcast: '', maskMode: false} ],
	}

	zeroes = '00000000000000000000000000000000'
	ones = '11111111111111111111111111111111'

	// Handlers and Helpers ~~~
	changeState = (state) => {
		// eslint-disable-next-line
		if(state == 'vlsm') {
			let switchbuttons = [ 'origin', 'binary' ]
			this.setState({state, switchbuttons})
		}
		// eslint-disable-next-line
		if(state == 'binary') {
			let switchbuttons = [ 'vlsm', 'origin' ]
			this.setState({state, switchbuttons})
		}
		// eslint-disable-next-line
		if(state == 'origin') {
			let switchbuttons = [ 'vlsm', 'binary' ]
			this.setState({state, switchbuttons})
		}
	}

	createSubnet = () => {
		return {name: '', hosts: '' }
	}

	handleMajor = (event) => {
		this.setState({major: event.target.value})
		this.vlsmCalculate()
	}

	addSubnet = () => {
		let { subnets } = this.state
		subnets.push(this.createSubnet())
		this.setState({ subnets })
	}

	handleArrayName = (event) => {
		const { subnets } = this.state
		subnets[event.target.id].name = event.target.value
		this.setState({ subnets })
		// eslint-disable-next-line
		if(event.target.id == this.state.subnets.length - 1) {
			this.addSubnet()
		}
		this.vlsmCalculate()
	}
	
	handleArrayHosts = (event) => {
		const { subnets } = this.state
		subnets[event.target.id].hosts = event.target.value
		this.setState({ subnets })
		// eslint-disable-next-line
		if(event.target.id == this.state.subnets.length - 1) {
			this.addSubnet()
		}
		this.vlsmCalculate()
	}

	handleBinaryToggle = (event) => {
		let { binary } = this.state
		const id = parseInt(event.target.id.split('.'))
		binary[id].statebinary = !binary[id].statebinary
		this.setState({ binary })
		this.binaryCalculate()
	}

	createOrigin = () => {
		return {ip: '', prefix: '', mask: '', maskMode: false}
	}

	addOrigin = () => {
		let { origin } = this.state
		origin.push(this.createOrigin())
		this.setState({ origin })
	}

	handleOriginIP = (event) => {
		let { origin } = this.state
		origin[event.target.id].ip = event.target.value
		this.setState({ origin })
		// eslint-disable-next-line
		if(event.target.id == this.state.origin.length - 1) {
			this.addOrigin()
		}
		this.originCalculate()
	}

	handleOriginPrefixMask = (event) => {
		let { origin } = this.state
		const id = parseInt(event.target.id.split('.')[0])
		const mode = event.target.id.split('.')[1]
		if (mode === 'mask') {
			origin[id].mask = event.target.value
		} else {
			origin[id].prefix = event.target.value
		}
		this.setState({ origin })
		// eslint-disable-next-line
		if(event.target.id == this.state.origin.length - 1) {
			this.addOrigin()
		}
		this.originCalculate()
	}
	
	createBinary = () => {
		return {decimal: '', binary: '', statebinary: false}
	}

	addBinary = () => {
		let { binary } = this.state
		binary.push(this.createBinary())
		this.setState({ binary })
	}

	handleBinary = (event) => {
		let { binary } = this.state
		const id = parseInt(event.target.id.split('.')[0])
		const mode = event.target.id.split('.')[1]
		console.log(event.target.id)
		// eslint-disable-next-line
	if (mode == 'bin') {
			binary[id].binary = event.target.value
		} else {
			binary[id].decimal = event.target.value
		}
		this.setState({ binary })
		// eslint-disable-next-line
		if(id == this.state.binary.length - 1) {
			this.addBinary()
		}
		this.binaryCalculate()
	}

	handleButton = (event) => {
		this.addSubnet()
	}

	handleBinaryButton = (event) => {
		this.addBinary()
	}

	handleChangeButton = (event) => {
		this.changeState(event.target.id)
	}

	handleToggle = (event) => {
		let { origin } = this.state
		origin[event.target.id].maskMode = !origin[event.target.id].maskMode
		this.setState({ origin })
		this.originCalculate()
	}
	// ~~~ Handlers and Helpers

	// Calculation Validators ~~~
	validateHosts = (hosts) => {
		if (hosts === '') 
			return false
		const regex = /([0-9]|[0-9]+)/g
		return regex.test(hosts)
	}
	// ~~~ Calculation Validators

	// Calculation ~~~
	networkToBinary = (networkstring) => {
		return networkstring.split('.').map(
			(octet) => {
				const temp = parseInt(octet).toString(2) 
				return ('00000000'.slice(0,8-temp.length) + temp)
			}).join('')
	}

	binaryToNetwork = (binary) => {
		if (binary === '') return null
		const network = binary.match(/.{1,8}/g).map(
			(octet) => {
				return parseInt(octet,2)
			}).join('.')
		return network === '0.0.0.0' ? null : network
	}

	prefixToSubnet = (prefix) => {
		let binarydigits = ''
		for(let i = 0; i < 32; i++) {
			if(i < prefix) { 
				binarydigits += '1' 
			} 
			else { 
				binarydigits += '0' 
			} 
		}
		return binarydigits
	} 

	calculatePrefix = (hosts) => {
		return (32 - Math.ceil(Math.log2(parseInt(hosts) + 2)))
	}

	nflbCalculate = (basenetwork, prefix) => {
		const basenet = basenetwork.slice(0,prefix) ?? null
		const network = this.binaryToNetwork(basenetwork)
		const first = this.binaryToNetwork(basenetwork.slice(0,31) + '1')
		const broadcast = this.binaryToNetwork(basenet + this.ones.slice(prefix))
		const last = this.binaryToNetwork((basenet + this.ones.slice(prefix)).slice(0,31) + '0')
		const middlenext = (parseInt(basenet.slice(0, prefix), 2) + 1).toString(2)
		const rightnext = middlenext + this.zeroes.slice(prefix)
		const next = this.binaryToNetwork(this.zeroes.slice(rightnext.length) + rightnext)
		return { network, first, last, broadcast, next }
	}

	vlsmCalculate = () => {
		let vlsmResults = []
		let subnets = this.state.subnets.map((subnet, index) => {
			return { subnet, index }
		}).sort((a,b) => {
			const hostsa = Math.ceil(Math.log2(parseInt(a.subnet.hosts) + 2))
			const hostsb = Math.ceil(Math.log2(parseInt(b.subnet.hosts) + 2))
			return Math.ceil(hostsb - hostsa) 
		})

		let past = [ this.networkToBinary(this.state.major) ]
		subnets.forEach((sub) => {
			const {subnet, index} = sub
			const {name, hosts} = subnet
			if(this.validateHosts(hosts)) {
				const prefix = this.calculatePrefix(hosts)
				const mask = this.binaryToNetwork(this.prefixToSubnet(prefix))
				const { network, first, last, broadcast, next } = this.nflbCalculate(past.slice(-1)[0], prefix)
				past.push(this.networkToBinary(next))
				vlsmResults.push({ index, name, network, mask, first, last, broadcast })
			} else {
				vlsmResults.push({index, name, network: '', mask: '', first: '', last: '', broadcast: ''})
			}
		})
		this.setState({ vlsmResults })
	}

	originPrefix = (origin) => {
		if(origin.maskMode) {
			return ((this.networkToBinary(origin.mask)).match(/1/g) || []).length
		} else {
		// eslint-disable-next-line
		return (origin.prefix == '' ? 32 : (origin.prefix[0] === '/' ? parseInt(origin.prefix.slice(1,3)) : origin.prefix)) 
		}
	}

	originBase = (originip, prefix) => {
		const slicedip =  this.networkToBinary(originip).slice(0, prefix)
		return slicedip + this.zeroes.slice(prefix)
	} 

	originCalculate = () => {
		let originResults = []
		// eslint-disable-next-line
		this.state.origin.map((origin, index) => {
			// eslint-disable-next-line
			if (origin.ip != '' && (origin.maskMode ? origin.mask != 0 : origin.prefix != 0)) {
				const prefix = this.originPrefix(origin)
				const { first, last, broadcast } = this.nflbCalculate(this.originBase(origin.ip, prefix), prefix)
				originResults.push({index, first, last, broadcast})
			} else {
				originResults.push({index, first: '', last: '', broadcast: ''})
			}
		})
		this.setState({ originResults })
	}

	binaryCalculate = () => {
		let binary = []
		// eslint-disable-next-line
		this.state.binary.map((bin, index) => {
			// eslint-disable-next-line
			if (bin.statebinary && bin.binary != '') {
				const bindigits = (bin.binary.indexOf('.') === -1 ? bin.binary : bin.binary.split('.').join(''))
				const decimal = this.binaryToNetwork(bindigits)
				binary.push({ decimal, binary: bin.binary, statebinary: true})
			// eslint-disable-next-line
			} else if (!bin.statebinary && bin.decimal != '') {
				const binarydigits = this.networkToBinary(bin.decimal).match(/.{1,8}/g).join('.')
				binary.push({ decimal: bin.decimal, binary: binarydigits, statebinary: false})
			} else {
				binary.push({decimal: bin.decimal, binary: bin.binary, statebinary: bin.statebinary})
			}
		})
		this.setState({ binary })
	}
	// ~~~ Calculation

	// Render Helpers ~~~
	majorNetwork = () => {
		return(
				<div className='input-group flex-nowrap pt-3'>
						<div className='input-group-prepend'>
							<span className='input-group-text text-right'>
								Major Network
							</span>
						</div>
					<input 
						type='text' 
						className='form-control' 
						value={this.state.major} 
						placeholder='...' 
						onChange={this.handleMajor}/>
				</div>
		)
	}

	mapArray = (id, network)  => {
		return (
				<div className='input-group flex-nowrap pt-3'>
					<div className='input-group-prepend'>
						<span className='input-group-text text-right'>
							{id + 1}
						</span>
					</div>
					<input 
						id={id}
						type='text' 
						value={network.name} 
						className='form-control' 
						placeholder='Name'
						onChange={this.handleArrayName}
					/>
					<input 
						id={id}
						type='text' 
						value={network.hosts} 
						className='form-control' 
						placeholder='Size'
						onChange={this.handleArrayHosts}
					/>
				</div>
		)
	}

	mapOrigin = (id, origin)  => {
		return (
			<div className='input-group flex-nowrap pt-3'>
				<div className='input-group-prepend'>
					<span className='input-group-text text-right'>
						{id + 1}
					</span>
				</div>
				<input 
					id={id}
					type='text' 
					value={origin.ip} 
					className='form-control' 
					placeholder='IP Address'
					onChange={this.handleOriginIP}
				/>
				<input 
					id={[id, (origin.maskMode ? 'mask' : 'prefix')].join('.')}
					type='text' 
					value={(origin.maskMode ? this.state.origin[id].mask : this.state.origin[id].prefix)} 
					className='form-control' 
					placeholder={origin.maskMode ? 'Mask' : 'Prefix'}
					onChange={this.handleOriginPrefixMask}
				/>
				<div class="input-group-append">
					<button class="btn btn-light" type="button" id={id} onClick={this.handleToggle}>Toggle</button>
				</div>
			</div>

		)
	}

	mapBinary = (id, binary)  => {
		return (
			<div className='input-group flex-nowrap pt-3'>
				<div className='input-group-prepend'>
					<span className='input-group-text text-right'>
						{id + 1}
					</span>
				</div>
				<input 
					id={[id, (binary.statebinary ? 'bin' : 'dec')].join('.')}
					type='text' 
					value={(binary.statebinary ? binary.binary : binary.decimal)} 
					className='form-control' 
					placeholder={(binary.statebinary ? 'Binary' : 'Decimal')}
					onChange={this.handleBinary}
				/>
				<div class="input-group-append">
					<button class="btn btn-light" type="button" id={id} onClick={this.handleBinaryToggle}>Toggle</button>
				</div>
			</div>

		)
	}

	prettifyLabel = (label) => {
		// eslint-disable-next-line
		if(label == 'vlsm') return 'VLSM Calculator'
		// eslint-disable-next-line
		if(label == 'binary') return 'Binary Converter'
		// eslint-disable-next-line
		if(label == 'origin') return 'Origin Calculator'
	}
	// ~~~ Render Helpers

	// Component Render ~~~
	vlsm = () => {
		return (
			<React.Fragment>
				{this.majorNetwork()}
				{this.state.subnets.map(
					(network, index) => 
					this.mapArray(index, network)
				)}
				<div 
					className='btn-toolbar justify-content-between pt-3' 
					role='toolbar'
				>
	    			<div className='btn-group'>
	    				<button 
		    				type='button' 
		    				className='btn btn-light' 
	    					onClick={this.handleButton}
		    			>
		    				+
		    			</button>
	    			</div>
	    			<div className='btn-group'>
	    				{this.state.switchbuttons.map(label => {
	    					return (
	    						<button 
	    							id={label} 
	    							type='button' 
	    							className='btn btn-light' 
	    							onClick={this.handleChangeButton}
	    						>
	    							{this.prettifyLabel(label)}
	    						</button>)
	    				})}
	    			</div>
	  			</div>
			</React.Fragment>
		)
	}

	origin = () => {
		return (
			<React.Fragment>
				{this.state.origin.map(
					(origin, index) => 
					this.mapOrigin(index, origin)
				)}
				<div 
					className='btn-toolbar justify-content-between pt-3' 
					role='toolbar'
				>
	    			<div className='btn-group'>
	    				<button 
		    				type='button' 
		    				className='btn btn-light' 
	    					onClick={this.handleButton}
		    			>
		    				+
		    			</button>
	    			</div>
	    			<div className='btn-group'>
	    				{this.state.switchbuttons.map(label => {
	    					return (
	    						<button 
	    							id={label} 
	    							type='button' 
	    							className='btn btn-light' 
	    							onClick={this.handleChangeButton}
	    						>
	    							{this.prettifyLabel(label)}
	    						</button>)
	    				})}
	    			</div>
	  			</div>
			</React.Fragment>
		)
	}

	binary = () => {
		return (
			<React.Fragment>
				{this.state.binary.map(
					(binary, index) => 
					this.mapBinary(index, binary)
				)}
				<div 
					className='btn-toolbar justify-content-between pt-3' 
					role='toolbar'
				>
	    			<div className='btn-group'>
	    				<button 
		    				type='button' 
		    				className='btn btn-light' 
	    					onClick={this.handleBinaryButton}
		    			>
		    				+
		    			</button>
	    			</div>
	    			<div className='btn-group'>
	    				{this.state.switchbuttons.map(label => {
	    					return (
	    						<button 
	    							id={label} 
	    							type='button' 
	    							className='btn btn-light' 
	    							onClick={this.handleChangeButton}
	    						>
	    							{this.prettifyLabel(label)}
	    						</button>)
	    				})}
	    			</div>
	  			</div>
			</React.Fragment>
		)
	}

	stateRender = () => {
		// eslint-disable-next-line
		if(this.state.state == 'vlsm') return this.vlsm()
		// eslint-disable-next-line
		if(this.state.state == 'origin') return this.origin()
		// eslint-disable-next-line
		if(this.state.state == 'binary') return this.binary()
	}

	vlsmResults = () => {
		return (
			<table className='table table-hover'>
				<thead>
					<tr>
						<th>#</th>
						<th>Name</th>
						<th>Network</th>
						<th>Mask</th>
						<th>First</th>
						<th>Last</th>
						<th>Broadcast</th>
					</tr>
				</thead>
			<tbody>
				{this.state.vlsmResults.map((subnet) => {
					const {index, name, network, mask, first, last, broadcast} = subnet
					return (
						<tr>
							<th style={{
									userSelect: 'none', 
									webkitUserSelect: 'none', 
									mozUserSelect: 'none', 
									msUserSelect: 'none'
								}} 
								className='text-muted'
							>
								{index + 1}
							</th>
							<th>{name}</th>
							<th>{network}</th>
							<th>{mask}</th>
							<th>{first}</th>
							<th>{last}</th>
							<th>{broadcast}</th>
						</tr>
					)})}
				</tbody>
			</table>
		)
	}

	originResults = () => {
		return (
			<table className='table table-hover'>
				<thead>
					<tr>
						<th>#</th>
						<th>First</th>
						<th>Last</th>
						<th>Broadcast</th>
					</tr>
				</thead>
			<tbody>
				{this.state.originResults.map((origin) => {
					const {index, first, last, broadcast} = origin
					return (
						<tr>
							<th style={{
									userSelect: 'none', 
									webkitUserSelect: 'none', 
									mozUserSelect: 'none', 
									msUserSelect: 'none'
								}} 
								className='text-muted'
							>
								{index + 1}
							</th>
							<th>{first}</th>
							<th>{last}</th>
							<th>{broadcast}</th>
						</tr>
					)})}
				</tbody>
			</table>
		)
	}

	binaryResults = () => {
		return (
			<table className='table table-hover'>
				<thead>
					<tr>
						<th>#</th>
						<th>Binary / Decimal</th>
					</tr>
				</thead>
			<tbody>
				{this.state.binary.map((bin, index) => {
					const { decimal, binary, statebinary } = bin
					return (
						<tr>
							<th style={{
									userSelect: 'none', 
									webkitUserSelect: 'none', 
									mozUserSelect: 'none', 
									msUserSelect: 'none'
								}} 
								className='text-muted'
							>
								{index + 1}
							</th>
							<th className="text-monospace">{(statebinary ? decimal : binary)}</th>
						</tr>
					)})}
				</tbody>
			</table>
		)
	}
	
	stateResultsRender = () => {
		// eslint-disable-next-line
		if(this.state.state == 'vlsm') return this.vlsmResults()
		// eslint-disable-next-line
		if(this.state.state == 'origin') return this.originResults()
		// eslint-disable-next-line
		if(this.state.state == 'binary') return this.binaryResults()
	}
	// ~~~ Component Render

  render() {
  	return (
  		<div className='container-fluid full-width vh-100 bg-transparent'>
			<div className='row'>
				<div className='col-4 bg-primary vh-100 shadow-lg'>
					{this.stateRender()}
				</div>
				<div className='col-8 bg-transparent vh-100'>
					{this.stateResultsRender()}
				</div>
			</div>
		</div>
	)
  }
}

export default App

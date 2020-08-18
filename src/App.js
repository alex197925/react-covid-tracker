import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './InfoBox';
import numeral from "numeral";
import Map from './Map';
import Table from './Table';
import { sortData } from './util';
import { prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import './App.css';


//https://disease.sh/v3/covid-19/countries

function App() {

	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState("worldwide");
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
	const [mapZoom, setMapZoom] = useState(3);
	const [mapCountries, setMapCountries] = useState([]);
	const [casesType, setCasesType] = useState('cases');



	// const sortHelper = (items) => {
	// 	return items.sort((a, b) => a.cases > b.cases ? -1 : 1);
	// }

	// const formatStat = (stat) => {
	// 	return stat ? `+${numeral(stat).format("0,0a")}` : "+0";
	// }



	useEffect(() => {
		fetch("https://disease.sh/v3/covid-19/all")
			.then(response => response.json())
			.then(data => {
				setCountryInfo(data);
			});
	}, []);



	useEffect(() => {
		const getCountriesData = async () => {
			await fetch("https://disease.sh/v3/covid-19/countries")
				.then((response) => response.json())
				.then((data) => {
					const countries = data.map((country) => (
						{
							name: country.country,
							value: country.countryInfo.iso3
						}));

					const sortedData = sortData(data);
					setTableData(sortedData);
					setMapCountries(data);
					setCountries(countries);
				});
		};

		getCountriesData();
	}, []);



	const onCountryChange = async (e) => {
		const selectCountry = e.target.value;

		const url = selectCountry === 'worldwide'
			? 'https://disease.sh/v3/covid-19/all'
			: `https://disease.sh/v3/covid-19/countries/${selectCountry}`;

		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				setCountry(selectCountry);
				setCountryInfo(data);
				if (data && data.countryInfo && data.countryInfo.lat) {
					setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
					setMapZoom(3);
				} else {
					setMapCenter([34.80746, -40.4796]);
					setMapZoom(2);
				}
			});
	}



	return (
		<div className="app">
			<div className="app__left">
				<div className="app__header">
					<h1> Covid-19 Tracker</h1>
					<FormControl className="app__dropdown">
						<Select variant="outlined" onChange={onCountryChange} value={country}>
							<MenuItem value="worldwide">Worldwilde</MenuItem>
							{countries.map((country) => (
								<MenuItem value={country.value}>{country.name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="app__stats">
					<InfoBox
						isRed
						active={casesType === 'cases'}
						onClick={e => setCasesType('cases')}
						title="Coronavirus cases"
						cases={prettyPrintStat(countryInfo.todayCases)}
						total={prettyPrintStat(countryInfo.cases)} />
					<InfoBox
						active={casesType === 'recovered'}
						onClick={e => setCasesType('recovered')}
						title="Recovered"
						cases={prettyPrintStat(countryInfo.todayRecovered)}
						total={prettyPrintStat(countryInfo.recovered)} />
					<InfoBox
						isRed
						active={casesType === 'deaths'}
						onClick={e => setCasesType('deaths')}
						title="Deaths"
						cases={prettyPrintStat(countryInfo.todayDeaths)}
						total={prettyPrintStat(countryInfo.deaths)} />
				</div>

				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={mapZoom}
				/>

			</div>
			<Card className="app__right">
				<CardContent>
					<h3>Live Cases By Country</h3>
					<Table countries={tableData} />
					<h3 className="app__graphTitle">Worldwilde New{casesType}</h3>
					<LineGraph className="app__graph" casesType={casesType} />
				</CardContent>

			</Card>

		</div>

	);
}

export default App;


const hunt = {
	locs: [
		{lat: 29.185169, lon: -81.070528, name: 'Daytona International Speedway'},
		{lat: 29.231585, lon: -81.009364, name: 'Daytona Beach Bandshell'},
		{lat: 29.080634, lon: -80.928023, name: 'Ponce DeLeon Lighthouse'},
		{lat: 29.080972, lon: -80.926265, name: 'Marine Science Center'},
		{lat: 29.227654, lon: -81.005459, name: 'Daytona Beach Pier, Main street, Beachside'},
		{lat: 29.214058, lon: -81.099045, name: 'Tanger Outlet'}
	]
}

function nextPlace(plat, plon) {
	let next = undefined
	for (let i = 0; i < hunt.locs.length; i++) {
		if (hunt.locs[i].lat == plat && hunt.locs[i].lon == plon) {
			next = i + 1;
			break;
		}
	}
	if (next == hunt.locs.length) 
		return undefined
	else
		return next;	
}

function test() {
	let next = nextPlace(29., -81.)
	if (next) {
		console.log(hunt.locs[next].name);
	} else
		console.log('out of places')
}

test();

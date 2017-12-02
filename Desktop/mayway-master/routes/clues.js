var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {

	const config = {
		projectId: process.env.GOOGLE_PROJECT_ID,
		keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
	}

	const Vision = require('@google-cloud/vision');
	const vision = new Vision();

	const Flickr = require("flickrapi"),
	    flickrOptions = {
				api_key: process.env.FLICKR_API_KEY,
				user_id: process.env.FLICKR_USER_ID,
				access_token: process.env.FLICKR_ACCESS_TOKEN,
				access_token_secret: process.env.FLICKR_ACCESS_TOKEN_SECRET
	    };

	function getPhotoIds(photos) {
		if (!photos) {
			return new Array();
		} else {
			return photos.map((photo) => photo.id)
		}
	}    

	function getPhotoUrls(photos) {
		if (!photos) 
			return new Array();
		else
			return photos.map((photo) => `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`)
	}

	async function queryFlickr(lat = 29.185169, lon=-81.070528, radius = 1, page = 1, per_page = 6, accuracy = 15) {
		console.log(`queryFlickr page=${page} per_page=${per_page} accuracy=${accuracy} lat=${lat} lon=${lon} radius=${radius}`)
		return new Promise(function(resolve, reject){
			Flickr.tokenOnly(flickrOptions, function(error, flickr) {
				flickr.photos.search({
					page: page,
					per_page: per_page,
					accuracy: accuracy,
					lat: lat,
					lon: lon,
					radius: radius,
					privacy_filter: 1,
					// has_geo: "true",
					// text: "building"
					// tags: "building, nature, landmark, outdoors",
					// tag_mode: "any"
				}, function(err, result) {
			  		// result is Flickr's response
					if (!err) {
						const photoUrls = getPhotoUrls(result.photos.photo);
						const ids = getPhotoIds(result.photos.photo)
						resolve({photoUrls: photoUrls, ids: ids})
					} else {
						console.log('Error' + err);
						reject(err)
					}
				});	
			});
		})
	}

	async function queryVision(requests = []) {
		return new Promise(function(resolve, reject) {
			vision.batchAnnotateImages({requests: requests})
			  .then((results) => {
					if (results) {
						const labels = new Array()
						for (let resp of results[0].responses) {
							labels.push(resp.labelAnnotations.map((label) => label.description))
						}
						resolve(labels)
					} else {
						reject('ERROR: missing results');
					}
			    //const labels = results[0].labelAnnotations;
			    //console.log('Labels:');
			    //labels.forEach((label) => console.log(label.description));
			  })
			  .catch((err) => {
			    reject('ERROR:', err);
			  });
		})
	}

	function getVisionReqs(imageUrls) {
		if (!imageUrls) {
			return new Array()
		} else {
			const results = new Array()
			for (let uri of imageUrls) {
				const req = {
					image: {
						source: {
							imageUri: uri
						}					
					},
					features: [{
						maxResults: 5,
						type: "LABEL_DETECTION"
					}
					// ,{
					// 	maxResults: 5,
					// 	type: "LANDMARK_DETECTION"
					// }
					]
				}			
				results.push(req);
			}
			return results;
		}
	}


	async function clues(res, lat = 29.185169, lon=-81.070528, name='johnnybgoode', success, next) {
		try {

			let result = await queryFlickr(lat, lon);
			console.log(result);
			let labels = await queryVision(getVisionReqs(result.photoUrls));
			result.labels = labels;
			console.log(result)
			res.render('clues', { title: 'Clues', success: success, next: next, lat: lat, lon: lon, name: name, result: result });
			// res.send(JSON.stringify(result))

		} catch (err) {
			console.log(err);
		}
	}

	const hunt = {
		locs: [
			{lat: 29.185169, lon: -81.070528, name: 'Daytona International Speedway'},
			{lat: 29.231585, lon: -81.009364, name: 'Daytona Beach Bandshell'},
			{lat: 29.080634, lon: -80.928023, name: 'Ponce DeLeon Lighthouse'},
			// {lat: 29.227654, lon: -81.005459, name: 'Daytona Beach Pier, Main street, Beachside'},
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

	function dist(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist
	}	

	let plat = req.query.plat;
	let plon = req.query.plon;
	let ulat = req.query.ulat;
	let ulon = req.query.ulon;
	let name = req.query.name;

	console.log(`*** /route/clues plat=${plat} plon=${plon} ulat=${ulat} ulon=${ulon} name=${name}`)

	let success = dist(plat, plon, ulat, ulon, 'K') < 0.5	
	let distance = dist(plat, plon, ulat, ulon, 'K')

	console.log(`*** /route/clues distance=${distance}`)


	if (success) {
		let nextPlaceLoc = nextPlace(plat, plon)
		

		if (nextPlaceLoc) {
			next = true;
			console.log(`*** /route/clues next place lat=${hunt.locs[nextPlaceLoc].lat} lon=${hunt.locs[nextPlaceLoc].lon}`)
		}
		else
			next = false;
	} else {
		next = false;
	}

	if (success && !next) {
		res.render('leaderboard', { title: 'Leaderboard', success: success, next: next });
	} else {

		let lat = plat
		let lon = plon

		if (next) {
			let nextPlaceLoc = nextPlace(plat, plon)
			lat = hunt.locs[nextPlaceLoc].lat
			lon = hunt.locs[nextPlaceLoc].lon
		}

  		clues(res, lat, lon, name, success, next)

	}

});

module.exports = router;
var express = require('express');
var router = express.Router();




/* GET users listing. */
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


async function query(res, lat = 29.185169, lon=-81.070528, name='johnnybgoode', result) {
	try {

		let result = await queryFlickr(lat, lon);
		console.log(result);
		let labels = await queryVision(getVisionReqs(result.photoUrls));
		result.labels = labels;
		console.log(result)
		res.render('init', { title: 'Express', lat: lat, lon: lon, name: name, result: result});
		// res.send(JSON.stringify(result))

	} catch (err) {
		console.log(err);
	}
}

	let lat = req.query.lat;
	let lon = req.query.lon;
	let name = req.query.name;


  console.log(`*** /route/init lat=${lat} lon=${lon} name=${name}`)

  	try {
  		query(res, lat, lon, name)
		  // res.send('done');

		// let result = await queryFlickr();
		// console.log(result);
		// let labels = await queryVision(getVisionReqs(result.photoUrls));
		// result.labels = labels;

	} catch (err) {
		console.log(err);
	}
});

module.exports = router;

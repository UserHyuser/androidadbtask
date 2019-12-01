let Promise = require('bluebird')
const { exec } = require('child_process');
const adb = require('adbkit');
const sharp = require('sharp');
const client = adb.createClient();

/* Settings */
let correctPath = '127.0.0.1:62001';
let emulatorDevice;
let arrDevices = [];


/*
client.listDevices()
	.then(function(devices) {
		return Promise.map(devices, function(device) {
			return client.shell(device.id, 'echo $RANDOM')
			// Use the readAll() utility to read all the content without
			// having to deal with the events. `output` will be a Buffer
			// containing all the output.
				.then(adb.util.readAll)
				.then(function(output) {
					console.log('[%s] %s', device.id, output.toString().trim())
				})
		})
	})
	.then(function() {
		console.log('Done.')
	})
	.catch(function(err) {
		console.error('Something went wrong:', err.stack)
	})*/

// original image
let originalImage = 'orig.jpg';

// file name for cropped image
let outputImage = 'croppedImage.jpg';

/*
sharp(originalImage).extract({ width: 180, height: 180, left: 60, top: 40 }).toFile(outputImage)
	.then(function(new_file_info) {
		console.log("Image cropped and saved");
	})
	.catch(function(err) {
		console.log(err);
	});*/


let out = 'out!!'
async function abc() {
	return new Promise((resolve, reject) =>{
		out = 'out';
		resolve();
	})
}
abc().then(console.log(out))



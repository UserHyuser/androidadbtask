// let Promise = require('bluebird')
const {exec} = require('child_process');
const adb = require('adbkit');
const sharp = require('sharp');
const client = adb.createClient();
const fs = require('fs');
const looksSame = require('looks-same');

/* Settings */
let correctPath = '127.0.0.1:62001'; // adb -e is the same
let emulatorDevice = undefined;
let arrDevices = [];

/* Additional functions */
function wait(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}


async function cropPhoto(originalImage) {
	console.log(originalImage)
	return new Promise(async (resolve, reject) => {
		// fs.unlinkSync('./cropped' + originalImage);
		fs.truncateSync('./cropped' + originalImage, 0);
		// await wait(30000);
		await sharp(originalImage).extract({
			width: originalImage === 'GoogleAppStart.png' ? 170 : 290,
			height: 150,
			left: 200,
			top: 0,
			right: 350
		})
			.png()
			.toFile('cropped' + originalImage)
			.then(function (new_file_info) {
				console.log("Image cropped and saved");
				resolve('DONE')
			})
			.catch(function (err) {
				console.log(err);
			});
	})
}

async function createScreenShot(action){
	return new Promise(resolve => {
		client.shell(correctPath, `screencap -p /sdcard/${action}.png`, function (err, output) {
			if (err) console.log(err);
			let interval = setInterval(function () {
				if (output.writable === false) {
					clearInterval(interval);
					resolve('DONE')
				}
			}, 100)
		})
	})
}

async function getScreenShot(action) {
	return new Promise((async (resolve, reject) => {
			fs.truncateSync(action + '.png', 0);
			await createScreenShot(action)
			.then(value => {
				client.pull(correctPath, `/sdcard/${action}.png`, async function (err, transfer) {
					await transfer.on('end', async function () {
						console.log('Saved screenshot of ' + action);
						resolve('Transferred')
					});
					await transfer.pipe(fs.createWriteStream(action + '.png'));
				})
			})
		}
	))
}

async function compareScreenshots(action) {
	return new Promise(async (resolve, reject) => {
		await looksSame('./cropped' + action + '.png', './screenshots/cropped' + action + '.png', {
			ignoreCaret: true,
			tolerance: 5
		}, async function (error, {equal}) {
			if (equal === true) {
				console.log('Screenshots are equal!')
				resolve(equal);
			} else {
				console.log('Screenshots are not equal. May be you did something wrong? Trying again...');
				await wait(2000)
				resolve(false)
			}
		}, 1500)
	})
}

async function verifyScreenshots(action) {
	return new Promise(async (resolve, reject) => {
			let res = false;
			while (res === false) {
				await getScreenShot(action)
					.then((async value => {
						await cropPhoto(action + '.png').then(async value => {
							console.log(value + 'promise from crop');
							res = await compareScreenshots(action);
						});

					}));
			}
			resolve('Equal screens')
		}
	)
}

client.listDevicesWithPaths(async function (err, devices) {
	try {
		await exec('adb connect 127.0.0.1:62001');
	} catch (e) {
		await exec('adb connect 127.0.0.1:62001');
		await setTimeout(function () {
			console.log('Mannually connected device:' + correctPath)
		}, 2000)
	}
	await devices.forEach(await function (item) {
		arrDevices.push(item);
		console.log(item);
		if (item.id === correctPath) {
			emulatorDevice = item;
		}
	});
	/*if (emulatorDevice === undefined || emulatorDevice.type === 'offline') {
		await exec('adb connect 127.0.0.1:62001');
		await setTimeout(function (){
			console.log('Mannually connected device:' + correctPath)
		}, 2000)
	}*/
	await client.shell(correctPath, 'am start -n com.google.android.googlequicksearchbox/com.google.android.googlequicksearchbox.SearchActivity', (err) => {
		if (err) {
			console.log(err);
		}
	});
	console.log(`Google is starting`)

	await wait(5000).then(async ()=>{
		await verifyScreenshots('GoogleAppStart')
	});

	await setTimeout(async function () {
		client.shell(correctPath, 'input text "Elon%sMusk"', async function () {
			await wait(5000).then(async ()=>{
				await verifyScreenshots('GoogleApp').then(async value =>{
					await client.shell(correctPath, 'input keyevent 66');
					console.log('Asked for Elon')
				}).then(async value => {
					//await client.shell(correctPath, 'input keyevent 3');
					await wait(10000)
					console.log('last');
					await client.shell(correctPath, 'input swipe 500 500 0 0')
						/*.then(async value1 => {
							await wait(100)
							await client.shell(correctPath, 'input swipe 600 600 0 0')
						});*/
				})
			})
		}).then(async ()=>{

		})
	}, 2000)
});





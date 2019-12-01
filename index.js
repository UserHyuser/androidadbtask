// let Promise = require('bluebird')
const {exec} = require('child_process');
const adb = require('adbkit');
const sharp = require('sharp');
const client = adb.createClient();
const fs = require('fs');
const looksSame = require('looks-same');

/* Settings */
let correctPath = '127.0.0.1:62001'; // adb -e is the same 252a951 127.0.0.1:62001
let emulatorDevice = undefined;
let arrDevices = [];

/* Additional functions */
function wait(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

async function cropPhoto(path, originalImage) {
	let w = 0, h = 150, r = 350, l = 200, t = 0;
	switch (originalImage) {
		case 'GoogleAppStart.png':
			w = 170;
			break;
		case 'GoogleApp.png':
			w = 290;
			break;
		case'LoadingPage.png':
			w = 500;
			h = 200;
			r = 0;
			l = 0;
			t = 400;
			break;
		default:
			w = 500;
			h = 200;
			r = 0;
			l = 0;
			t = 300;
			break;
	}

	return new Promise(async (resolve, reject) => {
		let content = fs.readFileSync(path + originalImage);
		await sharp(content).extract({
			width: w,
			height: h,
			left: l,
			top: t,
			right: r
		})
			.png()
			.toBuffer(async (err, data, info) => {
				fs.writeFileSync(path + 'cropped' + originalImage, data, {flag: 'w'});
				resolve('DONE');
			})
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

async function getScreenShot(path, action) {
	return new Promise((async (resolve, reject) => {
			await createScreenShot(action)
			.then(value => {
				client.pull(correctPath, `/sdcard/${action}.png`, async function (err, transfer) {
					await transfer.on('end', async function () {
						// console.log('Saved screenshot of ' + action);
						resolve('Transferred')
					});
					await transfer.pipe(fs.createWriteStream(path + action + '.png'));
				})
			})
		}
	))
}

async function compareScreenshots(path, action) {
	return new Promise(async (resolve, reject) => {
		try{
			await looksSame( path + 'cropped' + action + '.png', path + 'screenshots/cropped' + action + '.png', async function (error, equal) {
				if (equal.equal === true) {
					// console.log('Screenshots are equal!');
					resolve(equal);
				} else {
					console.log('Screenshots are not equal. May be you did something wrong? Or just emulator is too fckn slow????? Trying again...');
					await wait(3000);
					resolve(false)
				}
			})
		} catch (e) {
			console.log('Some problem with your screenshots. Check them.')
		}
	})
}

async function verifyScreenshots(action) {
	let path = './screenshots/';
	return new Promise(async (resolve, reject) => {
			let res = false;
			while (res === false) {
				await getScreenShot(path, action)
					.then((async value => {
						await wait(100);
						await cropPhoto(path, action + '.png').then(async value => {
							res = await compareScreenshots(path, action);
						});
					}));
			}
			resolve('Equal screens')
		}
	)
}

client.listDevicesWithPaths(async function (err, devices) {
	try {
		await exec('adb connect ' + correctPath);
	} catch (e) {
		await exec('adb connect ' + correctPath);
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

	await wait(4000).then(async ()=>{
		await verifyScreenshots('GoogleAppStart')
	});

	await wait(1500);
	await (async () => {
		return new Promise(async (resolve, reject) => {
			await client.shell(correctPath, 'input text "Elon%sMusk"', async () => {
				await wait(2000);
				await verifyScreenshots('GoogleApp').then(async value =>{
					await client.shell(correctPath, 'input keyevent 66');
					console.log('Ask Google for Elon Musk')
					resolve('Asked')
				})
			});
		})
	})();

	await wait(4000);
	await (async () =>{
		return new Promise(async (resolve,reject)=>{
			await verifyScreenshots('GoogleIsReady').then(async value =>{
				await client.shell(correctPath,'input keyevent 93');
				await wait(700);
				await client.shell(correctPath,'input keyevent 93');
				await wait(700);
				await client.shell(correctPath,'input keyevent 93');
				console.log('Scrolled')
				resolve('Ready to click');
			})
		})
	})();

	await wait(3000);
	await (async () =>{
		return new Promise(async (resolve,reject)=>{
			await verifyScreenshots('LoadingPage').then(async value =>{
				await client.shell(correctPath,'input tap 300 560', async function (err,output) {
					console.log('Clicked');
					await wait(6000);
					await client.shell(correctPath,'input keyevent 3', async function (err,output) {
						console.log('Done');
					});
				});
			})
		})
	})();

	console.log('next')

	/*await client.shell(correctPath, 'input text "Elon%sMusk"', async function () {
		await wait(1000).then(async ()=>{
			await verifyScreenshots('GoogleApp').then(async value =>{
				await client.shell(correctPath, 'input keyevent 66');
				console.log('Asked for Elon')
			})
			await wait(7000)
			console.log('last');
			client.shell(correctPath,'input keyevent 93', async function (std) {
				await wait(2000);
				await client.shell(correctPath,'input keyevent 93', async function (err,output) {
					await wait(3000);
					await verifyScreenshots('LoadingPage');
					let interval = setInterval(async function () {
						if (output.writable === false) {
							clearInterval(interval);
							await client.shell(correctPath,'tap 250 380',function (err,output) {
								console.log('clicked?')
								client.shell(correctPath,'tap 250 380')
							});
						}
					}, 100)
				})
			})
		})
	})*/
});





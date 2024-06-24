// Function to simulate a click event
function simulateClick(element) {
	const event = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});
	element.dispatchEvent(event);
}

// Function to set video quality
function setQuality(quality) {
	const settingsButton = document.querySelector('.ytp-settings-button');
	if (!settingsButton) return 2;

	simulateClick(settingsButton);

	const qualityMenuItem = Array.from(document.querySelectorAll('.ytp-menuitem-label')).find(item => item.innerText === 'Quality');
	if (!qualityMenuItem) return 2;

	simulateClick(qualityMenuItem);

	const desiredQualityItem = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem')).find(item => item.innerText.includes(quality));
	if (desiredQualityItem) {
		simulateClick(desiredQualityItem);
		console.log(`Quality set to ${quality}`);
	} else {
		console.log(`Desired quality ${quality} is not available.`);
		return 1;
	}

	// Close the settings menu
	simulateClick(settingsButton);
	return 0;
}

function setHighestQualityAvailable(limit) {
	qualityList = [
		'4320p',
		'2160p',
		'1440p',
		'1080p',
		'720p',
		'480p',
		'360p',
		'240p',
		'144p',
	];
	let index = qualityList.indexOf(limit);
	while (setQuality(qualityList[index]) === 1) { index++; }
}

// Function to adjust quality based on playback speed
function adjustQuality() {
	const player = document.querySelector('video');
	if (player) {
		const speed = player.playbackRate;
		console.log(`Current playback speed: ${speed}`);

		if (speed >= 2) {
			setHighestQualityAvailable('480p');
		} else {
			setHighestQualityAvailable('1080p');
		}
	} else {
		console.error('Video element not found.');
	}
}

// Add an event listener for when the playback speed changes
document.addEventListener('ratechange', adjustQuality, true);

// Initial adjustment
adjustQuality();
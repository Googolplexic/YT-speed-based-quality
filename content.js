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
		'Auto',
	];

	let index = qualityList.indexOf(quality);

	const settingsButton = document.querySelector('.ytp-settings-button');
	if (!settingsButton) { return 2; };

	simulateClick(settingsButton);

	const qualityMenuItem = Array.from(document.querySelectorAll('.ytp-menuitem-label')).find(item => item.innerText === 'Quality');
	if (!qualityMenuItem) { return 2; }
	var desiredQualityItem;
	simulateClick(qualityMenuItem);
	while (!desiredQualityItem && index <= 8) {
		desiredQualityItem = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem')).find(item => item.innerText.includes(qualityList[index]));
		if (desiredQualityItem) {
			console.log(`Quality set to ${qualityList[index]}`);
			simulateClick(desiredQualityItem);

		} else {
			console.log(`Desired quality ${qualityList[index]} is not available, trying a lower quality.`);
			index++;
		}
	}

	// Close the settings menu
	simulateClick(settingsButton);
	return 0;
}

// Function to adjust quality based on playback speed
function adjustQuality() {
	const player = document.querySelector('video');
	if (player) {
		const speed = player.playbackRate;
		console.log(`Current playback speed: ${speed}`);
		chrome.storage.sync.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], function (items) {
			if (!items.enabled) {
				console.log('Extension is disabled.');
				return;
			}
			const threshold = parseFloat(items.speedThreshold || '2.0');
			const qualityAbove = items.qualityAbove || '480p';
			const qualityBelow = items.qualityBelow || '1080p';

			if (speed >= threshold) {
				setQuality(qualityAbove); // Quality for speeds above the threshold
			} else {
				setQuality(qualityBelow); // Quality for speeds below or equal to the threshold
			}
		});
	} else {
		console.error('Video element not found.');
	}
}

// Add an event listener for when the playback speed changes
document.addEventListener('ratechange', adjustQuality, true);

// Initial adjustment
adjustQuality();
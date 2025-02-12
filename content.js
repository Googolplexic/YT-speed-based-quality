// Function to simulate a click event
function simulateClick(element) {
	const event = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});
	element.dispatchEvent(event);
}

// Function to estimate data saving
function estimateDataSaving(oldQuality, newQuality) {
	const qualityBitrates = {
		'4320p': 80000,
		'2160p': 40000,
		'1440p': 16000,
		'1080p': 8000,
		'720p': 5000,
		'480p': 2500,
		'360p': 1000,
		'240p': 500,
		'144p': 300,
		'Auto': 5000
	};

	const duration = document.querySelector('video').duration;
	const oldBitrate = qualityBitrates[oldQuality];
	const newBitrate = qualityBitrates[newQuality];
	const savings = (oldBitrate - newBitrate) * duration / 8000; // Convert to MB

	chrome.storage.sync.get(['dataSaved', 'videosOptimized'], function (items) {
		chrome.storage.sync.set({
			dataSaved: (items.dataSaved || 0) + savings,
			videosOptimized: (items.videosOptimized || 0) + 1
		});
	});
}

// Enhanced quality setting with retry mechanism
function setQuality(quality) {
	let retries = 3;
	const trySetQuality = () => {
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
		while (!desiredQualityItem && index <= qualityList.length) {
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
	};

	const result = trySetQuality();
	if (result === 2 && retries > 0) {
		retries--;
		setTimeout(trySetQuality, 1000);
	}
}

// Function to adjust quality based on playback speed
function adjustQuality() {
	const player = document.querySelector('video');
	if (!player) {
		console.error('Video element not found.');
		return;
	}

	chrome.storage.sync.get(['enabled', 'speedThreshold', 'qualityAbove', 'qualityBelow'], function (items) {
		if (!items.enabled) {
			console.log('Extension is disabled.');
			return;
		}

		const speed = player.playbackRate;
		console.log(`Current playback speed: ${speed}`);

		const threshold = parseFloat(items.speedThreshold || '2.0');
		const qualityAbove = items.qualityAbove || '480p';
		const qualityBelow = items.qualityBelow || '1080p';

		if (speed >= threshold) {
			setQuality(qualityAbove);
		} else {
			setQuality(qualityBelow);
		}
	});
}

// Add an event listener for when the playback speed changes
document.addEventListener('ratechange', adjustQuality, true);

// Initial adjustment
adjustQuality();

// Add quality change observer
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.target.className.includes('ytp-settings-menu')) {
			adjustQuality();
		}
	});
});

// Start observing quality changes
observer.observe(document.body, {
	childList: true,
	subtree: true
});

// Add message listener for immediate quality adjustment
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "adjustQuality") {
		adjustQuality();
	}
});
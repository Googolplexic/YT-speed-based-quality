// Function to simulate a click event
function simulateClick(element) {
	const event = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});
	element.dispatchEvent(event);
}

let lastQuality = 'Auto';

function setQuality(quality) {
	const qualityList = [
		'4320p', '2160p', '1440p', '1080p', '720p',
		'480p', '360p', '240p', '144p', 'Auto'
	];

	let index = qualityList.indexOf(quality);
	const settingsButton = document.querySelector('.ytp-settings-button');
	if (!settingsButton) return;

	// Open settings menu
	simulateClick(settingsButton);

	// First timeout to wait for settings menu
	setTimeout(() => {
		// Try to find quality menu item (both by text and aria-label)
		const qualityMenuItem = Array.from(document.querySelectorAll('.ytp-menuitem'))
			.find(item => {
				const label = item.querySelector('.ytp-menuitem-label');
				return label && (
					label.textContent === 'Quality' ||
					item.getAttribute('aria-label')?.includes('Quality')
				);
			});

		if (!qualityMenuItem) {
			simulateClick(settingsButton); // Close menu if quality option not found
			return;
		}

		simulateClick(qualityMenuItem);

		// Second timeout to wait for quality submenu
		setTimeout(() => {
			let foundQuality = false;
			while (!foundQuality && index < qualityList.length) {
				const currentQuality = qualityList[index];
				const qualityItems = document.querySelectorAll('.ytp-menuitem');

				for (const item of qualityItems) {
					if (item.textContent.includes(currentQuality.replace('p', ''))) {
						simulateClick(item);
						console.log(`Successfully set quality to ${currentQuality}`);
						lastQuality = currentQuality;
						foundQuality = true;
						break;
					}
				}

				if (!foundQuality) {
					console.log(`Quality ${currentQuality} not available, trying lower`);
					index++;
				}
			}

			// Close settings menu
			setTimeout(() => {
				simulateClick(settingsButton);
			}, 100);
		}, 150); // Increased delay for quality submenu
	}, 150); // Increased delay for main menu
}

function adjustQuality() {
	try {
		const player = document.querySelector('video');
		if (!player) return;

		chrome.storage.sync.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], function (items) {
			if (!items.enabled) {
				console.log('Extension is disabled.');
				return;
			}

			const speed = player.playbackRate;
			const threshold = parseFloat(items.speedThreshold || '2.0');
			const qualityAbove = items.qualityAbove || '480p';
			const qualityBelow = items.qualityBelow || '1080p';

			console.log(`Speed: ${speed}, Threshold: ${threshold}`);
			if (speed >= threshold) {
				setQuality(qualityAbove);
			} else {
				setQuality(qualityBelow);
			}
		});
	} catch (error) {
		console.debug('Quality adjustment skipped');
	}
}

// Use error boundaries for event listeners
document.addEventListener('ratechange', (e) => {
	try {
		adjustQuality();
	} catch (error) {
		console.debug('Rate change handler skipped');
	}
}, true);

setTimeout(adjustQuality, 1000); // Initial adjustment with delay

// Add error event listener to ignore YouTube analytics errors
window.addEventListener('error', function (e) {
	if (e.target?.src?.includes('youtube.com/api/stats') ||
		e.target?.src?.includes('play.google.com/log')) {
		e.preventDefault();
		e.stopPropagation();
		return true;
	}
}, true);

// Update message listener to handle force updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "adjustQuality") {
		if (request.force) {
			// Force immediate quality adjustment
			lastQuality = 'Auto'; // Reset last quality to force update
			adjustQuality();
		} else {
			adjustQuality();
		}
	}
	return true;
});
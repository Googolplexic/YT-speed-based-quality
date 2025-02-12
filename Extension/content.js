// Function to simulate a click event
function simulateClick(element) {
	const event = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});
	element.dispatchEvent(event);
}

let currentState = {
	speed: null,
	quality: null,
	threshold: null,
	isChanging: false  // Add lock to prevent concurrent changes
};

let lastChangeTime = 0;
const CHANGE_COOLDOWN = 2000; // 2 seconds cooldown between changes

// Add new function to handle video initialization
function initializeVideo() {
	currentState = {
		speed: null,
		quality: null,
		threshold: null,
		isChanging: false
	};
	debouncedAdjustQuality();
}

// Add mutation observer to detect video player changes
const videoObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		const nodes = Array.from(mutation.addedNodes);
		if (nodes.some(node => node.tagName === 'VIDEO')) {
			console.log('New video detected, initializing...');
			initializeVideo();
			break;
		}
	}
});

// Observe video player container
videoObserver.observe(document.documentElement, {
	childList: true,
	subtree: true
});

// Listen for navigation events
document.addEventListener('yt-navigate-finish', initializeVideo);
document.addEventListener('yt-page-data-updated', initializeVideo);

function shouldChangeQuality(speed, threshold) {
	const wasAbove = currentState.speed >= currentState.threshold;
	const isAbove = speed >= threshold;
	return wasAbove !== isAbove || currentState.quality === null;
}

function setQuality(quality) {
	if (currentState.isChanging) {
		console.log('🔒 Quality change already in progress');
		return Promise.resolve(false);
	}

	return new Promise((resolve) => {
		currentState.isChanging = true;
		console.log(`📊 Attempting to set quality to ${quality}`);

		// Wait for player to be ready
		function waitForPlayer(attempts = 0) {
			const settingsButton = document.querySelector('.ytp-settings-button');
			const player = document.querySelector('video');

			if (!settingsButton || !player || !player.readyState) {
				if (attempts > 10) {
					console.log('❌ Player not ready after 10 attempts');
					currentState.isChanging = false;
					return resolve(false);
				}
				console.log('⏳ Waiting for player to be ready...');
				setTimeout(() => waitForPlayer(attempts + 1), 500);
				return;
			}

			openSettings();
		}

		function openSettings() {
			// Force close any open menu first
			const openMenu = document.querySelector('.ytp-settings-menu');
			if (openMenu && openMenu.style.display !== 'none') {
				const settingsButton = document.querySelector('.ytp-settings-button');
				simulateClick(settingsButton);
				setTimeout(startQualityChange, 300);
			} else {
				startQualityChange();
			}
		}

		function startQualityChange() {
			const settingsButton = document.querySelector('.ytp-settings-button');
			simulateClick(settingsButton);
			console.log('🔓 Opening settings menu');

			setTimeout(() => {
				const qualityButton = Array.from(document.querySelectorAll('.ytp-menuitem'))
					.find(item => item.textContent.includes('Quality'));

				if (!qualityButton) {
					console.log('❌ Quality menu not found');
					simulateClick(settingsButton);
					currentState.isChanging = false;
					return resolve(false);
				}

				simulateClick(qualityButton);
				console.log('🎯 Opening quality submenu');

				// Increased timeout from 300 to 500ms to ensure menu is fully loaded
				setTimeout(() => {
					const qualityOption = Array.from(document.querySelectorAll('.ytp-menuitem'))
						.find(item => item.textContent.includes(quality.replace('p', '')));

					if (qualityOption) {
						simulateClick(qualityOption);
						console.log(`✅ Setting quality to ${quality}`);

						const player = document.querySelector('video');
						if (player) {
							currentState.quality = quality;
							currentState.speed = player.playbackRate;
							console.log('📝 State updated:', currentState);
						}
					} else {
						console.log(`⚠️ Quality option ${quality} not found`);
					}

					// Always close settings
					setTimeout(() => {
						currentState.isChanging = false;
						resolve(true);
					}, 300);
				}, 700); 
			}, 300);
		}

		// Start the process
		waitForPlayer();
	});
}

function debounce(func, wait) {
	let timeout;
	let lastArgs;
	let lastThis;
	let result;
	let lastRun = 0;

	return function debounced(...args) {
		const context = this;
		const now = Date.now();

		if (timeout) {
			clearTimeout(timeout);
		}

		const later = () => {
			const delta = Date.now() - lastRun;
			if (delta >= wait) {
				func.apply(context, args);
				lastRun = Date.now();
			} else {
				timeout = setTimeout(later, wait - delta);
			}
		};

		timeout = setTimeout(later, wait);
	};
}

const debouncedAdjustQuality = debounce(async () => {
	const player = document.querySelector('video');
	if (!player) return;

	chrome.storage.sync.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], async function (items) {
		if (!items.enabled) {
			console.log('🔴 Extension disabled');
			return;
		}

		const speed = player.playbackRate;
		const threshold = parseFloat(items.speedThreshold || '2.0');
		currentState.threshold = threshold;

		console.log(`🎮 Speed: ${speed}, Threshold: ${threshold}, Current Quality: ${currentState.quality}`);

		if (shouldChangeQuality(speed, threshold)) {
			const targetQuality = speed >= threshold ? items.qualityAbove : items.qualityBelow;
			console.log(`🎯 Target quality: ${targetQuality}`);
			await setQuality(targetQuality);
		}
	});
}, 500);

// Replace adjustQuality with debounced version
document.addEventListener('ratechange', debouncedAdjustQuality, true);

// Increase initial wait time
setTimeout(debouncedAdjustQuality, 2000);

// Initialize immediately on page load
initializeVideo();
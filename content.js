// Function to set video quality
function setQuality(quality) {
	const player = document.querySelector('video');
	if (player) {
		const ytPlayer = document.querySelector('.html5-video-player');
		if (ytPlayer) {
			const qualityLevels = ytPlayer.getAvailableQualityLevels();
			if (qualityLevels.includes(quality)) {
				ytPlayer.setPlaybackQuality(quality);
				ytPlayer.setPlaybackQualityRange(quality);
				console.log(`Quality set to ${quality
					}`);
			} else {
				console.log(`Desired quality ${quality
					} is not available. Available qualities: ${qualityLevels.join(', ')
					}`);
			}
		} else {
			console.error('YouTube player not found.');
		}
	} else {
		console.error('Video element not found.');
	}
}
// Function to adjust quality based on playback speed
function adjustQuality() {
	const player = document.querySelector('video');
	if (player) {
		const speed = player.playbackRate;
		console.log(`Current playback speed: ${speed
			}`);

		if (speed > 2) {
			setQuality('large');
		}
		else {
			setQuality('medium');
		}
	} else {
		console.error('Video element not found.');
	}
}
// Add an event listener for when the playback speed changes
document.addEventListener('ratechange', adjustQuality, true);

// Initial adjustment
adjustQuality();
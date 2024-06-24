document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('save');
    const speedThreshold = document.getElementById('speedThreshold');
    const toggleButton = document.getElementById('toggleButton');
    const thresholdValue = document.getElementById('thresholdValue');
    const qualityAbove = document.getElementById('qualityAbove');
    const qualityBelow = document.getElementById('qualityBelow');
    // Load saved settings
    chrome.storage.sync.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], function (items) {
        if (items.speedThreshold) {
            speedThreshold.value = items.speedThreshold;
            thresholdValue.textContent = items.speedThreshold;
        }
        if (items.qualityAbove) qualityAbove.value = items.qualityAbove;
        if (items.qualityBelow) qualityBelow.value = items.qualityBelow;
        if (items.enabled !== undefined) {
            toggleButton.textContent = items.enabled ? 'Disable' : 'Enable';
        }
    });

    // Update threshold display
    speedThreshold.addEventListener('input', function () {
        thresholdValue.textContent = speedThreshold.value;
    });

    // Save settings
    saveButton.addEventListener('click', function () {
        chrome.storage.sync.set({
            speedThreshold: speedThreshold.value,
            qualityAbove: qualityAbove.value,
            qualityBelow: qualityBelow.value
        }, function () {
            console.log('Settings saved');
        });
    });

    // Toggle extension
    toggleButton.addEventListener('click', function () {
        chrome.storage.sync.get('enabled', function (items) {
            const newState = !items.enabled;
            chrome.storage.sync.set({ enabled: newState }, function () {
                toggleButton.textContent = newState ? 'Disable' : 'Enable';
                console.log(`Extension ${newState ? 'enabled' : 'disabled'}`);
            });
        });
    });
});
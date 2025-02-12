document.addEventListener('DOMContentLoaded', function () {
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

    // Update threshold display and trigger auto-save
    speedThreshold.addEventListener('input', function () {
        thresholdValue.textContent = speedThreshold.value;
        autoSave();
    });

    // Save settings
    let saveTimeout;
    function autoSave() {
        clearTimeout(saveTimeout);
        // Reduce timeout to 100ms for more responsive saves
        saveTimeout = setTimeout(() => {
            chrome.storage.sync.get('enabled', function (items) {
                chrome.storage.sync.set({
                    speedThreshold: speedThreshold.value,
                    qualityAbove: qualityAbove.value,
                    qualityBelow: qualityBelow.value,
                    enabled: items.enabled !== undefined ? items.enabled : true
                }, function () {
                    // Trigger quality adjustment immediately after save
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        if (tabs[0].url.includes('youtube.com')) {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "adjustQuality" });
                        }
                    });
                });
            });
        }, 100); // Reduced from 500ms
    }

    // Add auto-save to quality selectors
    qualityAbove.addEventListener('change', autoSave);
    qualityBelow.addEventListener('change', autoSave);

    // Add auto-save to presets
    document.getElementById('presets').addEventListener('change', function (e) {
        const preset = presets[e.target.value];
        speedThreshold.value = preset.threshold;
        thresholdValue.textContent = preset.threshold + 'x';
        qualityAbove.value = preset.above;
        qualityBelow.value = preset.below;
        autoSave();
    });

    // Add immediate save triggers
    speedThreshold.addEventListener('change', autoSave); // Add change event
    qualityAbove.addEventListener('change', autoSave);
    qualityBelow.addEventListener('change', autoSave);

    // Update UI based on enabled state
    function updateUIState(enabled) {
        const wrapper = document.querySelector('.content-wrapper');
        toggleButton.textContent = enabled ? 'Disable' : 'Enable';
        toggleButton.className = enabled ? '' : 'disabled';
        wrapper.className = `content-wrapper ${enabled ? '' : 'disabled'}`;
    }

    // Initialize enabled state
    chrome.storage.sync.get('enabled', function (items) {
        const enabled = items.enabled !== undefined ? items.enabled : true;
        chrome.storage.sync.set({ enabled: enabled }, function () {
            updateUIState(enabled);
        });
    });

    // Toggle extension
    toggleButton.addEventListener('click', function () {
        chrome.storage.sync.get('enabled', function (items) {
            const newState = !(items.enabled !== undefined ? items.enabled : true);
            chrome.storage.sync.set({ enabled: newState }, function () {
                updateUIState(newState);
            });
        });
    });

    const presets = {
        'default': { threshold: 1.0, above: '720p', below: '1080p' },
        'data-saver': { threshold: 1.5, above: '360p', below: '720p' },
        'high-quality': { threshold: 2.0, above: '720p', below: '1440p' },
        'balanced': { threshold: 1.75, above: '480p', below: '1080p' }
    };


    function updateStats() {
        chrome.storage.sync.get(['dataSaved', 'videosOptimized'], function (items) {
            document.getElementById('dataSaved').textContent =
                `${Math.round(items.dataSaved || 0)}`;
            document.getElementById('videosOptimized').textContent =
                items.videosOptimized || 0;
        });
    }

    // Update stats every 5 seconds
    updateStats();
    setInterval(updateStats, 5000);
});
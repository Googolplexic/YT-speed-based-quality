document.addEventListener('DOMContentLoaded', function () {
    const speedThreshold = document.getElementById('speedThreshold');
    const toggleButton = document.getElementById('toggleButton');
    const thresholdValue = document.getElementById('thresholdValue');
    const qualityAbove = document.getElementById('qualityAbove');
    const qualityBelow = document.getElementById('qualityBelow');

    const presets = {
        'efficient': {
            threshold: 1.5,
            above: '480p',  // Good enough for reading
            below: '1080p'  // Normal viewing
        },
        'ultra-light': {
            threshold: 1.25,
            above: '360p',  // Minimum viable
            below: '720p'   // Light HD
        },
        'balanced': {
            threshold: 1.75,
            above: '720p',  // HD for fast
            below: '1080p'  // Full HD for normal
        },
        'high-quality': {
            threshold: 2.0,
            above: '1080p', // Full HD even when fast
            below: '1440p'  // 2K for normal
        }
    };

    // Load saved settings
    chrome.storage.sync.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], function (items) {
        if (chrome.runtime.lastError) {
            // Try local storage instead
            chrome.storage.local.get(['speedThreshold', 'qualityAbove', 'qualityBelow', 'enabled'], function (localItems) {
                updateSettings(localItems);
            });
        } else {
            updateSettings(items);
        }
    });

    function updateSettings(items) {
        if (items.speedThreshold) {
            speedThreshold.value = items.speedThreshold;
            thresholdValue.textContent = items.speedThreshold;
        }
        if (items.qualityAbove) qualityAbove.value = items.qualityAbove;
        if (items.qualityBelow) qualityBelow.value = items.qualityBelow;
        updateUIState(items.enabled);
    }

    function saveSettings() {
        chrome.storage.sync.set({
            speedThreshold: speedThreshold.value,
            qualityAbove: qualityAbove.value,
            qualityBelow: qualityBelow.value
        });
    }

    // Update threshold display and auto-save
    speedThreshold.addEventListener('input', function () {
        thresholdValue.textContent = speedThreshold.value;
        saveSettings();
    });

    // Add auto-save to quality selectors
    qualityAbove.addEventListener('change', saveSettings);
    qualityBelow.addEventListener('change', saveSettings);

    // Fix preset handling
    document.getElementById('presets').addEventListener('change', function (e) {
        const preset = presets[e.target.value];
        if (!preset) return;

        console.log('Applying preset:', preset);

        speedThreshold.value = preset.threshold;
        thresholdValue.textContent = preset.threshold;
        qualityAbove.value = preset.above;
        qualityBelow.value = preset.below;

        // Save immediately after preset change
        chrome.storage.sync.set({
            speedThreshold: preset.threshold,
            qualityAbove: preset.above,
            qualityBelow: preset.below
        }, () => {
            // Notify content script to update immediately
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0]?.url?.includes('youtube.com')) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "adjustQuality",
                        force: true
                    });
                }
            });
        });
    });

    function updateUIState(enabled) {
        const wrapper = document.querySelector('.content-wrapper');
        const checkbox = document.querySelector('#toggleButton');
        checkbox.checked = enabled;
        wrapper.className = `content-wrapper ${enabled ? '' : 'disabled'}`;
    }

    // Toggle extension
    document.getElementById('toggleButton').addEventListener('change', function (e) {
        chrome.storage.sync.set({ enabled: e.target.checked }, function () {
            updateUIState(e.target.checked);
        });
    });
});
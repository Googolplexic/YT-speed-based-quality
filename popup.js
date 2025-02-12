document.addEventListener('DOMContentLoaded', function () {
    const speedThreshold = document.getElementById('speedThreshold');
    const toggleButton = document.getElementById('toggleButton');
    const thresholdValue = document.getElementById('thresholdValue');
    const qualityAbove = document.getElementById('qualityAbove');
    const qualityBelow = document.getElementById('qualityBelow');
    const presetsSelect = document.getElementById('presets');

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

    // Add 'custom' option to presets
    presetsSelect.insertAdjacentHTML('afterbegin', '<option value="custom">Custom</option>');

    let isCustom = false; // Add this at the top with other variables

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

        // Check if initial settings match any preset
        const currentSettings = {
            threshold: Number(items.speedThreshold || speedThreshold.value),
            above: items.qualityAbove || qualityAbove.value,
            below: items.qualityBelow || qualityBelow.value
        };

        const matchingPreset = Object.entries(presets).find(([_, preset]) =>
            preset.threshold === currentSettings.threshold &&
            preset.above === currentSettings.above &&
            preset.below === currentSettings.below
        );

        isCustom = !matchingPreset;
        updatePresetSelection();
    }

    function saveSettings() {
        chrome.storage.sync.set({
            speedThreshold: speedThreshold.value,
            qualityAbove: qualityAbove.value,
            qualityBelow: qualityBelow.value
        });
    }

    function updatePresetSelection() {
        // Always remove existing custom option first
        const customOption = presetsSelect.querySelector('option[value="custom"]');
        if (customOption) customOption.remove();

        const currentSettings = {
            threshold: Number(speedThreshold.value),
            above: qualityAbove.value,
            below: qualityBelow.value
        };

        // Only show custom if we're in custom mode
        if (isCustom) {
            presetsSelect.insertAdjacentHTML('afterbegin', '<option value="custom">Custom</option>');
            presetsSelect.value = 'custom';
            return;
        }

        // Find matching preset
        const matchingPreset = Object.entries(presets).find(([_, preset]) =>
            preset.threshold === currentSettings.threshold &&
            preset.above === currentSettings.above &&
            preset.below === currentSettings.below
        );

        if (matchingPreset) {
            presetsSelect.value = matchingPreset[0];
        } else {
            // If no match and not in custom mode, default to first preset
            presetsSelect.value = Object.keys(presets)[0];
        }
    }

    // Manual changes always set to custom
    function handleManualChange() {
        isCustom = true;
        saveSettings();
        updatePresetSelection();
    }

    // Update threshold display and trigger save
    speedThreshold.addEventListener('input', function () {
        thresholdValue.textContent = this.value; 
        handleManualChange();
    });

    qualityAbove.addEventListener('change', handleManualChange);
    qualityBelow.addEventListener('change', handleManualChange);

    // Fix preset handling
    presetsSelect.addEventListener('change', function (e) {
        if (e.target.value === 'custom') return;

        const preset = presets[e.target.value];
        if (!preset) return;

        isCustom = false; // Clear custom state
        const customOption = presetsSelect.querySelector('option[value="custom"]');
        if (customOption) customOption.remove();

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
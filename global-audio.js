/**
 * Global background music + notification SFX.
 * Cross-page: localStorage time + playing/paused; gesture unlock when autoplay is blocked.
 */
(function (global) {
    var LS_TIME = 'global_bg_audio_time';
    var LS_SRC = 'global_bg_audio_src';
    var LS_MUTED = 'global_bg_audio_muted';
    var LS_PLAYING = 'global_bg_audio_playing';
    var SS_INIT = 'global_bg_audio_session_init';

    var BG_PATH = 'images/SOUND/Anima_Christi___Marco_Frisina___Lyrics_-_Paroles___Pâques___Ascension(256k).mp3';
    var NOTIFY_PATH = 'images/SOUND/universfield-new-notification-057-494255.mp3';

    var bgAudio = null;
    var timePersistInterval = null;
    var unloadBound = false;
    var bgWireDone = false;
    var pageNavigating = false;
    var bgResumeGestureAttached = false;
    var notificationAudio = null;
    var notificationUnlockPending = false;

    function ensureNotificationAudio() {
        if (!notificationAudio) {
            notificationAudio = new Audio(NOTIFY_PATH);
            notificationAudio.preload = 'auto';
        }
        return notificationAudio;
    }

    function attachNotificationGestureUnlock() {
        if (notificationUnlockPending) return;
        notificationUnlockPending = true;
        global.addEventListener('pointerdown', function onFirstPointer() {
            notificationUnlockPending = false;
            playNotificationSound();
        }, { capture: true, once: true });
    }

    function trySetLocalStorage(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) { /* ignore */ }
    }

    function setPlayingState(playing) {
        trySetLocalStorage(LS_PLAYING, playing ? '1' : '0');
    }

    function isPlayingStateStored() {
        try {
            return localStorage.getItem(LS_PLAYING) === '1';
        } catch (e) {
            return false;
        }
    }

    function flushTime() {
        try {
            if (bgAudio && !isNaN(bgAudio.currentTime) && isFinite(bgAudio.currentTime)) {
                trySetLocalStorage(LS_TIME, String(bgAudio.currentTime));
                trySetLocalStorage(LS_SRC, BG_PATH);
            }
        } catch (e) { /* ignore */ }
    }

    function startTimePersistEverySecond() {
        stopTimePersistEverySecond();
        timePersistInterval = setInterval(flushTime, 1000);
    }

    function stopTimePersistEverySecond() {
        if (timePersistInterval) {
            clearInterval(timePersistInterval);
            timePersistInterval = null;
        }
    }

    function bindUnloadOnce() {
        if (unloadBound) return;
        unloadBound = true;
        
        function setNavigating() {
            pageNavigating = true;
            flushTime();
        }

        global.addEventListener('pagehide', setNavigating);
        global.addEventListener('beforeunload', setNavigating);
        
        if (global.document) {
            global.document.addEventListener('click', function(e) {
                var a = e.target.closest('a');
                if (a && a.href && !a.href.startsWith('#') && !a.href.startsWith('javascript:') && a.target !== '_blank') {
                    setNavigating();
                }
            }, true);
        }

        global.addEventListener('pageshow', function () {
            pageNavigating = false;
        });
    }

    function wireBgElement() {
        if (bgWireDone || !bgAudio) return;
        bgWireDone = true;

        bgAudio.addEventListener('play', function () {
            setPlayingState(true);
            startTimePersistEverySecond();
        });

        bgAudio.addEventListener('pause', function () {
            flushTime();
            if (pageNavigating) return;
            setPlayingState(false);
            stopTimePersistEverySecond();
        });
    }

    function ensureBg() {
        if (!bgAudio) {
            bgAudio = new Audio();
            bgAudio.preload = 'auto';
            bgAudio.loop = true;
            bgAudio.src = BG_PATH;
            wireBgElement();
        }
        return bgAudio;
    }

    function applyMuteFromStorage() {
        var muted = false;
        try {
            muted = localStorage.getItem(LS_MUTED) === '1';
        } catch (e) { /* ignore */ }
        if (bgAudio) bgAudio.volume = muted ? 0 : 1;
        return muted;
    }

    function readSavedTime() {
        try {
            return parseFloat(localStorage.getItem(LS_TIME) || '0') || 0;
        } catch (e) {
            return 0;
        }
    }

    function seekBgToStored() {
        var a = ensureBg();
        a.currentTime = readSavedTime();
        applyMuteFromStorage();
    }

    function tryPlayBg() {
        var a = ensureBg();
        bindUnloadOnce();
        var p = a.play();
        if (p && typeof p.catch === 'function') {
            return p;
        }
        return Promise.resolve();
    }

    function attachBgResumeGesture() {
        if (bgResumeGestureAttached) return;
        bgResumeGestureAttached = true;

        var done = false;
        function cleanup() {
            document.removeEventListener('pointerdown', onInteract, true);
            document.removeEventListener('click', onInteract, true);
            document.removeEventListener('touchstart', onInteract, true);
            var hb = document.getElementById('hamburger');
            if (hb) hb.removeEventListener('click', onInteract, true);
            bgResumeGestureAttached = false;
        }

        function onInteract() {
            if (done) return;
            if (!shouldAutoResumeBg()) {
                cleanup();
                return;
            }
            done = true;
            cleanup();
            seekBgToStored();
            applyMuteFromStorage();
            tryPlayBg().catch(function () {
                attachBgResumeGesture();
            });
        }

        document.addEventListener('pointerdown', onInteract, true);
        document.addEventListener('click', onInteract, true);
        document.addEventListener('touchstart', onInteract, true);
        var hb = document.getElementById('hamburger');
        if (hb) hb.addEventListener('click', onInteract, true);
    }

    /** True if this tab should try to resume background music on load. */
    function shouldAutoResumeBg() {
        if (isPlayingStateStored()) return true;
        try {
            if (sessionStorage.getItem(SS_INIT) === '1') return true;
        } catch (e) { /* ignore */ }
        return false;
    }

    /**
     * Run on every page that includes this script: resume at saved currentTime if music was playing.
     * If autoplay is blocked, waits for first pointer/click/touch or #hamburger click.
     */
    function initCrossPageResume() {
        if (!shouldAutoResumeBg()) return;

        try {
            var src = localStorage.getItem(LS_SRC);
            if (src && src !== BG_PATH) return;
        } catch (e) { /* ignore */ }

        seekBgToStored();
        bindUnloadOnce();

        tryPlayBg().catch(function () {
            attachBgResumeGesture();
        });
    }

    /**
     * Call from homepage when user clicks the final gate accept (second "I ACCEPT").
     */
    function startFromLastGateAccept() {
        var a = ensureBg();
        var hadSession = false;
        try {
            hadSession = sessionStorage.getItem(SS_INIT) === '1';
        } catch (e) { /* ignore */ }
        try {
            sessionStorage.setItem(SS_INIT, '1');
        } catch (e) { /* ignore */ }

        var startAt = 0;
        if (hadSession) {
            startAt = readSavedTime();
        }

        a.currentTime = startAt;
        applyMuteFromStorage();
        trySetLocalStorage(LS_SRC, BG_PATH);
        setPlayingState(true);
        bindUnloadOnce();

        tryPlayBg().catch(function () {
            attachBgResumeGesture();
        });

        try {
            global.dispatchEvent(new CustomEvent('global-audio-mute-changed', { detail: { muted: applyMuteFromStorage() } }));
        } catch (e4) { /* ignore */ }
    }

    /** @deprecated use initCrossPageResume (auto-runs on DOMContentLoaded) */
    function resumeIfSessionActive() {
        initCrossPageResume();
    }

    function setMusicMuted(muted) {
        trySetLocalStorage(LS_MUTED, muted ? '1' : '0');
        if (bgAudio) bgAudio.volume = muted ? 0 : 1;
        try {
            global.dispatchEvent(new CustomEvent('global-audio-mute-changed', { detail: { muted: !!muted } }));
        } catch (e2) { /* ignore */ }
    }

    function toggleMusicMute() {
        setMusicMuted(!isMusicMuted());
    }

    function isMusicMuted() {
        try {
            return localStorage.getItem(LS_MUTED) === '1';
        } catch (e) {
            return false;
        }
    }

    function playNotificationSound() {
        var snd = ensureNotificationAudio();
        snd.currentTime = 0;
        snd.volume = 0.85;
        var p = snd.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {
                attachNotificationGestureUnlock();
            });
        }
    }

    function boot() {
        initCrossPageResume();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }

    global.GlobalAudio = {
        startFromLastGateAccept: startFromLastGateAccept,
        resumeIfSessionActive: resumeIfSessionActive,
        initCrossPageResume: initCrossPageResume,
        setMusicMuted: setMusicMuted,
        toggleMusicMute: toggleMusicMute,
        isMusicMuted: isMusicMuted,
        playNotificationSound: playNotificationSound,
        attachNotificationGestureUnlock: attachNotificationGestureUnlock,
        BG_PATH: BG_PATH,
        NOTIFY_PATH: NOTIFY_PATH
    };
    global.playNotificationSound = playNotificationSound;
})(typeof window !== 'undefined' ? window : this);

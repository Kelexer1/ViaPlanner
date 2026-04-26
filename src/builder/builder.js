let modulePromise = null;
let managerPromise = null;

import viaBuilderScriptUrl from './via-builder.js?url';
import viaBuilderWasmUrl from './via-builder.wasm?url';

async function ensureViaBuilderScriptLoaded() {
    await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-via-builder="true"]');

        if (existing) {
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load via-builder.js')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = viaBuilderScriptUrl;
        script.async = true;
        script.dataset.viaBuilder = 'true';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load via-builder.js'));
        document.head.appendChild(script);
    });
}

async function getModule() {
    if (!modulePromise) {
        modulePromise = ensureViaBuilderScriptLoaded().then(() => {
            return window.createViaBuilderModule({
                locateFile(path) {
                    if (path.endsWith('.wasm')) {
                        return viaBuilderWasmUrl;
                    }

                    return path;
                }
            });
        });
    }

    return modulePromise;
}

/**
 * Check out https://github.com/Kelexer1/via-builder for documentation on how to use these methods, and JSON formatting
 */
class ViaBuilderManager {
    constructor(Module) {
        this.Module = Module;
        this.api = new Module.ViaBuilderAPI();
    }

    setPreferences(preferences) {
        this.api.setPreferences(JSON.stringify(preferences));
    }

    setSettings(settings) {
        this.api.setSettings(JSON.stringify(settings))
    }

    addCourse(course) {
        this.api.addCourse(JSON.stringify(course));
    }

    removeCourse(courseCode, type) {
        this.api.removeCourse(courseCode, type);
    }

    build() {
        const raw = this.api.buildTimetable();
        return raw ? JSON.parse(raw) : {};
    }

    reset() {
        this.api.delete();
        this.api = new this.Module.ViaBuilderAPI();

        if (this.preferences) {
            this.api.setPreferences(JSON.stringify(this.preferences));
        }

        if (this.settings) {
            this.api.setSettings(JSON.stringify(this.settings));
        }
    }

    dispose() {
        this.api.delete();
    }
}

export async function getViaBuilderManager() {
    if (!managerPromise) {
        managerPromise = getModule().then((Module) => new ViaBuilderManager(Module));
    }

    return managerPromise;
}
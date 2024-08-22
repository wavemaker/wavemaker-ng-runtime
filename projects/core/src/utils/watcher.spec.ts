import { setNgZone, setAppRef, muteWatchers, unMuteWatchers, isFirstTimeChange, FIRST_TIME_WATCH, $watch, $unwatch, $invokeWatchers, $appDigest, isChangeFromWatch, resetChangeFromWatch } from "@wm/core";
import { debounce } from "lodash-es";

const registry = new Map<string, any>();

jest.mock('./id-generator', () => ({
    IDGenerator: class IDGenerator {
        nextUid() {
            return 'test-id';
        }
    }
}));

jest.mock('./expression-parser', () => ({
    $parseExpr: jest.fn((expr) => () => expr)
}));

jest.spyOn(console, 'warn').mockImplementation(() => { });

describe('Utils', () => {
    let mockZone: { run: any; };
    let mockAppRef: { tick: any; };

    beforeEach(() => {
        mockZone = {
            run: jest.fn((cb) => cb())
        };
        mockAppRef = {
            tick: jest.fn()
        };
        setNgZone(mockZone);
        setAppRef(mockAppRef);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('unMuteWatchers', () => {
        let muted = false;
        it('should unmute the watchers', () => {
            muteWatchers();
            unMuteWatchers();
            expect(muted).toBe(false);
        });
    });

    describe('isFirstTimeChange', () => {
        it('should return true for FIRST_TIME_WATCH', () => {
            expect(isFirstTimeChange(FIRST_TIME_WATCH)).toBe(true);
        });

        it('should return false for other values', () => {
            expect(isFirstTimeChange('other-value')).toBe(false);
        });
    });

    describe('$unwatch', () => {
        it('should unregister a watch', () => {
            $watch('test.expression', {}, {}, jest.fn());
            $unwatch('test-id');
            expect(registry.size).toBe(0);
        });
    });

    describe('$invokeWatchers', () => {
        it('should invoke watchers', () => {
            const mockListener = jest.fn();
            $watch('test.expression', {}, {}, mockListener);

            $invokeWatchers(true);
            expect(mockListener).toHaveBeenCalledWith('test.expression', FIRST_TIME_WATCH);
        });
    });

    describe('$appDigest', () => {
        beforeEach(() => {
            mockZone = {
                run: jest.fn((cb) => cb())
            };
            mockAppRef = {
                tick: jest.fn()
            };
            setNgZone(mockZone);
            setAppRef(mockAppRef);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should run app digest when forced', () => {
            $appDigest(true);
            expect(mockZone.run).toHaveBeenCalledWith(expect.any(Function));
            expect(mockAppRef.tick).toHaveBeenCalled();
        });

        it('should not run app digest if appRef is not defined', () => {
            setAppRef(null);
            $appDigest();
            expect(mockZone.run).not.toHaveBeenCalled();
            expect(mockAppRef.tick).not.toHaveBeenCalled();
        });
    });
    describe('isChangeFromWatch', () => {
        it('should return the change detection status', () => {
            expect(isChangeFromWatch()).toBe(false);
            resetChangeFromWatch();
            expect(isChangeFromWatch()).toBe(false);
        });
    });
});
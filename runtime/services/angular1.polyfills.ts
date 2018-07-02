const win = window as any;

win.angular = {};

const ANGULAR1_DEPRECATED = () => {
    console.warn('DEPRECATED Angular 1.x feature');
    return win.angular;
};

win.angular.module = ANGULAR1_DEPRECATED;
win.angular.controller = ANGULAR1_DEPRECATED;
win.angular.directive = ANGULAR1_DEPRECATED;
win.angular.run = ANGULAR1_DEPRECATED;
win.angular.config = ANGULAR1_DEPRECATED;
win.angular.service = ANGULAR1_DEPRECATED;
win.angular.factory = ANGULAR1_DEPRECATED;
win.angular.constant = ANGULAR1_DEPRECATED;
win.angular.value = ANGULAR1_DEPRECATED;
win.angular.animation = ANGULAR1_DEPRECATED;
win.angular.component = ANGULAR1_DEPRECATED;
win.angular.decorator = ANGULAR1_DEPRECATED;
win.angular.filter = ANGULAR1_DEPRECATED;
win.angular.info = ANGULAR1_DEPRECATED;
win.angular.provider = ANGULAR1_DEPRECATED;
win.angular.requires = ANGULAR1_DEPRECATED;

export const patchAngular1Deprecations = () => {};

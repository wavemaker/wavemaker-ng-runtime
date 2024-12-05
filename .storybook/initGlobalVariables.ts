import * as $ from 'jquery';
import moment from 'moment';
import FullCalendar from 'fullcalendar'

window['moment'] = moment;
window['FullCalendar'] = FullCalendar
window['$'] = $;
window['jQuery'] = $;

//Adding wm-app class to storybook root element 
document.addEventListener('DOMContentLoaded', () => {
    const rootDocsElement = document.getElementById('storybook-docs');
    const rootStoryElement = document.getElementById('storybook-root');
    rootDocsElement?.classList.add('wm-app');
    rootStoryElement?.classList.add('wm-app');
});

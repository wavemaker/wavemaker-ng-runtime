import { Input } from '@angular/core';

/**
 * The wmPrefabContainer component defines the prefab-container widget.
 */

export class PrefabContainer {

    /**
     * Name of the prefab container widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

}
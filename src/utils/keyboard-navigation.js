const config = {
    calendar: [
        {
            query: '#meeting-name-input',
            actOnFocus: true,
            action: 'focus'
        },
        {
            query: '[class*="meeting"]',
            action: 'click',
            multiple: true
        }
    ]
};

export class KeyboardNavigation {
    constructor() {
        this.handleKeypress = this.handleKeypress.bind(this);
        this.handleMousemove = this.handleMousemove.bind(this);
        this.cursor = null;
        this.subCursor = null;
        this.viewName = null;
    }

    getBox() {
        return document.getElementById('keyboard-handler');
    }

    handleKeypress(event) {
        if (!this.viewName) {
            return;
        }

        switch (event.keyCode) {
        case 13: // enter
            this._act();

            return;

        case 37: // left
            return;

        case 38: // up
            event.preventDefault();
            this._up();

            return;

        case 39: // right
            return;

        case 40: // down
            event.preventDefault();
            this._down();

            return;
        }
    }

    _act() {
        const element = this._getCurrentElement();

        const action = this._getCurrentAction();

        element
            && element[action]
            && element[action]();
    }

    _getCurrentAction() {
        if (!this.viewName || this.cursor === null) {
            return;
        }

        return config[this.viewName][this.cursor].action;
    }

    _getCurrentQuery() {
        if (!this.viewName || this.cursor === null) {
            return;
        }

        return config[this.viewName][this.cursor].query;
    }

    handleMousemove() {
        this.cursor = null;

        const keyboardBox = this.getBox();

        keyboardBox.style.display = 'none';

        const overlay = this.getOverlay();

        overlay.style.display = 'none';
    }

    getOverlay() {
        return document.getElementById('keyboard-handler-overlay');
    }

    _hasGoneThroughAllReverse() {
        return this.subCursor === 0;
    }

    _getSubCursorMax() {
        const query = this._getCurrentQuery();
        const elements = document.querySelectorAll(query);

        return elements.length - 1;
    }

    _up() {
        document.activeElement.blur();

        if (this.cursor === null) {
            this.cursor = 0;
        } else {
            if (this._currentlyHasMultiple()) {
                if (this._hasGoneThroughAllReverse()) {
                    this.cursor -= 1;
                    this.subCursor = null;
                } else {
                    // FIX THIS ONE
                    this.subCursor = this.subCursor === null
                        ? this._getSubCursorMax() : this.subCursor - 1;
                }
            } else {
                this.cursor -= 1;
            }

            if (this.cursor < 0) {
                this.cursor = config[this.viewName].length - 1;
            }
        }

        if (this._currentlyHasMultiple() && this.subCursor === null) {
            // FIX THIS ONE

            this.subCursor = this._getSubCursorMax();
        }
        const currentElement = this._getCurrentElement(this._getCurrentQuery());

        if (!currentElement) {
            return;
        }
        currentElement.scrollIntoViewIfNeeded();

        const details
            = this._getElementDetails(this._getCurrentQuery());

        const keyboardBox = this.getBox();

        if (keyboardBox.style.display === 'none') {
            keyboardBox.style.transition = 0;
            keyboardBox.style.display = 'block';

            const overlay = this.getOverlay();

            overlay.style.display = 'block';
        } else {
            keyboardBox.style.transition = '500ms';
        }

        keyboardBox.style.height = details.height;
        keyboardBox.style.width = details.width;
        keyboardBox.style.left = details.left;
        keyboardBox.style.top = details.top;

        if (config[this.viewName][this.cursor].actOnFocus) {
            const element = this._getCurrentElement();
            const action = this._getCurrentAction();

            element
                && element[action]
                && element[action]();
        }
    }

    _hasGoneThroughAll() {
        const query = this._getCurrentQuery();
        const elements = document.querySelectorAll(query);

        return this.subCursor === elements.length - 1;
    }

    _down() {
        document.activeElement.blur();

        if (this.cursor === null) {
            this.cursor = 0;
        } else {
            if (this._currentlyHasMultiple()) {
                if (this._hasGoneThroughAll()) {
                    this.cursor += 1;
                    this.subCursor = null;
                } else {
                    this.subCursor = this.subCursor === null
                        ? 0 : this.subCursor + 1;
                }
            } else {
                this.cursor += 1;
            }

            if (this.cursor > config[this.viewName].length - 1) {
                this.cursor = 0;
            }
        }

        if (this._currentlyHasMultiple() && this.subCursor === null) {
            this.subCursor = 0;
        }

        const currentElement = this._getCurrentElement(this._getCurrentQuery());

        if (!currentElement) {
            return;
        }
        currentElement.scrollIntoViewIfNeeded();

        const details
            = this._getElementDetails(this._getCurrentQuery());

        const keyboardBox = this.getBox();

        if (keyboardBox.style.display === 'none') {
            keyboardBox.style.transition = 0;
            keyboardBox.style.display = 'block';

            const overlay = this.getOverlay();

            overlay.style.display = 'block';
        } else {
            keyboardBox.style.transition = '500ms';
        }

        keyboardBox.style.display = 'block';
        keyboardBox.style.height = details.height;
        keyboardBox.style.width = details.width;
        keyboardBox.style.left = details.left;
        keyboardBox.style.top = details.top;

        if (config[this.viewName][this.cursor].actOnFocus) {
            const element = this._getCurrentElement();
            const action = this._getCurrentAction();

            element
                && element[action]
                && element[action]();
        }
    }

    _getElementDetails() {
        const element = this._getCurrentElement();

        return element && element.getBoundingClientRect();
    }

    _getCurrentElement() {
        const query = this._getCurrentQuery();

        const elements = document.querySelectorAll(query);

        if (this._currentlyHasMultiple()) {
            return elements[this.subCursor];
        }

        return elements[0];
    }

    _currentlyHasMultiple() {
        const currentCursor = config[this.viewName][this.cursor];

        return currentCursor && currentCursor.multiple;
    }

    startListening(viewName) {
        this.viewName = viewName;
        this.cursor = null;

        document.addEventListener('keydown', this.handleKeypress);
        document.addEventListener('mousemove', this.handleMousemove);
        const keyboardBox = this.getBox();

        keyboardBox.style.display = 'none';

        const overlay = this.getOverlay();

        overlay.style.display = 'none';
    }

    stopListening() {
        this.viewName = null;
        this.cursor = null;
        document.removeEventListener('keydown', this.handleKeypress);
        document.removeEventListener('mousemove', this.handleMousemove);

        const keyboardBox = this.getBox();

        keyboardBox.style.display = 'none';

        const overlay = this.getOverlay();

        overlay.style.display = 'none';
    }
}


export default new KeyboardNavigation();

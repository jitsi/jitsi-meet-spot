import { logger } from 'common/logger';
import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


import SourcePreview from './source-preview';

/**
 * A desktop source as provided by Electron's desktopCapturer.
 */
interface Source {
    id: string;
    type?: string;
    [key: string]: any;
}

/**
 * The lists of available desktop sources grouped by type.
 */
interface SourcesByType {
    screen: Source[];
    window: Source[];
    [key: string]: Source[];
}

interface IProps {
    onCancel?: (...args: any[]) => void;
    onSelect?: (id?: string, type?: string) => void;
    t?: (key: string) => string;
}

interface IState {
    selected: Source | Record<string, never>;
    sources: SourcesByType;
    tab: string;
}

/**
 * Displays desktop capturer sources provided by Electron. Note: this component
 * assumes the environment has access to Electron's desktopCapturer.
 */
export class DesktopPicker extends React.Component<IProps, IState> {
    _updateSourcesTimeout: ReturnType<typeof setTimeout> | null;

    /**
     * Initializes a new {@code DesktopPicker} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            selected: {},
            sources: {
                window: [],
                screen: []
            },
            tab: 'window'
        };

        /**
         * The timeout used to fetch an update of available desktop sources. A
         * timeout is used over an interval to provide a consistent gap between
         * asynchronous fetching of available sources.
         */
        this._updateSourcesTimeout = null;

        this._onClick = this._onClick.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
        this._onShowScreenPreviews = this._onShowScreenPreviews.bind(this);
        this._onShowWindowPreviews = this._onShowWindowPreviews.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._updateSources = this._updateSources.bind(this);
    }

    /**
     * Begins requesting selectable desktop sharing sources.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._startPolling();
    }

    /**
     * Stops requesting selectable desktop sharing sources.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._stopPolling();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { onCancel, t } = this.props;
        const windowSelected = this.state.tab === 'window';
        const rootClasses
            = `desktop-picker ${windowSelected ? 'left-most-tab' : ''}`;

        return (
            <div className = { rootClasses }>
                <div className = 'picker-tabs'>
                    <button
                        className
                            = { windowSelected ? 'selected' : '' }
                        onClick = { this._onShowWindowPreviews }>
                        { t?.('screenshare.windowType') }
                    </button>
                    <button
                        className
                            = { this.state.tab === 'screen' ? 'selected' : '' }
                        onClick = { this._onShowScreenPreviews }>
                        { t?.('screenshare.screenType') }
                    </button>
                </div>
                <div className = 'picker-choices'>
                    { this._renderPreviews() }
                </div>
                <div className = 'picker-footer'>
                    <Button
                        appearance = 'subtle'
                        onClick = { onCancel }>
                        { t?.('buttons.cancel') }
                    </Button>
                    <Button
                        disabled = { !(this.state.selected as Source).id }
                        onClick = { this._onSubmit }>
                        { t?.('buttons.select') }
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Chooses a new selected source from the passed in available sources.
     * Accounts for unavailability of the currently selected source.
     *
     * @param availableSources - The lists of available window and
     * screen desktop sources.
     * @param typeToSelect - The current source type from
     * availableSources to choose from.
     * @private
     * @returns {Object}
     */
    _getSelectedSource(availableSources: SourcesByType, typeToSelect: string): Source | Record<string, never> {
        const selected = this.state.selected as Source;
        const sources = availableSources[typeToSelect];

        // Default to no selection if there are no available sources.
        if (!sources || !sources.length) {
            return {};
        }

        // If there is a valid selection for the current tab, return it.
        if (selected.id && sources.some(
            source => source.id === selected.id)) {
            return selected;
        }

        // Select the first available source.
        return {
            id: sources[0].id,
            type: typeToSelect
        };
    }

    /**
     * Callback invoked to mark a desktop source as being selected.
     *
     * @param id - The source id.
     * @param type - The type of the source, "window" or "screen".
     * @private
     * @returns {void}
     */
    _onClick({ id, type }: { id: string; type: string; }) {
        this.setState({
            selected: {
                id,
                type
            }
        });
    }

    /**
     * Callback invoked when a {@code SourcePreview} is double clicked. Selects
     * the preview for use as a desktop sharing source.
     *
     * @param id - The source id.
     * @param type - The type of the source, "window" or "screen".
     * @private
     * @returns {void}
     */
    _onDoubleClick({ id, type }: { id: string; type: string; }) {
        this.props.onSelect?.(id, type);
    }

    /**
     * Callback invoked to show desktop sources of the type "screen".
     *
     * @private
     * @returns {void}
     */
    _onShowScreenPreviews() {
        this.setState({
            selected: this._getSelectedSource(this.state.sources, 'screen'),
            tab: 'screen'
        });
    }

    /**
     * Callback invoked to show desktop sources of the type "window".
     *
     * @private
     * @returns {void}
     */
    _onShowWindowPreviews() {
        this.setState({
            selected: this._getSelectedSource(this.state.sources, 'window'),
            tab: 'window'
        });
    }

    /**
     * Callback invoked when a screensharing source has been selected.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const {
            id,
            type
        } = this.state.selected as Source;

        this.props.onSelect?.(id, type);
    }

    /**
     * Returns an instance of {@code SourcePreview} for each desktop source
     * preview.
     *
     * @private
     * @returns {Array<SourcePreview>}
     */
    _renderPreviews() {
        const sources = this.state.sources[this.state.tab];

        return sources.map((source: Source) => (
            <SourcePreview
                key = { source.id }
                onClick = { this._onClick }
                onDoubleClick = { this._onDoubleClick }
                selected = { source.id === (this.state.selected as Source).id }
                source = { source } />
        ));
    }

    /**
     * Create an interval to update known available desktop sources.
     *
     * @private
     * @returns {void}
     */
    _startPolling() {
        this._stopPolling();
        this._updateSources();
    }

    /**
     * Cancels the interval to update desktop sources.
     *
     * @private
     * @returns {void}
     */
    _stopPolling() {
        if (this._updateSourcesTimeout) {
            window.clearTimeout(this._updateSourcesTimeout);
        }
        this._updateSourcesTimeout = null;
    }

    /**
     * Obtains a list of desktop sources and their previews.
     *
     * @private
     * @returns {void}
     */
    _updateSources() {
        const electron = (window as any).require('electron');
        const getSources = new Promise<Source[]>((resolve, reject) => {
            electron.desktopCapturer.getSources({
                types: [ 'window', 'screen' ]
            }, (error: any, sources: Source[]) => {
                if (error) {
                    return reject(error);
                }

                return resolve(sources);
            });
        });

        getSources.then(sources => {
            const sourcesByType: SourcesByType = {
                screen: [],
                window: []
            };

            sources.forEach(source => {
                const idParts = source.id.split(':');
                const type = idParts[0];

                if (sourcesByType[type]) {
                    sourcesByType[type].push(source);
                }
            });

            this.setState({
                selected:
                    this._getSelectedSource(sourcesByType, this.state.tab),
                sources: sourcesByType
            });
        })
        .catch(error => {
            logger.error('Failed to fetch desktop previews', { error });
        })
        .then(() => {
            this._updateSourcesTimeout = setTimeout(this._updateSources, 3000);
        });
    }
}

export default withTranslation()(DesktopPicker);

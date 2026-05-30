import { EVENTS } from './constants';
import { ExternalApiSubscriber } from './ExternalApiSubscriber';

describe('ExternalApiSubscriber', () => {
    let changeSubscriber: jest.Mock;
    let externalApiSubscriber: ExternalApiSubscriber;

    beforeEach(() => {
        changeSubscriber = jest.fn();
        externalApiSubscriber = new ExternalApiSubscriber(changeSubscriber);
    });

    describe('Spot-TV view changes', () => {
        const testView1 = 'testView1';
        const testView2 = 'testView2';

        /**
         * Helper to encapsulate simulating a redux store change.
         *
         * @param viewName - The current Spot-TV view.
         * @returns {void}
         */
        function triggerViewUpdate(viewName: string) {
            externalApiSubscriber.onUpdate({
                spotTv: {
                    view: viewName
                }
            });
        }

        beforeEach(() => {
            triggerViewUpdate(testView1);
        });

        it('notifies when the view has changed', () => {
            expect(changeSubscriber).toHaveBeenCalledWith({
                type: EVENTS.SPOT_TV_VIEW_CHANGED,
                details: {
                    view: testView1
                }
            });

            changeSubscriber.mockClear();

            triggerViewUpdate(testView2);

            expect(changeSubscriber).toHaveBeenCalledWith({
                type: EVENTS.SPOT_TV_VIEW_CHANGED,
                details: {
                    view: testView2
                }
            });
        });

        it('does not notify when the view is the same', () => {
            changeSubscriber.mockClear();

            triggerViewUpdate(testView1);

            expect(changeSubscriber).not.toHaveBeenCalled();
        });
    });
});

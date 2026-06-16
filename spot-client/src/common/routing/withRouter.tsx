import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Re-implements the {@code withRouter} higher-order component that React Router
 * removed in v6. Class components in this codebase still expect the v5-style
 * {@code history}/{@code location}/{@code match} props, so this shim derives
 * them from the v7 hooks and injects them. {@code history} exposes just the
 * {@code push}/{@code replace}/{@code goBack} methods consumers rely on, mapped
 * onto {@code navigate}.
 *
 * @param Component - The component to wrap.
 * @returns The wrapped component.
 */
export function withRouter(Component: React.ComponentType<any>): React.ComponentType<any> {
    /**
     * Functional wrapper that reads the router hooks and forwards the derived
     * props to the wrapped component.
     *
     * @param props - The own props passed to the wrapped component.
     * @returns {ReactElement}
     */
    function ComponentWithRouterProp(props: any) {
        const location = useLocation();
        const navigate = useNavigate();
        const params = useParams();
        const history = {
            push: (to: string, state?: any) => navigate(to, { state }),
            replace: (to: string, state?: any) => navigate(to, {
                replace: true,
                state
            }),
            goBack: () => navigate(-1)
        };

        return (
            <Component
                { ...props }
                history = { history }
                location = { location }
                match = {{ params }}
                navigate = { navigate } />
        );
    }

    return ComponentWithRouterProp;
}

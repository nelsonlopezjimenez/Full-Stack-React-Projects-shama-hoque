import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';

function withRouter(WrappedComponent) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const history = {
      push: (path) => navigate(path),
      goBack: () => navigate(-1),
      location,
    };
    return (
      <WrappedComponent
        {...props}
        history={history}
        location={location}
        match={{ params }}
      />
    );
  }
  ComponentWithRouterProp.displayName = `withRouter(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;
  return ComponentWithRouterProp;
}

export default withRouter;
export { withRouter };

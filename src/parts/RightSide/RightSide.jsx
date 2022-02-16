import React, { useContext, useEffect, Fragment } from 'react';

// style file
import './RightSide.scss';

// context (global state)
import { ThemeContext } from '../../context/ThemeContext';
import UserContext from '../../context/UserContext';

// libraries
// import WhoToAdd from '../WhoToAdd/WhoToAdd';
import Join from '../Join/Join';
import CurrentUser from '../CurrentUser/CurrentUser';

const RightSide = () => {
  // ******* start global state ******* //

  // theme context
  const { isLightTheme, light, dark } = useContext(ThemeContext);
  const theme = isLightTheme ? light : dark;

  // user context
  const { userData } = useContext(UserContext);

  // ******* end global state ******* //
  useEffect(() => {}, [userData.isAuth]);

  return (
    <div className="rightSide">
      <div
        className="rightSide__box"
        style={{
          backgroundColor: `${theme.background}`,
        }}
      >
        {userData.isAuth && window.screen.width > 991 ? (
          <Fragment>
            <CurrentUser />
            {/* <div
              className="rightSide__box__whoToAddBox"
              style={{
                backgroundColor: `${theme.foreground}`,
              }}
            >
              <WhoToAdd />
            </div> */}
          </Fragment>
        ) : (
          <Join />
        )}
      </div>
    </div>
  );
};

export default RightSide;

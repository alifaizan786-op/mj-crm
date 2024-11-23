import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';

const DrawerMenu = ({ menuData }) => {
  const [menuItem, setMenuItems] = React.useState([]);
  const [open, setOpen] = React.useState({});

  const handleClick = (item) => {
    setOpen({ ...open, [item]: !open[item] });
  };

  const menuOrder = [
    'Client',
    'Merchandise',
    'Malani Jewelers (.com)',
    'Supplies',
    'Marketing',
    'User',
    'Settings',
  ];

  React.useEffect(() => {
    let parentMenuArr = [];

    const levelOne = menuData
      .filter((menu) => menu.menuItem == true)
      .filter(
        (menu) => menu.path.split('/').filter(Boolean).length == 1
      );

    const levelTwo = menuData
      .filter((menu) => menu.menuItem == true)
      .filter(
        (menu) => menu.path.split('/').filter(Boolean).length == 2
      )
      .filter(
        (menu) =>
          menu.path.split('/').filter(Boolean)[
            menu.path.split('/').filter(Boolean).length - 1
          ] != ':id'
      );

    const levelThree = menuData
      .filter((menu) => menu.menuItem == true)
      .filter(
        (menu) => menu.path.split('/').filter(Boolean).length == 3
      )
      .filter(
        (menu) =>
          menu.path.split('/').filter(Boolean)[
            menu.path.split('/').filter(Boolean).length - 1
          ] != ':id'
      );

    const levelFour = menuData
      .filter((menu) => menu.menuItem == true)
      .filter(
        (menu) => menu.path.split('/').filter(Boolean).length == 4
      )
      .filter(
        (menu) =>
          menu.path.split('/').filter(Boolean)[
            menu.path.split('/').filter(Boolean).length - 1
          ] != ':id'
      );

    const menuArr = [];

    // Initialize open state
    const initialOpenState = {};

    for (let i = 0; i < levelOne.length; i++) {
      const elementI = levelOne[i];
      elementI.child = [];
      initialOpenState[elementI.name] = false; // Initialize open state for Level 1

      for (let j = 0; j < levelTwo.length; j++) {
        const elementJ = levelTwo[j];
        if (elementJ.path.startsWith(elementI.path)) {
          elementJ.child = [];
          initialOpenState[elementJ.name] = false; // Initialize open state for Level 2

          for (let k = 0; k < levelThree.length; k++) {
            const elementK = levelThree[k];
            if (elementK.path.startsWith(elementJ.path)) {
              elementK.child = [];
              initialOpenState[elementK.name] = false; // Initialize open state for Level 3

              for (let l = 0; l < levelFour.length; l++) {
                const elementL = levelFour[l];
                if (elementL.path.startsWith(elementK.path)) {
                  elementK.child.push(elementL); // Nest Level 4 under Level 3
                  initialOpenState[elementL.name] = false; // Initialize open state for Level 4
                }
              }
              elementJ.child.push(elementK); // Nest Level 3 under Level 2
            }
          }
          elementI.child.push(elementJ); // Nest Level 2 under Level 1
        }
      }

      menuArr.push(elementI); // Add Level 1 to the final array
    }

    const sortMenu = (arr) => {
      return arr.sort((a, b) => {
        const indexA = menuOrder.indexOf(a.name);
        const indexB = menuOrder.indexOf(b.name);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });
    };

    setMenuItems(sortMenu(menuArr));
    setOpen(initialOpenState); // Set the initialized open state
  }, [menuData]);
  console.log(menuItem);
  console.log(open);

  const renderMenu = (items, level = 0) => {
    return (
      <List
        component='div'
        disablePadding>
        {items.map((item) => (
          <React.Fragment key={item.name}>
            <ListItemButton
              sx={{ pl: 4 * level }}
              onClick={() =>
                item.child && item.child.length > 0
                  ? handleClick(item.name)
                  : window.location.assign(item.path)
              }>
              <ListItemText primary={item.name} />
              {item.child && item.child.length > 0 ? (
                open[item.name] ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )
              ) : null}
            </ListItemButton>
            {item.child && item.child.length > 0 && (
              <Collapse
                in={open[item.name]}
                timeout='auto'
                unmountOnExit>
                {renderMenu(item.child, level + 1)}
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return <>{renderMenu(menuItem)}</>;
};

export default DrawerMenu;

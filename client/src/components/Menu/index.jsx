import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import React, { useState } from 'react';

const DrawerMenu = ({ menuData }) => {
  const [openStates, setOpenStates] = useState({});

  const handleToggle = (key) => {
    setOpenStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const parseRoutesToMenuData = (routes) => {
    const menuTree = {};

    routes.forEach((route) => {
      // Exclude routes with menuItem: false or dynamic segments
      if (route.menuItem === false || route.path.split('/').some(segment => segment.startsWith(':'))) {
        return;
      }

      const segments = route.path.split('/').filter(Boolean); // Split path by '/' and ignore empty segments
      let currentLevel = menuTree;

      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;

        if (!currentLevel[segment]) {
          currentLevel[segment] = {
            name: isLast ? route.name : segment,
            path: isLast ? route.path : null, // Only last items have valid paths
            submenus: {},
          };
        }

        if (isLast) {
          currentLevel[segment].element = route.element;
        }

        currentLevel = currentLevel[segment].submenus;
      });
    });

    return Object.values(menuTree);
  };

  const renderMenu = (menu, level = 0, key = '') => {
    const isOpen = openStates[key] || false;
    const paddingLeft = `${16 + level * 16}px`; // Base padding + level-based indentation

    return (
      <React.Fragment key={key}>
        <ListItem
          button={!!menu.path} // Only make clickable if there's a valid path
          onClick={() => menu.path ? window.location.assign(menu.path) : handleToggle(key)}
          sx={{ paddingLeft }}
        >
          <ListItemText primary={menu.name} />
          {menu.submenus && Object.keys(menu.submenus).length > 0 ? (
            isOpen ? <ExpandLess /> : <ExpandMore />
          ) : null}
        </ListItem>
        {menu.submenus && Object.keys(menu.submenus).length > 0 && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {Object.values(menu.submenus).map((submenu, index) =>
                renderMenu(submenu, level + 1, `${key}-${index}`)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const parsedMenuData = parseRoutesToMenuData(menuData);

  return <List>{parsedMenuData.map((menu, index) => renderMenu(menu, 0, `menu-${index}`))}</List>;
};

export default DrawerMenu;

import * as React from 'react';
import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';

import usePlansStore from "../hooks/usePlans.js";
import { createTheme } from '@mui/material';
import { useTranslation } from "react-i18next";


export default function MenuSimple({ isDisabled = false }) {

  const { t } = useTranslation();

  const { plans, currentPlan, focusTrigger, setCurrentPlan, setFocusTrigger } = usePlansStore((state) => {
    return { plans: state.plans, currentPlan: state.currentPlan, focusTrigger: state.focusTrigger, setCurrentPlan: state.setCurrentPlan, setFocusTrigger: state.setFocusTrigger };
  });

  const default_Work = {
    "plan": `Default Plan ${localStorage.getItem('block_name')}`,
    "plan_id": localStorage.getItem("plan_id"),
  }

  const handlePlanSelect = (plan) => {
    return () => {
      setCurrentPlan(plan)
    };
  };

  const theme = createTheme({
    palette: {
      mode: focusTrigger ? 'dark' : 'light',
    },
  })

  return (
    <Dropdown>
      <MenuButton theme={theme}>{currentPlan == null ? t("t_plan") : currentPlan.plan}</MenuButton>
      {!isDisabled && <Menu slots={{ listbox: Listbox }}>

        {plans !== null ? (
          plans.map((item) => {
            return (
              <MenuItem onClick={handlePlanSelect(item)} key={item.plan_id}>{item.plan}</MenuItem>
            )
          })
        ) : (
          <MenuItem onClick={handlePlanSelect(default_Work)}>{default_Work.plan}</MenuItem>
        )}

      </Menu>}
    </Dropdown>
  );
}

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 1.2rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  max-height: 300px; /* Approximately 7 items (40px per item) */
  overflow-y: auto;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#d6d5c9'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-size: 1.2em;
  line-height: 1.5;
  padding: 6px 10px;
  margin : 0 1em 0 0;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: ${theme.palette.mode === 'dark' ? '2px' : '0px'} solid ${theme.palette.mode === 'dark' ? '#e63946' : '#e63946'};
  background: ${theme.palette.mode === 'dark' ? '#D6D5C9' : '#D6D5C9'};
  color: ${theme.palette.mode === 'dark' ? '#592941' : '#592941'};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);

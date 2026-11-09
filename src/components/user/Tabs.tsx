// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { AccountBalance, AltRoute, AppSettingsAlt, Badge, ContactMail, ContactPhone, Folder, Key,
  MobileFriendly, MoveToInbox, Quickreply, SupervisorAccount } from "@mui/icons-material";
import { Tab, Tabs } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { MuiIcon } from '@/types/common';


const useStyles = makeStyles()(() => ({
  scroller: {
    width: 0,
  },
}));

type UserTabProps = {
  label: string;
  disabled?: boolean;
  icon: MuiIcon;
}

const UserTab = ({ icon: Icon, ...props }: UserTabProps) => <Tab
  {...props} 
  iconPosition='start'
  sx={{ minHeight: 48 }}
  icon={<Icon fontSize="small"/>}
/>

type UserTabsProps = {
  ID: number;
  value: number;
  handleTabChange: (_: unknown, tab: number) => void;
  sysAdminReadPermissions: boolean;
}

function UserTabs({ ID, value, handleTabChange, sysAdminReadPermissions }: UserTabsProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
  return <Tabs
    indicatorColor="primary"
    value={value}
    onChange={handleTabChange}
    variant="scrollable"
    scrollButtons="auto"
    classes={{
      scroller: classes.scroller,
    }}
  >
    <UserTab label={t("Account")} icon={AccountBalance} />
    <UserTab label={t("Alt names")} icon={AltRoute} />
    <UserTab label={t("Details")} disabled={!ID} icon={Badge}/>
    <UserTab label={t("Contact")} disabled={!ID} icon={ContactPhone}/>
    <UserTab label={t("Roles")} disabled={!ID || !sysAdminReadPermissions} icon={SupervisorAccount}/>
    <UserTab label={t("SMTP")} disabled={!ID} icon={ContactMail}/>
    <UserTab label={t("Folders")} disabled={!ID} icon={Folder}/>
    <UserTab label={t("Permissions")} disabled={!ID} icon={Key}/>
    <UserTab label={t("Out-of-Office")} disabled={!ID} icon={Quickreply}/>
    <UserTab label={t("Fetchmail")} disabled={!ID} icon={MoveToInbox}/>
    <UserTab label={t("Mobile devices")} disabled={!ID} icon={MobileFriendly}/>
    <UserTab label={t("Sync policy")} disabled={!ID} icon={AppSettingsAlt}/>
  </Tabs>;
}


export default UserTabs;
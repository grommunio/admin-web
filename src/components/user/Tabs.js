import React from 'react';
import PropTypes from 'prop-types';
import { AccountBalance, AltRoute, AppSettingsAlt, Badge, ContactMail, ContactPhone, Key, MobileFriendly, MoveToInbox, Quickreply, SupervisorAccount } from "@mui/icons-material";
import { Tab, Tabs } from "@mui/material";
import { withTranslation } from 'react-i18next';
import { withStyles } from 'tss-react/mui';

const styles = {
  scroller: {
    width: 0,
  },
};

// eslint-disable-next-line react/prop-types
const UserTab = ({ icon: Icon, ...props }) => <Tab
  {...props} 
  iconPosition='start'
  sx={{ minHeight: 48 }}
  icon={<Icon fontSize="small"/>}
/>

function UserTabs({ t, ID, value, classes, handleTabChange, sysAdminReadPermissions }) {
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
    <UserTab label={t("Permissions")} disabled={!ID} icon={Key}/>
    <UserTab label={t("OOF")} disabled={!ID} icon={Quickreply}/>
    <UserTab label={t("Fetchmail")} disabled={!ID} icon={MoveToInbox}/>
    <UserTab label={t("Mobile devices")} disabled={!ID} icon={MobileFriendly}/>
    <UserTab label={t("Sync policy")} disabled={!ID} icon={AppSettingsAlt}/>
  </Tabs>;
}

UserTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  ID: PropTypes.any,
  value: PropTypes.number.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  sysAdminReadPermissions: PropTypes.bool,
}

export default withStyles(withTranslation()(UserTabs), styles);
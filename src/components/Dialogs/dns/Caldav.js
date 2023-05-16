import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Caldav({ onClose, dnsCheck={} }) {
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Caldav(s) SRV"
      subtitle="caldav_expl"
      label1='Caldav check result'
      label2='Caldavs check result'
      field1='caldavSRV'
      field2='caldavsSRV'
    />
  );
}

Caldav.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Caldav;
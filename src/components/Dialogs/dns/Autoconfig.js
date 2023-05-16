import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Autoconfig({ onClose, dnsCheck={} }) {
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autoconfig"
      field='autoconfig'
      subtitle="autoconfig_expl"
    />
  );
}

Autoconfig.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Autoconfig;
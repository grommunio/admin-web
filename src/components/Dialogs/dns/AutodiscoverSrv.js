import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function AutodiscoverSrv({ onClose, dnsCheck }) {
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autodiscover SRV"
      field='autodiscoverSRV'
      subtitle="autodiscoverSrv_expl"
    />
  );
}

AutodiscoverSrv.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default AutodiscoverSrv;
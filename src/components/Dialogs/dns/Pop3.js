import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Pop3({ onClose, dnsCheck={} }) {
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="POP3(s) SRV"
      subtitle="pop3_expl"
      label1='POP3 check result'
      label2='POP3s check result'
      field1='pop3SRV'
      field2='pop3sSRV'
    />
  );
}

Pop3.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Pop3;
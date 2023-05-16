import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Imap({ onClose, dnsCheck={} }) {
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="IMAP(s) SRV"
      subtitle="imap_expl"
      label1='IMAP check result'
      label2='IMAPs check result'
      field1='imapSRV'
      field2='imapsSRV'
    />
  );
}

Imap.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Imap;
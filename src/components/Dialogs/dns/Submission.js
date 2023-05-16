import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Imap({ onClose, dnsCheck={} }) {
  return <DefaultDNSDialog
    onClose={onClose}
    dnsCheck={dnsCheck}
    label="Submission SRV"
    field='submissionSRV'
    subtitle="submission_expl"
  />;
}

Imap.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Imap;
import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Autodiscover({ onClose, dnsCheck }) {
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autodiscover"
      field='autodiscover'
      subtitle="autodiscover_expl"
    />
  );
}

Autodiscover.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Autodiscover;
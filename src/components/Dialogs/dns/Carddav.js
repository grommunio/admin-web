import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Carddav({ onClose, dnsCheck={} }) {
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Carddav(s) SRV"
      subtitle="carddav_expl"
      label1='Carddav check result'
      label2='Carddavs check result'
      field1='carddavSRV'
      field2='carddavsSRV'
    />
  );
}

Carddav.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default Carddav;
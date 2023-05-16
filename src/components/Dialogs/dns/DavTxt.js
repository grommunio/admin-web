import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function DavTxt({ onClose, dnsCheck={} }) {
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Cal-/Carddav TXT"
      subtitle="caldav_expl"
      label1='Caldavs TXT result'
      label2='Carddavs TXT result'
      field1='caldavTXT'
      field2='carddavTXT'
    />
  );
}

DavTxt.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default DavTxt;
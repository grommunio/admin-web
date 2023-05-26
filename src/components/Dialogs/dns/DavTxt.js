import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function DavTxt({ onClose, dnsCheck={}, domain={} }) {
  const domainname = domain.domainname || "example.at";
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Cal-/Carddav TXT"
      subtitle="davtxt_expl"
      label1='Caldav TXT result'
      label2='Carddav TXT result'
      field1='caldavTXT'
      field2='carddavTXT'
      example={<pre>
        {`_caldavs._tcp.${domainname}.    1    IN    TXT    "path=/dav"
_caldav._tcp.${domainname}.     1    IN    TXT    "path=/dav"
_carddavs._tcp.${domainname}.   1    IN    TXT    "path=/dav"
_carddav._tcp.${domainname}.    1    IN    TXT    "path=/dav"`}
      </pre>}
    />
  );
}

DavTxt.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default DavTxt;